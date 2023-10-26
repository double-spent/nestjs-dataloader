import { RequestScopedDataLoaderModule } from './RequestScopedDataLoaderModule';

export class RequestScopedDataLoaderStorageNotFoundError extends Error {
  constructor() {
    super(
      `No request-scoped data loader storage had been initialized. Please, make sure you are importing the ${RequestScopedDataLoaderModule.name} module in your application.`,
    );
  }
}
