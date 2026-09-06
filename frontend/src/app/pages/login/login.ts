import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../shared/auth.service';
import { mensajeDeError } from '../../shared/errores-api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm!: FormGroup;
  forgotForm!: FormGroup;
  showPassword = false;
  isLoading = false;
  errorMsg = '';
  successMsg = '';

  // Modal de recuperación de contraseña
  showForgotModal = false;
  forgotLoading = false;
  forgotSuccess = false;
  forgotError = '';
  forgotMsg = '';

  /** Ruta a la que volver tras iniciar sesión (la pone el guard o el interceptor). */
  private redirect = '/inicio';

  ngOnInit(): void {
    this.checkAuthStatus();
    this.initForms();

    const params = this.route.snapshot.queryParamMap;
    this.redirect = params.get('redirect') || '/inicio';

    if (params.get('motivo') === 'sesion-caducada') {
      this.errorMsg = 'Tu sesión ha caducado. Vuelve a iniciar sesión para continuar.';
    }
  }

  private checkAuthStatus(): void {
    if (this.auth.estaAutenticado()) {
      this.router.navigate(['/inicio']);
    }
  }

  private initForms(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });

    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  openForgotModal(): void {
    this.showForgotModal = true;
    this.forgotSuccess = false;
    this.forgotError = '';
    this.forgotMsg = '';
    const currentEmail = this.loginForm.get('email')?.value;
    if (currentEmail) {
      this.forgotForm.patchValue({ email: currentEmail });
    }
  }

  closeForgotModal(): void {
    this.showForgotModal = false;
  }

  /**
   * Solicita de verdad el enlace de recuperación.
   * Antes esto era un setTimeout que fingía éxito sin enviar nada.
   */
  submitForgot(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.forgotLoading = true;
    this.forgotError = '';

    this.auth
      .solicitarRecuperacion(this.forgotForm.value.email)
      .pipe(finalize(() => (this.forgotLoading = false)))
      .subscribe({
        next: respuesta => {
          this.forgotSuccess = true;
          this.forgotMsg = respuesta.message;
        },
        error: error => {
          this.forgotError = mensajeDeError(
            error,
            'No se pudo enviar el correo de recuperación. Inténtalo de nuevo más tarde.'
          );
        }
      });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.errorMsg = 'Revisa el correo y la contraseña antes de continuar.';
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';
    this.successMsg = '';

    const { email, password } = this.loginForm.value;

    this.auth
      .login(email, password)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.successMsg = '¡Bienvenida! Accediendo a tu cuenta...';
          setTimeout(() => this.router.navigateByUrl(this.redirect), 800);
        },
        error: error => {
          this.errorMsg = mensajeDeError(
            error,
            'Credenciales incorrectas. Por favor, compruébalas.'
          );
        }
      });
  }
}
