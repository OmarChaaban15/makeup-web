import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-modal.html',
  styleUrl: './login-modal.css'
})
export class LoginModal {
  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();

  isRegisterOpen = false;
  showPassword = false;
  isLoading = false;
  errorMsg = '';

  email = '';
  password = '';
  registerName = '';
  registerEmail = '';
  registerPassword = '';

  close() {
    this.isOpen = false;
    this.isOpenChange.emit(false);
    this.errorMsg = '';
  }

  closeAll() {
    this.isOpen = false;
    this.isRegisterOpen = false;
    this.isOpenChange.emit(false);
    this.errorMsg = '';
  }

  onOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeAll();
    }
  }

  switchToRegister() {
    this.isOpen = false;
    this.isRegisterOpen = true;
    this.errorMsg = '';
  }

  switchToLogin() {
    this.isRegisterOpen = false;
    this.isOpen = true;
    this.errorMsg = '';
  }

  async onSubmit() {
    if (!this.email || !this.password) {
      this.errorMsg = 'Por favor, completa todos los campos.';
      return;
    }
    this.isLoading = true;
    this.errorMsg = '';

    // TODO: conectar con Laravel API
    // const res = await this.authService.login(this.email, this.password);
    setTimeout(() => {
      this.isLoading = false;
      // Simulación: descomentar cuando haya API
      // this.close();
      this.errorMsg = 'Credenciales incorrectas. Inténtalo de nuevo.';
    }, 1200);
  }

  onRegister() {
    if (!this.registerName || !this.registerEmail || !this.registerPassword) {
      return;
    }
    // TODO: conectar con Laravel API
    // this.authService.register(...)
    console.log('Registrar:', this.registerName, this.registerEmail);
  }
}
