import type { CanActivate } from '@nestjs/common';
import { Injectable } from '@nestjs/common';

import type { RequestScopedDataLoader } from './RequestScopedDataLoader';
import { RequestScopedDataLoaderStorage, requestScopedDataLoaderStorage } from './RequestScopedDataLoaderStorage';

/**
 * Initializes the request-scoped storage used by the {@link RequestScopedDataLoader} on request init.
 */
@Injectable()
export class RequestScopedDataLoaderGuard implements CanActivate {
  /** @inheritdoc */
  public canActivate() {
    requestScopedDataLoaderStorage.enterWith(new RequestScopedDataLoaderStorage());
    return true;
  }
}
