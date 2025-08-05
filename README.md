# Servidor de Productos y Carritos

Este proyecto implementa un servidor Node.js con Express para el manejo de productos y carritos de compra, desarrollado como parte de un entregable para CoderHouse.

## Características

- Servidor Express corriendo en puerto 8080
- API REST para manejo de productos y carritos
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
    └── data/              # Archivos de persistencia
        ├── products.json  # Base de datos de productos
        └── carts.json     # Base de datos de carritos
```

## API Endpoints

### Productos (/api/products)

- **GET /api/products/** - Listar todos los productos
- **GET /api/products/:pid** - Obtener producto por ID
- **POST /api/products/** - Crear nuevo producto
- **PUT /api/products/:pid** - Actualizar producto
- **DELETE /api/products/:pid** - Eliminar producto

### Carritos (/api/carts)

- **POST /api/carts/** - Crear nuevo carrito
- **GET /api/carts/:cid** - Obtener productos de un carrito
- **POST /api/carts/:cid/product/:pid** - Agregar producto al carrito

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

### Carrito

```
json
{
  "id": 1,
  "products": [
    {
      "product": 1,
      "quantity": 2
    }
  ]
}
```

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

## Se uso la siguiente Tecnologías

- Node.js
- Express.js
- File System (fs) para persistencia
- JSON para almacenamiento de datos

## Notas

- Los IDs se autogeneran para asegurar unicidad
- El campo `status` por defecto es `true`
- Si un producto ya existe en el carrito, se incrementa la cantidad
- Todas las rutas incluyen validaciones y manejo de errores
