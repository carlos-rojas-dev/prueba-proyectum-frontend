# 🛍️ CRUD de Productos - Frontend

Una aplicación web en Angular para la gestión de productos con sistema de autenticación integrado.
Este proyecto esta desarrollado exclusivamente como Prueba técnica - Desarrollador full stack Proyectum.

## 📋 Descripción

Sistema de gestión de productos que permite realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar). Incluye autenticación de usuarios a la API Backend en el repositorio https://github.com/carlos-rojas-dev/prueba-proyectum-backend.

## ✨ Características

- 🔐 **Sistema de Autenticación**: Login seguro con manejo de sesiones
- 📦 **Gestión de Productos**: CRUD completo con validaciones
- 🔍 **Filtrado en Tiempo Real**: Búsqueda instantánea por nombre
- 📊 **Estadísticas**: Resumen de productos, stock total y valor total 
- ⚡ **Rendimiento Optimizado**: Carga asíncrona y actualizaciones eficientes
- 🔄 **Manejo de Estados**: Gestión robusta de estados de carga y errores

## 🛠️ Tecnologías Utilizadas

- **Angular 20.3.0** - Framework principal
- **TypeScript 5.9.2** - Lenguaje de programación
- **RxJS 7.8.0** - Programación reactiva
- **Angular Forms** - Manejo de formularios
- **Angular Router** - Navegación 

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js (versión 18 o superior)
- npm o yarn
- API backend funcionando en `http://localhost:8080`

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone `https://github.com/carlos-rojas-dev/prueba-proyectum-frontend`
   cd crud-productos
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Edita el archivo `src/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:8080', // URL de tu API backend
     apiTimeout: 30000,
     enableLogging: true,
     version: '1.0.0'
   };
   ```

4. **Ejecutar la aplicación**
   ```bash
   npm start
   ```

5. **Acceder a la aplicación**
   
   Abre tu navegador y ve a `http://localhost:4200`

## 📖 Uso

### Autenticación

1. Accede a la aplicación
2. Ingresa tus credenciales de usuario
  - Usuario: Carlos
  - Clave: 1234
3. El sistema validará tu identidad
4. Una vez autenticado, tendrás acceso a todas las funcionalidades
5. El sistema detecta si existen datos de session, si es asi, usa los datos de sesiones e ingresa a productos de forma automatica

### Gestión de Productos

#### Crear Producto
1. Haz clic en el botón "Agregar Producto"
2. Completa el formulario con:
   - Nombre del producto
   - Precio (debe ser mayor a 0)
   - Stock (debe ser 0 o mayor)
3. Haz clic en "Guardar"

#### Editar Producto
1. Haz clic en el botón de editar (✏️) del producto deseado
2. Modifica los campos necesarios
3. Haz clic en "Actualizar"

#### Eliminar Producto
1. Haz clic en el botón de eliminar (🗑️) del producto
2. Confirma la eliminación en el diálogo

#### Buscar Productos
- Utiliza el campo de búsqueda para filtrar productos por nombre
- La búsqueda es en tiempo real y no distingue mayúsculas/minúsculas

## 🏗️ Estructura del Proyecto

```
src/
├── app/
│   ├── services/
│   │   ├── auth.service.ts      # Servicio de autenticación
│   │   └── producto.service.ts  # Servicio de productos
│   ├── app.component.*          # Componente principal
│   ├── login.component.*        # Componente de login
│   └── *.ts                     # Configuración de rutas y app
├── environments/
│   ├── environment.ts           # Configuración desarrollo
│   └── environment.prod.ts      # Configuración producción
└── styles.css                   # Estilos globales
```

## 🔧 Scripts Disponibles

- `npm start` - Ejecuta la aplicación en modo desarrollo
- `npm run build` - Construye la aplicación para producción 

## 🌐 API Backend

La aplicación se conecta a una API REST que debe estar ejecutándose en `http://localhost:8080` con los siguientes endpoints, recordar que la API Backend se encuentra en https://github.com/carlos-rojas-dev/prueba-proyectum-backend:

### Autenticación
- `POST /auth/login` - Iniciar sesión

### Productos
- `GET /productos` - Obtener todos los productos
- `POST /productos` - Crear nuevo producto
- `PUT /productos/:id` - Actualizar producto
- `DELETE /productos/:id` - Eliminar producto

## 🎨 Características de UI/UX

- **Diseño Responsive**: Adaptable a diferentes tamaños de pantalla
- **Feedback Visual**: Mensajes de éxito, error e información
- **Estados de Carga**: Indicadores visuales durante operaciones
- **Validaciones**: Formularios con validación en tiempo real
- **Iconografía**: Uso de emojis y iconos para mejor experiencia

## 🐛 Resolución de Problemas

### Error de Conexión
- Verifica que la API backend esté ejecutándose
- Revisa la URL en `environment.ts`
- Comprueba la configuración de CORS en el backend

### Problemas de Autenticación
- Verifica las credenciales
- Revisa que el endpoint de login esté funcionando
- Comprueba el manejo de tokens en el localStorage
  
## 👨‍💻 Autor

Desarrollado con ❤️ usando Angular y TypeScript.

Carlos Rojas

---

**Versión**: 1.0.0  
**Última actualización**: Septiembre 2025