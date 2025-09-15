
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
 import { Producto, ProductoService } from './services/producto.service';
import { AuthService, Usuario } from './services/auth.service';
import { CommonModule,CurrencyPipe } from '@angular/common';
import { LoginComponent } from './login.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [FormsModule, ReactiveFormsModule, CurrencyPipe, CommonModule, LoginComponent] 
})
export class AppComponent implements OnInit {
  title = 'Gestión de Productos';
  productos: Producto[] = [];
  productoForm: FormGroup;
  editandoProducto: Producto | null = null;
  cargando = false;
  mensaje = '';
  tipoMensaje: 'success' | 'error' | 'info' = 'info';
  mostrarModal = false;
  filtroNombre = '';
   
  isAuthenticated = false;
  currentUser: Usuario | null = null;
  
  constructor(
    private readonly productoService: ProductoService,
    private readonly authService: AuthService,
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.productoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      precio: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void { 
    // Suscribirse a los cambios de autenticación
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
      if (isAuth) {
        this.cargarProductos();
      }
    });

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Está autenticado..?
    if (this.authService.isAuthenticated()) {
      this.isAuthenticated = true;
      this.currentUser = this.authService.getCurrentUser();
      this.cargarProductos();
    }
  }

  cargarProductos(): void {
    console.log('🔄 Cargando productos...');
    this.cargando = true;
    
    // Intentar primero con autenticación, si falla probar sin autenticación, eliminar despues si no es necesario
    this.productoService.getAll().subscribe({
      next: data => { 
        this.productos = [...data];
        this.cargando = false; 
        this.forzarActualizacionVista();
        console.log('✅ Productos cargados con auth:', this.productos.length);
      },
      error: err => {
        console.error('❌ Error con autenticación:', err);
        
        // Si falla con auth, intentar sin autenticación
        //Prueba para saltar a productos si hay error con auth, despues, eliminar si no es necesario
        console.log('🔄 Intentando sin autenticación...');
        this.productoService.getAllWithoutAuth().subscribe({
          next: data => {
            this.productos = [...data];
            this.cargando = false;
            this.forzarActualizacionVista();
            console.log('✅ Productos cargados sin auth:', this.productos.length);
            this.mostrarMensaje('Productos cargados (sin autenticación)', 'info');
          },
          error: err2 => {
            console.error('❌ Error también sin autenticación:', err2);
            this.mostrarMensaje('Error al cargar productos', 'error');
            this.cargando = false;
          }
        });
      }
    });
  }

  eliminarProducto(id: number | undefined): void {
    if (!id) return;
    
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      this.cargando = true;
      this.productoService.delete(id).subscribe({
        next: () => {
          this.cargarProductos();
          this.mostrarMensaje('Producto eliminado correctamente', 'success');
        },
        error: err => {
          console.error('Error al eliminar producto', err);
          this.mostrarMensaje('Error al eliminar producto', 'error');
          this.cargando = false;
        }
      });
    }
  }

  agregarProducto(): void {
    if (this.productoForm.valid) {
      const producto = this.productoForm.value;
      this.cargando = true;
      
      this.productoService.create(producto).subscribe({
        next: (productoCreado) => { 
          this.cerrarModal(); 
          this.mostrarMensaje('Producto agregado correctamente', 'success'); 
          this.cargarProductos();
        },
        error: err => {
          console.error('Error al agregar producto', err);
          this.mostrarMensaje('Error al agregar producto', 'error');
          this.cargando = false;
        }
      });
    } else {
      this.mostrarMensaje('Por favor, completa todos los campos correctamente', 'error');
    }
  }

  editarProducto(producto: Producto): void {
    this.editandoProducto = producto;
    this.productoForm.patchValue({
      nombre: producto.nombre,
      precio: producto.precio,
      stock: producto.stock
    });
    this.mostrarModal = true;
  }

  actualizarProducto(): void {
    if (this.productoForm.valid && this.editandoProducto?.id) {
      const producto = this.productoForm.value;
      this.cargando = true;
      
      this.productoService.update(this.editandoProducto.id, producto).subscribe({
        next: (productoActualizado) => {
         
          this.cerrarModal(); 
          this.mostrarMensaje('Producto actualizado correctamente', 'success');
          // Recargar productos
          this.cargarProductos();
        },
        error: err => {
          console.error('Error al actualizar producto', err);
          this.mostrarMensaje('Error al actualizar producto', 'error');
          this.cargando = false;
        }
      });
    }
  }

  cancelarEdicion(): void {
    this.editandoProducto = null;
    this.limpiarFormulario();
    this.mostrarModal = false;
  }

  limpiarFormulario(): void {
    this.productoForm.reset();
    this.productoForm.patchValue({
      nombre: '',
      precio: 0,
      stock: 0
    });
  }

  abrirModal(): void {
    this.editandoProducto = null;
    this.limpiarFormulario();
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.editandoProducto = null;
    this.limpiarFormulario();
  }

  mostrarMensaje(mensaje: string, tipo: 'success' | 'error' | 'info'): void {
    this.mensaje = mensaje;
    this.tipoMensaje = tipo;
    setTimeout(() => {
      this.mensaje = '';
    }, 3000);
  }

  // Método para forzar la actualización completa de la vista
  forzarActualizacionVista(): void { 
    this.cdr.markForCheck();
    this.cdr.detectChanges(); 
  }

  // Método para cerrar sesión
  logout(): void {
    this.authService.logout();
    this.mostrarMensaje('Sesión cerrada correctamente', 'info');
  }

  get productosFiltrados(): Producto[] {
    // Si no hay filtro, devolver todos los productos
    if (!this.filtroNombre || this.filtroNombre.trim() === '') {
      return this.productos;
    }
    
    // Filtrar productos por nombre (sin modificar el array original)
    return this.productos.filter(producto => 
      producto.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase().trim())
    );
  }

  get totalProductos(): number {
    return this.productos.length;
  }

  get totalStock(): number {
    return this.productos.reduce((sum, p) => sum + p.stock, 0);
  }

  get valorTotal(): number {
    return this.productos.reduce((sum, p) => sum + (p.precio * p.stock), 0);
  }
}
