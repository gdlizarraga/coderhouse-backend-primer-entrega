# Servidor de Productos y Carritos con WebSockets

Este proyecto implementa un servidor Node.js con Express para el manejo de productos y carritos de compra, ahora con soporte para WebSockets y vistas HTML en tiempo real, desarrollado como parte de un entregable para CoderHouse.

## Características

- Servidor Express corriendo en puerto 8080
- API REST para manejo de productos y carritos
- **Vistas HTML con Handlebars (HBS)**
- **WebSockets para actualización en tiempo real**
- **Interfaz web Bootstrap responsive**
- **Notificaciones SweetAlert2**
- Persistencia en archivos JSON
- Rutas con Express Router
- Validaciones de datos
- Manejo de errores

## Estructura del Proyecto

```
├── package.json           # Dependencias y scripts
├── README.md              # Documentación del proyecto
├── .gitignore             # Archivos ignorados por git
└── src/                   # Código fuente
    ├── app.js             # Archivo principal del servidor
    ├── managers/          # Clases para manejo de datos
    │   ├── ProductManager.js  # Gestor de productos
    │   └── CartManager.js     # Gestor de carritos
    ├── routes/            # Rutas de la API
    │   ├── products.js    # Rutas de productos
    │   └── carts.js       # Rutas de carritos
    ├── views/             # Vistas HTML con Handlebars
    │   ├── layouts/       # Layouts principales
    │   │   └── main.hbs   # Layout base con Bootstrap y SweetAlert2
    │   ├── home.hbs       # Vista estática de productos
    │   └── realTimeProducts.hbs  # Vista en tiempo real con WebSockets
    ├── public/            # Archivos estáticos
    │   ├── js/           # Scripts del cliente
    │   │   └── rtp.js    # JavaScript para tiempo real
    │   └── favicon/      # Iconos del sitio
    └── data/              # Archivos de persistencia
        ├── products.json  # Base de datos de productos
        └── carts.json     # Base de datos de carritos
```

## Rutas Disponibles

### Vistas Web

