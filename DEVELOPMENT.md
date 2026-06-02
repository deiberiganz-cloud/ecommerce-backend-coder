# 👨‍💻 Guía de Desarrollo

## Inicio Rápido

### 1. Clonar y configurar

```bash
git clone https://github.com/tuusuario/ecommerce.git
cd ecommerce
npm install
cp .env.example .env
```

### 2. Configurar MongoDB

1. Ir a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crear cuenta y cluster
3. Copiar connection string
4. Actualizar `.env`:

```env
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/ecommerce?appName=CursoBackend
```

### 3. Iniciar desarrollo

```bash
npm run dev
```

Abre `http://localhost:8080` 

---

## Scripts Disponibles

```bash
npm run dev     # Inicia con nodemon (hot reload)
npm start       # Inicia modo producción
```

---

## Estructura de Desarrollo

### Agregar Nuevo Endpoint

#### 1. Crear método en Manager

**Archivo:** `src/dao/ProductosManager.js`

```javascript
export class ProductosManager {
    // ... métodos existentes
    
    async filtrarPorPrecio(minPrice, maxPrice) {
        try {
            return await productosModelo.find({
                price: { $gte: minPrice, $lte: maxPrice }
            }).lean()
        } catch (error) {
            console.error(error)
            return []
        }
    }
}
```

#### 2. Crear ruta

**Archivo:** `src/routes/products.router.js`

```javascript
// Filtrar productos por rango de precio
router.get('/price-range', async (req, res) => {
    const { minPrice, maxPrice } = req.query

    if (!minPrice || !maxPrice) {
        return res.status(400).json({
            status: 'error',
            error: 'minPrice y maxPrice son requeridos'
        })
    }

    if (isNaN(minPrice) || isNaN(maxPrice)) {
        return res.status(400).json({
            status: 'error',
            error: 'Los precios deben ser números'
        })
    }

    try {
        const productos = await productosManager.filtrarPorPrecio(
            parseFloat(minPrice),
            parseFloat(maxPrice)
        )

        return res.status(200).json({
            status: 'success',
            payload: productos
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            status: 'error',
            error: 'Internal Server Error'
        })
    }
})
```

#### 3. Testear

```bash
curl "http://localhost:8080/api/products/price-range?minPrice=100&maxPrice=500"
```

---

### Agregar Nuevo Modelo

#### 1. Crear Schema

**Archivo:** `src/dao/models/categoriasModelo.js`

```javascript
import mongoose from 'mongoose'

const categoriasSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        unique: true
    },
    descripcion: String,
    activa: {
        type: Boolean,
        default: true
    }
})

export const categoriasModelo = mongoose.model('Categorias', categoriasSchema)
```

#### 2. Crear Manager

**Archivo:** `src/dao/CategoriasManager.js`

```javascript
import { categoriasModelo } from './models/categoriasModelo.js'

export class CategoriasManager {
    async getCategorias() {
        try {
            return await categoriasModelo.find().lean()
        } catch (error) {
            console.error(error)
            return []
        }
    }

    async create(categoria) {
        try {
            return await categoriasModelo.create(categoria)
        } catch (error) {
            console.error(error)
            throw error
        }
    }

    // ... más métodos
}
```

#### 3. Crear Rutas

**Archivo:** `src/routes/categorias.router.js`

```javascript
import { Router } from 'express'
import { CategoriasManager } from '../dao/CategoriasManager.js'

export const router = Router()
const categoriasManager = new CategoriasManager()

router.get('/', async (req, res) => {
    try {
        const categorias = await categoriasManager.getCategorias()
        return res.json({ status: 'success', payload: categorias })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Internal Server Error' })
    }
})

// ... más rutas
```

#### 4. Registrar Rutas en app.js

**Archivo:** `src/app.js`

```javascript
import { router as categoriasRouter } from './routes/categorias.router.js'

// ...

app.use('/api/categorias', categoriasRouter)
```

---

## Debugging

### 1. Logs en Console

```javascript
// Información
console.log('Valor:', valor)

// Advertencia
console.warn('Cuidado:', mensaje)

// Error
console.error('Error:', error)
```

### 2. MongoDB Compass

Conectarse a MongoDB localmente para inspeccionar:

```
mongodb+srv://usuario:password@cluster.mongodb.net/ecommerce
```

### 3. VS Code Debugger

Archivo: `.vscode/launch.json`

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Launch Program",
            "program": "${workspaceFolder}/src/app.js",
            "restart": true,
            "console": "integratedTerminal"
        }
    ]
}
```

### 4. Breakpoints

En VS Code:
1. Click en la línea (frente al número)
2. Aparece punto rojo (breakpoint)
3. F5 para ejecutar con debugger
4. Navega por F10 (step), F11 (step into)

---

## Testing Manual

### API REST (Postman/Insomnia)

#### Crear Producto

```
POST http://localhost:8080/api/products
Content-Type: application/json

