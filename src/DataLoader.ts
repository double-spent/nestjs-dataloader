import InternalDataLoader from 'dataloader';

/**
 * DataLoader creates a public API for loading data from a particular data back-end with unique
 * keys such as the id column of a SQL table or document name in a MongoDB database, given a batch
 * loading function.
 *
 * Each DataLoader instance contains a unique memoized cache. Use caution when used in long-lived
 * applications or those which serve many users with different access permissions and consider
 * creating a new instance per web request.
 */
export abstract class DataLoader<Key, Value, CacheKey = Key>
  implements InternalDataLoader<Key, Value | undefined, CacheKey>
{
  /** @inheritdoc */
  public name: string | null;

  protected internalDataLoader: InternalDataLoader<Key, Value | undefined, CacheKey> | null = null;

  public constructor(protected readonly options?: InternalDataLoader.Options<Key, Value | undefined, CacheKey>) {}

  /** @inheritdoc */
  public async load(id: Key): Promise<Value | undefined> {
    return this.dataLoader.load(id);
  }

  /** @inheritdoc */
  public async loadMany(ids: Key[]): Promise<(Value | undefined | Error)[]> {
    return this.dataLoader.loadMany(ids);
  }

  /** @inheritdoc */
  public clear(id: Key): this {
    this.dataLoader.clear(id);

    return this;
  }

  /** @inheritdoc */
  public clearAll(): this {
    this.dataLoader.clearAll();
    return this;
  }

  /** @inheritdoc */
  public prime(id: Key, value: Value | Error): this {
    this.dataLoader.prime(id, value);
    return this;
  }

  /**
   * Loads values in batch from the data store by key.
   *
   * **IMPORTANT:** There are a few constraints this function must uphold:
   * * The returned array of values must be the same length as the array of keys.
   * * Each index in the returned array of values must correspond to the same index in the array of keys.
   */
  protected abstract batchLoad(keys: readonly Key[]): Promise<(Value | undefined)[]>;

  /**
   * Gets the data loader instance.
   */
  protected get dataLoader() {
    if (this.internalDataLoader) {
      return this.internalDataLoader;
    }

    this.internalDataLoader = new InternalDataLoader<Key, Value | undefined, CacheKey>(async (keys) => {
      return await this.batchLoad(keys);
    }, this.options);

    return this.internalDataLoader;
  }
}
