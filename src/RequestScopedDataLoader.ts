import InternalDataLoader from 'dataloader';
import { v4 as uuidv4 } from 'uuid';

import { Inject, Optional } from '@nestjs/common';

import { DataLoader } from './DataLoader';
import { RequestScopedDataLoaderStorageNotFoundError } from './errors';
import type { RequestScopedDataLoaderModule } from './RequestScopedDataLoaderModule';
import { RequestScopedDataLoaderStorage } from './RequestScopedDataLoaderStorage';

/**
 * DataLoader creates a public API for loading data from a particular data back-end with unique
 * keys such as the id column of a SQL table or document name in a MongoDB database, given a batch
 * loading function.
 *
 * DataLoader provides by default a memoized cache that is shared across all instances. This is not
 * suitable for scenarios where the data should only be cached per request or not shared between users.
 * The {@link RequestScopedDataLoader} uses a transient cache that expires at the end of the request
 * instead. It should be used along the {@link RequestScopedDataLoaderModule} to activate the transient
 * storage where the cache will be stored.
 */
export abstract class RequestScopedDataLoader<Key, Value, CacheKey = Key> extends DataLoader<Key, Value, CacheKey> {
  /**
   * The request context instance to store the cache.
   */
  @Optional()
  @Inject(RequestScopedDataLoaderStorage)
  public requestScopedStorage: RequestScopedDataLoaderStorage | undefined;

  /**
   * Initializes a new instance.
   *
   * @param options The data loader options.
   */
  public constructor(options?: Omit<InternalDataLoader.Options<Key, Value | undefined, CacheKey>, 'cacheMap'>) {
    super(options);
  }

  /** @inheritdoc */
  protected get dataLoader() {
    if (this.internalDataLoader) {
      return this.internalDataLoader;
    }

    if (!this.requestScopedStorage) {
      throw new RequestScopedDataLoaderStorageNotFoundError();
    }

    const cacheKey = `${this.constructor.name}_${uuidv4()}`;
    const requestContext = this.requestScopedStorage;

    class ProxyCacheMap<Key, Value> implements InternalDataLoader.CacheMap<Key, Value> {
      public get(key: Key) {
        return this.getCache().get(key);
      }

      public set(key: Key, value: Value) {
        return this.getCache().set(key, value);
      }

      public delete(key: Key) {
        return this.getCache().delete(key);
      }

      public clear() {
        this.getCache().clear();
      }

      private getCache() {
        let cache = requestContext.get<Map<Key, Value>>(cacheKey);

        if (!cache) {
          requestContext.set(cacheKey, (cache = new Map()));
        }

        return cache;
      }
    }

    const cacheMap = new ProxyCacheMap<CacheKey, Promise<Value>>();

    this.internalDataLoader = new InternalDataLoader<Key, Value | undefined, CacheKey>(
      async (keys) => {
        return await this.batchLoad(keys);
      },
      {
        ...this.options,
        cacheMap,
      },
    );

    return this.internalDataLoader;
  }
}
