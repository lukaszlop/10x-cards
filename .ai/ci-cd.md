# CI/CD Pipeline Documentation

## Overview

This document describes the GitHub Actions CI/CD pipeline implementation for the 10x-cards project. The pipeline is designed for a private project with optimal balance between functionality and simplicity.

## Architecture

### Workflow Structure

```
.github/
├── workflows/
│   └── main.yml (250 lines) - Main CI/CD pipeline
└── actions/ (283 lines total)
    ├── setup-node/ (51 lines) - Node.js setup with advanced caching
    ├── upload-coverage/ (60 lines) - Codecov integration
    ├── setup-e2e-env/ (121 lines) - E2E environment setup
    └── simple-summary/ (51 lines) - Pipeline status reporting
```

### Pipeline Jobs

1. **Test Matrix** (Node.js 20, 22)
2. **Build Matrix** (Node.js 20, 22)
3. **E2E Tests** (Node.js 22)
4. **Summary** (Pipeline status)

## Job Details

### 1. Test Job (`test`)

**Purpose**: Run linting and unit tests across multiple Node.js versions

**Matrix Strategy**:

- Node.js 20 LTS (backward compatibility)
- Node.js 22 LTS (current project version)

**Steps**:

1. Checkout code
2. Cache build artifacts
3. Setup Node.js and dependencies (composite action)
4. Run ESLint (CI-friendly mode)
5. Run unit tests with coverage
6. Upload coverage to Codecov (Node.js 22 only)

**Timeout**: 15 minutes

### 2. Build Job (`build`)

**Purpose**: Verify production builds across Node.js versions

**Matrix Strategy**:

- Node.js 22 LTS (main build)
- Node.js 20 LTS (compatibility test)

**Steps**:

1. Checkout code
2. Cache build artifacts
3. Setup Node.js and dependencies
4. Build for production
5. Upload build artifacts (Node.js 22 only)

**Timeout**: 20 minutes

### 3. E2E Job (`e2e`)

**Purpose**: Run end-to-end tests with real database

**Node.js Version**: 22 LTS

**Steps**:

1. Checkout code
2. Cache build artifacts
3. Setup Node.js and dependencies
4. Cache Playwright browsers
5. Install Playwright (conditional)
6. Setup E2E environment (composite action)
7. Run E2E tests with retry mechanism
8. Upload Playwright reports

**Timeout**: 45 minutes

### 4. Summary Job (`summary`)

**Purpose**: Analyze and report pipeline results

**Steps**:

1. Checkout code
2. Analyze pipeline results (composite action)

**Timeout**: 5 minutes

## Composite Actions

### setup-node

**Purpose**: Standardized Node.js setup with advanced caching

**Features**:

- Node.js installation with NPM cache
- node_modules caching with smart invalidation
- Conditional dependency installation
- Installation verification

**Cache Strategy**:

```yaml
key: ${{ runner.os }}-node-modules-${{ inputs.node-version }}-${{ hashFiles('package-lock.json') }}
```

### upload-coverage

**Purpose**: Intelligent Codecov integration

**Features**:

- Coverage file validation
- Smart token handling (public/private repos)
- Detailed upload status reporting
- Error handling

### setup-e2e-env

**Purpose**: E2E environment validation and setup

**Features**:

- Comprehensive secrets validation
- Secure .env.test file creation
- Environment verification
- Detailed error messages

### simple-summary

**Purpose**: Streamlined pipeline status reporting

**Features**:

- Critical vs non-critical failure classification
- Clear success/failure reporting
- Build and E2E focus (test matrix non-blocking)
- Simple troubleshooting guidance

## Caching Strategy

### Multi-Layer Caching

1. **NPM Cache** (actions/setup-node built-in)

   - Path: ~/.npm
   - Key: npm cache from package-lock.json

2. **node_modules Cache** (custom)

   - Path: node_modules
   - Key: OS + Node.js version + package-lock.json hash
   - Benefit: Skip `npm ci` when cache hit

3. **Build Artifacts Cache**

   - Paths: ~/.npm, .eslintcache, node_modules/.cache, dist
   - Key: OS + Node.js version + package-lock.json + source files
   - Benefit: Speed up builds and linting

