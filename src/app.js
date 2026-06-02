import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { engine } from 'express-handlebars'
import path from 'path'
import __dirname from './utils.js'
import { conectarDB } from './config/db.js'
import { router as productsRouter } from './routes/products.router.js'
import { router as cartsRouter } from './routes/carts.router.js'
import { ProductosManager } from './dao/ProductosManager.js'
import { CarritosManager } from './dao/CarritosManager.js'

const PORT = process.env.PORT || 8080

const app = express()

app.engine('handlebars', engine({
    helpers: {
        eq: (a, b) => a === b
    }
}))
app.set('view engine', 'handlebars')
app.set('views', path.join(__dirname, './views'))
app.use(express.static('./public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/api/products', productsRouter)
app.use('/api/carts', cartsRouter)
app.get('/products', async (req, res) => {
    try {
        const manager = new ProductosManager()
        const { limit = 10, page = 1, query, sort } = req.query
        const resultado = await manager.getProductos({ limit, page, query, sort })
        res.render('products', { ...resultado, query, sort })
    } catch (error) {
        console.error(error)
        res.status(500).render('products', { error: 'Error al cargar productos' })
    }
})

app.get('/products/:pid', async (req, res) => {
    const { pid } = req.params

    try {
        const manager = new ProductosManager()
        const product = await manager.getProductoById(pid)

        if (!product) {
            return res.status(404).send('Producto no encontrado')
        }

        res.render('productDetail', { product })
    } catch (error) {
        console.error(error)
        res.status(500).send('Error al cargar el producto')
    }
})

app.get('/carts/:cid', async (req, res) => {
    const { cid } = req.params

    try {
        const manager = new CarritosManager()
        const cart = await manager.getCarritoById(cid)

        if (!cart) {
            return res.status(404).send('Carrito no encontrado')
        }

        res.render('cart', { cart })
    } catch (error) {
        console.error(error)
        res.status(500).send('Error al cargar el carrito')
    }
})

const serverHTTP = createServer(app)
export const serverSocket = new Server(serverHTTP)

serverSocket.on('connection', socket => {
    console.log(`Usuario conectado: ${socket.id}`)

    socket.on('disconnect', () => {
        console.log(`Usuario desconectado: ${socket.id}`)
    })
})

serverHTTP.listen(PORT, () => {
    console.log(`🚀 arrancanddo servidor ${PORT}`)
})
await conectarDB(process.env.MONGO_URI)
