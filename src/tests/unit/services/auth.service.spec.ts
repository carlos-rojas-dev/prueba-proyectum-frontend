import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { AuthService, Usuario } from '../../../app/services/auth.service';
import { environment } from '../../../environments/environment';
import { of, throwError } from 'rxjs';
import { provideZonelessChangeDetection } from '@angular/core';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('HttpClient', ['post']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: HttpClient, useValue: spy },
        provideZonelessChangeDetection() // ✅ Zoneless para pruebas
      ]
    });

    service = TestBed.inject(AuthService);
    httpClientSpy = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
    httpMock = TestBed.inject(HttpTestingController);

    // Limpiar localStorage antes de cada prueba
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('debería ser creado', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('debería retornar éxito cuando el login es exitoso', (done) => {
      const mockUser: Usuario = {
        id: 1,
        username: 'Carlos',
        clave: '1234',
        nombre: 'Test User'
      };

      const mockResponse = {
        usuario: mockUser,
        token: 'mock-token'
      };

      httpClientSpy.post.and.returnValue(of(mockResponse));

      service.login('testuser', 'password').subscribe(result => {
        expect(result.success).toBe(true);
        expect(result.message).toContain('Bienvenido, Test User');
        expect(result.user).toEqual(mockUser);
        done();
      });
    });

    it('debería retornar error cuando las credenciales son inváidas', (done) => {
      const errorResponse = { status: 401, message: 'Unauthorized' };
      httpClientSpy.post.and.returnValue(throwError(() => errorResponse));

      service.login('wronguser', 'wrongpass').subscribe(result => {
        expect(result.success).toBe(false);
        expect(result.message).toBe('Usuario o contraseña incorrectos');
        done();
      });
    });

    it('debería retornar error cuando la conexión falla', (done) => {
      const errorResponse = { status: 0, message: 'Network error' };
      httpClientSpy.post.and.returnValue(throwError(() => errorResponse));

      service.login('testuser', 'password').subscribe(result => {
        expect(result.success).toBe(false);
        expect(result.message).toBe('Error de conexión. Verifica que la API esté funcionando.');
        done();
      });
    });

    it('debería guardar usuario en localStorage en login exitoso', (done) => {
      const mockUser: Usuario = {
        id: 1,
        username: 'Carlos',
        clave: '1234',
        nombre: 'Test User'
      };

      const mockResponse = {
        usuario: mockUser,
        token: 'mock-token'
      };

      httpClientSpy.post.and.returnValue(of(mockResponse));

      service.login('Carlos', '1234').subscribe(() => {
        const savedUser = localStorage.getItem('currentUser');
        const savedToken = localStorage.getItem('token');
        
        expect(savedUser).toBeTruthy();
        expect(savedToken).toBe('mock-token');
        expect(JSON.parse(savedUser!)).toEqual(mockUser);
        done();
      });
    });

    it('debería manejar respuesta inválida del servidor', (done) => {
      const mockResponse = { invalid: 'response' };
      httpClientSpy.post.and.returnValue(of(mockResponse));

      service.login('testuser', 'password').subscribe(result => {
        expect(result.success).toBe(false);
        expect(result.message).toBe('Respuesta inválida del servidor');
        done();
      });
    });
  });

  describe('logout', () => {
    it('debería limpiar localStorage y resetear estado de autenticación', () => {
      // Simular usuario logueado
      localStorage.setItem('currentUser', JSON.stringify({ id: 1, nombre: 'Test' }));
      localStorage.setItem('token', 'mock-token');

      service.logout();

      expect(localStorage.getItem('currentUser')).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
      expect(service.getCurrentUser()).toBeNull();
    });
  });

  describe('authentication state', () => {
    it('debería retornar false cuando no está autenticado', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('debería retornar null cuando no hay usuario actual', () => {
      expect(service.getCurrentUser()).toBeNull();
    });

    it('debería emitir cambios de estado de autenticación', (done) => {
      service.isAuthenticated$.subscribe(isAuth => {
        expect(isAuth).toBe(false);
        done();
      });
    });

    it('debería emitir cambios de usuario actual', (done) => {
      service.currentUser$.subscribe(user => {
        expect(user).toBeNull();
        done();
      });
    });
  });

  describe('localStorage integration', () => {
    it('debería restaurar usuario desde localStorage en inicialización', () => {
      const mockUser: Usuario = {
        id: 1,
        username: 'Carlos',
        clave: '1234',
        nombre: 'Test User'
      }; 

      localStorage.setItem('currentUser', JSON.stringify(mockUser));

      // Crear nueva instancia del servicio
      const newService = new AuthService(httpClientSpy);
      
      expect(newService.isAuthenticated()).toBe(true);
      expect(newService.getCurrentUser()).toEqual(mockUser);
    });
  });
});