{
  "title": "Test Product",
  "description": "Una descripción",
  "code": "TEST-001",
  "price": 99.99,
  "stock": 10,
  "category": "test",
  "status": true
}
```

#### Obtener Productos

```
GET http://localhost:8080/api/products?limit=5&page=1
```

### WebSocket (Browser Console)

```javascript
// En navegador abierto en http://localhost:8080/products
const socket = io()

socket.on('productoNuevo', (producto) => {
    console.log('Nuevo producto:', producto)
})

socket.on('productoEliminado', (pid) => {
    console.log('Producto eliminado:', pid)
})
```

---

## Errores Comunes

### Error: "Cannot GET /"

**Causa:** Express no tiene ruta raíz

**Solución:** Agregar ruta en `app.js`

```javascript
app.get('/', (req, res) => {
    res.json({ message: 'Bienvenido a la API' })
})
```

---

### Error: "MongoServerError: E11000"

**Causa:** Campo único (unique) duplicado

**Solución:** 

```javascript
// Verificar valor único antes de crear
const existe = await productosModelo.findOne({ code: 'LAP-001' })
if (existe) {
    return res.status(400).json({ error: 'Código duplicado' })
}
```

---

### Error: "Cast to ObjectId failed"

**Causa:** ID inválido pasado a MongoDB

**Solución:** Validar con `isValidObjectId()`

```javascript
if (!isValidObjectId(pid)) {
    return res.status(400).json({ error: 'ID inválido' })
}
```

---

### Error: "Cannot read property 'length' of undefined"

**Causa:** Acceder a propiedad de undefined

**Solución:** Validar antes

```javascript
// ❌ Mal
if (carrito.products.length > 0) { ... }

// ✅ Bien
if (carrito?.products?.length > 0) { ... }
```

---

## Performance

### 1. Queries Optimizadas

```javascript
// ❌ Trae todo
const producto = await productosModelo.findById(id)

// ✅ Solo datos necesarios
const producto = await productosModelo.findById(id).lean()
```

---

### 2. Seleccionar Campos

```javascript
// ❌ Todos los campos
const productos = await productosModelo.find()

// ✅ Solo necesarios
const productos = await productosModelo
    .find()
    .select('title price category')
    .lean()
```

---

### 3. Índices MongoDB

```javascript
const productosSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        index: true  // Búsquedas frecuentes
    }
})
```

---

## Buenas Prácticas

### 1. Validar Input Temprano

```javascript
// ✅ Validar inmediatamente
router.post('/', (req, res) => {
    const { title, price } = req.body
    
    if (!title || !price) {
        return res.status(400).json({ error: 'Campos requeridos' })
    }
    
    // Lógica principal
})
```

---

### 2. Manejo de Errores Consistente

```javascript
// ✅ Patrón consistente
try {
    const resultado = await operacion()
    return res.json(resultado)
} catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Error interno' })
}
```

---

### 3. Nombres Descriptivos

```javascript
// ✅ Claro
const productoFiltrado = productos.filter(p => p.price > 100)

// ❌ Confuso
const pf = p.filter(x => x.p > 100)
```

---

### 4. Evitar Callbacks Anidados

```javascript
// ✅ Async/Await
const resultado = await operacion1()
const final = await operacion2(resultado)

// ❌ Callback Hell
operacion1((err, res1) => {
    operacion2(res1, (err, res2) => {
        operacion3(res2, (err, res3) => {
            // ...
        })
    })
})
```

---

## Commits y Versionado

### Estructura de Commits

```bash
# Feature
git commit -m "feat: agregar filtro por precio en productos"

# Bug fix
git commit -m "fix: corregir validación de cantidad en carrito"

# Documentation
git commit -m "docs: actualizar README con ejemplos de API"

# Refactor
git commit -m "refactor: mejorar estructura de managers"

# Style (formato)
git commit -m "style: aplicar prettier a rutas"

# Test
git commit -m "test: agregar test de creación de producto"
```

---

## Versionado Semántico

```
MAJOR.MINOR.PATCH
1.2.3

- MAJOR: cambios incompatibles (v1 → v2)
- MINOR: nuevas features compatibles (1.2 → 1.3)
- PATCH: bug fixes (1.2.3 → 1.2.4)
```

**En package.json:**
```json
{
    "version": "1.0.0"
}
```

---

## Checklist Pre-Deploy

- [ ] Todos los tests pasan
- [ ] Variables de entorno configuradas
- [ ] No hay console.log() de debug
- [ ] Código formateado (prettier/eslint)
- [ ] README actualizado
- [ ] Dependencies actualizadas
- [ ] Secrets en .env (NO en código)
- [ ] CORS configurado correctamente
- [ ] Rate limiting implementado
- [ ] Logs configurados

---

## Recursos

- [Express Docs](https://expressjs.com)
- [MongoDB Docs](https://docs.mongodb.com)
- [Mongoose Docs](https://mongoosejs.com)
- [Socket.io Docs](https://socket.io/docs)
- [MDN Web Docs](https://developer.mozilla.org)

---

**Última actualización:** Junio 2024

