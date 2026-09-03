import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

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

  ngOnInit(): void {
    this.checkAuthStatus();
    this.initForms();
  }

  private checkAuthStatus(): void {
    if (localStorage.getItem('auth_token')) {
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
    const currentEmail = this.loginForm.get('email')?.value;
    if (currentEmail) {
      this.forgotForm.patchValue({ email: currentEmail });
    }
  }

  closeForgotModal(): void {
    this.showForgotModal = false;
  }

  submitForgot(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.forgotLoading = true;
    this.forgotError = '';

    // Simulamos / enviamos petición de recuperación
    setTimeout(() => {
      this.forgotLoading = false;
      this.forgotSuccess = true;
    }, 900);
  }

  private getErrorMessage(error: any, fallback: string): string {
    if (!error || !error.error) return fallback;
    if (error.status === 0) return 'No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.';
    if (error.error?.message) return error.error.message;
    return fallback;
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

    const credentials = this.loginForm.value;

    this.http.post<any>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          this.successMsg = '¡Bienvenida! Accediendo a tu cuenta...';
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          
          setTimeout(() => {
            this.router.navigate(['/inicio']);
          }, 800);
        },
        error: (error) => {
          this.errorMsg = this.getErrorMessage(error, 'Credenciales incorrectas. Por favor, compruébalas.');
        }
      });
  }
}