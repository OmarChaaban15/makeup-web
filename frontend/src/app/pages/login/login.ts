import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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
  showPassword = false;
  isLoading = false;
  errorMsg = '';
  successMsg = '';

  ngOnInit(): void {
    this.checkAuthStatus();
    this.initForm();
  }

  private checkAuthStatus(): void {
    if (localStorage.getItem('auth_token')) {
      this.router.navigate(['/inicio']);
    }
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
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

    this.http.post<any>('http://localhost:8000/api/auth/login', credentials).subscribe({
      next: (response) => {
        this.successMsg = 'Iniciando sesión...';
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        setTimeout(() => {
          this.router.navigate(['/inicio']);
        }, 1000);
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 0) {
          this.errorMsg = 'No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.';
        } else if (error.status === 401) {
          this.errorMsg = 'El correo o la contraseña son incorrectos.';
        } else {
          this.errorMsg = error.error?.message || 'No se pudo iniciar sesión. Inténtalo de nuevo.';
        }
      }
    });
  }
}