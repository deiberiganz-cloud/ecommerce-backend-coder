import { Router } from 'express'
import { isValidObjectId } from 'mongoose'
import { ProductosManager } from '../dao/ProductosManager.js'

export const router = Router()

const productosManager = new ProductosManager()

router.get('/', async (req, res) => {
    try {
        let { limit = 10, page = 1, query, sort } = req.query

        let resultado = await productosManager.getProductos({ limit, page, query, sort })

        res.setHeader('Content-Type', 'application/json')
        return res.status(200).json(resultado)

    } catch (error) {
        console.log(error)
        res.setHeader('Content-Type', 'application/json')
        return res.status(500).json({ status: 'error', error: 'Internal Server Error' })
    }
})

router.get('/:pid', async (req, res) => {
    let { pid } = req.params

    if (!isValidObjectId(pid)) {
        res.setHeader('Content-Type', 'application/json')
        return res.status(400).json({ status: 'error', error: 'Ingresá un id válido de MongoDB' })
    }

    try {
        let producto = await productosManager.getProductoById(pid)

        if (!producto) {
            res.setHeader('Content-Type', 'application/json')
            return res.status(404).json({ status: 'error', error: `Producto con id ${pid} no encontrado` })
        }

        res.setHeader('Content-Type', 'application/json')
        return res.status(200).json({ status: 'success', payload: producto })

    } catch (error) {
        console.log(error)
        res.setHeader('Content-Type', 'application/json')
        return res.status(500).json({ status: 'error', error: 'Internal Server Error' })
    }
})

router.post('/', async (req, res) => {
    let { title, description, code, price, stock, category, status, thumbnails } = req.body

    if (!title || !description || !code || !price || !stock || !category) {
        res.setHeader('Content-Type', 'application/json')
        return res.status(400).json({
            status: 'error',
            error: 'title | description | code | price | stock | category son requeridos'
        })
    }

    try {
        let existe = await productosManager.getProductoBy({ code })
        if (existe) {
            res.setHeader('Content-Type', 'application/json')
            return res.status(400).json({ status: 'error', error: `El código ${code} ya existe` })
        }

        let nuevoProducto = await productosManager.create({
            title, description, code,
            price: +price,
            status: status ?? true,
            stock: +stock,
            category,
            thumbnails: thumbnails || []
        })

        // Avisamos por WebSocket que hay un producto nuevo
        const { serverSocket } = await import('../app.js')
        serverSocket.emit('productoNuevo', nuevoProducto)

        res.setHeader('Content-Type', 'application/json')
        return res.status(201).json({ status: 'success', message: 'Producto creado', payload: nuevoProducto })

    } catch (error) {
        console.log(error)
        res.setHeader('Content-Type', 'application/json')
        return res.status(500).json({ status: 'error', error: 'Internal Server Error' })
    }
})

router.put('/:pid', async (req, res) => {
    let { pid } = req.params

    if (!isValidObjectId(pid)) {
        res.setHeader('Content-Type', 'application/json')
        return res.status(400).json({ status: 'error', error: 'Ingresá un id válido de MongoDB' })
    }

    try {
        let productoActualizado = await productosManager.update(pid, req.body)

        if (!productoActualizado) {
            res.setHeader('Content-Type', 'application/json')
            return res.status(404).json({ status: 'error', error: `Producto con id ${pid} no encontrado` })
        }

        res.setHeader('Content-Type', 'application/json')
        return res.status(200).json({ status: 'success', message: 'Producto actualizado', payload: productoActualizado })

    } catch (error) {
        console.log(error)
        res.setHeader('Content-Type', 'application/json')
        return res.status(500).json({ status: 'error', error: 'Internal Server Error' })
    }
})

router.delete('/:pid', async (req, res) => {
    let { pid } = req.params

    if (!isValidObjectId(pid)) {
        res.setHeader('Content-Type', 'application/json')
        return res.status(400).json({ status: 'error', error: 'Ingresá un id válido de MongoDB' })
    }

    try {
        let productoEliminado = await productosManager.delete(pid)

        if (!productoEliminado) {
            res.setHeader('Content-Type', 'application/json')
            return res.status(404).json({ status: 'error', error: `Producto con id ${pid} no encontrado` })
        }

        const { serverSocket } = await import('../app.js')
        serverSocket.emit('productoEliminado', pid)

        res.setHeader('Content-Type', 'application/json')
        return res.status(200).json({ status: 'success', message: 'Producto eliminado', payload: productoEliminado })

    } catch (error) {
        console.log(error)
        res.setHeader('Content-Type', 'application/json')
        return res.status(500).json({ status: 'error', error: 'Internal Server Error' })
    }
})
