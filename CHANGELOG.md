# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Renamed the package to `vue-calendarium` and published it to the public npm registry.
- Renamed the root CSS class from `.google-calendar` to `.vue-calendarium`. **Breaking:** update any custom selectors that targeted `.google-calendar`.
- Replaced the default font stack (now `Roboto` + system fonts).

### Added

- MIT `LICENSE` file, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, issue/PR templates, and CI workflow.

## [0.1.0]

- Initial release: Month/Week/Day views, event CRUD, recurring events (RRULE),
  mobile gestures, Temporal-based date handling, and i18n (`en`, `pt`).
