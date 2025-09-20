# Conventional Commits Guide

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for automated versioning and changelog generation.

## Commit Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Types

- **feat**: A new feature (triggers minor version bump)
- **fix**: A bug fix (triggers patch version bump)
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

## Breaking Changes

Add `!` after the type/scope or include `BREAKING CHANGE:` in the footer to trigger a major version bump:

```
feat!: remove deprecated API
```

or

```
feat: add new authentication method

BREAKING CHANGE: old auth tokens are no longer supported
```

## Examples

```bash
# Feature addition (minor bump)
feat: add deep research caching mechanism

# Bug fix (patch bump)
fix: resolve API timeout handling

# Documentation update (no version bump)
docs: update installation instructions

# Breaking change (major bump)
feat!: restructure API response format

# Scoped commit
feat(api): add rate limiting support
```

## Validation

Commits are automatically validated using commitlint. Invalid commit messages will be rejected.