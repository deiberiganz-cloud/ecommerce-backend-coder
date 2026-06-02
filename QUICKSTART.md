# ⚡ Referencia Rápida

Resumen rápido de la API y el proyecto.

---

## 🚀 Inicio Rápido

```bash
git clone <repo>
cd ecommerce
npm install
cp .env.example .env
# Edita .env con tu MONGO_URI
npm run dev
```

Abre: `http://localhost:8080`

---

## 📡 Endpoints - Quick Reference

### PRODUCTOS

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/products` | Listar (paginado) |
| GET | `/api/products/:pid` | Obtener uno |
| POST | `/api/products` | Crear |
| PUT | `/api/products/:pid` | Actualizar |
| DELETE | `/api/products/:pid` | Eliminar |

**Query params para GET /api/products:**
- `limit=10` (default)
- `page=1` (default)
- `query=electrónica` (filtro)
- `sort=asc|desc` (precio)

---

### CARRITOS

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/carts` | Crear carrito |
| GET | `/api/carts/:cid` | Obtener carrito |
| POST | `/api/carts/:cid/products/:pid` | Agregar producto |
| DELETE | `/api/carts/:cid/products/:pid` | Eliminar producto |
| PUT | `/api/carts/:cid/products/:pid` | Actualizar cantidad |
| PUT | `/api/carts/:cid` | Reemplazar carrito |
| DELETE | `/api/carts/:cid` | Vaciar carrito |

---

## 📝 Crear Producto

```bash
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Laptop",
    "description": "Desc",
    "code": "LAP-001",
    "price": 1200,
    "stock": 10,
    "category": "electrónica"
  }'
```

**Campos requeridos:**
- `title`
- `description`
- `code` (único)
- `price`
- `stock`
- `category`

**Campos opcionales:**
- `status` (default: true)
- `thumbnails` (default: [])

---

## 🛒 Crear Carrito

```bash
curl -X POST http://localhost:8080/api/carts
```

Respuesta:
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

## 📊 Obtener Productos

```bash
# Todos
curl http://localhost:8080/api/products

# Con paginación
curl http://localhost:8080/api/products?limit=5&page=1

# Filtrar por categoría
curl http://localhost:8080/api/products?query=electrónica

# Ordenar por precio
curl http://localhost:8080/api/products?sort=asc
```

---

## 📦 Obtener Producto

```bash
curl http://localhost:8080/api/products/507f1f77bcf86cd799439011
```

---

## ➕ Agregar al Carrito

```bash
curl -X POST http://localhost:8080/api/carts/CARRITO_ID/products/PRODUCTO_ID
```

---

## 🔢 Actualizar Cantidad

```bash
curl -X PUT http://localhost:8080/api/carts/CARRITO_ID/products/PRODUCTO_ID \
  -H "Content-Type: application/json" \
  -d '{"quantity": 5}'
```

---

## ❌ Eliminar del Carrito

```bash
curl -X DELETE http://localhost:8080/api/carts/CARRITO_ID/products/PRODUCTO_ID
```

---

## 🗑️ Vaciar Carrito

```bash
curl -X DELETE http://localhost:8080/api/carts/CARRITO_ID
```

---

## ✏️ Actualizar Producto

```bash
curl -X PUT http://localhost:8080/api/products/PRODUCTO_ID \
  -H "Content-Type: application/json" \
  -d '{
    "price": 1500,
    "stock": 20
  }'
```

---

## 🗑️ Eliminar Producto

```bash
curl -X DELETE http://localhost:8080/api/products/PRODUCTO_ID
```

---

## 🌳 Estructura de Carpetas

```
src/
├── app.js                    Servidor principal
├── config/db.js              Conexión BD
├── dao/
│   ├── ProductosManager.js   Lógica productos
│   ├── CarritosManager.js    Lógica carritos
│   └── models/               Schemas MongoDB
├── routes/
│   ├── products.router.js    Rutas productos
│   └── carts.router.js       Rutas carritos
└── views/                    Handlebars
```

---

## 🔧 Scripts

```bash
npm run dev     # Desarrollo (nodemon)
npm start       # Producción
```

---

## 🔐 Variables de Entorno

```env
PORT=8080
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/ecommerce
```

---

## ❓ Validaciones

| Campo | Validación | Ejemplo |
|-------|-----------|---------|
| ID | ObjectId 24 hex | `507f1f77bcf86cd799439011` |
| Price | Número positivo | `1299.99` |
| Stock | Número ≥ 0 | `15` |
| Quantity | Número > 0 | `5` |
| Code | String único | `LAP-001` |

---

## 🚨 Códigos HTTP

| Código | Significado |
|--------|------------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 404 | Not Found |
| 500 | Server Error |

---

## 📚 Documentación Completa

- **README.md** - Overview e instalación
- **API.md** - Endpoints detallados
- **ARCHITECTURE.md** - Diseño del sistema
- **DEVELOPMENT.md** - Guía de desarrollo
- **DOCUMENTATION.md** - Índice completo

---

## 💡 Tipode Errores Comunes

```
❌ "Ingresá un id válido de MongoDB"
→ El ID no es ObjectId válido

❌ "El código LAP-001 ya existe"
→ El código ya está en uso

❌ "Se requiere un array de products"
→ El body debe contener array

❌ "quantity debe ser un número mayor a 0"
→ Cantidad inválida en carrito
```

---

## 🔄 WebSocket Events

```javascript
socket.on('productoNuevo', (producto) => {
    // Nuevo producto creado
})

socket.on('productoEliminado', (productId) => {
    // Producto eliminado
})
```

---

## 📍 URLs Locales

```
API:    http://localhost:8080/api
Vistas: http://localhost:8080/products
```

---

## 🎯 Workflow Típico

```
1. Crear carrito
   POST /api/carts
   
2. Crear productos
   POST /api/products (x N)
   
3. Listar productos
   GET /api/products
   
4. Agregar al carrito
   POST /api/carts/:cid/products/:pid
   
5. Ver carrito
   GET /api/carts/:cid
   
6. Actualizar cantidad
   PUT /api/carts/:cid/products/:pid
   
7. Eliminar del carrito
   DELETE /api/carts/:cid/products/:pid
   
8. Vaciar carrito
   DELETE /api/carts/:cid
```

---

## 📞 Ayuda Rápida

**Instalación → [README.md](README.md)**  
**Endpoints → [API.md](API.md)**  
**Arquitectura → [ARCHITECTURE.md](ARCHITECTURE.md)**  
**Desarrollo → [DEVELOPMENT.md](DEVELOPMENT.md)**  
**Índice → [DOCUMENTATION.md](DOCUMENTATION.md)**

---

**Última actualización:** Junio 2024