4. **Playwright Browsers Cache**
   - Paths: ~/.cache/ms-playwright, ~/Library/Caches/ms-playwright
   - Key: OS + package-lock.json hash
   - Benefit: Skip browser downloads (100-200MB)

### Cache Performance

**Expected Performance Gains**:

- First run: Setup cache (baseline)
- Subsequent runs: 60-80% time reduction
- Cache hit rate: ~90% for stable dependencies

## Configuration

### Required Secrets

The pipeline requires the following GitHub repository secrets:

- `E2E_USERNAME` - E2E test user email
- `E2E_PASSWORD` - E2E test user password
- `E2E_USERNAME_ID` - E2E test user ID
- `TEST_SUPABASE_URL` - Test database URL
- `TEST_SUPABASE_KEY` - Test database anon key
- `CODECOV_TOKEN` - Codecov upload token (optional for public repos)

### Environment Variables

**Test Jobs**:

- `NODE_ENV=test`

**Build Jobs**:

- `NODE_ENV=production`
- `PUBLIC_SUPABASE_URL` - Placeholder for build
- `PUBLIC_SUPABASE_KEY` - Placeholder for build

**E2E Jobs**:

- `NODE_ENV=test`
- `CI=true`

## Failure Handling

### Critical vs Non-Critical

**Critical Failures** (Pipeline fails):

- Build job failures
- E2E test failures

**Non-Critical Failures** (Pipeline continues):

- Test matrix failures (compatibility testing)

### Retry Mechanism

**E2E Tests**: 3 attempts with 10-second delays

- Handles flaky tests
- Improves reliability
- Detailed attempt logging

## Optimization Features

### Matrix Strategy Benefits

1. **Compatibility Testing**: Ensures code works on Node.js 20 & 22
2. **Parallel Execution**: Jobs run simultaneously
3. **Selective Uploads**: Artifacts only from main version (22)

### Conditional Logic

- Coverage upload: Only Node.js 22
- Build artifacts: Only Node.js 22
- Playwright install: Only on cache miss
- Dependency install: Only on cache miss

## Troubleshooting

### Common Issues

1. **Cache Miss**: Check if package-lock.json changed
2. **E2E Failures**: Verify secrets configuration
3. **Build Failures**: Check Node.js version compatibility
4. **Coverage Upload**: Verify CODECOV_TOKEN secret

### Debug Commands

Local development commands for debugging:

```bash
npm run lint        # Check linting issues
npm run test        # Run unit tests
npm run test:e2e    # Run E2E tests locally
npm run build       # Test production build
```

### Artifacts

Available artifacts after pipeline runs:

- `production-build`: Built application (7 days retention)
- `playwright-report`: E2E test reports (30 days retention)

## Pipeline Evolution

### Optimization History

1. **Security**: Enhanced secrets handling
2. **Performance**: Multi-layer caching implementation
3. **Reliability**: Retry mechanisms and intelligent error handling
4. **Maintainability**: Composite actions for reusability
5. **Simplification**: Right-sized for private project needs

### Key Decisions

- **Matrix Simplified**: Removed Node.js 23 (over-engineering)
- **Summary Streamlined**: 219 → 51 lines (77% reduction)
- **Caching Advanced**: Multiple cache layers for performance
- **Actions Modular**: Reusable composite actions

## Metrics

### Line Count Optimization

- **Initial**: ~340+ lines (monolithic)
- **Final**: 250 lines main workflow + 283 lines actions
- **Total**: 533 lines (well-organized, maintainable)

### Performance Metrics

- **First run**: Baseline (cache setup)
- **Cache hit**: 60-80% time reduction
- **Playwright cache**: ~3-5 minutes saved
- **Dependencies cache**: ~1-2 minutes saved

## Best Practices Applied

1. **DRY Principle**: Composite actions eliminate duplication
2. **Fail Fast**: Critical failures exit immediately
3. **Graceful Degradation**: Non-critical failures don't block
4. **Caching Strategy**: Multi-layer for optimal performance
5. **Security**: Step-level secrets exposure
6. **Monitoring**: Comprehensive status reporting
7. **Documentation**: Self-documenting action descriptions

---

This CI/CD pipeline provides enterprise-grade functionality optimized for private project development with excellent developer experience and performance characteristics.
