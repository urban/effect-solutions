---
title: Data Modeling
description: "Schema classes, unions, brands, pattern matching, and JSON serialization"
order: 5
---

# Data Modeling

TypeScript's built-in tools for modeling data are limited. Effect's `Schema` library provides a robust alternative with runtime validation, serialization, and type safety built in.

## Why Schema?

- **Single source of truth**: define once, get TypeScript types + runtime validation + JSON serialization + auto-generated tooling.
- **Parse safely**: validate HTTP/CLI/config data with detailed errors—catch bad data before it crashes your app.
- **Rich domain types**: branded primitives prevent confusion; classes add methods and behavior.
- **Ecosystem integration**: use the same schema everywhere—RPC, HttpApi, CLI, frontend, backend.

## Schema Classes

Use `Schema.Class` for composite data models with multiple fields:

```typescript
import { Schema } from "effect"

const UserId = Schema.String.pipe(Schema.brand("UserId"))
type UserId = typeof UserId.Type

export class User extends Schema.Class<User>("User")({
  id: UserId,
  name: Schema.String,
  email: Schema.String,
  createdAt: Schema.Date,
}) {
  // Add custom getters and methods to extend functionality
  get displayName() {
    return `${this.name} (${this.email})`
  }
}

// Usage
const user = User.make({
  id: UserId.make("user-123"),
  name: "Alice",
  email: "alice@example.com",
  createdAt: new Date(),
})

console.log(user.displayName) // "Alice (alice@example.com)"
```

## Schema Unions

Use `Schema.Union` for types that can be one of several variants:

```typescript
import { Schema } from "effect"

const Status = Schema.Literal("pending", "active", "completed")
type Status = typeof Status.Type // "pending" | "active" | "completed"
```

For more complex unions with multiple fields per variant, use `Schema.TaggedClass`:

```typescript
import { Match, Schema } from "effect"

// Define variants with a tag field
export class Success extends Schema.TaggedClass<Success>()("Success", {
  value: Schema.Number,
}) {}

export class Failure extends Schema.TaggedClass<Failure>()("Failure", {
  error: Schema.String,
}) {}

// Create the union
export const Result = Schema.Union(Success, Failure)
export type Result = typeof Result.Type

// Pattern 1: Match.value - inline matching
const handleResultInline = (result: Result) =>
  Match.value(result).pipe(
    Match.tag("Success", ({ value }) => `Got: ${value}`),
    Match.tag("Failure", ({ error }) => `Error: ${error}`),
    Match.exhaustive
  )

// Pattern 2: Match.type - extract matcher (compiled once, better perf)
const matcher = Match.type<Result>().pipe(
  Match.tag("Success", ({ value }) => `Got: ${value}`),
  Match.tag("Failure", ({ error }) => `Error: ${error}`),
  Match.exhaustive
)

const handleResult = (result: Result) => matcher(result)

// Pattern 3: Match.tags - handle multiple tags together
const isOk = Match.type<Result>().pipe(
  Match.tag("Success", () => true),
  Match.orElse(() => false)
)

const success = Success.make({ value: 42 })
const failure = Failure.make({ error: "oops" })

handleResult(success) // "Got: 42"
handleResult(failure) // "Error: oops"
isOk(success) // true
isOk(failure) // false
```

**Benefits:**

- Type-safe exhaustive matching
- Compiler ensures all cases handled
- No possibility of invalid states

## Branded Types

Use branded types to prevent mixing values that have the same underlying type. **In a well-designed domain model, nearly all primitives should be branded**. Not just IDs, but emails, URLs, timestamps, slugs, counts, percentages, and any value with semantic meaning.

```typescript
import { Schema } from "effect"

// IDs - prevent mixing different entity IDs
export const UserId = Schema.String.pipe(Schema.brand("UserId"))
export type UserId = typeof UserId.Type

export const PostId = Schema.String.pipe(Schema.brand("PostId"))
export type PostId = typeof PostId.Type

// Domain primitives - create a rich type system
export const Email = Schema.String.pipe(Schema.brand("Email"))
export type Email = typeof Email.Type

export const Port = Schema.Int.pipe(Schema.between(1, 65535), Schema.brand("Port"))
export type Port = typeof Port.Type

// Usage - impossible to mix types
const userId = UserId.make("user-123")
const postId = PostId.make("post-456")
const email = Email.make("alice@example.com")

function getUser(id: UserId) { return id }
function sendEmail(to: Email) { return to }

// This works
getUser(userId)
sendEmail(email)

// All of these produce type errors
// getUser(postId) // Can't pass PostId where UserId expected
// sendEmail(slug) // Can't pass Slug where Email expected
// const bad: UserId = "raw-string" // Can't assign raw string to branded type
```

**Why brand everything?**

- Prevents subtle bugs (passing email where username expected)
- Self-documenting code (function signatures reveal intent)
- Validation at boundaries (Schema.decode enforces rules once)
- Refactoring safety (rename `Email` → `EmailAddress` catches all uses)
- Beautiful domain model (types match business concepts)

## Pattern Summary

1. **Composite types**: `Schema.Class` with `.make()`
2. **Unions**: `Schema.Literal()` for simple enums, `Schema.TaggedClass()` + `Schema.Union()` for complex variants
3. **IDs**: Branded types with `Schema.brand()`
4. **Compose**: Use branded IDs inside schema classes
5. **Never**: Use plain strings for IDs or raw TypeScript types for models

## JSON Encoding & Decoding

Use `Schema.parseJson` to parse JSON strings and validate them with your schema in one step. This combines `JSON.parse` + `Schema.decodeUnknown` for decoding, and `JSON.stringify` + `Schema.encode` for encoding:

```typescript
import { Effect, Schema } from "effect"

const Row = Schema.Literal("A", "B", "C", "D", "E", "F", "G", "H")
const Column = Schema.Literal("1", "2", "3", "4", "5", "6", "7", "8")

class Position extends Schema.Class<Position>("Position")({
  row: Row,
  column: Column,
}) {}

class Move extends Schema.Class<Move>("Move")({
  from: Position,
  to: Position,
}) {}

// parseJson combines JSON.parse + schema decoding
// MoveFromJson is a schema that takes a JSON string and returns a Move
const MoveFromJson = Schema.parseJson(Move)

const program = Effect.gen(function* () {
  // Parse and validate JSON string in one step
  // Use MoveFromJson (not Move) to decode from JSON string
  const jsonString = '{"from":{"row":"A","column":"1"},"to":{"row":"B","column":"2"}}'
  const move = yield* Schema.decodeUnknown(MoveFromJson)(jsonString)

  yield* Effect.log("Decoded move", move)

  // Encode to JSON string in one step (typed as string)
  // Use MoveFromJson (not Move) to encode to JSON string
  const json = yield* Schema.encode(MoveFromJson)(move)
  return json
})
```

Having a single source of truth means every boundary (HTTP handlers, CLI arguments, file IO) can reuse the same schema for both validation and serialization.
