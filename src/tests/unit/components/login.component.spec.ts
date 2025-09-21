import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { LoginComponent } from '../../../app/login.component';
import { AuthService } from '../../../app/services/auth.service';
import { provideZonelessChangeDetection } from '@angular/core';

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let mockAuthService: jasmine.SpyObj<AuthService>;

    beforeEach(async () => {
        const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);

        await TestBed.configureTestingModule({
            imports: [LoginComponent, FormsModule],
            providers: [
                { provide: AuthService, useValue: authServiceSpy },
                provideZonelessChangeDetection() // ✅ Zoneless para pruebas
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    });

    it('debería crear el componente', () => {
        expect(component).toBeTruthy();
    });

    it('debería inicializar con valores vacíos', () => {
        expect(component.username).toBe('');
        expect(component.password).toBe('');
        expect(component.cargando).toBe(false);
        expect(component.mensaje).toBe('');
    });

    describe('onSubmit', () => {
        it('debería mostrar error cuando los campos están vacíos', () => {
            component.onSubmit();

            expect(component.mensaje).toBe('Por favor, completa todos los campos');
            expect(component.tipoMensaje).toBe('error');
        });

        it('debería mostrar error cuando el usuario está vacío', () => {
            component.password = '1234';
            component.onSubmit();

            expect(component.mensaje).toBe('Por favor, completa todos los campos');
            expect(component.tipoMensaje).toBe('error');
        });

        it('debería mostrar error cuando la contraseña está vacía', () => {
            component.username = 'Carlos';
            component.onSubmit();

            expect(component.mensaje).toBe('Por favor, completa todos los campos');
            expect(component.tipoMensaje).toBe('error');
        });

         it('debería llamar al servicio de login cuando el formulario es válido', () => {
             component.username = 'Carlos';
             component.password = '1234';
             mockAuthService.login.and.returnValue(of({ success: true, message: 'Success' }));

             component.onSubmit();

             expect(mockAuthService.login).toHaveBeenCalledWith('Carlos', '1234');
         });

        it('debería manejar el login exitoso', (done) => {
            component.username = 'Carlos';
            component.password = '1234';
            mockAuthService.login.and.returnValue(of({ success: true, message: 'Login successful' }));

            component.onSubmit();

            setTimeout(() => {
                expect(component.mensaje).toBe('Login successful');
                expect(component.tipoMensaje).toBe('success');
                expect(component.cargando).toBe(false);
                done();
            }, 0);
        });

        it('debería manejar el login fallido', (done) => {
            component.username = 'Carlos';
            component.password = 'wrongpassword';
            mockAuthService.login.and.returnValue(of({ success: false, message: 'Invalid credentials' }));

            component.onSubmit();

            setTimeout(() => {
                expect(component.mensaje).toBe('Invalid credentials');
                expect(component.tipoMensaje).toBe('error');
                expect(component.cargando).toBe(false);
                done();
            }, 0);
        });

        it('debería manejar errores de login', (done) => {
            component.username = 'Carlos';
            component.password = '1234';
            mockAuthService.login.and.returnValue(throwError(() => new Error('Network error')));

            component.onSubmit();

            setTimeout(() => {
                expect(component.mensaje).toBe('Error de conexión. Intenta nuevamente.');
                expect(component.tipoMensaje).toBe('error');
                expect(component.cargando).toBe(false);
                done();
            }, 0);
        });



        it('debería manejar espacios en blanco en usuario y contraseña', () => {
            component.username = '  ';
            component.password = '  ';

            component.onSubmit();

            expect(component.mensaje).toBe('Por favor, completa todos los campos');
            expect(component.tipoMensaje).toBe('error');
        });
    });

    describe('manejo de mensajes', () => {
        it('debería establecer mensaje y tipo cuando el login falla', () => {
            component.username = 'Carlos';
            component.password = '22222';
            mockAuthService.login.and.returnValue(of({ success: false, message: 'Invalid credentials' }));

            component.onSubmit();

            expect(component.mensaje).toBe('Invalid credentials');
            expect(component.tipoMensaje).toBe('error');
        });

        it('debería establecer mensaje y tipo cuando el login es exitoso', () => {
            component.username = 'Carlos';
            component.password = '1234';
            mockAuthService.login.and.returnValue(of({ success: true, message: 'Login successful' }));

            component.onSubmit();

            expect(component.mensaje).toBe('Login successful');
            expect(component.tipoMensaje).toBe('success');
        });
    });

    describe('inicialización del componente', () => {
        it('debería tener el estado inicial correcto', () => {
            expect(component.username).toBe('');
            expect(component.password).toBe('');
            expect(component.cargando).toBe(false);
            expect(component.mensaje).toBe('');
            expect(component.tipoMensaje).toBe('info');
        });
    });

    describe('validación del formulario', () => {
        it('debería validar campos requeridos', () => {
            component.username = '';
            component.password = '';

            component.onSubmit();

            expect(component.mensaje).toBe('Por favor, completa todos los campos');
            expect(component.tipoMensaje).toBe('error');
        });

        it('debería validar que el usuario no sea solo espacios en blanco', () => {
            component.username = '   ';
            component.password = 'password';

            component.onSubmit();

            expect(component.mensaje).toBe('Por favor, completa todos los campos');
            expect(component.tipoMensaje).toBe('error');
        });

        it('debería validar que la contraseña no sea solo espacios en blanco', () => {
            component.username = 'username';
            component.password = '   ';

            component.onSubmit();

            expect(component.mensaje).toBe('Por favor, completa todos los campos');
            expect(component.tipoMensaje).toBe('error');
        });
    });
});