- **GET /** - Vista principal con lista estática de productos (home.hbs)
- **GET /realtimeproducts** - Vista en tiempo real con WebSockets (realTimeProducts.hbs)

### API Endpoints

### Productos (/api/products)

- **GET /api/products/** - Listar todos los productos
- **GET /api/products/:pid** - Obtener producto por ID
- **POST /api/products/** - Crear nuevo producto
- **PUT /api/products/:pid** - Actualizar producto
- **DELETE /api/products/:pid** - Eliminar producto

### Carritos (/api/carts)

- **POST /api/carts/** - Crear nuevo carrito
- **GET /api/carts/:cid** - Obtener productos de un carrito (con información completa del producto)
- **POST /api/carts/:cid/product/:pid** - Agregar producto al carrito

## WebSockets

El servidor implementa Socket.io para comunicación en tiempo real:

### Eventos del Cliente → Servidor

- **addProduct** - Agregar nuevo producto desde la interfaz web
- **deleteProduct** - Eliminar producto por ID

### Eventos del Servidor → Cliente

- **updateProducts** - Actualizar lista completa de productos
- **addProductSuccess** - Confirmación de producto agregado exitosamente
- **addProductError** - Error al agregar producto (ej: código duplicado)
- **errorMessage** - Mensaje de error general

## Características de la Interfaz Web

### Vista Home (/)

- Lista estática de productos en cards Bootstrap
- Diseño responsivo
- Información completa de cada producto

### Vista Real Time Products (/realtimeproducts)

- **Actualización automática** de la lista al agregar/eliminar productos
- **Formulario integrado** para agregar productos
- **Eliminación en tiempo real** con botones en cada producto
- **Notificaciones SweetAlert2** para éxito y errores
- **Validación de campos** obligatorios

## Estructura de Datos

### Producto

```
json
{
  "id": 1,
  "title": "Producto ejemplo",
  "description": "Descripción del producto",
  "code": "PROD001",
  "price": 100,
  "status": true,
  "stock": 50,
  "category": "Categoría",
  "thumbnails": ["imagen1.jpg", "imagen2.jpg"]
}
```

### Carrito Mejorado (GET /api/carts/:cid)

Devuelve información completa del producto:

```json
[
  {
    "product": {
      "id": 1,
      "title": "Laptop Gaming",
      "description": "Laptop para gaming de alta gama",
      "code": "LAP001",
      "price": 1500,
      "stock": 10,
      "category": "Electrónicos",
      "thumbnails": []
    },
    "quantity": 2
  }
]
```

## Cómo usar la aplicación

### 1. Acceso a las vistas web

- Navega a `http://localhost:8080/` para ver la lista estática de productos
- Navega a `http://localhost:8080/realtimeproducts` para la interfaz en tiempo real

### 2. Agregar productos en tiempo real

- En la vista `/realtimeproducts`, completa el formulario con:
  - Título
  - Descripción
  - Precio
  - Código (único)
  - Stock
  - Categoría
- El producto aparecerá automáticamente en la lista sin recargar la página

### 3. Eliminar productos en tiempo real

- Haz clic en "Eliminar" en cualquier producto de la vista `/realtimeproducts`
- El producto se eliminará automáticamente de la lista

## Ejemplos de Uso con Postman

### Crear un producto

```
POST http://localhost:8080/api/products/
Content-Type: application/json

{
  "title": "Laptop Gaming",
  "description": "Laptop para gaming de alta gama",
  "code": "LAP001",
  "price": 1500,
  "stock": 10,
  "category": "Electrónicos",
  "thumbnails": ["laptop1.jpg", "laptop2.jpg"]
}
```

### Crear un carrito

```
POST http://localhost:8080/api/carts/
```

### Agregar producto al carrito

```
POST http://localhost:8080/api/carts/1/product/1
```

## Tecnologías Utilizadas

### Backend

- **Node.js** - Entorno de ejecución
- **Express.js** - Framework web
- **Socket.io** - WebSockets para tiempo real
- **express-handlebars** - Motor de plantillas

### Frontend

- **Bootstrap 5.3.0** - Framework CSS responsive
- **SweetAlert2** - Notificaciones elegantes
- **Socket.io Client** - Cliente WebSockets
- **Handlebars (HBS)** - Plantillas HTML

### Persistencia

- **File System (fs)** - Manejo de archivos
- **JSON** - Formato de almacenamiento

## Instalación y Ejecución

1. Clona el repositorio
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor:
   ```bash
   npm start
   ```
4. Accede a la aplicación:
   - Vista estática: `http://localhost:8080/`
   - Vista en tiempo real: `http://localhost:8080/realtimeproducts`
   - API: `http://localhost:8080/api/products` y `http://localhost:8080/api/carts`

## Notas Importantes

- Los IDs se autogeneran para asegurar unicidad
- El campo `status` por defecto es `true`
- Si un producto ya existe en el carrito, se incrementa la cantidad
- Todas las rutas incluyen validaciones y manejo de errores
- **Los códigos de producto deben ser únicos**
- **Las vistas se actualizan automáticamente** con WebSockets
- **Notificaciones SweetAlert2** informan sobre éxito o errores
- **Diseño responsive** que funciona en móviles y tablets
- **Favicon personalizado** desde `/favicon/favicon.ico`

## Nuevas Características de esta Entrega

✅ **Motor de plantillas Handlebars** configurado  
✅ **WebSockets con Socket.io** para tiempo real  
✅ **Vista Home** con lista estática de productos  
✅ **Vista RealTimeProducts** con funcionalidad en tiempo real  
✅ **Bootstrap 5** para diseño responsive  
✅ **SweetAlert2** para notificaciones elegantes  
✅ **Formulario completo** para agregar productos  
✅ **Eliminación en tiempo real** de productos  
✅ **Información completa** de productos en carritos (API mejorada)  
✅ **Manejo de errores** con notificaciones visuales
