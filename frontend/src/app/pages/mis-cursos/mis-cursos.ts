import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { finalize } from 'rxjs';
import { environment } from '../../../environments/environment';

interface Curso {
  id: number;
  titulo: string;
  descripcion_corta: string | null;
  descripcion_larga: string | null;
  precio: string;
  video_url: string | null;
  miniatura_url: string | null;
  nivel: 'basico' | 'intermedio' | 'avanzado' | null;
  categoria?: { id: number; nombre?: string } | null;
}

@Component({
  selector: 'app-mis-cursos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mis-cursos.html',
  styleUrl: './mis-cursos.css'
})
export class MisCursos implements OnInit {
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);

  cursos = signal<Curso[]>([]);
  isLoading = signal(true);
  errorMsg = signal('');

  cursoActivo = signal<Curso | null>(null);

  ngOnInit(): void {
    this.cargarCursos();
  }

  private cargarCursos(): void {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<Curso[]>(`${environment.apiUrl}/mis-cursos`, { headers })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (cursos) => this.cursos.set(cursos),
        error: () => this.errorMsg.set('No se pudieron cargar tus cursos. Inténtalo de nuevo más tarde.')
      });
  }

  abrirCurso(curso: Curso): void {
    if (!curso.video_url) {
      return;
    }
    this.cursoActivo.set(curso);
    document.body.style.overflow = 'hidden';
  }

  cerrarModal(): void {
    this.cursoActivo.set(null);
    document.body.style.overflow = '';
  }

  esEmbed(url: string): boolean {
    return /youtube\.com|youtu\.be|vimeo\.com/i.test(url);
  }

  embedUrl(url: string): SafeResourceUrl {
    let embed = url;

    const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/i);
    if (yt) {
      embed = `https://www.youtube.com/embed/${yt[1]}`;
    }

    const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
    if (vimeo) {
      embed = `https://player.vimeo.com/video/${vimeo[1]}`;
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(embed);
  }
}