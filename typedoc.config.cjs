/** @type {import('typedoc').TypeDocOptions} */
module.exports = {
  entryPoints: [
    "./packages/core",
    "./packages/client",
    "./packages/langchain",
    "./packages/openai",
    "./packages/otel",
    "./packages/tracing",
  ],
  entryPointStrategy: "packages",
  name: "ElasticDash JS/TS SDKs",
  navigationLinks: {
    GitHub: "http://github.com/terryjiang2020/elasticdash-js",
    Docs: "https://elasticdash.com/docs/sdk/typescript",
  },
};
