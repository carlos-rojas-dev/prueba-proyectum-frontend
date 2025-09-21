import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { AppComponent } from '../../../app/app.component';
import { ProductoService } from '../../../app/services/producto.service';
import { AuthService } from '../../../app/services/auth.service';
import { provideZonelessChangeDetection } from '@angular/core';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockProductoService: jasmine.SpyObj<ProductoService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const productoServiceSpy = jasmine.createSpyObj('ProductoService', ['getAll']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated'], {
      isAuthenticated$: of(false),
      currentUser$: of(null)
    });

    await TestBed.configureTestingModule({
      imports: [AppComponent, FormsModule, ReactiveFormsModule],
      providers: [
        { provide: ProductoService, useValue: productoServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        provideZonelessChangeDetection() // ✅ Zoneless para pruebas
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    mockProductoService = TestBed.inject(ProductoService) as jasmine.SpyObj<ProductoService>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('debería crear la aplicación', () => {
    expect(component).toBeTruthy();
  });

  it('debería tener el título correcto', () => {
    expect(component.title).toBe('Gestión de Productos');
  });

  it('debería inicializar con productos vacíos', () => {
    expect(component.productos).toEqual([]);
  });

  it('debería inicializar formulario con valores por defecto', () => {
    expect(component.productoForm.get('nombre')?.value).toBe('');
    expect(component.productoForm.get('precio')?.value).toBe(0);
    expect(component.productoForm.get('stock')?.value).toBe(0);
  });

  it('debería inicializar con estado por defecto correcto', () => {
    expect(component.cargando).toBe(false);
    expect(component.mensaje).toBe('');
    expect(component.tipoMensaje).toBe('info');
    expect(component.mostrarModal).toBe(false);
    expect(component.editandoProducto).toBeNull();
    expect(component.filtroNombre).toBe('');
    expect(component.isAuthenticated).toBe(false);
    expect(component.currentUser).toBeNull();
  });
});
