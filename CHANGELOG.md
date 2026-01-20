# Changelog

All notable changes to Scavy will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.8.21] - 2026-01-20

### Fixed
- Rolled back problematic database lookup causing Edge Function errors
- Scanner now works reliably again

### Changed
- Temporarily removed secondary cache lookup (will re-add with better error handling)
- Improved Edge Function error messages

---

## [0.8.20] - 2026-01-20

### Added
- Secondary cache lookup by device name + manufacturer + model
- Consistent component results across multiple scans

### Fixed
- AI badge now correctly changes to "database" badge on rescans
- Components are now cached and reused (no more random variations)

### Known Issues
- Database lookup caused Edge Function failures (reverted in 0.8.21)

---

## [0.8.19] - 2026-01-20

### Added
- Complete scanner overhaul with hint prompt system
- Database migrations for missing tables (`profiles`, `user_inventory`)

### Fixed
- Scanner capture/upload reliability
- Click event propagation issues
- Hint prompt infinite loop
- 404 errors on database queries

---

## [0.8.18] - 2026-01-20

### Fixed
- Hint prompt now only appears once per scan session
- Added `hintProvided` flag to prevent loop

---

## [0.8.17] - 2026-01-20

### Fixed
- Critical bug: Analyze button was passing click event object instead of image
- Changed `onClick={onAnalyze}` to `onClick={() => onAnalyze()}`

---

## [0.8.13-0.8.16] - 2026-01-20

### Fixed
- Multiple iterations fixing `e.match is not a function` error
- Added comprehensive validation for image data types
- Improved error logging

---

## [0.8.12] - 2026-01-20

### Added
- First release workflow via GitHub Actions
- Scanner capture/upload reliability improvements

### Fixed
- Upload button now uses `inputRef.click()` for better mobile compatibility
- Capture button no longer incorrectly disabled

---

## [0.8.11] - 2026-01-14

### Changed
- Removed real-time detection UI
- Simplified to capture → analyze flow

---

## [0.7.0] - 2026-01-14

### Added
- Multi-stage scan flow (Stage 1: device ID, Stage 2: components, Stage 3: details)
- ScrapGadget database caching system
- Performance optimizations (60-80% faster scans)

### Changed
- Migrated from Lovable to Supabase backend
- Complete ownership of codebase

---

## [0.6.2] - 2026-01-08

### Added
- Component database with 15,000+ entries
- Admin panel for database management

---

## [0.6.0] - 2026-01-01

### Added
- Initial public release
- AI-powered device scanning
- Inventory management
- Project matching

---

For older versions, see `.archive/v0.*.md` files.
