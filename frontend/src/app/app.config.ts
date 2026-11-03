import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { routes } from './app.routes';
import { authInterceptor } from './shared/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      // scrollPositionRestoration devuelve la posicion previa al volver
      // atras y lleva al inicio en cada navegacion nueva. App ya no fuerza
      // window.scrollTo, que anulaba esta restauracion.
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled'
      }),
      // Fundido entre paginas (estilos en styles.css). skipInitialTransition:
      // la primera carga no anima, el HTML prerenderizado se ve tal cual.
      withViewTransitions({ skipInitialTransition: true })
    ),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideClientHydration(withEventReplay())
  ]
};
