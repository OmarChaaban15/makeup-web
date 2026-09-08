import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Curso {
  id: number;
  titulo: string;
  descripcion_corta: string | null;
  descripcion_larga: string | null;
  /** Tarifa base, la que queda cuando termina la oferta. */
  precio: string;
  /** Tarifa promocional, si la hay. */
  precio_oferta: string | null;
  /** Importe que se cobraria ahora mismo. Lo decide el servidor. */
  precio_efectivo: string;
  oferta_activa: boolean;
  /** Segundos que le quedan a la oferta, o null si no hay ninguna activa. */
  oferta_segundos_restantes: number | null;
  oferta_fin: string | null;
  /** Meses de acceso que incluye la compra. null = sin caducidad. */
  duracion_acceso_meses: number | null;
  video_url: string | null;
  miniatura_url: string | null;
  nivel: 'basico' | 'intermedio' | 'avanzado' | null;
  activo: boolean;
  categoria?: { id: number; nombre?: string } | null;
}

/** Un curso ya comprado, tal y como lo devuelve /mis-cursos. */
export interface CursoConAcceso extends Curso {
  acceso_vigente: boolean;
  acceso_expira_en: string | null;
  acceso_dias_restantes: number | null;
}

export interface RespuestaCompra {
  pedido: { id: number };
  checkout_url: string;
}

/** Datos que hace falta pedir cuando se compra sin cuenta. */
export interface DatosInvitado {
  nombre: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class CursosService {
  private http = inject(HttpClient);

  /** Catálogo público. No incluye video_url. */
  listar(): Observable<Curso[]> {
    return this.http.get<Curso[]>(`${environment.apiUrl}/tutoriales`);
  }

  /**
   * La masterclass que se promociona. Se resuelve por catálogo en lugar de
   * por un ID escrito a mano, que en su día apuntaba a un curso inexistente.
   */
  masterclass(): Observable<Curso | null> {
    return this.listar().pipe(
      map(cursos =>
        cursos.find(c => c.titulo.toLowerCase().includes('automaquillaje')) ??
        cursos.find(c => Number(c.precio_efectivo) > 0) ??
        null
      )
    );
  }

  /** Cursos comprados por el usuario autenticado. */
  misCursos(): Observable<CursoConAcceso[]> {
    return this.http.get<CursoConAcceso[]>(`${environment.apiUrl}/mis-cursos`);
  }

  /**
   * Inicia la compra. Con sesión iniciada basta el id del curso; sin ella
   * hay que enviar nombre y correo, y la cuenta se crea al confirmarse el
   * pago.
   */
  comprar(cursoId: number, invitado?: DatosInvitado): Observable<RespuestaCompra> {
    const cuerpo: Record<string, unknown> = { tutoriales: [cursoId] };

    if (invitado) {
      cuerpo['nombre'] = invitado.nombre;
      cuerpo['email'] = invitado.email;
    }

    return this.http.post<RespuestaCompra>(`${environment.apiUrl}/pedidos`, cuerpo);
  }

  /** "45,00 €" a partir del importe que llega como cadena decimal. */
  formatearPrecio(valor: string | number | null): string {
    if (valor === null) return '';

    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: Number.isInteger(Number(valor)) ? 0 : 2
    }).format(Number(valor));
  }
}
