import { Router } from 'express'
import { isValidObjectId } from 'mongoose'
import { ProductosManager } from '../dao/ProductosManager.js'

export const router = Router()

const productosManager = new ProductosManager()

router.get('/', async (req, res) => {
    try {
        const { limit = 10, page = 1, query, sort } = req.query

        const resultado = await productosManager.getProductos({ limit, page, query, sort })
        return res.status(200).json(resultado)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ status: 'error', error: 'Internal Server Error' })
    }
})

router.get('/:pid', async (req, res) => {
    const { pid } = req.params

    if (!isValidObjectId(pid)) {
        return res.status(400).json({ status: 'error', error: 'Ingresá un id válido de MongoDB' })
    }

    try {
        const producto = await productosManager.getProductoById(pid)

        if (!producto) {
            return res.status(404).json({ status: 'error', error: `Producto con id ${pid} no encontrado` })
        }

        return res.status(200).json({ status: 'success', payload: producto })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ status: 'error', error: 'Internal Server Error' })
    }
})

router.post('/', async (req, res) => {
    const { title, description, code, price, stock, category, status, thumbnails } = req.body

    if (!title || !description || !code || !price || !stock || !category) {
        return res.status(400).json({
            status: 'error',
            error: 'title | description | code | price | stock | category son requeridos'
        })
    }

    try {
        const existe = await productosManager.getProductoBy({ code })
        if (existe) {
            return res.status(400).json({ status: 'error', error: `El código ${code} ya existe` })
        }

        const nuevoProducto = await productosManager.create({
            title, description, code,
            price: +price,
            status: status ?? true,
            stock: +stock,
            category,
            thumbnails: thumbnails || []
        })

        const { serverSocket } = await import('../app.js')
        serverSocket.emit('productoNuevo', nuevoProducto)

        return res.status(201).json({ status: 'success', message: 'Producto creado', payload: nuevoProducto })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ status: 'error', error: 'Internal Server Error' })
    }
})

router.put('/:pid', async (req, res) => {
    const { pid } = req.params

    if (!isValidObjectId(pid)) {
        return res.status(400).json({ status: 'error', error: 'Ingresá un id válido de MongoDB' })
    }

    try {
        const productoActualizado = await productosManager.update(pid, req.body)

        if (!productoActualizado) {
            return res.status(404).json({ status: 'error', error: `Producto con id ${pid} no encontrado` })
        }

        return res.status(200).json({ status: 'success', message: 'Producto actualizado', payload: productoActualizado })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ status: 'error', error: 'Internal Server Error' })
    }
})

router.delete('/:pid', async (req, res) => {
    const { pid } = req.params

    if (!isValidObjectId(pid)) {
        return res.status(400).json({ status: 'error', error: 'Ingresá un id válido de MongoDB' })
    }

    try {
        const productoEliminado = await productosManager.delete(pid)

        if (!productoEliminado) {
            return res.status(404).json({ status: 'error', error: `Producto con id ${pid} no encontrado` })
        }

        const { serverSocket } = await import('../app.js')
        serverSocket.emit('productoEliminado', pid)

        return res.status(200).json({ status: 'success', message: 'Producto eliminado', payload: productoEliminado })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ status: 'error', error: 'Internal Server Error' })
    }
})
