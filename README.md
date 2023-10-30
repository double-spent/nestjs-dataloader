<h1 align="center">⚡️ NestJS Dataloader</h1>
<p align="center">A simple dataloader implementation for NestJS including request-scoped caching.</p>

<p align="center">
  <a href="https://badge.fury.io/js/@double-spent%2Fnestjs-dataloader">
    <img src="https://badge.fury.io/js/@double-spent%2Fnestjs-dataloader.svg" alt="package npm version" height="18" />
  </a>
  <img src="https://img.shields.io/npm/l/%40double-spent%2Fnestjs-dataloader" alt="package license" height="18">
  <img src="https://img.shields.io/npm/dw/%40double-spent%2Fnestjs-dataloader" alt="package weekly downloads" height="18" />
</p>

## About

> [DataLoader](https://www.npmjs.com/package/dataloader) is a generic utility to be used as part of your application's
> data fetching layer to provide a simplified and consistent API over various remote data sources such as databases or
> web services via batching and caching.

This library simplifies the integration of [DataLoader](https://www.npmjs.com/package/dataloader) within NestJS
applications by providing a friendly wrapper around the original implementation. It also introduces a request-scoped
DataLoader, enabling efficient data fetching while ensuring the isolation of requests, especially useful in GraphQL
scenarios and services that doesn't support request-scope like [NestJS CQRS.](https://github.com/nestjs/cqrs)

```ts
// before:

import DataLoader from 'dataloader';

const userLoader = new DataLoader(async (keys) => {
  // load users ..
});

// after:

import { DataLoader } from '@double-spent/nestjs-dataloader';

@Injectable()
class UserLoader extends DataLoader<User['id'], User> {
  async batchLoad(ids): User[] {
    // load users ..
  }
}
```

## Installation

```bash
npm install @double-spent/nestjs-dataloader
```

## Usage

### Default DataLoader

The default DataLoader base class offers all the functionality the original implementation does by accepting the same
options in the constructor. To use it in a NestJS module, extend the base class, decorate it with `@Injectable()`, and
add it to the module providers and exports:

```ts
// 💾 UserLoader.ts

import { DataLoader } from '@double-spent/nestjs-dataloader';

@Injectable()
export class UserLoader extends DataLoader<User['id'], User> {
  async batchLoad(ids): User[] {
    // load users ..
  }
}

// 💾 UserController.ts

@Controller()
export class UserController() {
  constructor(userLoader: UserLoader) {}

  @Get()
  async user(@Param('id') id: User['id']) {
    return this.userLoader.load(id);
  }
}

// 💾 UserModule.ts

@Module({
  providers: [UserLoader],
  controllers: [UserController],
})
export class UserModule {}
```

### Request-scoped DataLoader

The default DataLoader uses a memoized cache by default that is shared across all requests. On the other hand, the
request-scoped DataLoader leverages the [`AsyncLocalStorage`](https://nodejs.org/api/async_context.html#introduction)
class to initialize a cache that expires at the end of the request. This makes it safe to use in NestJS services that
only supports global scope but must handle request-scoped (or user-scoped) data, like
[CQRS.](https://github.com/nestjs/cqrs)

In order for this loader to work, you must import the `RequestScopedDataLoaderModule` into your application which
initializes the cache storage. An error is thrown otherwise as there's no sense in using this DataLoader if no
request-scoped storage is available.

```ts
// 💾 UserLoader.ts

import { RequestScopedDataLoader } from '@double-spent/nestjs-dataloader';

@Injectable()
export class UserLoader extends RequestScopedDataLoader<User['id'], User> {
  async batchLoad(ids): User[] {
    // load users ..
  }
}

// 💾 UserController.ts

@Controller()
export class UserController() {
  constructor(userLoader: UserLoader) {}

  @Get()
  async user(@Param('id') id: User['id']) {
    return this.userLoader.load(id);
  }
}

// 💾 UserModule.ts

@Module({
  providers: [UserLoader],
  controllers: [UserController],
  imports: [RequestScopedDataLoaderModule],
})
export class UserModule {}
```

## Troubleshooting

### I'm getting a runtime error when extending the `RequestScopedDataLoader` class.

Make sure you're importing the `RequestScopedDataLoaderModule` into your application.

## License

[MIT License](https://andreasonny.mit-license.org/2019) © Andrea SonnY
