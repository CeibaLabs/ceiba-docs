# SDKs

Ceiba integrates through Runtime plus a thin, language-specific SDK. The SDK extracts the downstream API key, calls Runtime, and maps the decision to stable behavior in your framework.

## Available Now

### Node

The Node SDK is published and ready to use. It ships an Express middleware and a Fastify pre-handler.

```bash
npm install @ceibalabs/ceiba-sdk
```

Start with the [Quickstart](/quickstart) or the [Node SDK repository](https://github.com/CeibaLabs/ceiba-sdk-node).

## Version And Compatibility

| | Supported |
|---|---|
| Current version | `0.1.0` |
| Node | 20 or later — tested against 20 and 22 |
| Express | `^4.21.0` or `^5.0.0` |
| Fastify | `^5.0.0` |

The SDK follows semantic versioning. While it is pre-1.0, a **minor** bump may contain
breaking changes; a patch bump will not.

Ceiba Runtime is deployed continuously rather than released as numbered versions, so the
supported combination is **the current SDK against the current Runtime**. If you pin an
older SDK, it will keep working for as long as the Runtime contract it depends on is
unchanged — but that is not something we currently promise for a specific version pair.
Check [Service Health](/service-health) for the build a service is running.

## Upcoming SDKs

Additional SDKs are planned for the future, including a NestJS SDK extension, as well as Python and Go SDKs. We'll share further updates on programmatic API access here soon.

## Continue

- [Quickstart](/quickstart) to protect a route with the Node SDK today.
- [Programmatic API Keys](/programmatic-api-keys) for backend-driven key lifecycle management.
