# ElasticDash-JS (Langfuse JavaScript/TypeScript SDK)

## Overview

This is a modular monorepo for the Langfuse JavaScript/TypeScript SDK client libraries. The project provides instrumentation and client libraries for observability and tracing in LLM applications.

## Project Structure

### Packages

- **[@elasticdash/core](./packages/core)** - Shared utilities, types and logger
- **[@elasticdash/client](./packages/client)** - API client for universal JavaScript environments
- **[@elasticdash/tracing](./packages/tracing)** - Instrumentation methods based on OpenTelemetry
- **[@elasticdash/otel](./packages/otel)** - OpenTelemetry export helpers
- **[@elasticdash/openai](./packages/openai)** - Integration for OpenAI SDK
- **[@elasticdash/langchain](./packages/langchain)** - Integration for LangChain

### Key Files

- `package.json` - Root package configuration with scripts
- `pnpm-workspace.yaml` - Monorepo workspace configuration
- `vitest.config.ts` - Testing configuration
- `tsconfig.base.json` - Base TypeScript configuration
- `eslint.config.mjs` - ESLint configuration

## Development Commands

### Setup

```bash
pnpm install          # Install dependencies
```

### Building

```bash
pnpm build            # Build all packages
pnpm build --watch    # Build and watch for changes
```

### Testing

```bash
pnpm test             # Run unit tests
pnpm test:watch       # Run tests in watch mode
pnpm test:integration # Run integration tests
pnpm test:e2e         # Run end-to-end tests (requires Langfuse server)
```

### Code Quality

```bash
pnpm lint             # Lint code
pnpm lint:fix         # Fix linting issues
pnpm format           # Format code with Prettier
pnpm format:check     # Check code formatting
pnpm typecheck        # Run TypeScript type checking
pnpm ci               # Run full CI suite (build + test + lint + typecheck + format:check)
```

### Maintenance

```bash
pnpm clean            # Clean build artifacts
pnpm nuke             # Full clean including node_modules
```

### Publishing

```bash
pnpm release          # Create production release
pnpm release:alpha    # Create alpha release
pnpm release:beta     # Create beta release
pnpm release:rc       # Create release candidate
```

## Requirements

- Node.js 20+
- pnpm package manager
- For E2E tests: Running Langfuse platform instance

## Testing Setup

### Integration Tests

- Run locally using MockSpanExporter
- No external dependencies required

### E2E Tests

- Requires running Langfuse server
- Set environment variables: `LANGFUSE_BASE_URL`, `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`

## Architecture

- **Monorepo**: Uses pnpm workspaces
- **Build system**: TypeScript with tsup
- **Testing**: Vitest with happy-dom
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier
- **CI/CD**: GitHub Actions with automated publishing
