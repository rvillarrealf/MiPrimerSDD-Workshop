<!--
Sync Impact Report
Version change: uninitialized → 1.0.0 (initial constitution)
Modified principles: template placeholders → SIMPLICITY FIRST (YAGNI), SIMPLE, CLEAR DESIGN,
STRUCTURED ARCHITECTURE, TEST-DRIVEN DEVELOPMENT, SPEC IS THE SOURCE OF TRUTH
Added sections: Implementation Constraints, Development Workflow
Removed sections: none
Follow-up TODOs: Confirm the original ratification date.
-->
# Curso-PSWE-07 Constitution

## Core Principles

### 1. SIMPLICITY FIRST (YAGNI)
Implement only what the spec requires. Implementers MUST choose the simplest solution that
works and MUST NOT add unrequested features, abstractions, configuration options, or
dependencies. Any added complexity MUST be justified in writing in the plan. Rationale:
limiting scope and complexity reduces maintenance and prevents speculative work.

### 2. SIMPLE, CLEAR DESIGN
Functions and modules MUST be small and have a single responsibility. Names MUST clearly
express intent. Abstractions MUST NOT be introduced for a single use, and duplication MUST
only be removed when it is real. Implementers MUST NOT optimize before a demonstrated need.
Rationale: simple, explicit code is easier to understand, test, and change.

### 3. STRUCTURED ARCHITECTURE
Code MUST separate UI (screens and components), application logic (task operations), and
persistence (storage), with dependencies flowing UI → logic → persistence. UI code MUST NOT
access storage directly. Persistence MUST be hidden behind a small interface that can be
replaced or faked in tests. Rationale: clear boundaries support independent testing and
replacement of storage.

### 4. TEST-DRIVEN DEVELOPMENT (NON-NEGOTIABLE)
Production code MUST follow Red-Green-Refactor: write a failing test, make it pass with
minimum code, then refactor. No production code may be added without a test that required it.
Business logic MUST have unit tests, and each user story MUST have at least one acceptance
test mirroring its acceptance scenarios. Tests MUST be fast and independent. Rationale:
test-first development verifies behavior while keeping changes safe to refactor.

### 5. SPEC IS THE SOURCE OF TRUTH
Every implementation task MUST trace to a requirement in the spec; anything not in the spec
is out of scope. Ambiguous requirements MUST be clarified before implementation. Rationale:
traceability keeps implementation aligned with agreed user needs.

## Implementation Constraints

Persistence access MUST follow the interface boundary in Principle 3. Plans MUST record the
reason for any complexity beyond the simplest solution that satisfies the spec.

## Development Workflow

Implementation MUST follow the test-first sequence in Principle 4. Reviews MUST verify task
traceability to the spec, required tests, and compliance with the architecture boundaries.

## Governance

This constitution takes precedence over conflicting project practices. Amendments MUST be
documented and approved through project review. Each amendment MUST update this document's
version and dates. Versioning follows semantic versioning: MAJOR for incompatible governance
changes or principle removals/redefinitions, MINOR for added principles or materially
expanded guidance, and PATCH for clarifications and non-semantic wording changes. Every
implementation review MUST check compliance with these principles and record or resolve
deviations before completion.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): original date unknown | **Last Amended**: 2026-10-29
