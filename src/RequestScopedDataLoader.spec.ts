import { Test } from '@nestjs/testing';

import { RequestScopedDataLoaderStorageNotFoundError } from './errors';
import { RequestScopedDataLoader } from './RequestScopedDataLoader';
import { RequestScopedDataLoaderModule } from './RequestScopedDataLoaderModule';

describe(RequestScopedDataLoader, () => {
  let loader: TestDataLoader;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [RequestScopedDataLoaderModule],
      providers: [TestDataLoader],
    }).compile();

    loader = moduleRef.get(TestDataLoader);
  });

  it('loads one', async () => {
    const expectedUser = data.get(1);
    const actualUser = await loader.load(1);

    expect(actualUser).toEqual(expectedUser);
  });

  it('loads many', async () => {
    const expectedUsers = [data.get(1), data.get(3)];
    const actualUsers = await loader.loadMany([1, 3]);

    expect(actualUsers).toEqual(expectedUsers);
    expect(loader.batchLoad).toHaveBeenCalledTimes(1);
  });

  it('calls batch load once', async () => {
    const expectedUsers = [data.get(1), data.get(3)];
    const actualUsers = await Promise.all([loader.load(1), loader.load(3)]);

    expect(actualUsers).toEqual(expectedUsers);
    expect(loader.batchLoad).toHaveBeenCalledTimes(1);
  });

  it('clears one item from cache', async () => {
    await loader.load(1);
    await loader.clear(1).load(1);

    expect(loader.batchLoad).toHaveBeenCalledTimes(2);
  });

  it('clears all items from cache', async () => {
    await loader.load(1);
    await loader.clearAll().load(1);

    expect(loader.batchLoad).toHaveBeenCalledTimes(2);
  });

  it('primes one item to cache', async () => {
    await loader.prime(1, data.get(1)!).load(1);

    expect(loader.batchLoad).not.toHaveBeenCalled();
  });

  it('throws on missing request context', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [TestDataLoader],
    }).compile();

    const dataloader = moduleRef.get(TestDataLoader);

    const tryLoad = () => dataloader.load(1);

    await expect(tryLoad()).rejects.toThrowError(RequestScopedDataLoaderStorageNotFoundError);
  });
});

type User = {
  id: number;
  name: string;
};

const data = new Map([
  [
    1,
    {
      id: 1,
      name: 'test-user-1',
    },
  ],
  [
    2,
    {
      id: 2,
      name: 'test-user-2',
    },
  ],
  [
    3,
    {
      id: 2,
      name: 'test-user-2',
    },
  ],
]);

class TestDataLoader extends RequestScopedDataLoader<User['id'], User> {
  public batchLoad = jest.fn(async (ids: readonly number[]) => {
    return ids.map((id) => data.get(id));
  });
}
