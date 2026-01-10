# Scavy Version History

## v0.3 - Admin Review System
**Date**: 2026-01-10  
**Commit**: TBD  
**Status**: 🚀 Deploying

### Changes:
- ✅ **NEW: Admin Dashboard** - Full review interface at `/admin`
- ✅ **NEW: UI Source Badges** - Shows "Verified Database" vs "AI Identified" in scanner results
- ✅ **NEW: Approval Workflow** - One-click approve/reject with automatic DB migration
- ✅ **NEW: Quality Control** - Manual review before gadgets enter main database
- ✅ **NEW: Analytics Dashboard** - Track pending, approved, rejected submissions

### Features:
**Admin Dashboard** (`/admin`):
- View all pending, approved, and rejected submissions
- See gadget details: components, values, difficulty, user info
- Approve: Automatically moves to `scrap_gadgets` + `scrap_gadget_components` tables
- Reject: Mark with reason for future reference
- Stats cards: Pending count, approved count, rejected count, total submissions

**Source Badges**:
- Scanner results now show:
  - 🟢 "Verified Database" badge (green) if from ScrapGadget DB
  - 🟡 "AI Identified" badge (amber) if from AI call
- Visible in both IdentificationResult and ComponentBreakdown views

**Access Control**:
- Admin access requires `user_roles.role = 'admin'` or `'super_admin'`
- Non-admins see "Access Denied" message
- Authentication required

### Technical Details:
- Added `from_database`, `verified`, `gadget_id` fields to `AIIdentificationResponse` type
- Created `Admin.tsx` page (19KB) with full submission management
- Database vs AI badges using Lucide icons: `<Database>` and `<Sparkles>`
- Approval flow creates records in both `scrap_gadgets` and `scrap_gadget_components`
- Updated `IdentificationResult.tsx` and `ComponentBreakdown.tsx` with source badges

### Files Changed:
- `src/pages/Admin.tsx` (NEW)
- `src/components/scanner/IdentificationResult.tsx` (badge added)
- `src/components/scanner/ComponentBreakdown.tsx` (badge added)
- `src/types/index.ts` (added from_database, verified, gadget_id)
- `src/pages/Home.tsx` (version → v0.3)

---

## v0.2 - Scan History Fix
**Date**: 2026-01-10  
**Commit**: TBD  
**Status**: 🚀 Deploying

### Changes:
- ✅ **FIXED: Scan history now shows high-level gadget** (e.g., "iPhone 12") instead of individual components
- ✅ Changed scan_history.component_name to use `parent_object` from AI response
- ✅ "Add All" now creates ONE scan entry for the parent device, not multiple entries per component
- ✅ Individual components still saved to inventory as before
- ✅ Average confidence calculated across all components for scan entry

### Bug Fixed:
**Before**: Scan history showed "STM32F103 Microcontroller" (individual component)  
**After**: Scan history shows "iPhone 12 Pro Max" (what you actually scanned)

### Technical Details:
- Updated `Scanner.tsx` line 124: Use `fullResult?.parent_object || item.component_name`
- Updated `handleAddAll` to create single scan_history entry before saving components
- Scan history now properly represents "what did I scan" vs "what components are inside"

---

## v0.1 - Initial Design Implementation
**Date**: 2026-01-10  
**Commit**: 95a6574  
**Status**: 🚀 Deployed

### Changes:
- ✅ Implemented tech circuit board homepage design
- ✅ Added hexagon pattern background
- ✅ Created "Get Started" button with electric lightning border
- ✅ Added 3 square tiles: Scan, Salvage, Build
- ✅ Implemented glowing blue horizontal separator line
- ✅ Created glossy "Component Library" card with gradient
- ✅ Added version number tracking (top-right corner)

### Features:
- Dark navy background (#0A1520)
- Electric blue accents (#00D9FF)
- Circuit board patterns on tiles
- Animated scan line effect
- Glossy card with glass shine
- PCB decoration element

### Next Version Plans:
- [ ] Additional feature pages (Tools, Marketplace)
- [ ] Scanner page enhancements
- [ ] Inventory page improvements

---

## Version Update Instructions

When making changes:
1. Update version number in `src/pages/Home.tsx` (line with `v0.X`)
2. Commit with message: `vX.X: Description of changes`
3. Add entry to this VERSION.md file
4. Push to deploy

**Current Version**: v0.1
