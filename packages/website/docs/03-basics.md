---
title: Basics
description: "Coding conventions for Effect.fn and Effect.gen"
order: 3
---

# Basics

Guidelines for how we structure Effect code: how to express sequencing with `Effect.gen`, and when to name effectful functions with `Effect.fn`.

## Effect.gen for Sequential Operations


Just as `async/await` provides a sequential, readable way to work with `Promise` values (avoiding nested `.then()` chains), `Effect.gen` and `yield*` provide the same ergonomic benefits for `Effect` values. 


```typescript
import { Effect } from "effect"
// hide-start
declare const fetchData: Effect.Effect<string>
declare const processData: (data: string) => Effect.Effect<string>
// hide-end

const program = Effect.gen(function* () {
  const data = yield* fetchData
  yield* Effect.logInfo(`Processing data: ${data}`)
  return processData(data)
})
```

## Effect.fn

Use `Effect.fn` with generator functions for traced, named effects:

```typescript
import { Effect } from "effect"
// hide-start
interface User {
  id: string
  name: string
}
declare const getUser: (userId: string) => Effect.Effect<User>
declare const processData: (user: User) => Effect.Effect<User>
// hide-end

const processUser = Effect.fn("processUser")(function* (userId: string) {
  yield* Effect.logInfo(`Processing user ${userId}`)
  const user = yield* getUser(userId)
  return yield* processData(user)
})
```

**Benefits:**

- Named spans for tracing/debugging
- Stack traces with location details
- Clean signatures
