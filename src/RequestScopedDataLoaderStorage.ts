import { AsyncLocalStorage } from 'async_hooks';

import { Injectable } from '@nestjs/common';

export const requestScopedDataLoaderStorage = new AsyncLocalStorage<RequestScopedDataLoaderStorage>();

/**
 * A transient state storage that expires at the end of the request.
 */
@Injectable()
export class RequestScopedDataLoaderStorage {
  private readonly cache = new Map();

  public set<V>(key: string, value: V): void {
    this.cache.set(key, value);
  }

  public get<V>(key: string): V {
    return this.cache.get(key);
  }
}
