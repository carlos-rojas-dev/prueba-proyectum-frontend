import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule, CommonModule]
})
export class LoginComponent {
  username = '';
  password = '';
  cargando = false;
  mensaje = '';
  tipoMensaje: 'success' | 'error' | 'info' = 'info';

  constructor(
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef
  ) {}
 
  onSubmit(): void {
    if (!this.username.trim() || !this.password.trim()) {
      this.mostrarMensaje('Por favor, completa todos los campos', 'error');
      return;
    }

    this.cargando = true;
    this.mensaje = '';

    this.authService.login(this.username, this.password).subscribe({
      next: (result) => {
        this.cargando = false;
        this.cdr.detectChanges();
        if (result.success) {
          this.mostrarMensaje(result.message, 'success'); 
        } else {
          this.mostrarMensaje(result.message, 'error');
        }
      },
      error: (err) => {
        this.cargando = false;
        this.cdr.detectChanges();
        this.mostrarMensaje('Error de conexión. Intenta nuevamente.', 'error');
        console.error('Error en login:', err);
      },
      complete: () => { 
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  private mostrarMensaje(mensaje: string, tipo: 'success' | 'error' | 'info'): void {
    this.mensaje = mensaje;
    this.tipoMensaje = tipo;
     
    const duracion = tipo === 'success' ? 2000 : 5000;
    
    setTimeout(() => {
      this.mensaje = '';
    }, duracion);
  }
 
}
