# Contributing to Scavy

Thank you for your interest in contributing to Scavy! This document provides guidelines and instructions for contributing.

---

## 🎯 Ways to Contribute

- **Bug Reports**: Found a bug? Open an issue with steps to reproduce
- **Feature Requests**: Have an idea? Open an issue describing the feature
- **Code Contributions**: Fix bugs or implement features via Pull Requests
- **Documentation**: Improve README, add examples, fix typos
- **Testing**: Test new features and report issues

---

## 📋 Before You Start

1. **Check existing issues**: Someone might already be working on it
2. **Discuss major changes**: Open an issue first for large features
3. **Follow code style**: Use ESLint, TypeScript strict mode
4. **Test locally**: Ensure your changes work before submitting

---

## 🔧 Development Setup

### 1. Fork and Clone

```bash
git clone https://github.com/YOUR_USERNAME/scavenge-build-reuse.git
cd scavenge-build-reuse
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 4. Start Development Server

```bash
npm run dev
# App runs at http://localhost:5173
```

---

## 🌿 Branch Strategy

- `main` - Production code (auto-deploys to Vercel)
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation changes

### Creating a Feature Branch

```bash
git checkout -b feature/my-awesome-feature
```

---

## 📝 Commit Message Guidelines

Use conventional commits format:

```
<type>(<scope>): <subject>

<body (optional)>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, missing semicolons, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples**:
```
feat(scanner): add multi-image capture support
fix(inventory): resolve duplicate component issue
docs(readme): update setup instructions
```

---

## 🧪 Testing Your Changes

### Manual Testing Checklist

- [ ] Scanner: Capture photo → Analyze → Results display correctly
- [ ] Scanner: Re-scan shows cached results (database badge)
- [ ] Inventory: Add/remove components works
- [ ] Mobile: Test on mobile viewport (responsive design)
- [ ] Console: No errors in browser console

### Linting

```bash
npm run lint
```

---

## 📤 Submitting a Pull Request

### 1. Update Your Fork

```bash
git remote add upstream https://github.com/BergUetli/scavenge-build-reuse.git
git fetch upstream
git rebase upstream/main
```

### 2. Push Your Changes

```bash
git push origin feature/my-awesome-feature
```

### 3. Create Pull Request

- Go to GitHub and click "New Pull Request"
- **Title**: Clear, descriptive title (e.g., "Add multi-image capture to scanner")
- **Description**: 
  - What does this PR do?
  - Why is this change needed?
  - How was it tested?
  - Screenshots (if UI changes)

### 4. PR Template

```markdown
## What does this PR do?
Brief description of changes.

## Why is this needed?
Explain the problem or feature request.

## How was it tested?
- [ ] Tested locally
- [ ] Tested on mobile
- [ ] No console errors

## Screenshots (if applicable)
Add screenshots for UI changes.

## Related Issues
Closes #123
```

---

## 🎨 Code Style Guidelines

### TypeScript

```typescript
// ✅ Good: Functional components with hooks
export default function MyComponent() {
  const [state, setState] = useState<string>('');
  
  return <div>{state}</div>;
}

// ❌ Avoid: Class components
export default class MyComponent extends React.Component {}
```

### React Hooks

```typescript
// ✅ Good: Custom hooks for reusable logic
export function useMyFeature() {
  const [data, setData] = useState(null);
  // ...
  return { data, refetch };
}

// Use in component:
const { data } = useMyFeature();
```

### Error Handling

```typescript
// ✅ Good: Try-catch with user-friendly messages
try {
  const result = await riskyOperation();
} catch (error) {
  console.error('[MyFeature] Operation failed:', error);
  toast({
    title: 'Error',
    description: 'Something went wrong. Please try again.',
    variant: 'destructive'
  });
}
```

---

## 🗄️ Database Changes

### Adding Tables

1. Create migration SQL in `supabase/migrations/`
2. Name format: `YYYYMMDD_description.sql`
3. Test locally first
4. Document in PR

### Edge Functions

Changes to `supabase/functions/**` trigger auto-deployment via GitHub Actions.

**Local testing**:
```bash
supabase functions serve identify-component
```

---

## 📚 Documentation

### Updating README

- Keep it clear and concise
- Update version numbers
- Add examples for new features
- Check markdown formatting

### Code Comments

```typescript
// ✅ Good: Explain WHY, not WHAT
// Compress image to reduce API costs by ~50%
const compressed = await compressImage(imageUrl);

// ❌ Avoid: Obvious comments
// Set state to compressed image
setState(compressed);
```

---

## 🐛 Reporting Bugs

### Bug Report Template

```markdown
**Describe the bug**
Clear description of what went wrong.

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should have happened?

**Screenshots**
Add screenshots if applicable.

**Environment**
- Browser: [e.g., Chrome 120]
- Device: [e.g., iPhone 12]
- Version: [e.g., v0.8.21]

**Console Logs**
Paste any errors from browser console.
```

---

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Describe the problem.

**Describe the solution you'd like**
Clear description of what you want.

**Describe alternatives you've considered**
Any alternative solutions?

**Additional context**
Screenshots, mockups, examples.
```

---

## 🚀 Release Process

Maintainers only:

```bash
# Bump version
npm version patch|minor|major --no-git-tag-version

# Update CHANGELOG.md

# Commit and push
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore: Release v0.8.22"
git tag v0.8.22
git push origin main --tags

# GitHub Release (auto-created via tag)
```

---

## 📞 Questions?

- Open a **Discussion** on GitHub
- Email: rishi_prasad@hotmail.com

---

**Thank you for contributing to Scavy!** 🎉
