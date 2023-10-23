import { DataLoader } from './DataLoader';

describe(DataLoader, () => {
  it('loads one', async () => {
    const loader = new TestDataLoader();

    const expectedUser = data.get(1);
    const actualUser = await loader.load(1);

    expect(actualUser).toEqual(expectedUser);
  });

  it('loads many', async () => {
    const loader = new TestDataLoader();

    const expectedUsers = [data.get(1), data.get(3)];
    const actualUsers = await loader.loadMany([1, 3]);

    expect(actualUsers).toEqual(expectedUsers);
    expect(loader.batchLoad).toHaveBeenCalledTimes(1);
  });

  it('calls batch load once', async () => {
    const loader = new TestDataLoader();

    const expectedUsers = [data.get(1), data.get(3)];
    const actualUsers = await Promise.all([loader.load(1), loader.load(3)]);

    expect(actualUsers).toEqual(expectedUsers);
    expect(loader.batchLoad).toHaveBeenCalledTimes(1);
  });

  it('clears one item from cache', async () => {
    const loader = new TestDataLoader({
      cache: true,
    });

    await loader.load(1);
    await loader.clear(1).load(1);

    expect(loader.batchLoad).toHaveBeenCalledTimes(2);
  });

  it('clears all items from cache', async () => {
    const loader = new TestDataLoader({
      cache: true,
    });

    await loader.load(1);
    await loader.clearAll().load(1);

    expect(loader.batchLoad).toHaveBeenCalledTimes(2);
  });

  it('primes one item to cache', async () => {
    const loader = new TestDataLoader({
      cache: true,
    });

    await loader.prime(1, data.get(1)!).load(1);

    expect(loader.batchLoad).not.toHaveBeenCalled();
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

class TestDataLoader extends DataLoader<User['id'], User> {
  public batchLoad = jest.fn(async (ids: readonly number[]) => {
    return ids.map((id) => data.get(id));
  });
}
