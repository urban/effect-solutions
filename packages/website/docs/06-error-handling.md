---
title: Error Handling
description: "Schema.TaggedError modeling, pattern matching, and defects"
order: 6
---

# Error Handling

Effect provides structured error handling with Schema integration for serializable, type-safe errors.

## Schema.TaggedError

Define domain errors with `Schema.TaggedError`:

```typescript
import { Schema } from "effect"

class ValidationError extends Schema.TaggedError<ValidationError>()(
  "ValidationError",
  {
    field: Schema.String,
    message: Schema.String,
  }
) {}

class NotFoundError extends Schema.TaggedError<NotFoundError>()(
  "NotFoundError",
  {
    resource: Schema.String,
    id: Schema.String,
  }
) {}

const AppError = Schema.Union(ValidationError, NotFoundError)
type AppError = typeof AppError.Type

// Usage
const error = ValidationError.make({
  field: "email",
  message: "Invalid format",
})
```

**Benefits:**

- Serializable (can send over network/save to DB)
- Type-safe
- Built-in `_tag` for pattern matching
- Custom methods via class
- Sensible default `message` when you don't declare one

**Note:** `Schema.TaggedError` creates yieldable errors that can be used directly without `Effect.fail()`:

```typescript
// ✅ Good: Yieldable errors can be used directly
return error.response.status === 404
  ? UserNotFoundError.make({ id })
  : Effect.die(error)

// ❌ Redundant: no need to wrap with Effect.fail
return error.response.status === 404
  ? Effect.fail(UserNotFoundError.make({ id }))
  : Effect.die(error)
```

## Recovering from Errors

Effect provides several functions for recovering from errors. Use these to handle errors and continue program execution.

### catchAll

Handle all errors by providing a fallback effect:

```typescript
import { Effect, Schema } from "effect"

class HttpError extends Schema.TaggedError<HttpError>()(
  "HttpError",
  {
    statusCode: Schema.Number,
    message: Schema.String,
  }
) {}

class ValidationError extends Schema.TaggedError<ValidationError>()(
  "ValidationError",
  {
    message: Schema.String,
  }
) {}

declare const program: Effect.Effect<string, HttpError | ValidationError>

const recovered: Effect.Effect<string, never> = program.pipe(
  Effect.catchAll((error) =>
    Effect.gen(function* () {
      yield* Effect.logError("Error occurred", error)
      return `Recovered from ${error.name}`
    })
  )
)
```

### catchTag

Handle specific errors by their `_tag`.

```typescript
import { Effect, Schema } from "effect"

class HttpError extends Schema.TaggedError<HttpError>()(
  "HttpError",
  {
    statusCode: Schema.Number,
    message: Schema.String,
  }
) {}

class ValidationError extends Schema.TaggedError<ValidationError>()(
  "ValidationError",
  {
    message: Schema.String,
  }
) {}

const program: Effect.Effect<string, HttpError | ValidationError> =
  HttpError.make({
    statusCode: 500,
    message: "Internal server error",
  })

const recovered: Effect.Effect<string, ValidationError> = program.pipe(
  Effect.catchTag("HttpError", (error) =>
    Effect.gen(function* () {
      yield* Effect.logWarning(`HTTP ${error.statusCode}: ${error.message}`)
      return "Recovered from HttpError"
    })
  )
)
```

### catchTags

Handle multiple error types at once.

```typescript
import { Effect, Schema } from "effect"

class HttpError extends Schema.TaggedError<HttpError>()(
  "HttpError",
  {
    statusCode: Schema.Number,
    message: Schema.String,
  }
) {}

class ValidationError extends Schema.TaggedError<ValidationError>()(
  "ValidationError",
  {
    message: Schema.String,
  }
) {}

const program: Effect.Effect<string, HttpError | ValidationError> =
  HttpError.make({
    statusCode: 500,
    message: "Internal server error",
  })

const recovered: Effect.Effect<string, never> = program.pipe(
  Effect.catchTags({
    HttpError: () => Effect.succeed("Recovered from HttpError"),
    ValidationError: () => Effect.succeed("Recovered from ValidationError")
  })
)
```

## Schema.Defect - Wrapping Unknown Errors

Use `Schema.Defect` to wrap unknown errors from external libraries.

```typescript
import { Schema, Effect } from "effect"

class ApiError extends Schema.TaggedError<ApiError>()(
  "ApiError",
  {
    endpoint: Schema.String,
    statusCode: Schema.Number,
    // Wrap the underlying error from fetch/axios/etc
    error: Schema.Defect,
  }
) {}

// Usage - catching errors from external libraries
const fetchUser = (id: string) =>
  Effect.tryPromise({
    try: () => fetch(`/api/users/${id}`).then((r: Response) => r.json()),
    catch: (error) => ApiError.make({
      endpoint: `/api/users/${id}`,
      statusCode: 500,
      error
    })
  })
```

**Schema.Defect handles:**

- JavaScript `Error` instances → `{ name, message }` objects
- Any unknown value → string representation
- Serializable for network/storage

**Use for:**

- Wrapping errors from external libraries (fetch, axios, etc)
- Network boundaries (API errors)
- Persisting errors to DB
- Logging systems

## Pattern Summary

1. **Domain errors** → `Schema.TaggedError()` with `Schema.Union()` for error unions
2. **Error recovery** → `Effect.catchTag()` for specific errors, `Effect.catchTags()` for multiple, `Effect.catchAll()` for all
3. **Wrap unknown errors** → `Schema.Defect` (from external libraries)
4. **Always** → Make errors serializable for production systems
