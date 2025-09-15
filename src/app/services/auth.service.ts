import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Usuario {
  id?: number;
  username: string;
  clave: string;
  nombre: string;
  email?: string;
  rol?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/usuarios`;

  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private readonly currentUserSubject = new BehaviorSubject<Usuario | null>(null);

  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private readonly http: HttpClient) {
    // Verificar si hay una sesión guardada en localStorage
    if (typeof localStorage !== 'undefined') {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      }
    }
  }

  login(username: string, clave: string): Observable<{ success: boolean; message: string; user?: Usuario }> {
     
    const loginData = { username, clave };
    const loginUrl = `${environment.apiUrl}/auth/login`;
    
    return this.http.post<any>(loginUrl, loginData).pipe(
      map(response => {
        const usuario = response.usuario || response;
        
        if (usuario && (usuario.nombre || usuario.id)) {
          
          // Guardar en localStorage si está disponible
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('currentUser', JSON.stringify(usuario));            
            localStorage.setItem("token", response.token.toString());
          }
          
          this.currentUserSubject.next(usuario);
          this.isAuthenticatedSubject.next(true);
          
          return { 
            success: true, 
            message: `Bienvenido, ${usuario.nombre || username}!`,
            user: usuario 
          };
        } else {
          return { 
            success: false, 
            message: 'Respuesta inválida del servidor' 
          };
        }
      }),
      catchError(error => {        
        if (error.status === 401) {
          return of({ 
            success: false, 
            message: 'Usuario o contraseña incorrectos' 
          });
        } else if (error.status === 0) {
          return of({ 
            success: false, 
            message: 'Error de conexión. Verifica que la API esté funcionando.' 
          });
        } else {
          return of({ 
            success: false, 
            message: `Error del servidor: ${error.status} - ${error.message}` 
          });
        }
      })
    );
  }

  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  
}
