import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { finalize } from 'rxjs';
import { AuthService } from '../../shared/auth.service';
import { CursoConAcceso, CursosService } from '../../shared/cursos.service';
import { mensajeDeError } from '../../shared/errores-api';

@Component({
  selector: 'app-mis-cursos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mis-cursos.html',
  styleUrl: './mis-cursos.css'
})
export class MisCursos implements OnInit, OnDestroy {
  private sanitizer = inject(DomSanitizer);
  private auth = inject(AuthService);
  private servicio = inject(CursosService);

  cursos = signal<CursoConAcceso[]>([]);
  isLoading = signal(true);
  errorMsg = signal('');

  cursoActivo = signal<CursoConAcceso | null>(null);
  activeTab = signal<'temario' | 'recursos' | 'dudas'>('temario');

  // Estado de progreso guardado localmente por curso
  cursoCompletado = signal<Record<number, boolean>>({});

  /** Cursos que siguen dentro de su periodo de acceso. */
  readonly vigentes = computed(() => this.cursos().filter(c => c.acceso_vigente));

  /** Cursos cuyo acceso ya ha terminado. Se muestran, pero sin vídeo. */
  readonly caducados = computed(() => this.cursos().filter(c => !c.acceso_vigente));

  ngOnInit(): void {
    this.cargarProgresoLocal();
    this.cargarCursos();
  }

  ngOnDestroy(): void {
    // Si se navega fuera con el modal abierto, el body se quedaba bloqueado.
    document.body.style.overflow = '';
  }

  get userName(): string {
    return this.auth.usuario()?.name ?? 'Alumna VIP';
  }

  private cargarProgresoLocal(): void {
    try {
      const guardado = localStorage.getItem('yona_cursos_progreso');
      if (guardado) {
        this.cursoCompletado.set(JSON.parse(guardado));
      }
    } catch (e) {
      console.warn('Error leyendo progreso', e);
    }
  }

  toggleCompletado(cursoId: number, event?: Event): void {
    event?.stopPropagation();

    const actual = { ...this.cursoCompletado() };
    actual[cursoId] = !actual[cursoId];
    this.cursoCompletado.set(actual);

    try {
      localStorage.setItem('yona_cursos_progreso', JSON.stringify(actual));
    } catch {
      // Modo privado o almacenamiento lleno: el progreso es accesorio.
    }
  }

  isCompletado(cursoId: number): boolean {
    return !!this.cursoCompletado()[cursoId];
  }

  private cargarCursos(): void {
    // El Authorization lo pone authInterceptor; y si el token ha caducado,
    // el propio interceptor devuelve al login.
    this.servicio
      .misCursos()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: cursos => this.cursos.set(cursos),
        error: error =>
          this.errorMsg.set(
            mensajeDeError(error, 'No se pudieron cargar tus cursos. Inténtalo de nuevo más tarde.')
          )
      });
  }

  /** "hasta el 09/03/2027" para mostrar el fin de acceso. */
  fechaFinAcceso(curso: CursoConAcceso): string {
    if (!curso.acceso_expira_en) return '';

    return new Date(curso.acceso_expira_en).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /** True cuando queda un mes o menos: es cuando conviene avisar en pantalla. */
  accesoTerminaPronto(curso: CursoConAcceso): boolean {
    const dias = curso.acceso_dias_restantes;
    return curso.acceso_vigente && dias !== null && dias <= 30;
  }

  getMiniatura(curso: CursoConAcceso): string {
    if (curso.miniatura_url && !curso.miniatura_url.includes('img.youtube.com')) {
      return curso.miniatura_url;
    }
    return 'images/portada_automaquillaje.png';
  }

  abrirCurso(curso: CursoConAcceso): void {
    // Sin acceso vigente el servidor no envía el vídeo, así que abrir el
    // reproductor solo mostraría un hueco negro.
    if (!curso.acceso_vigente || !curso.video_url) {
      return;
    }

    this.cursoActivo.set(curso);
    this.activeTab.set('temario');
    document.body.style.overflow = 'hidden';
  }

  cerrarModal(): void {
    this.cursoActivo.set(null);
    document.body.style.overflow = '';
  }

  /** True solo si la URL es de una plataforma de vídeo que sabemos embeber. */
  esEmbed(url: string): boolean {
    return this.extraerEmbed(url) !== null;
  }

  /**
   * Devuelve la URL del iframe.
   *
   * Solo se marca como segura la URL que hemos construido nosotros a partir
   * del ID extraido de YouTube o Vimeo. Antes se pasaba la URL de la base de
   * datos tal cual a bypassSecurityTrustResourceUrl, saltandose la
   * sanitizacion de Angular para cualquier valor.
   */
  embedUrl(url: string): SafeResourceUrl {
    const embed = this.extraerEmbed(url);
    return this.sanitizer.bypassSecurityTrustResourceUrl(embed ?? 'about:blank');
  }

  private extraerEmbed(url: string): string | null {
    if (!url) return null;

    const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/i);
    if (yt) {
      return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0`;
    }

    const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
    if (vimeo) {
      return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`;
    }

    return null;
  }
}
