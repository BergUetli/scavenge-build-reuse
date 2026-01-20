# v0.6.2 Fix Plan

## Issues to Fix:

### 1. YouTube Video Link Goes to Generic YouTube
**Problem**: video_url points to youtube.com instead of specific video
**Location**: DisassemblyWizard.tsx, edge function response
**Fix**: Ensure video_url includes full YouTube video URL or ID

### 2. Generic "SmartPhone" → Ask Follow-up Questions
**Problem**: When AI returns generic device name, no follow-up prompts
**Solution**: 
- Detect generic names: "SmartPhone", "Device", "Gadget", "Phone", etc.
- Show modal asking for more details
- Re-run identification with additional hint
- Improve hint UI (larger, more readable)

### 3. Slow Performance
**Problem**: Takes too long to scan
**Investigation needed**:
- Check edge function logs
- Identify bottlenecks (compression, AI call, DB lookup)
- Add caching optimizations
- Reduce image compression time

## Implementation Order:
1. Fix hint button UI (quick win)
2. Add follow-up question flow
3. Fix YouTube link
4. Performance optimizations
