import { ElasticDashOtelSpanAttributes } from "@elasticdash/core";
import { type Attributes } from "@opentelemetry/api";

import {
  ElasticDashObservationAttributes,
  ElasticDashObservationType,
  ElasticDashTraceAttributes,
} from "./types.js";

/**
 * Creates OpenTelemetry attributes from ElasticDash trace attributes.
 *
 * Converts user-friendly trace attributes into the internal OpenTelemetry
 * attribute format required by the span processor.
 *
 * @param attributes - ElasticDash trace attributes to convert
 * @returns OpenTelemetry attributes object with non-null values
 *
 * @example
 * ```typescript
 * import { createTraceAttributes } from '@elasticdash/tracing';
 *
 * const otelAttributes = createTraceAttributes({
 *   name: 'user-checkout-flow',
 *   userId: 'user-123',
 *   sessionId: 'session-456',
 *   tags: ['checkout', 'payment'],
 *   metadata: { version: '2.1.0' }
 * });
 *
 * span.setAttributes(otelAttributes);
 * ```
 *
 * @public
 */
export function createTraceAttributes({
  name,
  userId,
  sessionId,
  version,
  release,
  input,
  output,
  metadata,
  tags,
  environment,
  public: isPublic,
}: ElasticDashTraceAttributes = {}): Attributes {
  const attributes = {
    [ElasticDashOtelSpanAttributes.TRACE_NAME]: name,
    [ElasticDashOtelSpanAttributes.TRACE_USER_ID]: userId,
    [ElasticDashOtelSpanAttributes.TRACE_SESSION_ID]: sessionId,
    [ElasticDashOtelSpanAttributes.VERSION]: version,
    [ElasticDashOtelSpanAttributes.RELEASE]: release,
    [ElasticDashOtelSpanAttributes.TRACE_INPUT]: _serialize(input),
    [ElasticDashOtelSpanAttributes.TRACE_OUTPUT]: _serialize(output),
    [ElasticDashOtelSpanAttributes.TRACE_TAGS]: tags,
    [ElasticDashOtelSpanAttributes.ENVIRONMENT]: environment,
    [ElasticDashOtelSpanAttributes.TRACE_PUBLIC]: isPublic,
    ..._flattenAndSerializeMetadata(metadata, "trace"),
  };

  return Object.fromEntries(
    Object.entries(attributes).filter(([_, v]) => v != null),
  );
}

export function createObservationAttributes(
  type: ElasticDashObservationType,
  attributes: ElasticDashObservationAttributes,
): Attributes {
  const {
    metadata,
    input,
    output,
    level,
    statusMessage,
    version,
    completionStartTime,
    model,
    modelParameters,
    usageDetails,
    costDetails,
    prompt,
  } = attributes;

  let otelAttributes: Attributes = {
    [ElasticDashOtelSpanAttributes.OBSERVATION_TYPE]: type,
    [ElasticDashOtelSpanAttributes.OBSERVATION_LEVEL]: level,
    [ElasticDashOtelSpanAttributes.OBSERVATION_STATUS_MESSAGE]: statusMessage,
    [ElasticDashOtelSpanAttributes.VERSION]: version,
    [ElasticDashOtelSpanAttributes.OBSERVATION_INPUT]: _serialize(input),
    [ElasticDashOtelSpanAttributes.OBSERVATION_OUTPUT]: _serialize(output),
    [ElasticDashOtelSpanAttributes.OBSERVATION_MODEL]: model,
    [ElasticDashOtelSpanAttributes.OBSERVATION_USAGE_DETAILS]:
      _serialize(usageDetails),
    [ElasticDashOtelSpanAttributes.OBSERVATION_COST_DETAILS]:
      _serialize(costDetails),
    [ElasticDashOtelSpanAttributes.OBSERVATION_COMPLETION_START_TIME]:
      _serialize(completionStartTime),
    [ElasticDashOtelSpanAttributes.OBSERVATION_MODEL_PARAMETERS]:
      _serialize(modelParameters),
    ...(prompt && !prompt.isFallback
      ? {
          [ElasticDashOtelSpanAttributes.OBSERVATION_PROMPT_NAME]: prompt.name,
          [ElasticDashOtelSpanAttributes.OBSERVATION_PROMPT_VERSION]:
            prompt.version,
        }
      : {}),
    ..._flattenAndSerializeMetadata(metadata, "observation"),
  };

  return Object.fromEntries(
    Object.entries(otelAttributes).filter(([_, v]) => v != null),
  );
}

/**
 * Safely serializes an object to JSON string.
 *
 * @param obj - Object to serialize
 * @returns JSON string or undefined if null/undefined, error message if serialization fails
 * @internal
 */
function _serialize(obj: unknown): string | undefined {
  try {
    if (typeof obj === "string") return obj;

    return obj != null ? JSON.stringify(obj) : undefined;
  } catch {
    return "<failed to serialize>";
  }
}

/**
 * Flattens and serializes metadata into OpenTelemetry attribute format.
 *
 * Converts nested metadata objects into dot-notation attribute keys.
 * For example, `{ database: { host: 'localhost' } }` becomes
 * `{ 'elasticdash.metadata.database.host': 'localhost' }`.
 *
 * @param metadata - Metadata object to flatten
 * @param type - Whether this is for observation or trace metadata
 * @returns Flattened metadata attributes
 * @internal
 */
function _flattenAndSerializeMetadata(
  metadata: unknown,
  type: "observation" | "trace",
): Record<string, string> {
  const prefix =
    type === "observation"
      ? ElasticDashOtelSpanAttributes.OBSERVATION_METADATA
      : ElasticDashOtelSpanAttributes.TRACE_METADATA;

  const metadataAttributes: Record<string, string> = {};

  if (metadata === undefined || metadata === null) {
    return metadataAttributes;
  }

  if (typeof metadata !== "object" || Array.isArray(metadata)) {
    const serialized = _serialize(metadata);
    if (serialized) {
      metadataAttributes[prefix] = serialized;
    }
  } else {
    for (const [key, value] of Object.entries(metadata)) {
      const serialized = typeof value === "string" ? value : _serialize(value);
      if (serialized) {
        metadataAttributes[`${prefix}.${key}`] = serialized;
      }
    }
  }

  return metadataAttributes;
}
