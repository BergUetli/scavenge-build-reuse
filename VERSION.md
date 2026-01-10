# Scavy Version History

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
