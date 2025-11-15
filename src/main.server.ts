import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app/app.config';

export const serverConfig = {
  ...appConfig,
  providers: [
    ...appConfig.providers,
    provideServerRendering()
  ]
};
