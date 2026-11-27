# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/). Entries before this file existed were backfilled from the git history.

## [Unreleased]

### Fixed

- The terminal view stayed empty because the player stylesheet (pinned to 3.7.1 on a CDN) did not match the installed player code. The stylesheet now comes from the installed package.

## 2025-06-12

### Added

- Seek dialog to jump to a specific time (`from-students` branch).

## 2024-09

### Added

- Multiple annotation timelines, session persistence across reloads, more key bindings.

### Changed

- Full-screen layout; the previous-session prompt is a Vue dialog.

### Fixed

- Timeline loading, export/import, panning and space-key bugs.

## 2024-07

### Added

- Keys A, B, C, Space, End and Delete, with their documentation.
