import { NestRequestContextModule } from 'nest-request-context';

import type { OnModuleInit } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { loadPackage } from '@nestjs/common/utils/load-package.util';
import { APP_GUARD } from '@nestjs/core';

import type { RequestScopedDataLoader } from './RequestScopedDataLoader';
import { RequestScopedDataLoaderGuard } from './RequestScopedDataLoaderGuard';
import { RequestScopedDataLoaderStorage, requestScopedDataLoaderStorage } from './RequestScopedDataLoaderStorage';

/**
 * Provides services and set-up to use the {@link RequestScopedDataLoader} class, including setting up
 * the request-scoped storage used for caching loaded data. To use this module, make sure to install the
 * {@link https://www.npmjs.com/package/nest-request-context | `nest-request-context`} package.
 */
@Module({
  imports: [
    NestRequestContextModule.forRoot({
      contexts: [{ contextClass: RequestScopedDataLoaderStorage, asyncContext: requestScopedDataLoaderStorage }],
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RequestScopedDataLoaderGuard,
    },
  ],
})
export class RequestScopedDataLoaderModule implements OnModuleInit {
  public onModuleInit() {
    loadPackage('nest-request-context', 'RequestContext', () => require('nest-request-context'));
  }
}
