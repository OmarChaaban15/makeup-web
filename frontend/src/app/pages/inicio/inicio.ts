import {
  Component, signal, computed, OnInit, OnDestroy, ElementRef,
  ViewChild, AfterViewInit, HostListener, PLATFORM_ID, Inject, inject
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { ScrollRevealDirective } from '../../shared/scroll-reveal.directive';
import { RUTAS } from '../../shared/idioma';
import { CursosService, Curso } from '../../shared/cursos.service';

interface Particle {
  x: number; y: number; size: number; speedX: number; speedY: number; opacity: number;
}

interface TarjetaServicio {
  ruta: string;
  titulo: string;
  etiqueta: string;
  texto: string;
  img: string;
  alt: string;
  /**
   * Precio orientativo "desde X €". Vacio a proposito: lo fija la duena.
   * Con un valor (p. ej. '180 €') la tarjeta lo muestra; null no pinta nada.
   */
  desde: string | null;
}

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, ScrollRevealDirective],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio implements OnInit, OnDestroy, AfterViewInit {

  private readonly cursos = inject(CursosService);

  // ── Hero videos ──────────────────────────────────────────────
  private readonly heroVideos = [
    'videos/masterclass_dia_final.mp4',
    'videos/masterclass_noche_final.mp4',
  ];
  private heroVideoIndex = 0;
  /** Segundo del video que se ve cuando la portada esta en pausa. */
  private static readonly SEGUNDO_FOTOGRAMA_FIJO = 2;
  private readonly precargados = new Set<string>();

  @ViewChild('heroVideo') heroVideoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('particleCanvas') particleCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('botonCerrarVisor') cerrarVisorRef?: ElementRef<HTMLButtonElement>;

  // ── Particle system ──
  private particles: Particle[] = [];
  private animFrameId: number | null = null;
  private canvasCtx: CanvasRenderingContext2D | null = null;

  // ── Cifras ──
  // Datos, no adorno: se muestran tal cual, sin contar desde 0. Las cifras
  // las decide la duena (ver informe: inicio y sobre-mi no coinciden).
  readonly cifras = [
    { valor: '+5', etiqueta: 'Años' },
    { valor: '+500', etiqueta: 'Clientas' },
    { valor: '100%', etiqueta: 'A medida' },
  ];

  // ── Servicios ──
  // El servicio estrella (novias) va primero y mas grande; cada tarjeta lleva
  // a su propia pagina en vez de a /servicios en general.
  readonly servicioEstrella: TarjetaServicio = {
    ruta: RUTAS.es.novias,
    titulo: 'Novias & Bodas',
    etiqueta: 'Servicio estrella',
    texto: 'Prueba previa personalizada, kit de retoque y preparación en villas u hoteles de Ibiza.',
    img: 'images/maquillaje-novia-ibiza.png',
    alt: 'Maquillaje de novia',
    desde: null,
  };

  readonly otrosServicios: TarjetaServicio[] = [
    {
      ruta: RUTAS.es.eventos,
      titulo: 'Invitadas & Galas',
      etiqueta: 'Social',
      texto: 'Looks de fiesta sofisticados con pestañas a medida y fijación extrema para bailar toda la noche.',
      img: 'images/maquillaje-invitada-fiesta-ibiza.png',
      alt: 'Maquillaje para eventos',
      desde: null,
    },
    {
      ruta: RUTAS.es.editorial,
      titulo: 'Editorial & Campañas',
      etiqueta: 'Moda',
      texto: 'Concepto creativo para marcas de moda, lookbooks y shootings con fotógrafos internacionales.',
      img: 'images/maquillaje-editorial-moda-ibiza.png',
      alt: 'Maquillaje editorial',
      desde: null,
    },
    {
      ruta: RUTAS.es.cine,
      titulo: 'Rodajes & TV',
      etiqueta: 'Cine & TV',
      texto: 'Control de brillo y textura específico para ópticas 4K/8K en exteriores, spots y videoclips.',
      img: 'images/maquillaje-cine-rodaje-ibiza.jpeg',
      alt: 'Maquillaje audiovisual',
      desde: null,
    },
  ];

  // ── Masterclass ──
  // Precio y acceso los da la API (precio_efectivo, oferta_activa,
  // duracion_acceso_meses): antes estaban escritos a mano y no coincidian
  // con /cursos.
  private readonly masterclass = signal<Curso | null>(null);
  readonly precioMasterclass = computed(() => {
    const curso = this.masterclass();
    return curso ? this.cursos.formatearPrecio(curso.precio_efectivo) : null;
  });
  readonly precioAnterior = computed(() => {
    const curso = this.masterclass();
    return curso?.oferta_activa ? this.cursos.formatearPrecio(curso.precio) : null;
  });
  readonly mesesAcceso = computed(() => this.masterclass()?.duracion_acceso_meses ?? null);

  // ── Testimonios VIP ──
  readonly testimonios = [
    {
      nombre: 'Elena M.',
      tipo: 'Novia · Boda en Santa Eulalia, Ibiza',
      texto: 'Yonaida fue la mejor decisión para mi gran día. Supo captar exactamente lo que quería desde la primera prueba. El maquillaje aguantó el calor de agosto y la fiesta hasta el amanecer intacto.',
      estrellas: 5,
    },
    {
      nombre: 'Sofía & Laura',
      tipo: 'Editorial de Moda · Campaña Baño',
      texto: 'Profesionalidad intachable en set. Su técnica de piel luminosa y su rapidez para cambios de look elevaron las fotografías a nivel de revista de lujo. Un diez.',
      estrellas: 5,
    },
    {
      nombre: 'Carlota R.',
      tipo: 'Alumna · Masterclass Automaquillaje',
      texto: 'Nunca conseguía hacerme el eyeliner ni que la base no se viese pesada. Con sus explicaciones paso a paso he aprendido a maquillarme en 15 minutos viéndome radiante.',
      estrellas: 5,
    },
  ];

  // ── Slideshow (works section) ─────────────────
  readonly slides = [
    { src: 'images/maquillaje-novia-ibiza.png', alt: 'Maquillaje de novia en Ibiza', pos: 'center center' },
    { src: 'images/maquillaje-novia-detalle-ojos.jpg', alt: 'Detalle de visagismo y acabado de ojos en alta definición', pos: 'center 30%' },
    { src: 'images/maquillaje-social-eventos-ibiza.png', alt: 'Maquillaje social para eventos', pos: 'center 35%' },
    { src: 'images/maquillaje-pasarela-editorial.jpeg', alt: 'Editorial de moda y pasarela con mirada protagonista', pos: 'center 25%' },
    { src: 'images/maquillaje-invitada-fiesta-ibiza.png', alt: 'Estilismo de fiesta e invitada', pos: 'center 35%' },
    { src: 'images/maquillaje-sesion-creativa-editorial.jpg', alt: 'Sesión creativa y editorial contemporáneo', pos: 'center 25%' },
    { src: 'images/maquillaje-editorial-moda-ibiza.png', alt: 'Producción de moda y campañas', pos: 'center 40%' },
    { src: 'images/maquillaje-glitter-textura-piel.jpg', alt: 'Técnica de pigmentación glitter y textura de piel', pos: 'center 35%' },
    { src: 'images/labios-brillo-dorado-detalle.jpg', alt: 'Detalle de labios con brillo dorado y rosa', pos: 'center 58%' },
    { src: 'images/maquillaje-cine-rodaje-ibiza.jpeg', alt: 'Rodaje y producción audiovisual', pos: 'center center' },
  ];

  currentIndex = signal(0);
  private autoPlayTimer: ReturnType<typeof setInterval> | null = null;

  /**
   * WCAG 2.2.2 pide poder detener el movimiento automatico de mas de 5
   * segundos, y cada cosa tiene su boton. El pase de fotos arranca en pausa
   * si el sistema pide reducir el movimiento. El video de portada no: es la
   * pieza principal de la web y muchos equipos llevan esa opcion activada sin
   * saberlo (en Windows basta con apagar los efectos de animacion), asi que se
   * reproduce y se puede pausar desde su boton.
   */
  movimientoPausado = signal(false);
  /** Video de portada y particulas. */
  videoPausado = signal(false);
  private reducirMovimiento = false;
  readonly autoPlayDuration = 5000;
  progressWidth = signal(0);
  private progressAnimFrame: number | null = null;
  private progressStart: number = 0;

  // ── Visor de fotos (pantalla completa) ──
  readonly visorIndice = signal<number | null>(null);
  readonly visorFoto = computed(() => {
    const i = this.visorIndice();
    return i === null ? null : this.slides[i];
  });
  /** Elemento que tenia el foco antes de abrir el visor, para devolverselo. */
  private focoPrevio: HTMLElement | null = null;

  // ── Gesto de deslizar en el carrusel y el visor ──
  private toqueInicio: { x: number; y: number; t: number } | null = null;
  /**
   * El navegador lanza un clic al levantar el dedo aunque haya sido un
   * deslizamiento. Esta marca evita que ese clic abra el visor (en el
   * carrusel) o lo cierre (al tocar el fondo del visor).
   */
  private acabaDeDeslizar = false;

  // ── Ken Burns ──
  readonly kenBurnsVariants = [
    'ken-burns-1', 'ken-burns-2', 'ken-burns-3', 'ken-burns-4'
  ];

  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // ── Lifecycle ──

  ngOnInit() {
    // En el prerender no hay temporizadores que lanzar ni API a la que
    // llamar (la peticion fallaria al compilar y el error quedaria en el HTML).
    if (!this.isBrowser) return;

    this.cursos.masterclass().subscribe({
      next: curso => this.masterclass.set(curso),
      // Sin precio la tarjeta sigue llevando a /cursos: no es un error que
      // haya que ensenar en la portada.
      error: () => this.masterclass.set(null),
    });

    this.reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (this.reducirMovimiento) {
      this.movimientoPausado.set(true);
      return;
    }

    this.startAutoPlay();
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    this.playHeroVideo(0);

    // Las particulas son decoracion: solo en pantallas con raton, donde
    // sobra potencia. En el movil un bucle de canvas a 60 fps solo gasta
    // bateria y compite con el scroll. Tampoco si se pide reducir movimiento.
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !this.reducirMovimiento) {
      this.initParticles();
    }
  }

  ngOnDestroy() {
    this.stopAutoPlay();
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this.progressAnimFrame) cancelAnimationFrame(this.progressAnimFrame);
    if (this.isBrowser) document.body.classList.remove('overflow-hidden');
  }

  // ── Hero Video ──

  private playHeroVideo(index: number): void {
    const video = this.heroVideoRef?.nativeElement;
    if (!video) return;

    video.muted = true;
    video.volume = 0;
    video.src = this.heroVideos[index];
    video.load();
    if (this.videoPausado()) {
      this.mostrarFotogramaFijo(video);
    } else {
      // Si el navegador no deja reproducir solo (ahorro de datos o de
      // bateria), el boton pasa a "Reanudar" y se ve un fotograma real.
      video.play().catch((error: unknown) => {
        if ((error as DOMException)?.name !== 'NotAllowedError') return;
        this.videoPausado.set(true);
        this.mostrarFotogramaFijo(video);
      });
    }

    // Deja el siguiente vídeo del bucle ya en caché del navegador, para que
    // el cambio al terminar el actual sea instantáneo y sin pérdida de
    // calidad. Se lanza cuando el actual ya está reproduciéndose, así que
    // no le roba ancho de banda.
    video.addEventListener('playing', () => this.precargarSiguiente(index), { once: true });
  }

  /**
   * El primer fotograma del video es un fundido casi blanco que, bajo la capa
   * oscura, se ve como un fondo gris vacio. En pausa se muestra uno de pleno
   * plano del mismo video.
   */
  private mostrarFotogramaFijo(video: HTMLVideoElement): void {
    const situar = () => { video.currentTime = Inicio.SEGUNDO_FOTOGRAMA_FIJO; };
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) situar();
    else video.addEventListener('loadedmetadata', situar, { once: true });
  }

  private precargarSiguiente(indiceActual: number): void {
    const siguiente = this.heroVideos[(indiceActual + 1) % this.heroVideos.length];
    if (!siguiente || this.precargados.has(siguiente)) return;

    this.precargados.add(siguiente);

    const enlace = document.createElement('link');
    enlace.rel = 'prefetch';
    enlace.as = 'video';
    enlace.href = siguiente;
    document.head.appendChild(enlace);
  }

  onHeroVideoEnded(): void {
    this.heroVideoIndex = (this.heroVideoIndex + 1) % this.heroVideos.length;
    this.playHeroVideo(this.heroVideoIndex);
  }

  // ── Particle System ──

  private initParticles(): void {
    const canvas = this.particleCanvasRef?.nativeElement;
    if (!canvas) return;

    this.canvasCtx = canvas.getContext('2d');
    this.resizeCanvas(canvas);

    // Create particles
    const count = Math.min(35, Math.floor(window.innerWidth / 40));
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3 - 0.15,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    if (!this.videoPausado()) {
      this.animateParticles();
    }
  }

  /** Boton de la portada: detiene o reanuda el video y las particulas. */
  toggleVideo(): void {
    const pausar = !this.videoPausado();
    this.videoPausado.set(pausar);
    const video = this.heroVideoRef?.nativeElement;

    if (pausar) {
      if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
      video?.pause();
    } else {
      if (this.particles.length > 0) this.animateParticles();
      video?.play().catch(() => { });
    }
  }

  /** Boton del pase de fotos. */
  toggleMovimiento(): void {
    const pausar = !this.movimientoPausado();
    this.movimientoPausado.set(pausar);

    if (pausar) this.stopAutoPlay();
    else this.startAutoPlay();
  }

  @HostListener('window:resize')
  onResize() {
    const canvas = this.particleCanvasRef?.nativeElement;
    if (canvas && this.canvasCtx) this.resizeCanvas(canvas);
  }

  private resizeCanvas(canvas: HTMLCanvasElement): void {
    const hero = canvas.parentElement;
    if (hero) {
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    }
  }

  private animateParticles(): void {
    const ctx = this.canvasCtx;
    const canvas = this.particleCanvasRef?.nativeElement;
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of this.particles) {
      p.x += p.speedX;
      p.y += p.speedY;

      // Wrap around
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(232, 201, 154, ${p.opacity})`;
      ctx.fill();
    }

    this.animFrameId = requestAnimationFrame(() => this.animateParticles());
  }

  // ── Slideshow / Carousel ──

  prev() {
    this.currentIndex.update(i => (i - 1 + this.slides.length) % this.slides.length);
    this.restartAutoPlay();
  }

  next() {
    this.currentIndex.update(i => (i + 1) % this.slides.length);
    this.restartAutoPlay();
  }

  goTo(index: number) {
    this.currentIndex.set(index);
    this.restartAutoPlay();
  }

  getKenBurnsClass(index: number): string {
    return this.kenBurnsVariants[index % this.kenBurnsVariants.length];
  }

  private startAutoPlay() {
    this.progressStart = Date.now();
    this.animateProgress();
    this.autoPlayTimer = setInterval(() => {
      this.next();
    }, this.autoPlayDuration);
  }

  private stopAutoPlay() {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
    if (this.progressAnimFrame) {
      cancelAnimationFrame(this.progressAnimFrame);
      this.progressAnimFrame = null;
    }
  }

  private restartAutoPlay() {
    this.stopAutoPlay();
    if (!this.movimientoPausado() && this.visorIndice() === null) {
      this.startAutoPlay();
    }
  }

  private animateProgress(): void {
    if (!this.isBrowser) return;
    const elapsed = Date.now() - this.progressStart;
    const pct = Math.min((elapsed / this.autoPlayDuration) * 100, 100);
    this.progressWidth.set(pct);
    if (pct < 100) {
      this.progressAnimFrame = requestAnimationFrame(() => this.animateProgress());
    }
  }

  // ── Deslizar con el dedo ──
  // Un gesto horizontal claro (mas de 40 px, o un golpe rapido) pasa de
  // foto; uno vertical se deja al scroll de la pagina (touch-action: pan-y).

  alEmpezarToque(evento: PointerEvent): void {
    if (evento.pointerType === 'mouse') return;
    this.toqueInicio = { x: evento.clientX, y: evento.clientY, t: performance.now() };
  }

  alTerminarToque(evento: PointerEvent, enVisor = false): void {
    const inicio = this.toqueInicio;
    this.toqueInicio = null;
    if (!inicio) return;

    const dx = evento.clientX - inicio.x;
    const dy = evento.clientY - inicio.y;
    if (Math.abs(dx) < Math.abs(dy)) return;

    const velocidad = Math.abs(dx) / Math.max(performance.now() - inicio.t, 1);
    if (Math.abs(dx) < 40 && velocidad < 0.11) return;

    this.acabaDeDeslizar = true;
    setTimeout(() => this.acabaDeDeslizar = false, 0);

    const haciaAtras = dx > 0;
    if (enVisor) {
      haciaAtras ? this.visorAnterior() : this.visorSiguiente();
    } else {
      haciaAtras ? this.prev() : this.next();
    }
  }

  // ── Visor de fotos ──

  abrirVisor(indice: number, evento?: Event): void {
    if (this.acabaDeDeslizar) return;
    this.focoPrevio = (evento?.currentTarget as HTMLElement) ?? (document.activeElement as HTMLElement);
    this.visorIndice.set(indice);
    this.stopAutoPlay();
    document.body.classList.add('overflow-hidden');
    // El foco entra en el dialogo (boton de cerrar) cuando ya esta pintado.
    requestAnimationFrame(() => this.cerrarVisorRef?.nativeElement.focus());
  }

  cerrarVisor(): void {
    if (this.visorIndice() === null) return;
    this.visorIndice.set(null);
    document.body.classList.remove('overflow-hidden');
    this.focoPrevio?.focus();
    this.restartAutoPlay();
  }

  /** Tocar fuera de la foto cierra, salvo que el toque fuera un deslizamiento. */
  alTocarFondoVisor(): void {
    if (!this.acabaDeDeslizar) this.cerrarVisor();
  }

  visorAnterior(): void {
    this.visorIndice.update(i => i === null ? i : (i - 1 + this.slides.length) % this.slides.length);
  }

  visorSiguiente(): void {
    this.visorIndice.update(i => i === null ? i : (i + 1) % this.slides.length);
  }

  /** Teclado del visor: flechas para pasar, Escape para salir, Tab no se escapa. */
  @HostListener('document:keydown', ['$event'])
  alPulsarTecla(evento: KeyboardEvent): void {
    if (this.visorIndice() === null) return;

    if (evento.key === 'Escape') {
      this.cerrarVisor();
    } else if (evento.key === 'ArrowLeft') {
      this.visorAnterior();
    } else if (evento.key === 'ArrowRight') {
      this.visorSiguiente();
    } else if (evento.key === 'Tab') {
      // Foco atrapado en el dialogo: recorre solo sus tres botones.
      const botones = Array.from(document.querySelectorAll<HTMLElement>('.visor button'));
      const actual = botones.indexOf(document.activeElement as HTMLElement);
      const siguiente = (actual + (evento.shiftKey ? -1 : 1) + botones.length) % botones.length;
      botones[siguiente]?.focus();
      evento.preventDefault();
    }
  }
}
