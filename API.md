# 📡 Documentación Detallada de API

## Índice

- [Códigos de Estado HTTP](#códigos-de-estado-http)
- [Productos - Endpoints](#productos---endpoints)
- [Carritos - Endpoints](#carritos---endpoints)
- [Estructura de Respuestas](#estructura-de-respuestas)
- [Validaciones](#validaciones)
- [Ejemplos con cURL](#ejemplos-con-curl)

---

## Códigos de Estado HTTP

| Código | Significado | Descripción |
|--------|------------|-------------|
| 200 | OK | Solicitud exitosa |
| 201 | Created | Recurso creado exitosamente |
| 400 | Bad Request | Solicitud inválida (parámetros faltantes/inválidos) |
| 404 | Not Found | Recurso no encontrado |
| 500 | Internal Server Error | Error del servidor |

---

## Productos - Endpoints

### 1. Listar Productos (Paginado)

```http
GET /api/products?limit=10&page=1&query=electrónica&sort=asc
```

**Descripción:** Obtiene un listado paginado de productos con filtrado y ordenamiento.

**Query Parameters:**

| Parámetro | Tipo | Obligatorio | Default | Valores |
|-----------|------|------------|---------|---------|
| `limit` | number | No | 10 | 1-100 |
| `page` | number | No | 1 | ≥ 1 |
| `query` | string | No | - | Categoría o "true"/"false" para status |
| `sort` | string | No | - | "asc" o "desc" (por precio) |

**Ejemplos de Uso:**

```bash
# Página 1, 10 productos por página
GET /api/products

# Productos de la categoría "electrónica"
GET /api/products?query=electrónica

# Productos activos (status=true)
GET /api/products?query=true

# Ordenados por precio ascendente
GET /api/products?sort=asc

# Combinado
GET /api/products?limit=20&page=2&query=electrónica&sort=desc
```

**Respuesta Exitosa (200):**

```json
{
  "status": "success",
  "payload": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Laptop Gaming ASUS",
      "description": "Laptop de alto rendimiento para gaming",
      "code": "LAP-ASUS-001",
      "price": 1299.99,
      "status": true,
      "stock": 15,
      "category": "electrónica",
      "thumbnails": ["img1.jpg", "img2.jpg"],
      "__v": 0
    }
  ],
  "totalPages": 5,
  "prevPage": null,
  "nextPage": 2,
  "page": 1,
  "hasPrevPage": false,
  "hasNextPage": true,
  "prevLink": null,
  "nextLink": "/api/products?limit=10&page=2&query=electrónica&sort=asc"
}
```

**Respuesta Error (500):**

```json
{
  "status": "error",
  "error": "Internal Server Error"
}
```

---

### 2. Obtener Producto por ID

```http
GET /api/products/:pid
```

**Descripción:** Obtiene los detalles completos de un producto específico.

**Parámetros de Ruta:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `pid` | string | ID de MongoDB del producto (ObjectId válido) |

**Validaciones:**
- El `pid` debe ser un ObjectId válido de MongoDB

**Ejemplos:**

```bash
GET /api/products/507f1f77bcf86cd799439011
```

**Respuesta Exitosa (200):**

```json
{
  "status": "success",
  "payload": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Laptop Gaming ASUS",
    "description": "Laptop de alto rendimiento para gaming",
    "code": "LAP-ASUS-001",
    "price": 1299.99,
    "status": true,
    "stock": 15,
    "category": "electrónica",
    "thumbnails": ["img1.jpg", "img2.jpg"],
    "__v": 0
  }
}
```

**Respuesta Error - ID Inválido (400):**

```json
{
  "status": "error",
  "error": "Ingresá un id válido de MongoDB"
}
```

**Respuesta Error - No Encontrado (404):**

```json
{
  "status": "error",
  "error": "Producto con id 507f1f77bcf86cd799439011 no encontrado"
}
```

---

### 3. Crear Producto

```http
POST /api/products
Content-Type: application/json
```

**Descripción:** Crea un nuevo producto en la base de datos.

**Body (JSON):**

```json
{
  "title": "Laptop Gaming ASUS",
  "description": "Laptop de alto rendimiento para gaming",
  "code": "LAP-ASUS-001",
  "price": 1299.99,
  "stock": 15,
  "category": "electrónica",
  "status": true,
  "thumbnails": ["img1.jpg", "img2.jpg"]
}
```

**Validaciones:**
- `title` - Requerido, string
- `description` - Requerido, string
- `code` - Requerido, string, **ÚNICO**
- `price` - Requerido, número
- `stock` - Requerido, número
- `category` - Requerido, string
- `status` - Opcional, boolean (default: true)
- `thumbnails` - Opcional, array de strings (default: [])

**Respuesta Exitosa (201):**

```json
{
  "status": "success",
  "message": "Producto creado",
  "payload": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Laptop Gaming ASUS",
    "description": "Laptop de alto rendimiento para gaming",
    "code": "LAP-ASUS-001",
    "price": 1299.99,
    "status": true,
    "stock": 15,
    "category": "electrónica",
    "thumbnails": ["img1.jpg", "img2.jpg"],
    "__v": 0
  }
}
```

**Respuesta Error - Campos Faltantes (400):**

```json
{
  "status": "error",
  "error": "title | description | code | price | stock | category son requeridos"
}
```

**Respuesta Error - Código Duplicado (400):**

```json
{
  "status": "error",
  "error": "El código LAP-ASUS-001 ya existe"
}
```

**WebSocket Event:**
```javascript
// Emite a todos los clientes conectados
serverSocket.emit('productoNuevo', {
  _id: "507f1f77bcf86cd799439011",
  title: "Laptop Gaming ASUS",
  ...
})
```

---

### 4. Actualizar Producto

```http
PUT /api/products/:pid
Content-Type: application/json
```

**Descripción:** Actualiza un producto existente (solo campos proporcionados).

**Parámetros de Ruta:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `pid` | string | ID del producto (ObjectId válido) |

**Body (JSON) - Solo enviar campos a actualizar:**

```json
{
  "price": 1199.99,
  "stock": 20,
  "status": false
}
```

**Validaciones:**
- El `pid` debe ser un ObjectId válido
- No se puede actualizar el `_id`

**Respuesta Exitosa (200):**

```json
{
  "status": "success",
  "message": "Producto actualizado",
  "payload": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Laptop Gaming ASUS",
    "description": "Laptop de alto rendimiento para gaming",
    "code": "LAP-ASUS-001",
    "price": 1199.99,
    "status": false,
    "stock": 20,
    "category": "electrónica",
    "thumbnails": ["img1.jpg", "img2.jpg"],
    "__v": 1
  }
}
```

**Respuesta Error - No Encontrado (404):**

```json
{
  "status": "error",
  "error": "Producto con id 507f1f77bcf86cd799439011 no encontrado"
}
```

---

### 5. Eliminar Producto

```http
DELETE /api/products/:pid
```

**Descripción:** Elimina un producto de la base de datos.

**Parámetros de Ruta:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `pid` | string | ID del producto (ObjectId válido) |

**Respuesta Exitosa (200):**

```json
{
  "status": "success",
  "message": "Producto eliminado",
  "payload": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Laptop Gaming ASUS",
    "description": "Laptop de alto rendimiento para gaming",
    "code": "LAP-ASUS-001",
    "price": 1199.99,
    "status": false,
    "stock": 20,
    "category": "electrónica",
    "thumbnails": ["img1.jpg", "img2.jpg"]
  }
}
```

**Respuesta Error - No Encontrado (404):**

```json
{
  "status": "error",
  "error": "Producto con id 507f1f77bcf86cd799439011 no encontrado"
}
```

**WebSocket Event:**
```javascript
// Emite a todos los clientes conectados
serverSocket.emit('productoEliminado', '507f1f77bcf86cd799439011')
```

---

## Carritos - Endpoints

### 1. Crear Carrito

```http
POST /api/carts
```

**Descripción:** Crea un nuevo carrito vacío.

**Body:** (vacío)

**Respuesta Exitosa (201):**

```json
{
  "status": "success",
  "message": "Carrito creado",
  "payload": {
    "_id": "507f191e810c19729de860ea",
    "products": [],
    "__v": 0
  }
}
```

**Respuesta Error (500):**

```json
{
  "status": "error",
  "error": "Internal Server Error"
}
```

---

### 2. Obtener Carrito

```http
GET /api/carts/:cid
```

**Descripción:** Obtiene los detalles de un carrito incluyendo los productos con toda su información.

**Parámetros de Ruta:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `cid` | string | ID del carrito (ObjectId válido) |

**Validaciones:**
- El `cid` debe ser un ObjectId válido

**Respuesta Exitosa (200):**

```json
{
  "status": "success",
  "payload": {
    "_id": "507f191e810c19729de860ea",
    "products": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "product": {
          "_id": "507f1f77bcf86cd799439011",
          "title": "Laptop Gaming ASUS",
          "description": "Laptop de alto rendimiento para gaming",
          "code": "LAP-ASUS-001",
          "price": 1199.99,
          "status": true,
          "stock": 20,
          "category": "electrónica",
          "thumbnails": ["img1.jpg"],
          "__v": 0
        },
        "quantity": 2
      }
    ],
    "__v": 0
  }
}
```

**Respuesta Error - ID Inválido (400):**

```json
{
  "status": "error",
  "error": "Ingresá un id válido de MongoDB"
}
```

**Respuesta Error - No Encontrado (404):**

```json
{
  "status": "error",
  "error": "Carrito con id 507f191e810c19729de860ea no encontrado"
}
```

---

### 3. Agregar Producto al Carrito

```http
POST /api/carts/:cid/products/:pid
```

**Descripción:** Agrega un producto al carrito. Si el producto ya existe, incrementa su cantidad en 1.

**Parámetros de Ruta:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `cid` | string | ID del carrito (ObjectId válido) |
| `pid` | string | ID del producto (ObjectId válido) |

**Validaciones:**
- Ambos `cid` y `pid` deben ser ObjectId válidos

**Body:** (vacío)

**Respuesta Exitosa (200):**

```json
{
  "status": "success",
  "message": "Producto agregado al carrito",
  "payload": {
    "_id": "507f191e810c19729de860ea",
    "products": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "product": "507f1f77bcf86cd799439011",
        "quantity": 1
      }
    ],
    "__v": 1
  }
}
```

**Respuesta Error - Carrito No Encontrado (404):**

```json
{
  "status": "error",
  "error": "Carrito con id 507f191e810c19729de860ea no encontrado"
}
```

---

### 4. Eliminar Producto del Carrito

```http
DELETE /api/carts/:cid/products/:pid
```

**Descripción:** Elimina un producto del carrito.

**Parámetros de Ruta:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `cid` | string | ID del carrito (ObjectId válido) |
| `pid` | string | ID del producto (ObjectId válido) |

**Respuesta Exitosa (200):**

```json
{
  "status": "success",
  "message": "Producto eliminado del carrito",
  "payload": {
    "_id": "507f191e810c19729de860ea",
    "products": [],
    "__v": 2
  }
}
```

**Respuesta Error - Producto No Encontrado (404):**

```json
{
  "status": "error",
  "error": "Carrito o producto no encontrado"
}
```

---

### 5. Actualizar Cantidad de un Producto

```http
PUT /api/carts/:cid/products/:pid
Content-Type: application/json
```

**Descripción:** Actualiza la cantidad de un producto específico en el carrito.

**Parámetros de Ruta:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `cid` | string | ID del carrito (ObjectId válido) |
| `pid` | string | ID del producto (ObjectId válido) |

**Body:**

```json
{
  "quantity": 5
}
```

**Validaciones:**
- `quantity` es requerido
- `quantity` debe ser un número
- `quantity` debe ser mayor que 0

**Respuesta Exitosa (200):**

```json
{
  "status": "success",
  "message": "Cantidad actualizada",
  "payload": {
    "_id": "507f191e810c19729de860ea",
    "products": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "product": "507f1f77bcf86cd799439011",
        "quantity": 5
      }
    ],
    "__v": 3
  }
}
```

**Respuesta Error - Cantidad Inválida (400):**

```json
{
  "status": "error",
  "error": "quantity debe ser un número mayor a 0"
}
```

**Respuesta Error - Producto No Encontrado (404):**

```json
{
  "status": "error",
  "error": "Carrito o producto no encontrado"
}
```

---

### 6. Actualizar Carrito Completo

```http
PUT /api/carts/:cid
Content-Type: application/json
```

**Descripción:** Reemplaza la lista completa de productos del carrito.

**Parámetros de Ruta:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `cid` | string | ID del carrito (ObjectId válido) |

**Body:**

```json
{
  "products": [
    {
      "product": "507f1f77bcf86cd799439011",
      "quantity": 3
    },
    {
      "product": "507f1f77bcf86cd799439013",
      "quantity": 2
    }
  ]
}
```

**Validaciones:**
- `products` es requerido
- `products` debe ser un array

**Respuesta Exitosa (200):**

```json
{
  "status": "success",
  "message": "Carrito actualizado",
  "payload": {
    "_id": "507f191e810c19729de860ea",
    "products": [
      {
        "product": "507f1f77bcf86cd799439011",
        "quantity": 3,
        "_id": "507f1f77bcf86cd799439012"
      },
      {
        "product": "507f1f77bcf86cd799439013",
        "quantity": 2,
        "_id": "507f1f77bcf86cd799439014"
      }
    ],
    "__v": 4
  }
}
```

**Respuesta Error - Array Vacío (400):**

```json
{
  "status": "error",
  "error": "Se requiere un array de products"
}
```

---

### 7. Vaciar Carrito

```http
DELETE /api/carts/:cid
```

**Descripción:** Elimina todos los productos del carrito dejándolo vacío.

**Parámetros de Ruta:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `cid` | string | ID del carrito (ObjectId válido) |

**Respuesta Exitosa (200):**

```json
{
  "status": "success",
  "message": "Carrito vaciado",
  "payload": {
    "_id": "507f191e810c19729de860ea",
    "products": [],
    "__v": 5
  }
}
```

**Respuesta Error - No Encontrado (404):**

```json
{
  "status": "error",
  "error": "Carrito con id 507f191e810c19729de860ea no encontrado"
}
```

---

## Estructura de Respuestas

### Respuesta de Éxito

```json
{
  "status": "success",
  "message": "Descripción de lo que pasó",
  "payload": { /* datos */ }
}
```

### Respuesta de Error

```json
{
  "status": "error",
  "error": "Descripción del error"
}
```

---

## Validaciones

### IDs de MongoDB

Los IDs de MongoDB deben ser ObjectIds válidos (24 caracteres hexadecimales):

```
✅ Válido:   507f1f77bcf86cd799439011
❌ Inválido: 123
❌ Inválido: abc
```

### Precios

- Deben ser números positivos
- Pueden tener decimales
- Ejemplo: `1299.99`, `100`, `9.95`

### Stocks

- Deben ser números enteros
- No pueden ser negativos
- Ejemplo: `15`, `100`, `0`

### Cantidad en Carrito

- Debe ser mayor que 0
- Debe ser un número entero
- Ejemplo: `1`, `5`, `100`

---

## Ejemplos con cURL

### Crear Producto

```bash
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mouse Logitech",
    "description": "Mouse inalámbrico de precisión",
    "code": "MOUSE-LOG-001",
    "price": 29.99,
    "stock": 50,
    "category": "accesorios",
    "status": true
  }'
```

### Obtener Productos

```bash
curl http://localhost:8080/api/products?limit=5&page=1
```

### Crear Carrito

```bash
curl -X POST http://localhost:8080/api/carts
```

### Agregar Producto al Carrito

```bash
curl -X POST http://localhost:8080/api/carts/507f191e810c19729de860ea/products/507f1f77bcf86cd799439011
```

### Actualizar Cantidad

```bash
curl -X PUT http://localhost:8080/api/carts/507f191e810c19729de860ea/products/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 5
  }'
```

### Eliminar Producto del Carrito

```bash
curl -X DELETE http://localhost:8080/api/carts/507f191e810c19729de860ea/products/507f1f77bcf86cd799439011
```

### Vaciar Carrito

```bash
curl -X DELETE http://localhost:8080/api/carts/507f191e810c19729de860ea
```

---

**Última actualización:** Junio 2024

