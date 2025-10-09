# Netlify Build Fix Documentation

## Problem

Netlify build was failing with the error:

```
Attempting Node.js version '20
' from .nvmrc
Version '20
' not found
```

**Root Cause**: The `.nvmrc` file contained stray newline/carriage return (CR/LF) characters, causing nvm to interpret the version as `20↵` instead of `20`.

## Solution Applied

### 1. Fixed `.nvmrc` (LF only, no BOM, no trailing spaces)

**Before:**
```
20\r\n
```

**After:**
```
20
```

- Recreated file from scratch to eliminate invisible characters
- Set to major version `20` (Netlify auto-selects latest available 20.x)
- Ensured LF line endings only

### 2. Added `.node-version`

Created `.node-version` file for compatibility with other Node version managers:

```
20
```

### 3. Hardened `netlify.toml`

Updated build configuration to explicitly set Node version:

```toml
[build.environment]
  NODE_VERSION = "20"
  COREPACK_ENABLE_DOWNLOAD_PROMPT = "0"
```

- `NODE_VERSION`: Sets Node.js major version (Netlify uses latest available 20.x)
- `COREPACK_ENABLE_DOWNLOAD_PROMPT`: Ensures pnpm availability via Corepack

### 4. Updated `package.json`

Added Node version constraints and package manager specification:

```json
{
  "packageManager": "pnpm@9.10.0",
  "engines": {
    "node": ">=20.0.0 <21"
  },
  "scripts": {
    "preinstall": "corepack enable || true",
    "prebuild": "bash ./scripts/print-env.sh && ..."
  }
}
```

- `packageManager`: Specifies pnpm version via Corepack
- `engines.node`: Prevents incompatible Node versions
- `preinstall`: Enables Corepack for pnpm support
- `prebuild`: Added environment logging for debugging

### 5. Created `scripts/print-env.sh`

Build environment verification script:

```bash
#!/usr/bin/env bash
set -euo pipefail
echo "=== Build Environment ==="
echo "Node.js: $(node -v)"
echo "pnpm: $(pnpm -v || echo 'not available')"
echo "========================="
```

This script runs before each build to verify:
- Node.js version is correct
- pnpm is available

### 6. Enhanced `.editorconfig`

Added specific rules for version files:

```ini
[.nvmrc]
insert_final_newline = false
trim_trailing_whitespace = true

[.node-version]
insert_final_newline = false
trim_trailing_whitespace = true
```

This prevents future line ending issues in version files.

## Verification

After deploying these changes, the Netlify build log should show:

```
=== Build Environment ===
Node.js: v20.x.x (latest available on Netlify)
pnpm: 9.10.0
=========================
```

And the build should complete successfully.

## Prevention

To prevent this issue from recurring:

1. **Use `.editorconfig`-aware editors** (VS Code, IntelliJ, etc.)
2. **Check line endings** before committing version files
3. **Monitor Netlify build logs** for the environment verification output
4. **Keep Node version pinned** in both `.nvmrc` and `netlify.toml`

## Rollback Plan

If issues persist:

1. **Option A**: Remove `.nvmrc` and rely solely on `netlify.toml` NODE_VERSION
2. **Option B**: Set `NODE_VERSION=20` in Netlify dashboard environment variables
3. **Note**: Always use major version only (`20`) for Netlify compatibility

## References

- [Netlify Node.js Version Documentation](https://docs.netlify.com/configure-builds/manage-dependencies/#node-js)
- [nvm Documentation](https://github.com/nvm-sh/nvm)
- [Corepack Documentation](https://nodejs.org/api/corepack.html)

---

**Date Fixed**: 2025-01-08  
**Related Commit**: fix(ci): normalize Node version and line endings for Netlify

