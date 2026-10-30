import { expect, test } from '@playwright/test';

const viewports = [320, 768, 1440];

async function measureScreen(page) {
  return page.evaluate(() => {
    function luminance(color) {
      const channels = color.match(/\d+/g).slice(0, 3).map((value) => Number(value) / 255);
      const linear = channels.map((channel) => (
        channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
      ));
      return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
    }

    function effectiveBackground(element) {
      const layers = [];
      for (let current = element; current; current = current.parentElement) {
        const values = getComputedStyle(current).backgroundColor.match(/[\d.]+/g).map(Number);
        layers.push({
          color: values.slice(0, 3),
          alpha: values.length === 4 ? values[3] : 1,
        });
      }

      let background = [255, 255, 255];
      for (const layer of layers.reverse()) {
        background = layer.color.map((channel, index) => (
          channel * layer.alpha + background[index] * (1 - layer.alpha)
        ));
      }
      return `rgb(${background.map(Math.round).join(', ')})`;
    }

    const textFailures = [...document.querySelectorAll('body *')]
      .filter((element) => element.children.length === 0 && element.textContent.trim())
      .flatMap((element) => {
        const style = getComputedStyle(element);
        const foreground = luminance(style.color);
        const background = luminance(effectiveBackground(element));
        const ratio = (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
        const fontSize = Number.parseFloat(style.fontSize);
        const largeText = fontSize >= 24 || (fontSize >= 18.66 && Number.parseInt(style.fontWeight, 10) >= 700);
        return ratio >= (largeText ? 3 : 4.5)
          ? []
          : [`${element.textContent.trim()}: ${ratio.toFixed(2)}:1`];
      });

    return {
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
      controls: [...document.querySelectorAll('button, input, textarea')].map((control) => {
        const { width, height } = control.getBoundingClientRect();
        return { width, height };
      }),
      textFailures,
    };
  });
}

function expectUsable(metrics) {
  expect(metrics.documentWidth).toBeLessThanOrEqual(metrics.viewportWidth);
  expect(metrics.controls.length).toBeGreaterThan(0);
  expect(metrics.controls.every(({ width, height }) => width >= 44 && height >= 44)).toBe(true);
  expect(metrics.textFailures).toEqual([]);
}

test('keeps list, form, and detail layouts accessible at required viewport widths', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Add task' }).click();
  await page.getByLabel('Title').fill('Accessible task');
  await page.getByRole('button', { name: 'Save' }).click();

  for (const width of viewports) {
    await page.setViewportSize({ width, height: 900 });
    expectUsable(await measureScreen(page));
    await expect(page.getByRole('button', { name: 'Add task' })).toBeVisible();

    await page.getByRole('button', { name: 'Add task' }).click();
    expectUsable(await measureScreen(page));
    await page.getByRole('button', { name: 'Cancel' }).click();

    await page.getByRole('button', { name: /Accessible task/ }).click();
    expectUsable(await measureScreen(page));
    await page.getByRole('button', { name: 'Back' }).click();
  }
});
