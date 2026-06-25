# Contributing to vue-calendarium

Thanks for your interest in contributing! This document explains how to get set up and what we expect from contributions.

## Code of Conduct

This project adheres to a [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold it. Please report unacceptable behavior to the address listed there.

## Getting started

```bash
git clone https://github.com/zehenrique/vue-calendarium.git
cd vue-calendarium
npm install
make dev      # or: npm run dev
```

The app runs on <http://localhost:3000>.

## Tech stack & conventions

- **Vue 3** with the Composition API (`<script setup>`). Avoid the Options API.
- **Vuetify 3** for components and Material Design styling.
- **Temporal API** for all date/time work — do not use the legacy `Date` object.
- **vue-i18n** for all user-facing strings (`en` and `pt`). Never hard-code copy.
- Times are always displayed in **24-hour** format.
- Keep components small and focused; prefer composables for shared logic.

See [AGENTS.md](./AGENTS.md) for the full set of project conventions.

## Tests

```bash
make test         # unit tests (Vitest)
make test-ui      # end-to-end / UI tests (Playwright)
```

All tests must pass before a PR is merged. Add or update tests for any behavior you change, and run the Playwright suite for UI changes.

## Pull requests

1. Fork the repo and create a branch off `main`.
2. Make your change, keeping commits focused.
3. Update documentation (`README.md`, `docs/`) and the [CHANGELOG](./CHANGELOG.md) when relevant.
4. Ensure `make lint`, `make test`, and the UI tests pass.
5. Open a PR describing **what** changed and **why**.

## Reporting bugs / requesting features

Please use the GitHub issue templates. Include reproduction steps, expected vs. actual behavior, and your environment (browser, OS, Vue/Vuetify versions).
