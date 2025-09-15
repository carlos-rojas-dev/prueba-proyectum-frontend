
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Producto {
  id?: number;
  nombre: string;
  precio: number;
  stock: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private readonly apiUrl = `${environment.apiUrl}/productos`;

  constructor(private readonly http: HttpClient) {}

  // Método para obtener los headers con autorización, mas propiedades para mejor manejo de CORS, etc.(preflight)
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem("token");
    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      });
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  // Método alternativo para obtener headers sin Content-Type (para evitar preflight)
  private getHeadersSimple(): HttpHeaders {
    const token = localStorage.getItem("token");
    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
    }
    return new HttpHeaders();
  }

  // Método para verificar si hay token disponible
  hasToken(): boolean {
    const token = localStorage.getItem("token");
    return token !== null && token !== '';
  }

  getAll(): Observable<Producto[]> {  
    return this.http.get<Producto[]>(this.apiUrl, { 
      headers: this.getHeadersSimple(),
      withCredentials: false
    });
  }
 
  getAllWithoutAuth(): Observable<Producto[]> { 
    return this.http.get<Producto[]>(this.apiUrl);
  }

  getById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  create(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto, { headers: this.getHeaders() });
  }

  update(id: number, producto: Producto): Observable<Producto> { 
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, producto, { headers: this.getHeaders() });
  }

  delete(id: number): Observable<void> {
    console.log('🗑️ Eliminando productos ID:', id);
    console.log('🔐 Token disponible:', this.hasToken());
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
