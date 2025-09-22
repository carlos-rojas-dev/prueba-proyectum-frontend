import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { AppComponent } from '../../../app/app.component';
import { ProductoService, Producto } from '../../../app/services/producto.service';
import { AuthService, Usuario } from '../../../app/services/auth.service';
import { By } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockProductoService: jasmine.SpyObj<ProductoService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  const mockProducts: Producto[] = [
    { id: 1, nombre: 'Producto 1', precio: 10, stock: 5 },
    { id: 2, nombre: 'Producto 2', precio: 20, stock: 3 }
  ];

  const mockUser: Usuario = {
    id: 1,
    username: 'testuser',
    clave: 'password',
    nombre: 'Test User'
  };

  beforeEach(async () => {
    const productoServiceSpy = jasmine.createSpyObj('ProductoService', [
      'getAll', 'getAllWithoutAuth', 'create', 'update', 'delete'
    ]);
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'login', 'logout', 'isAuthenticated', 'getCurrentUser'
    ], {
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

  it('debería inicializar con productos vacíos array', () => {
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

  describe('ngOnInit', () => {
    it('debería suscribirse a cambios de autenticación', () => {
      spyOn(component, 'cargarProductos');
      mockAuthService.isAuthenticated$.subscribe = jasmine.createSpy().and.returnValue(of(true));
      
      component.ngOnInit();
      
      expect(mockAuthService.isAuthenticated$.subscribe).toHaveBeenCalled();
    });

    it('debería cargar productos si está autenticado', () => {
      spyOn(component, 'cargarProductos');
      mockAuthService.isAuthenticated.and.returnValue(true);
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
      
      component.ngOnInit();
      
      expect(component.cargarProductos).toHaveBeenCalled();
    });

  });

  describe('cargarProductos', () => {
    it('debería cargar productos exitosamente', () => {
      mockProductoService.getAll.and.returnValue(of(mockProducts));
      
      component.cargarProductos();
      
      expect(component.productos).toEqual(mockProducts);
      expect(component.cargando).toBe(false);
    });

    it('debería manejar errores de carga..', () => {
      mockProductoService.getAll.and.returnValue(throwError(() => new Error('Network error')));
      mockProductoService.getAllWithoutAuth.and.returnValue(of(mockProducts));
      spyOn(component, 'mostrarMensaje');
      
      component.cargarProductos();
      
      expect(component.productos).toEqual(mockProducts);
      expect(component.cargando).toBe(false);
      expect(component.mostrarMensaje).toHaveBeenCalledWith(
        'Productos cargados (sin autenticación)',
        'info'
      );
    });

    it('debería manejar ambos errores de autenticación y no autenticación', () => {
      mockProductoService.getAll.and.returnValue(throwError(() => new Error('Auth error')));
      mockProductoService.getAllWithoutAuth.and.returnValue(throwError(() => new Error('Network error')));
      spyOn(component, 'mostrarMensaje');
      
      component.cargarProductos();
      
      expect(component.mostrarMensaje).toHaveBeenCalledWith('Error al cargar productos', 'error');
      expect(component.cargando).toBe(false);
    });

    it('debería establecer estado de carga durante la solicitud', () => {
      mockProductoService.getAll.and.returnValue(of(mockProducts));
      
      component.cargarProductos();
      
      expect(component.cargando).toBe(false); // mmmm
    });
  });

  describe('form validation', () => {
    it('debería validar campos requeridos', () => {
      component.productoForm.patchValue({ nombre: '', precio: 0, stock: 0 });
      
      expect(component.productoForm.valid).toBeFalsy();
      expect(component.productoForm.get('nombre')?.hasError('required')).toBeTruthy();
    });

    it('debería validar longitud mínima para nombre', () => {
      component.productoForm.patchValue({ nombre: 'A', precio: 10, stock: 5 });
      
      expect(component.productoForm.get('nombre')?.hasError('minlength')).toBeTruthy();
    });

    it('debería validar precio mínimo', () => {
      component.productoForm.patchValue({ nombre: 'Producto', precio: 0, stock: 5 });
      
      expect(component.productoForm.get('precio')?.hasError('min')).toBeTruthy();
    });

    it('debería validar stock mínimo', () => {
      component.productoForm.patchValue({ nombre: 'Producto', precio: 10, stock: -1 });
      
      expect(component.productoForm.get('stock')?.hasError('min')).toBeTruthy();
    });

    it('debería ser válido con valores correctos', () => {
      component.productoForm.patchValue({ nombre: 'Producto Test', precio: 10, stock: 5 });
      
      expect(component.productoForm.valid).toBeTruthy();
    });
  });

  describe('agregarProducto', () => {
    it('debería agregar producto cuando formulario es válido', () => {
      const newProduct = { nombre: 'Nuevo Producto', precio: 15, stock: 10 };
      component.productoForm.patchValue(newProduct);
      mockProductoService.create.and.returnValue(of({ id: 1, ...newProduct }));
      spyOn(component, 'cargarProductos');
      spyOn(component, 'cerrarModal');
      spyOn(component, 'mostrarMensaje');
      
      component.agregarProducto();
      
      expect(mockProductoService.create).toHaveBeenCalledWith(newProduct);
      expect(component.cargarProductos).toHaveBeenCalled();
      expect(component.cerrarModal).toHaveBeenCalled();
      expect(component.mostrarMensaje).toHaveBeenCalledWith(
        'Producto agregado correctamente',
        'success'
      );
    });

    it('debería no agregar producto cuando formulario es inválido', () => {
      component.productoForm.patchValue({ nombre: '', precio: 0, stock: 0 });
      spyOn(component, 'mostrarMensaje');
      
      component.agregarProducto();
      
      expect(mockProductoService.create).not.toHaveBeenCalled();
      expect(component.mostrarMensaje).toHaveBeenCalledWith(
        'Por favor, completa todos los campos correctamente',
        'error'
      );
    });

    it('debería manejar errores de creación', () => {
      const newProduct = { nombre: 'Nuevo Producto', precio: 15, stock: 10 };
      component.productoForm.patchValue(newProduct);
      mockProductoService.create.and.returnValue(throwError(() => new Error('Create failed')));
      spyOn(component, 'mostrarMensaje');
      
      component.agregarProducto();
      
      expect(component.mostrarMensaje).toHaveBeenCalledWith('Error al agregar producto', 'error');
      expect(component.cargando).toBe(false);
    });
  });

  describe('eliminarProducto', () => {
    it('debería eliminar producto cuando es confirmado', () => {
      const productId = 1;
      spyOn(window, 'confirm').and.returnValue(true);
      mockProductoService.delete.and.returnValue(of(void 0));
      spyOn(component, 'cargarProductos');
      spyOn(component, 'mostrarMensaje');
      
      component.eliminarProducto(productId);
      
      expect(mockProductoService.delete).toHaveBeenCalledWith(productId);
      expect(component.cargarProductos).toHaveBeenCalled();
      expect(component.mostrarMensaje).toHaveBeenCalledWith(
        'Producto eliminado correctamente',
        'success'
      );
    });

    it('debería no eliminar producto cuando no es confirmado', () => {
      const productId = 1;
      spyOn(window, 'confirm').and.returnValue(false);
      
      component.eliminarProducto(productId);
      
      expect(mockProductoService.delete).not.toHaveBeenCalled();
    });

    it('debería manejar errores de eliminación', () => {
      const productId = 1;
      spyOn(window, 'confirm').and.returnValue(true);
      mockProductoService.delete.and.returnValue(throwError(() => new Error('Delete failed')));
      spyOn(component, 'mostrarMensaje');
      
      component.eliminarProducto(productId);
      
      expect(component.mostrarMensaje).toHaveBeenCalledWith('Error al eliminar producto', 'error');
      expect(component.cargando).toBe(false);
    });

    it('debería no eliminar cuando id es undefined', () => {
      spyOn(window, 'confirm');
      
      component.eliminarProducto(undefined);
      
      expect(window.confirm).not.toHaveBeenCalled();
    });
  });

  describe('editarProducto', () => {
    it('debería establecer producto en edición y abrir modal', () => {
      const product = mockProducts[0];
      
      component.editarProducto(product);
      
      expect(component.editandoProducto).toBe(product);
      expect(component.mostrarModal).toBe(true);
      expect(component.productoForm.get('nombre')?.value).toBe(product.nombre);
      expect(component.productoForm.get('precio')?.value).toBe(product.precio);
      expect(component.productoForm.get('stock')?.value).toBe(product.stock);
    });
  });

  describe('actualizarProducto', () => {
    it('debería actualizar producto cuando formulario es válido', () => {
      const productId = 1;
      component.editandoProducto = { id: productId, nombre: 'Test', precio: 10, stock: 5 };
      component.productoForm.patchValue({ nombre: 'Updated', precio: 20, stock: 10 });
      mockProductoService.update.and.returnValue(of({ id: productId, nombre: 'Updated', precio: 20, stock: 10 }));
      spyOn(component, 'cargarProductos');
      spyOn(component, 'cerrarModal');
      spyOn(component, 'mostrarMensaje');
      
      component.actualizarProducto();
      
      expect(mockProductoService.update).toHaveBeenCalledWith(productId, {
        nombre: 'Updated',
        precio: 20,
        stock: 10
      });
      expect(component.cargarProductos).toHaveBeenCalled();
      expect(component.cerrarModal).toHaveBeenCalled();
      expect(component.mostrarMensaje).toHaveBeenCalledWith(
        'Producto actualizado correctamente',
        'success'
      );
    });

    it('debería no actualizar cuando formulario es inválido', () => {
      component.editandoProducto = { id: 1, nombre: 'Test', precio: 10, stock: 5 };
      component.productoForm.patchValue({ nombre: '', precio: 0, stock: 0 });
      
      component.actualizarProducto();
      
      expect(mockProductoService.update).not.toHaveBeenCalled();
    });

    it('debería no actualizar cuando no hay producto en edición', () => {
      component.editandoProducto = null;
      component.productoForm.patchValue({ nombre: 'Test', precio: 10, stock: 5 });
      
      component.actualizarProducto();
      
      expect(mockProductoService.update).not.toHaveBeenCalled();
    });

    it('debería manejar errores de actualización', () => {
      const productId = 1;
      component.editandoProducto = { id: productId, nombre: 'Test', precio: 10, stock: 5 };
      component.productoForm.patchValue({ nombre: 'Updated', precio: 20, stock: 10 });
      mockProductoService.update.and.returnValue(throwError(() => new Error('Update failed')));
      spyOn(component, 'mostrarMensaje');
      
      component.actualizarProducto();
      
      expect(component.mostrarMensaje).toHaveBeenCalledWith('Error al actualizar producto', 'error');
      expect(component.cargando).toBe(false);
    });
  });

  describe('modal operations', () => {
    it('debería abrir modal para nuevo producto', () => {
      component.abrirModal();
      
      expect(component.mostrarModal).toBe(true);
      expect(component.editandoProducto).toBeNull();
    });

    it('debería cerrar modal', () => {
      component.mostrarModal = true;
      component.editandoProducto = mockProducts[0];
      component.cerrarModal();
      
      expect(component.mostrarModal).toBe(false);
      expect(component.editandoProducto).toBeNull();
    });

    it('debería cancelar edición', () => {
      component.editandoProducto = mockProducts[0];
      component.mostrarModal = true;
      component.cancelarEdicion();
      
      expect(component.editandoProducto).toBeNull();
      expect(component.mostrarModal).toBe(false);
    });

    it('debería limpiar formulario', () => {
      component.productoForm.patchValue({ nombre: 'Test', precio: 10, stock: 5 });
      component.limpiarFormulario();
      
      expect(component.productoForm.get('nombre')?.value).toBe('');
      expect(component.productoForm.get('precio')?.value).toBe(0);
      expect(component.productoForm.get('stock')?.value).toBe(0);
    });
  });

  describe('filtrado', () => {
    beforeEach(() => {
      component.productos = mockProducts;
    });

    it('debería retornar todos los productos cuando no hay filtro', () => {
      component.filtroNombre = '';
      const filtered = component.productosFiltrados;
      
      expect(filtered).toEqual(mockProducts);
    });

    it('debería filtrar productos por nombre', () => {
      component.filtroNombre = 'Producto 1';
      const filtered = component.productosFiltrados;
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].nombre).toBe('Producto 1');
    });

    it('debería filtrar productos sin distinción de mayúsculas', () => {
      component.filtroNombre = 'producto 1';
      const filtered = component.productosFiltrados;
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].nombre).toBe('Producto 1');
    });

    it('debería manejar filtro vacío', () => {
      component.filtroNombre = '   ';
      const filtered = component.productosFiltrados;
      
      expect(filtered).toEqual(mockProducts);
    });
  });

  describe('calculations', () => {
    beforeEach(() => {
      component.productos = mockProducts;
    });

    it('debería calcular total de productos', () => {
      expect(component.totalProductos).toBe(2);
    });

    it('debería calcular total de stock', () => {
      expect(component.totalStock).toBe(8); // 5 + 3
    });

    it('debería calcular total de valor', () => {
      expect(component.valorTotal).toBe(110); // (10*5) + (20*3)
    });

    it('debería manejar array de productos vacío', () => {
      component.productos = [];
      
      expect(component.totalProductos).toBe(0);
      expect(component.totalStock).toBe(0);
      expect(component.valorTotal).toBe(0);
    });
  });

  describe('logout', () => {
    it('debería llamar servicio de logout', () => {
      spyOn(component, 'mostrarMensaje');
      
      component.logout();
      
      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(component.mostrarMensaje).toHaveBeenCalledWith(
        'Sesión cerrada correctamente',
        'info'
      );
    });
  });

  describe('mostrarMensaje', () => {
    it('debería establecer mensaje y tipo', () => {
      component.mostrarMensaje('Test message', 'success');
      
      expect(component.mensaje).toBe('Test message');
      expect(component.tipoMensaje).toBe('success');
    });

    it('debería limpiar mensaje después de timeout', (done) => {
      component.mostrarMensaje('Test message', 'success');
      
      setTimeout(() => {
        expect(component.mensaje).toBe('');
        done();
      }, 3100); // 3000ms + buffer
    });
  });

  describe('forzarActualizacionVista', () => {
    it('debería llamar cambio de detección', () => {
      spyOn(component['cdr'], 'markForCheck');
      spyOn(component['cdr'], 'detectChanges');
      
      component.forzarActualizacionVista();
      
      expect(component['cdr'].markForCheck).toHaveBeenCalled();
      expect(component['cdr'].detectChanges).toHaveBeenCalled();
    });
  });
});
