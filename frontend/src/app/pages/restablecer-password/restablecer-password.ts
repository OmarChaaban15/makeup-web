import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../shared/auth.service';
import { mensajeDeError } from '../../shared/errores-api';

/**
 * Destino del enlace que envia el correo de recuperacion:
 * /restablecer-password?token=...&email=...
 */
@Component({
  selector: 'app-restablecer-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './restablecer-password.html',
  styleUrl: './restablecer-password.css'
})
export class RestablecerPassword implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form!: FormGroup;
  showPassword = false;
  isLoading = false;
  errorMsg = '';
  successMsg = '';
  enlaceValido = true;

  private token = '';
  email = '';

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    this.token = params.get('token') ?? '';
    this.email = params.get('email') ?? '';

    // Sin token ni email el enlace no sirve: mejor decirlo de entrada que
    // dejar rellenar el formulario para fallar al enviarlo.
    this.enlaceValido = this.token !== '' && this.email !== '';

    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordsCoinciden });
  }

  private passwordsCoinciden(control: AbstractControl): ValidationErrors | null {
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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMsg = this.form.errors?.['mismatch']
        ? 'Las contraseñas no coinciden.'
        : 'La contraseña debe tener al menos 8 caracteres.';
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';

    this.auth
      .restablecerPassword({
        token: this.token,
        email: this.email,
        password: this.form.value.password,
        password_confirmation: this.form.value.confirmPassword
      })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: respuesta => {
          this.successMsg = respuesta.message;
          setTimeout(() => this.router.navigate(['/login']), 1800);
        },
        error: error => {
          this.errorMsg = mensajeDeError(
            error,
            'No se pudo cambiar la contraseña. Solicita un enlace nuevo.'
          );
        }
      });
  }
}
