import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { ProductoService, Producto } from '../../../app/services/producto.service';
import { environment } from '../../../environments/environment';
import { of, throwError } from 'rxjs';
import { provideZonelessChangeDetection } from '@angular/core';

describe('ProductoService', () => {
  let service: ProductoService;
  let httpMock: HttpTestingController;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ProductoService,
        { provide: HttpClient, useValue: spy },
        provideZonelessChangeDetection() // ✅ Zoneless para pruebas
      ]
    });

    service = TestBed.inject(ProductoService);
    httpClientSpy = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
    httpMock = TestBed.inject(HttpTestingController);

    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('debería ser creado', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('debería retornar array de productos', (done) => {
      const mockProducts: Producto[] = [
        { id: 1, nombre: 'Producto 1', precio: 10, stock: 5 },
        { id: 2, nombre: 'Producto 2', precio: 20, stock: 3 }
      ];

      httpClientSpy.get.and.returnValue(of(mockProducts));

      service.getAll().subscribe(products => {
        expect(products).toEqual(mockProducts);
        expect(products.length).toBe(2);
        done();
      });
    });

    it('debería manejar errores HTTP', (done) => {
      httpClientSpy.get.and.returnValue(throwError(() => new Error('Network error')));

      service.getAll().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toBe('Network error');
          done();
        }
      });
    });

    it('debería llamar endpoint correcto de API', () => {
      const mockProducts: Producto[] = [];
      httpClientSpy.get.and.returnValue(of(mockProducts));

      service.getAll();

      expect(httpClientSpy.get).toHaveBeenCalledWith(
        `${environment.apiUrl}/productos`,
        jasmine.any(Object)
      );
    });
  });

  describe('getAllWithoutAuth', () => {
    it('debería retornar productos sin autenticación', (done) => {
      const mockProducts: Producto[] = [
        { id: 1, nombre: 'Producto 1', precio: 10, stock: 5 }
      ];

      httpClientSpy.get.and.returnValue(of(mockProducts));

      service.getAllWithoutAuth().subscribe(products => {
        expect(products).toEqual(mockProducts);
        done();
      });
    });

    it('debería llamar API sin headers', () => {
      const mockProducts: Producto[] = [];
      httpClientSpy.get.and.returnValue(of(mockProducts));

      service.getAllWithoutAuth();

      expect(httpClientSpy.get).toHaveBeenCalledWith(`${environment.apiUrl}/productos`);
    });
  });

  describe('create', () => {
    it('debería crear un nuevo producto', (done) => {
      const newProduct: Producto = {
        nombre: 'Nuevo Producto',
        precio: 15,
        stock: 10
      };

      const createdProduct: Producto = {
        id: 1,
        ...newProduct
      };

      httpClientSpy.post.and.returnValue(of(createdProduct));

      service.create(newProduct).subscribe(product => {
        expect(product).toEqual(createdProduct);
        expect(product.id).toBe(1);
        done();
      });
    });

    it('debería llamar endpoint correcto de API for create', () => {
      const newProduct: Producto = { nombre: 'Test', precio: 10, stock: 5 };
      httpClientSpy.post.and.returnValue(of({ id: 1, ...newProduct }));

      service.create(newProduct);

      expect(httpClientSpy.post).toHaveBeenCalledWith(
        `${environment.apiUrl}/productos`,
        newProduct,
        jasmine.any(Object)
      );
    });
  });

  describe('update', () => {
    it('debería actualizar un producto existente', (done) => {
      const productId = 1;
      const updatedProduct: Producto = {
        id: productId,
        nombre: 'Producto Actualizado',
        precio: 25,
        stock: 8
      };

      httpClientSpy.put.and.returnValue(of(updatedProduct));

      service.update(productId, updatedProduct).subscribe(product => {
        expect(product).toEqual(updatedProduct);
        done();
      });
    });

    it('debería llamar endpoint correcto de API for update', () => {
      const productId = 1;
      const product: Producto = { id: productId, nombre: 'Test', precio: 10, stock: 5 };
      httpClientSpy.put.and.returnValue(of(product));

      service.update(productId, product);

      expect(httpClientSpy.put).toHaveBeenCalledWith(
        `${environment.apiUrl}/productos/${productId}`,
        product,
        jasmine.any(Object)
      );
    });
  });

  describe('delete', () => {
    it('debería eliminar un producto', (done) => {
      const productId = 1;

      httpClientSpy.delete.and.returnValue(of(void 0));

      service.delete(productId).subscribe(() => {
        expect(httpClientSpy.delete).toHaveBeenCalledWith(
          `${environment.apiUrl}/productos/${productId}`,
          jasmine.any(Object)
        );
        done();
      });
    });

    it('debería llamar endpoint correcto de API for delete', () => {
      const productId = 1;
      httpClientSpy.delete.and.returnValue(of(void 0));

      service.delete(productId);

      expect(httpClientSpy.delete).toHaveBeenCalledWith(
        `${environment.apiUrl}/productos/${productId}`,
        jasmine.any(Object)
      );
    });
  });

  describe('getById', () => {
    it('debería retornar un producto específico', (done) => {
      const productId = 1;
      const mockProduct: Producto = {
        id: productId,
        nombre: 'Producto Específico',
        precio: 30,
        stock: 15
      };

      httpClientSpy.get.and.returnValue(of(mockProduct));

      service.getById(productId).subscribe(product => {
        expect(product).toEqual(mockProduct);
        done();
      });
    });

    it('debería llamar endpoint correcto de API for getById', () => {
      const productId = 1;
      const mockProduct: Producto = { id: productId, nombre: 'Test', precio: 10, stock: 5 };
      httpClientSpy.get.and.returnValue(of(mockProduct));

      service.getById(productId);

      expect(httpClientSpy.get).toHaveBeenCalledWith(
        `${environment.apiUrl}/productos/${productId}`,
        jasmine.any(Object)
      );
    });
  });

  describe('hasToken', () => {
    it('debería retornar false cuando no hay token', () => {
      expect(service.hasToken()).toBe(false);
    });

    it('debería retornar true cuando existe token', () => {
      localStorage.setItem('token', 'mock-token');
      expect(service.hasToken()).toBe(true);
    });

    it('debería retornar false cuando token es string vacío', () => {
      localStorage.setItem('token', '');
      expect(service.hasToken()).toBe(false);
    });
  });

  describe('error handling', () => {
    it('debería manejar errores de creación', (done) => {
      const newProduct: Producto = { nombre: 'Test', precio: 10, stock: 5 };
      httpClientSpy.post.and.returnValue(throwError(() => new Error('Create failed')));

      service.create(newProduct).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toBe('Create failed');
          done();
        }
      });
    });

    it('debería manejar errores de actualización', (done) => {
      const productId = 1;
      const product: Producto = { id: productId, nombre: 'Test', precio: 10, stock: 5 };
      httpClientSpy.put.and.returnValue(throwError(() => new Error('Update failed')));

      service.update(productId, product).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toBe('Update failed');
          done();
        }
      });
    });

    it('debería manejar errores de eliminación', (done) => {
      const productId = 1;
      httpClientSpy.delete.and.returnValue(throwError(() => new Error('Delete failed')));

      service.delete(productId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toBe('Delete failed');
          done();
        }
      });
    });
  });
});
