---
"effect-solutions": patch
---

Refactor CLI to idiomatic Effect patterns

- Convert open-issue-service to proper Effect services with BrowserService and IssueService
- Convert update-notifier to service/layer pattern with UpdateNotifier and UpdateNotifierConfig
- Add Effect.fn trace names to all effectful functions
- Implement proper layer composition using Layer.provide
- Update all tests to use new service patterns
- Remove MCP package
- All services use Context.Tag with @cli/ prefix
- Error handling uses Schema.TaggedError
