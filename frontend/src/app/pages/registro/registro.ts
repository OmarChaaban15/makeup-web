import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class Registro implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  registroForm!: FormGroup;
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

  private getErrorMessage(error: any, fallback: string): string {
    if (!error || !error.error) {
      return fallback;
    }

    if (error.status === 0) {
      return 'No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.';
    }

    if (error.error?.errors) {
      const firstKey = Object.keys(error.error.errors)[0];
      const firstError = error.error.errors[firstKey];
      if (Array.isArray(firstError) && firstError.length) {
        return firstError[0];
      }
    }

    if (error.error?.message) {
      return error.error.message;
    }

    return fallback;
  }

  private initForm(): void {
    this.registroForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      aceptaTerminos: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirm = control.get('confirmPassword');
    
    if (password && confirm && password.value !== confirm.value) {
      return { mismatch: true };
    }
    return null;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      if (this.registroForm.errors?.['mismatch']) {
        this.errorMsg = 'Las contraseñas no coinciden.';
      } else if (this.registroForm.get('aceptaTerminos')?.invalid) {
        this.errorMsg = 'Debes aceptar los términos y la política de privacidad.';
      } else {
        this.errorMsg = 'Revisa los campos del formulario antes de continuar.';
      }
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';
    this.successMsg = '';

    const formData = {
      nombre: this.registroForm.value.nombre,
      email: this.registroForm.value.email,
      telefono: this.registroForm.value.telefono || null,
      password: this.registroForm.value.password,
      password_confirmation: this.registroForm.value.confirmPassword
    };

    this.http.post<any>(`${environment.apiUrl}/auth/register`, formData)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          this.successMsg = '¡Cuenta creada! Redirigiendo...';
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          
          setTimeout(() => {
            this.router.navigate(['/inicio']);
          }, 1000);
        },
        error: (error) => {
          this.errorMsg = this.getErrorMessage(error, 'No se pudo crear la cuenta. Inténtalo de nuevo.');
        }
      });
  }
}