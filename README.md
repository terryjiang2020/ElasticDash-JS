# ElasticDash JS/TS SDK

[![MIT License](https://img.shields.io/badge/License-MIT-red.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![NPM Version](https://img.shields.io/npm/v/@elasticdash/client.svg?style=flat-square&label=npm+elasticdash)](https://www.npmjs.com/package/@elasticdash/client)

## About ElasticDash

ElasticDash is a fork of Langfuse, extended with additional observability and regression testing features for the ElasticDash platform. We maintain compatibility with core Langfuse concepts while adding specialized instrumentation for production LLM applications and robust evaluation workflows.

**Original Project:** [Langfuse JS SDK](https://github.com/langfuse/langfuse-js)
**License:** MIT License (see [LICENSE](LICENSE) for full terms and attribution)

### Key Differences from Langfuse

- Integrated with ElasticDash Logger platform (https://logger.elasticdash.com)
- Enhanced OpenTelemetry support for distributed tracing
- Custom instrumentation for additional LLM providers
- Extended tracing, observability, and regression testing features for production environments

## Installation

```bash
pnpm install @elasticdash/client @elasticdash/tracing
```

## Configuration

Set your ElasticDash credentials as environment variables so the SDK knows who you are (if using the hosted platform):

```bash
ELASTICDASH_SECRET_KEY="sk-lf-..."
ELASTICDASH_PUBLIC_KEY="pk-lf-..."
ELASTICDASH_BASE_URL="https://logger.elasticdash.com"
```

Or in your JS/TS files:

```js
process.env.ELASTICDASH_PUBLIC_KEY = "pk-lf-...";
process.env.ELASTICDASH_SECRET_KEY = "sk-lf-...";
process.env.ELASTICDASH_BASE_URL = "https://logger.elasticdash.com";
```

## Packages

| Package                                        | NPM                                                                                                                     | Description                                                  | Environments |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------ |
| [@elasticdash/client](./packages/client)       | [![NPM](https://img.shields.io/npm/v/@elasticdash/client.svg)](https://www.npmjs.com/package/@elasticdash/client)       | ElasticDash API client for universal JavaScript environments | Universal JS |
| [@elasticdash/tracing](./packages/tracing)     | [![NPM](https://img.shields.io/npm/v/@elasticdash/tracing.svg)](https://www.npmjs.com/package/@elasticdash/tracing)     | ElasticDash instrumentation methods based on OpenTelemetry   | Node.js 20+  |
| [@elasticdash/otel](./packages/otel)           | [![NPM](https://img.shields.io/npm/v/@elasticdash/otel.svg)](https://www.npmjs.com/package/@elasticdash/otel)           | ElasticDash OpenTelemetry export helpers                     | Node.js 20+  |
| [@elasticdash/openai](./packages/openai)       | [![NPM](https://img.shields.io/npm/v/@elasticdash/openai.svg)](https://www.npmjs.com/package/@elasticdash/openai)       | ElasticDash integration for OpenAI SDK                       | Universal JS |
| [@elasticdash/langchain](./packages/langchain) | [![NPM](https://img.shields.io/npm/v/@elasticdash/langchain.svg)](https://www.npmjs.com/package/@elasticdash/langchain) | ElasticDash integration for LangChain                        | Universal JS |

## Usage

### General Tracing

You can start tracing by initializing the ElasticDash client:

```js
import { getClient } from "@elasticdash/client";

const elasticdash = getClient();

// Verify connection
elasticdash.authCheck().then((ok) => {
  if (ok) {
    console.log("ElasticDash client is authenticated and ready!");
  } else {
    console.error(
      "Authentication failed. Please check your credentials and host.",
    );
  }
});
```

### OpenAI SDK

Swap the regular OpenAI import to ElasticDash's OpenAI drop-in. It behaves like the regular OpenAI client while also recording each call for you.

```js
import { openai } from "@elasticdash/openai";
```

Use the OpenAI SDK as you normally would. The wrapper captures the prompt, model, and output and forwards everything to ElasticDash.

```js
const completion = await openai.chat.completions.create({
  name: "test-chat",
  model: "gpt-4o",
  messages: [
    {
      role: "system",
      content:
        "You are a very accurate calculator. You output only the result of the calculation.",
    },
    { role: "user", content: "1 + 1 = " },
  ],
  metadata: { someMetadataKey: "someValue" },
});
```

### Manual Observation

This can help you cover the LLM models that we are not currently supporting.

```js
import { getClient } from "@elasticdash/client";

const elasticdash = getClient();

// Verify connection
elasticdash.authCheck().then((ok) => {
  if (ok) {
    console.log("ElasticDash client is authenticated and ready!");
  } else {
    console.error(
      "Authentication failed. Please check your credentials and host.",
    );
  }
});

// Create a span using a context manager (pseudo-code, see API for details)
const span = elasticdash.startAsCurrentObservation({
  asType: "span",
  name: "process-request",
});
// Your processing logic here
span.update({ input: "Llm input here" });

// Create a nested generation for an LLM call
const generation = elasticdash.startAsCurrentObservation({
  asType: "generation",
  name: "llm-response",
  model: "gpt-3.5-turbo",
});
generation.update({ input: "Llm input here" });
// Your LLM call logic here
span.update({ output: "Processing complete" });
generation.update({ output: "Generated response" });

// All spans are automatically closed when exiting their context blocks (see API for async/await usage)

// Flush events in short-lived applications
elasticdash.flush();
```

### Sample Usage

Always include the http.method, http.route, and http.body (optional) in the span.
Make sure to include the input and output of the LLM in the observation.
Each LLM call should have an observation, while all LLM calls should be under (contained by) the span.

```js
const span = elasticdash.startAsCurrentSpan({
  name: "POST /chat/gemini/send/",
});
span.update({
  metadata: {
    "http.method": "POST",
    "http.route": "/chat/gemini/send/",
    "http.body": body,
  },
});
const generation = elasticdash.startAsCurrentObservation({
  asType: "generation",
  name: "gemini-response",
  model: "gemini-2.5-flash",
  input: {
    message: userMessage,
    history,
  },
});
// ... LLM call logic ...
generation.update({ output: botResponse });
```

## Documentation

- [Docs](https://elasticdash.com/docs)
- [Reference](https://elasticdash.com/docs/reference)

## Development

This is a monorepo managed with pnpm. See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed development instructions.

Quick start:

```bash
pnpm install    # Install dependencies
pnpm build      # Build all packages
pnpm test       # Run tests
pnpm ci         # Run full CI suite
```

## License

[MIT](LICENSE)
