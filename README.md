# 🛒 E-Commerce Backend API

Proyecto de API REST para un sistema de e-commerce desarrollado con **Express.js**, **MongoDB** y **Socket.io**.

![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square)
![Express](https://img.shields.io/badge/Express-4.19-blue?style=flat-square)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square)
![License](https://img.shields.io/badge/License-ISC-yellow?style=flat-square)

---

## 📋 Tabla de Contenidos

- [Características](#características)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [API Endpoints](#api-endpoints)
- [Modelos de Datos](#modelos-de-datos)
- [Desarrollo Local](#desarrollo-local)
- [WebSocket Events](#websocket-events)
- [Buenas Prácticas Aplicadas](#buenas-prácticas-aplicadas)
- [Troubleshooting](#troubleshooting)

---

## ✨ Características

- ✅ **API REST completa** con rutas de productos y carrito
- ✅ **Autenticación con MongoDB Atlas** usando Mongoose
- ✅ **WebSocket en tiempo real** con Socket.io
- ✅ **Paginación de productos** con mongoose-paginate-v2
- ✅ **Renderizado de vistas** con Handlebars
- ✅ **Validación de datos** con guard clauses
- ✅ **Manejo robusto de errores** con try/catch
- ✅ **Código limpio y profesional** siguiendo estándares
- ✅ **Gestión de carrito** con persistencia en BD

---

## 🔧 Requisitos Previos

- **Node.js** v18 o superior
- **npm** (incluido con Node.js)
- **MongoDB Atlas** cuenta (base de datos en la nube)
- **Git** (para clonar el repositorio)

Verificar instalación:
```bash
node --version
npm --version
```

---

## 📦 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/tuusuario/ecommerce.git
cd ecommerce
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Crear archivo `.env`
Copiar el archivo `.env.example` y renombrarlo a `.env`:
```bash
cp .env.example .env
```

---

## ⚙️ Configuración

### Archivo `.env`

```env
PORT=8080
MONGO_URI=mongodb+srv://TUUSUARIO:TUPASSWORD@cluster.mongodb.net/ecommerce?appName=CursoBackend
```

**Obtener MongoDB URI:**
1. Ir a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crear una cuenta y un cluster
3. Obtener la connection string
4. Reemplazar `TUUSUARIO` y `TUPASSWORD` con tus credenciales

---

## 📁 Estructura del Proyecto

```
ecommerce/
├── src/
│   ├── app.js                          # Servidor principal
│   ├── utils.js                        # Utilidades (dirname para ES modules)
│   ├── config/
│   │   └── db.js                       # Conexión a MongoDB
│   ├── dao/
│   │   ├── CarritosManager.js          # Lógica de carritos
│   │   ├── ProductosManager.js         # Lógica de productos
│   │   ├── fs/
│   │   │   └── ProductManager.js       # Gestor de archivo (legacy)
│   │   └── models/
│   │       ├── carritosModelo.js       # Schema de carrito
│   │       └── productosModelo.js      # Schema de producto
│   ├── routes/
│   │   ├── carts.router.js             # Rutas de carritos
│   │   └── products.router.js          # Rutas de productos
│   └── views/
│       ├── layouts/
│       │   └── main.handlebars         # Layout principal
│       ├── cart.handlebars             # Vista de carrito
│       ├── productDetail.handlebars    # Detalle de producto
│       └── products.handlebars         # Listado de productos
├── public/
│   ├── css/
│   │   └── styles.css                  # Estilos CSS
│   └── js/
│       └── index.js                    # JavaScript del cliente
├── .env                                # Variables de entorno (NO subir a git)
├── .env.example                        # Plantilla .env
├── package.json                        # Dependencias del proyecto
└── README.md                           # Este archivo
```

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:8080/api
```

### 📦 PRODUCTOS

#### `GET /products`
Obtener listado paginado de productos

**Query Parameters:**
| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `limit` | number | 10 | Productos por página |
| `page` | number | 1 | Número de página |
| `query` | string | - | Filtro por categoría o status (true/false) |
| `sort` | string | - | Ordenar por precio: `asc` o `desc` |

**Ejemplo:**
```bash
GET /api/products?limit=5&page=1&query=electrónica&sort=asc
```

**Respuesta:**
```json
{
  "status": "success",
  "payload": [
    {
      "_id": "67890abc",
      "title": "Laptop",
      "description": "Laptop gaming",
      "code": "LAP001",
      "price": 1200,
      "status": true,
      "stock": 5,
      "category": "electrónica",
      "thumbnails": []
    }
  ],
  "totalPages": 5,
  "page": 1,
  "hasPrevPage": false,
  "hasNextPage": true,
  "prevLink": null,
  "nextLink": "/api/products?limit=5&page=2&query=electrónica&sort=asc"
}
```

---

#### `GET /products/:pid`
Obtener un producto por ID

**Parámetros:**
- `pid` - ID de MongoDB del producto

**Ejemplo:**
```bash
GET /api/products/67890abc
```

**Respuesta:**
```json
{
  "status": "success",
  "payload": {
    "_id": "67890abc",
    "title": "Laptop",
    "price": 1200,
    ...
  }
}
```

---

#### `POST /products`
Crear un nuevo producto

**Body:**
```json
{
  "title": "Laptop Gaming",
  "description": "Laptop de alta performance",
  "code": "LAP001",
  "price": 1200,
  "stock": 5,
  "category": "electrónica",
  "status": true,
  "thumbnails": []
}
```

**Validaciones:**
- `title`, `description`, `code`, `price`, `stock`, `category` son **requeridos**
- `code` debe ser **único**
- `status` por defecto es `true`

**Eventos WebSocket:**
Emite evento `productoNuevo` a todos los clientes conectados

---

#### `PUT /products/:pid`
Actualizar un producto

**Parámetros:**
- `pid` - ID del producto

**Body:** (cualquier campo a actualizar)
```json
{
  "price": 1500,
  "stock": 10
}
```

---

#### `DELETE /products/:pid`
Eliminar un producto

**Eventos WebSocket:**
Emite evento `productoEliminado` con el ID del producto eliminado

---

### 🛒 CARRITOS

#### `POST /carts`
Crear un nuevo carrito

**Respuesta:**
```json
{
  "status": "success",
  "message": "Carrito creado",
  "payload": {
    "_id": "123abc",
    "products": []
  }
}
```

---

#### `GET /carts/:cid`
Obtener un carrito por ID

**Parámetros:**
- `cid` - ID del carrito

**Respuesta:**
```json
{
  "status": "success",
  "payload": {
    "_id": "123abc",
    "products": [
      {
        "product": {
          "_id": "67890abc",
          "title": "Laptop",
          "price": 1200,
          ...
        },
        "quantity": 2,
        "_id": "xyz123"
      }
    ]
  }
}
```

---

#### `POST /carts/:cid/products/:pid`
Agregar producto al carrito

**Parámetros:**
- `cid` - ID del carrito
- `pid` - ID del producto

Si el producto ya existe, incrementa la cantidad en 1.

**Respuesta:**
```json
{
  "status": "success",
  "message": "Producto agregado al carrito",
  "payload": { ... }
}
```

---

#### `DELETE /carts/:cid/products/:pid`
Eliminar producto del carrito

**Parámetros:**
- `cid` - ID del carrito
- `pid` - ID del producto

---

#### `PUT /carts/:cid`
Actualizar todos los productos del carrito

**Body:**
```json
{
  "products": [
    {
      "product": "67890abc",
      "quantity": 5
    },
    {
      "product": "11223344",
      "quantity": 2
    }
  ]
}
```

---

#### `PUT /carts/:cid/products/:pid`
Actualizar cantidad de un producto en el carrito

**Body:**
```json
{
  "quantity": 5
}
```

**Validación:**
- `quantity` debe ser un número > 0

---

#### `DELETE /carts/:cid`
Vaciar carrito (eliminar todos los productos)

---

## 💾 Modelos de Datos

### Producto (Product)

```javascript
{
  _id: ObjectId,
  title: String (requerido),
  description: String (requerido),
  code: String (requerido, único),
  price: Number (requerido),
  status: Boolean (default: true),
  stock: Number (requerido),
  category: String (requerido),
  thumbnails: [String] (default: [])
}
```

**Métodos disponibles:**
- `getProductos()` - Lista paginada
- `getProductoById()` - Por ID
- `getProductoBy()` - Por filtro personalizado
- `create()` - Crear producto
- `update()` - Actualizar
- `delete()` - Eliminar

---

### Carrito (Cart)

```javascript
{
  _id: ObjectId,
  products: [
    {
      product: ObjectId (ref a Product),
      quantity: Number,
      _id: ObjectId
    }
  ]
}
```

**Métodos disponibles:**
- `create()` - Crear carrito
- `getCarritoById()` - Obtener por ID
- `agregarProducto()` - Agregar/incrementar producto
- `eliminarProducto()` - Eliminar producto
- `actualizarProductos()` - Reemplazar lista de productos
- `actualizarCantidad()` - Actualizar cantidad de un producto
- `vaciarCarrito()` - Vaciar carrito

---

## 🚀 Desarrollo Local

### 1. Iniciar servidor en modo desarrollo
```bash
npm run dev
```

El servidor ejecutará con **nodemon** y se reiniciará automáticamente en cada cambio.

**Salida esperada:**
```
🚀 arrancanddo servidor 8080
DB online...!!!
```

### 2. Iniciar servidor en modo producción
```bash
npm start
```

### 3. Acceder a la aplicación

**API:**
```
http://localhost:8080/api/products
http://localhost:8080/api/carts
```

**Vistas:**
```
http://localhost:8080/products
http://localhost:8080/products/:pid
http://localhost:8080/carts/:cid
```

---

## 📡 WebSocket Events

### Eventos Emitidos por el Servidor

#### `productoNuevo`
Se emite cuando se crea un nuevo producto.

```javascript
serverSocket.emit('productoNuevo', {
  _id: "123abc",
  title: "Nuevo Producto",
  ...
})
```

**Escuchar en el cliente:**
```javascript
socket.on('productoNuevo', (producto) => {
  console.log('Producto nuevo:', producto)
  // Actualizar UI
})
```

---

#### `productoEliminado`
Se emite cuando se elimina un producto.

```javascript
serverSocket.emit('productoEliminado', '123abc')
```

**Escuchar en el cliente:**
```javascript
socket.on('productoEliminado', (productoId) => {
  console.log('Producto eliminado:', productoId)
  // Actualizar UI
})
```

---

### Eventos Recibidos del Servidor

```javascript
socket.on('connection', (socket) => {
  console.log(`Usuario conectado: ${socket.id}`)
})

socket.on('disconnect', () => {
  console.log(`Usuario desconectado: ${socket.id}`)
})
```

---

## 🏆 Buenas Prácticas Aplicadas

### 1. Guard Clauses
Validaciones al inicio de cada ruta para evitar anidamientos:

```javascript
router.get('/:cid', async (req, res) => {
    const { cid } = req.params

    // Guard clause - validar y retornar inmediatamente
    if (!isValidObjectId(cid)) {
        return res.status(400).json({ status: 'error', error: 'ID inválido' })
    }

    try {
        // Lógica principal
    } catch (error) {
        console.error(error)
    }
})
```

### 2. Const vs Let
Se usa `const` por defecto para variables inmutables:

```javascript
const { cid } = req.params  // ✅ const
const carrito = await manager.getCarrito(cid)  // ✅ const
```

### 3. Logging de Errores
Se usa `console.error()` para errores, no `console.log()`:

```javascript
catch (error) {
    console.error(error)  // ✅ console.error()
    return res.status(500).json({ error: 'Internal Server Error' })
}
```

### 4. Headers Automáticos
Express maneja automáticamente `Content-Type: application/json` con `.json()`:

```javascript
// ❌ Evitado
res.setHeader('Content-Type', 'application/json')
return res.status(200).json(data)

// ✅ Así se hace
return res.status(200).json(data)
```

### 5. Try/Catch Limpio
Estructura consistente en todos los métodos:

```javascript
try {
    const resultado = await operacionBD()
    return resultado
} catch (error) {
    console.error(error)
    return null  // o throw error según corresponda
}
```

### 6. Validación con IDs de MongoDB
Validar que los IDs sean válidos antes de usar:

```javascript
const { pid } = req.params

if (!isValidObjectId(pid)) {
    return res.status(400).json({ error: 'ID inválido' })
}
```

---

## 📝 Variables de Entorno

### .env (NO subir a Git)
```env
PORT=8080
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/ecommerce?appName=CursoBackend
```

### .env.example (Subir a Git como plantilla)
```env
PORT=8080
MONGO_URI=mongodb+srv://TUUSUARIO:TUPASSWORD@cluster.mongodb.net/ecommerce?appName=CursoBackend
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module"
```bash
npm install
```

---

### Error: "MONGO_URI not defined"
Verificar que el archivo `.env` existe y contiene `MONGO_URI`:
```bash
cat .env
```

---

### Error: "Connection timeout"
1. Verificar la URL de MongoDB en `.env`
2. Verificar que la IP está whitelisted en MongoDB Atlas
3. Verificar la conexión a internet

---

### Error: "Port already in use"
Cambiar el puerto en `.env`:
```env
PORT=3000
```

O matar el proceso usando el puerto:
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :8080
kill -9 <PID>
```

---

### El servidor no se reinicia en cambios (dev mode)
Asegurarse que nodemon está instalado:
```bash
npm install --save-dev nodemon
```

---

## 📚 Dependencias Principales

| Paquete | Versión | Descripción |
|---------|---------|-------------|
| express | ^4.19 | Framework web |
| mongoose | ^9.6 | ODM para MongoDB |
| mongoose-paginate-v2 | ^1.9 | Paginación automática |
| express-handlebars | ^8.0 | Motor de vistas |
| socket.io | ^4.8 | Comunicación en tiempo real |
| dotenv | ^16.4 | Gestión de variables de entorno |
| nodemon | ^3.0 | Dev - reinicio automático |

---

## 📞 Soporte

Para reportar bugs o sugerencias:
1. Abrir un issue en el repositorio
2. Incluir pasos para reproducir
3. Detallar el entorno (OS, Node version, etc.)

---

## 📄 Licencia

ISC License - Ver `LICENSE` para más detalles

---

## 🙏 Agradecimientos

- Prof Diego Polverelli
- Curso de Backend Coderhouse
- MongoDB Atlas
- Express.js Community
- Socket.io Documentation

---

**Última actualización:** Junio 2024  
**Versión:** 1.0.0

