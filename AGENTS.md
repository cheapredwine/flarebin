# Agent Instructions

## Pre-Commit Requirements

**ALWAYS run tests before committing changes:**
- Run `npm test` before any `git commit`
- Fix all test failures before committing
- If tests fail after a rename/refactor, update both source AND test assertions

## Testing Commands

```bash
npm test    # Run full test suite
```

## General Guidelines

- Make minimal changes to achieve the goal
- Follow existing code style in the project
- Do not commit files that contain secrets (.env, credentials.json, etc.)
- Prefer readability over terseness within reason

## Commit Message Guidelines

Use conventional commit prefixes:
- `feat:` — New feature or functionality
- `fix:` — Bug fix
- `docs:` — Documentation changes only
- `style:` — Code style changes (formatting, semicolons, etc.)
- `refactor:` — Code refactoring without changing functionality
- `test:` — Adding or updating tests
- `chore:` — Maintenance tasks (build, deps, etc.)

## Verification

`npm run verify` is the done-check for any code change in this repo (agents: run it before claiming done; task is complete when it exits 0).

## Merge authority (user grant, 2026-10-29)

Jason has granted standing merge authority for this repo: agents may merge their own PRs without asking. Main pushes are blocked by repo rules, so the workflow is: branch → PR → merge the PR (and delete the branch). This is the first repo with this grant; it does not extend to other repos.
