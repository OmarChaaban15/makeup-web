import { Component, OnInit, inject } from '@angular/core';
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

  cursos: Curso[] = [];
  isLoading = true;
  errorMsg = '';

  // Curso que se esta reproduciendo en el modal (null = modal cerrado)
  cursoActivo: Curso | null = null;

  ngOnInit(): void {
    this.cargarCursos();
  }

  private cargarCursos(): void {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<Curso[]>(`${environment.apiUrl}/mis-cursos`, { headers })
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (cursos) => this.cursos = cursos,
        error: () => this.errorMsg = 'No se pudieron cargar tus cursos. Inténtalo de nuevo más tarde.'
      });
  }

  abrirCurso(curso: Curso): void {
    if (!curso.video_url) {
      return;
    }
    this.cursoActivo = curso;
    document.body.style.overflow = 'hidden';
  }

  cerrarModal(): void {
    this.cursoActivo = null;
    document.body.style.overflow = '';
  }

  // Devuelve true si el video es un embed (YouTube / Vimeo) y no un archivo directo
  esEmbed(url: string): boolean {
    return /youtube\.com|youtu\.be|vimeo\.com/i.test(url);
  }

  // Normaliza YouTube/Vimeo a su URL de embed y la marca como segura para el iframe
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
