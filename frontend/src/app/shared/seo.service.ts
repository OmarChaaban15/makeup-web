import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import type { Curso } from './cursos.service';
import { aEspanol, aIngles, esRutaIngles, normalizarRuta } from './idioma';
import { SITIO, schemaCurso, schemaMigas, schemaNegocio, schemaServicios, url } from './seo-schemas';

/** Lo que cada ruta declara en `data.seo` de app.routes.ts. */
export interface SeoRuta {
  descripcion: string;
  /** Nombre corto para las migas de pan. Sin el, no hay BreadcrumbList. */
  nombre?: string;
  /** Rutas privadas o de paso: se rastrean pero no se indexan. */
  noindex?: boolean;
  /** Ruta de la imagen para redes. Por defecto, la de la marca. */
  imagen?: string;
  schema?: 'negocio' | 'servicios';
  /** JSON-LD propio de la pagina (p. ej. BlogPosting), calculado por un resolver. */
  jsonLd?: object;
  /** Migas completas; sustituyen a las de por defecto (Inicio > nombre). */
  migas?: { nombre: string; ruta: string }[];
}

const ID_JSONLD = 'seo-jsonld';
const ID_JSONLD_CURSO = 'seo-jsonld-curso';

/**
 * Pone en cada navegacion lo que un buscador y las redes leen del <head>:
 * descripcion, canonical, robots, Open Graph, Twitter y JSON-LD.
 *
 * El <title> lo sigue gestionando el router (propiedad `title` de cada
 * ruta). Aqui solo se lee para repetirlo en og:title.
 *
 * Las paginas privadas se marcan con noindex en vez de bloquearse en
 * robots.txt: un Disallow impide a Google ver el noindex.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private router = inject(Router);
  private meta = inject(Meta);
  private doc = inject(DOCUMENT);

  /** Ruta a la que pertenece el Course publicado, si lo hay. */
  private rutaCurso: string | null = null;

  constructor() {
    this.router.events
      .pipe(filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd))
      .subscribe(() => this.actualizar());
  }

  /**
   * Añade el Course de la ruta actual cuando ya se conoce su importe, que
   * viene de la API. Se retira solo al cambiar de pagina.
   */
  publicarCurso(curso: Curso): void {
    this.rutaCurso = this.rutaActual();
    this.ponerJsonLd(ID_JSONLD_CURSO, schemaCurso(curso, this.rutaCurso));
  }

  private actualizar(): void {
    const hoja = this.hojaActiva();
    const seo = hoja?.data['seo'] as SeoRuta | undefined;
    const ruta = this.rutaActual();
    const titulo = hoja?.title ?? SITIO.nombre;

    this.ponerCanonical(url(ruta));

    // Sin declaracion en la ruta (p. ej. la redireccion comodin) no se
    // indexa: es mejor no publicar nada que repetir los metadatos de otra.
    const descripcion = seo?.descripcion ?? '';
    const imagen = url(seo?.imagen ?? SITIO.imagenOg);

    if (descripcion) {
      this.fijar('name', 'description', descripcion);
    } else {
      this.meta.removeTag("name='description'");
    }

    this.fijar(
      'name',
      'robots',
      seo && !seo.noindex ? 'index,follow,max-image-preview:large' : 'noindex,follow'
    );

    this.ponerIdiomas(ruta);

    this.fijar('property', 'og:title', titulo);
    this.fijar('property', 'og:description', descripcion);
    this.fijar('property', 'og:url', url(ruta));
    this.fijar('property', 'og:image', imagen);
    this.fijar('property', 'og:image:width', '1200');
    this.fijar('property', 'og:image:height', '630');
    this.fijar('name', 'twitter:title', titulo);
    this.fijar('name', 'twitter:description', descripcion);
    this.fijar('name', 'twitter:image', imagen);

    this.ponerJsonLd(ID_JSONLD, this.esquemas(seo, ruta));
    // El Course de la pagina anterior no debe quedarse colgado.
    if (this.rutaCurso !== ruta) this.ponerJsonLd(ID_JSONLD_CURSO, null);
  }

  private esquemas(seo: SeoRuta | undefined, ruta: string): object | null {
    if (!seo || seo.noindex) return null;

    const grafo: object[] = [];

    if (seo.schema === 'negocio') grafo.push(schemaNegocio());
    if (seo.schema === 'servicios') grafo.push(schemaServicios());

    if (seo.jsonLd) grafo.push(seo.jsonLd);

    if (seo.migas) {
      grafo.push(schemaMigas(seo.migas));
    } else if (seo.nombre && ruta !== '/' && ruta !== '/en') {
      grafo.push(
        schemaMigas([
          esRutaIngles(ruta) ? { nombre: 'Home', ruta: '/en' } : { nombre: 'Inicio', ruta: '/' },
          { nombre: seo.nombre, ruta }
        ])
      );
    }

    if (grafo.length === 0) return null;

    return grafo.length === 1 ? grafo[0] : grafo;
  }

  /** La ruta mas profunda activa: es la que lleva el `data` y el titulo. */
  private hojaActiva(): ActivatedRouteSnapshot | null {
    let ruta: ActivatedRouteSnapshot | null = this.router.routerState.snapshot.root;

    while (ruta?.firstChild) {
      ruta = ruta.firstChild;
    }

    return ruta;
  }

  /** Ruta sin parametros, fragmento ni barra final: una URL por pagina. */
  private rutaActual(): string {
    return normalizarRuta(this.router.url);
  }

  /**
   * Idioma del documento, og:locale y enlaces hreflang. Solo las paginas que
   * existen en los dos idiomas declaran alternativas; hreflang exige que se
   * apunten entre si, asi que no se publica en el resto.
   */
  private ponerIdiomas(ruta: string): void {
    const ingles = esRutaIngles(ruta);
    const es = ingles ? aEspanol(ruta) : ruta;
    const en = ingles ? ruta : aIngles(ruta);

    this.doc.documentElement.setAttribute('lang', ingles ? 'en' : 'es');
    this.fijar('property', 'og:locale', ingles ? 'en_US' : 'es_ES');

    this.doc.head
      .querySelectorAll('link[rel="alternate"][hreflang]')
      .forEach(enlace => enlace.remove());

    if (es === null || en === null) {
      this.meta.removeTag("property='og:locale:alternate'");
      return;
    }

    this.fijar('property', 'og:locale:alternate', ingles ? 'es_ES' : 'en_US');

    for (const [hreflang, destino] of [['es', es], ['en', en], ['x-default', es]]) {
      const enlace = this.doc.createElement('link');
      enlace.setAttribute('rel', 'alternate');
      enlace.setAttribute('hreflang', hreflang);
      enlace.setAttribute('href', url(destino));
      this.doc.head.appendChild(enlace);
    }
  }

  private fijar(atributo: 'name' | 'property', clave: string, contenido: string): void {
    this.meta.updateTag({ [atributo]: clave, content: contenido }, `${atributo}='${clave}'`);
  }

  private ponerCanonical(href: string): void {
    let enlace = this.doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

    if (!enlace) {
      enlace = this.doc.createElement('link');
      enlace.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(enlace);
    }

    enlace.setAttribute('href', href);
  }

  private ponerJsonLd(id: string, datos: object | null): void {
    const existente = this.doc.getElementById(id);

    if (datos === null) {
      existente?.remove();
      return;
    }

    const script = existente ?? this.doc.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute('id', id);
    script.textContent = JSON.stringify(datos);

    if (!existente) this.doc.head.appendChild(script);
  }
}
