# 🏗️ Arquitectura del Proyecto

## Índice

- [Patrones Arquitectónicos](#patrones-arquitectónicos)
- [Capas de la Aplicación](#capas-de-la-aplicación)
- [Flujo de Datos](#flujo-de-datos)
- [Estructura de Carpetas](#estructura-de-carpetas)
- [Decisiones de Diseño](#decisiones-de-diseño)
- [Escalabilidad](#escalabilidad)

---

## Patrones Arquitectónicos

### Patrón MVC (Model-View-Controller) Modificado

La aplicación sigue una variante del patrón MVC:

```
REQUEST → ROUTER (Controller) → DAO/Manager (Model) → BD (MongoDB)
                    ↓
                RESPONSE (JSON/HTML)
```

**Componentes:**

- **Router/Controller** (`routes/`) - Maneja las solicitudes HTTP
- **Manager/DAO** (`dao/`) - Lógica de negocio y acceso a datos
- **Model** (`dao/models/`) - Esquemas de MongoDB
- **View** (`views/`) - Plantillas Handlebars para HTML

---

## Capas de la Aplicación

### 1. Capa de Presentación (View)

**Archivos:**
```
src/views/
├── layouts/main.handlebars
├── products.handlebars
├── productDetail.handlebars
└── cart.handlebars
```

**Responsabilidades:**
- Renderizar interfaz de usuario
- Mostrar datos de productos
- Mostrar carrito de compras
- Comunicación WebSocket con el servidor

**Tecnologías:**
- Handlebars (motor de plantillas)
- HTML5
- CSS3
- JavaScript (Socket.io)

---

### 2. Capa de Rutas (Controller)

**Archivos:**
```
src/routes/
├── products.router.js
└── carts.router.js
```

**Responsabilidades:**
- Recibir solicitudes HTTP
- Validar parámetros y datos de entrada
- Guardia clauses (guard clauses)
- Delegar a la capa de negocio
- Formatear y enviar respuestas

**Patrón Guard Clause:**
```javascript
router.get('/:pid', async (req, res) => {
    const { pid } = req.params
    
    // Validar PRIMERO (guard clause)
    if (!isValidObjectId(pid)) {
        return res.status(400).json({ error: 'ID inválido' })
    }
    
    // Lógica principal dentro de try/catch
    try {
        const producto = await manager.getProductoById(pid)
        return res.json(producto)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Error interno' })
    }
})
```

---

### 3. Capa de Negocio (Manager/DAO)

**Archivos:**
```
src/dao/
├── CarritosManager.js
├── ProductosManager.js
└── models/
    ├── carritosModelo.js
    └── productosModelo.js
```

**Responsabilidades:**
- Encapsular lógica de negocio
- Acceder a la base de datos
- Validar reglas de negocio
- Manejar errores de BD

**Patrón Manager:**
```javascript
export class ProductosManager {
    async getProductoById(id) {
        try {
            return await productosModelo.findById(id).lean()
        } catch (error) {
            console.error(error)
            return null
        }
    }
    
    async create(producto) {
        try {
            return await productosModelo.create(producto)
        } catch (error) {
            console.error(error)
            throw error
        }
    }
}
```

---

### 4. Capa de Datos (Models)

**Archivos:**
```
src/dao/models/
├── productosModelo.js
└── carritosModelo.js
```

**Responsabilidades:**
- Definir esquemas MongoDB
- Validación de datos en BD
- Índices y relaciones
- Configurar plugins (paginación)

**Ejemplo de Schema:**
```javascript
const productosSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    category: { type: String, required: true },
    status: { type: Boolean, default: true },
    thumbnails: [String]
})

productosSchema.plugin(mongoosePaginate)
```

---

## Flujo de Datos

### Obtener Producto

```
Cliente HTTP
    ↓
GET /api/products/:pid
    ↓
products.router.js
  - Extraer parámetro: pid
  - Validar: isValidObjectId(pid)
  - Guard clause: si no es válido, retornar 400
    ↓
ProductosManager.getProductoById(pid)
  - Try/catch
  - productosModelo.findById(pid)
    ↓
MongoDB
    ↓
Resultado
    ↓
Respuesta JSON 200
    ↓
Cliente
```

---

### Crear Producto

```
Cliente HTTP
    ↓
POST /api/products
Body: { title, description, code, price, stock, category, ... }
    ↓
products.router.js
  - Extraer body
  - Validar TODOS los campos requeridos (guard clause)
  - Validar que code no exista
    ↓
ProductosManager.create(producto)
  - Try/catch
  - productosModelo.create()
    ↓
MongoDB
  - Validar schema
  - Garantizar unicidad de code
    ↓
Documento creado
    ↓
WebSocket emit 'productoNuevo'
    ↓
Respuesta JSON 201
    ↓
Cliente + Todos los clientes conectados
```

---

### Agregar Producto al Carrito

```
Cliente HTTP
    ↓
POST /api/carts/:cid/products/:pid
    ↓
carts.router.js
  - Extraer parámetros: cid, pid
  - Validar: isValidObjectId(cid) && isValidObjectId(pid)
  - Guard clauses
    ↓
CarritosManager.agregarProducto(cid, pid)
  - Obtener carrito
  - Si existe el producto, incrementar cantidad
  - Si no existe, agregar con cantidad 1
  - Guardar carrito
    ↓
MongoDB
    ↓
Carrito actualizado
    ↓
Respuesta JSON 200
    ↓
Cliente
```

---

## Estructura de Carpetas

```
ecommerce/
│
├── src/
│   ├── app.js                    # 🚀 Punto de entrada principal
│   │                             # Configura Express, WebSocket, rutas
│   │
│   ├── utils.js                  # 🛠️ Utilidades (__dirname para ES modules)
│   │
│   ├── config/
│   │   └── db.js                 # 🔗 Conexión a MongoDB
│   │                             # Función: conectarDB(url)
│   │
│   ├── dao/
│   │   ├── ProductosManager.js   # 📦 Lógica de productos
│   │   │                         # Métodos: getProductos, create, update, delete
│   │   │
│   │   ├── CarritosManager.js    # 🛒 Lógica de carritos
│   │   │                         # Métodos: agregarProducto, eliminarProducto, etc
│   │   │
│   │   ├── fs/
│   │   │   └── ProductManager.js # 📄 Gestor de archivo (legacy)
│   │   │
│   │   └── models/
│   │       ├── productosModelo.js # 📋 Schema de Producto
│   │       │                       # title, code, price, stock, category, etc
│   │       │
│   │       └── carritosModelo.js  # 📋 Schema de Carrito
│   │                               # products (array), references
│   │
│   ├── routes/
│   │   ├── products.router.js    # 🔀 Rutas de productos
│   │   │                         # GET, POST, PUT, DELETE /api/products
│   │   │
│   │   └── carts.router.js       # 🔀 Rutas de carritos
│   │                             # GET, POST, PUT, DELETE /api/carts
│   │
│   └── views/
│       ├── layouts/
│       │   └── main.handlebars   # 🎨 Layout base HTML
│       │                         # head, navbar, footer
│       │
│       ├── products.handlebars   # 🎨 Listado de productos
│       │                         # Grid, paginación, búsqueda
│       │
│       ├── productDetail.handlebars # 🎨 Detalle de producto
│       │                            # Información completa + imagen
│       │
│       └── cart.handlebars       # 🎨 Vista de carrito
│                                 # Productos, cantidad, total
│
├── public/
│   ├── css/
│   │   └── styles.css            # 🎨 Estilos CSS
│   │
│   └── js/
│       └── index.js              # 🔧 JavaScript del cliente
│                                 # WebSocket, interactividad
│
├── .env                          # 🔐 Variables de entorno (NO commitear)
├── .env.example                  # 🔐 Plantilla .env (commitear)
├── .gitignore                    # 📝 Qué archivos ignorar en git
├── package.json                  # 📦 Dependencias y scripts
├── package-lock.json             # 📦 Versiones exactas
├── README.md                     # 📚 Documentación principal
├── API.md                        # 📚 Documentación API
└── ARCHITECTURE.md               # 📚 Este archivo

```

---

## Decisiones de Diseño

### 1. Uso de Managers (DAO Pattern)

**Por qué:**
- Separación de responsabilidades
- Lógica de negocio centralizada
- Fácil de testear
- Reutilizable desde diferentes contextos

**Ejemplo:**
```javascript
// En router
const manager = new ProductosManager()
const producto = await manager.getProductoById(pid)

// En otro contexto
const manager = new ProductosManager()
const productos = await manager.getProductos({ limit: 10 })
```

---

### 2. Guard Clauses en Rutas

**Por qué:**
- Evita nidificación profunda
- Código más legible
- Valida early y retorna early

**Antes (❌ nidificación):**
```javascript
if (valido) {
    try {
        if (existente) {
            // ... 3 niveles de profundidad
        }
    }
}
```

**Después (✅ guard clauses):**
```javascript
if (!valido) return error
if (existente) return error

try {
    // Lógica principal
}
```

---

### 3. Try/Catch en Managers

**Por qué:**
- Centralizar manejo de errores
- Logging consistente
- Retorna valores predecibles (null o throw)

**Patrón:**
```javascript
// Retorna null en errores de búsqueda
async getProductoById(id) {
    try {
        return await productosModelo.findById(id).lean()
    } catch (error) {
        console.error(error)
        return null
    }
}

// Lanza error en creación (importante saber si falló)
async create(producto) {
    try {
        return await productosModelo.create(producto)
    } catch (error) {
        console.error(error)
        throw error
    }
}
```

---

### 4. WebSocket para Actualizaciones en Tiempo Real

**Por qué:**
- Notificación inmediata a clientes
- Producto nuevo aparece en todos sin refrescar
- Escalable a notificaciones más complejas

**Eventos:**
- `productoNuevo` - Nuevo producto creado
- `productoEliminado` - Producto eliminado

---

### 5. MongoDB con Mongoose

**Por qué:**
- Schema validation
- Plugins (paginación)
- Relaciones (populate)
- Lean queries (mejor performance)

---

## Escalabilidad

### Crecimiento Horizontal

Para escalar horizontalmente (múltiples servidores):

1. **Usar MongoDB Atlas** (ya lo hacemos) ✅
2. **Centralizar sesiones** - Redis
3. **Load Balancer** - Nginx/HAProxy
4. **WebSocket con Redis Adapter** - Socket.io Redis

```javascript
import { createAdapter } from '@socket.io/redis-adapter'
import { createClient } from 'redis'

const pubClient = createClient()
const subClient = pubClient.duplicate()

io.adapter(createAdapter(pubClient, subClient))
```

---

### Crecimiento Vertical

Para escalar verticalmente (un solo servidor más poderoso):

1. **Caché** - Redis para queries frecuentes
2. **Índices MongoDB** - En campos usados en filtros
3. **Lean queries** - Solo datos necesarios
4. **Pagination** - Limitar resultados

---

### Optimizaciones Implementadas

✅ **Paginación** - Búsqueda paginada de productos  
✅ **Lean queries** - MongoDB sin documentos completos  
✅ **Validación early** - Guard clauses  
✅ **Índices unique** - Field `code` único  
✅ **WebSocket** - Actualizaciones sin polling

---

### Mejoras Futuras

- [ ] Autenticación JWT
- [ ] Roles y permisos
- [ ] Caché con Redis
- [ ] Rate limiting
- [ ] Búsqueda full-text
- [ ] Notificaciones por email
- [ ] Órdenes de compra
- [ ] Pagos (Stripe/MercadoPago)

---

## Dependencias Principales

```json
{
  "express": "Framework web minimalista",
  "mongoose": "ODM para MongoDB",
  "mongoose-paginate-v2": "Plugin de paginación",
  "express-handlebars": "Motor de vistas HTML",
  "socket.io": "WebSocket bidireccional",
  "dotenv": "Variables de entorno"
}
```

---

## Convenciones de Código

### Nombres de Variables

```javascript
// ✅ Claro e intuitivo
const { cid, pid } = req.params
const productosManager = new ProductosManager()
const carrito = await carritosManager.getCarritoById(cid)

// ❌ Ambiguo o innecesario
const c = req.params.cid
const p = req.params.pid
const pm = new ProductosManager()
const res = await query()
```

### Async/Await

```javascript
// ✅ Consistente
async agregarProducto(cid, pid) {
    try {
        const carrito = await carritosModelo.findById(cid)
        if (!carrito) return null
        
        carrito.products.push({ product: pid, quantity: 1 })
        await carrito.save()
        return carrito
    } catch (error) {
        console.error(error)
        return null
    }
}

// ❌ Inconsistente
async agregarProducto(cid, pid) {
    const carrito = await carritosModelo.findById(cid)
    carrito.products.push({ product: pid, quantity: 1 })
    await carrito.save()
    return carrito
}
```

### Comentarios

```javascript
// ✅ Útiles
// Incrementar cantidad si el producto ya existe
const index = carrito.products.findIndex(...)

// ❌ Obvios
// Obtener el carrito
const carrito = await carritosModelo.findById(cid)

// ❌ Desactualizados
// TODO: Agregar validación (hecho pero nunca se borró)
```

---

**Última actualización:** Junio 2024  
**Versión:** 1.0.0

