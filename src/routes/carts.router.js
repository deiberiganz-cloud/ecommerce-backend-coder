import { Router } from 'express'
import { isValidObjectId } from 'mongoose'
import { CarritosManager } from '../dao/CarritosManager.js'
export const router = Router()

const carritosManager = new CarritosManager()

router.post('/', async (req, res) => {
    try {
        const carrito = await carritosManager.create()
        return res.status(201).json({ status: 'success', message: 'Carrito creado', payload: carrito })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ status: 'error', error: 'Internal Server Error' })
    }
})

router.get('/:cid', async (req, res) => {
    const { cid } = req.params

    if (!isValidObjectId(cid)) {
        return res.status(400).json({ status: 'error', error: 'Ingresá un id válido de MongoDB' })
    }

    try {
        const carrito = await carritosManager.getCarritoById(cid)

        if (!carrito) {
            return res.status(404).json({ status: 'error', error: `Carrito con id ${cid} no encontrado` })
        }

        return res.status(200).json({ status: 'success', payload: carrito })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ status: 'error', error: 'Internal Server Error' })
    }
})

router.post('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params

    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
        return res.status(400).json({ status: 'error', error: 'Ingresá ids válidos de MongoDB' })
    }

    try {
        const carrito = await carritosManager.agregarProducto(cid, pid)

        if (!carrito) {
            return res.status(404).json({ status: 'error', error: `Carrito con id ${cid} no encontrado` })
        }

        return res.status(200).json({ status: 'success', message: 'Producto agregado al carrito', payload: carrito })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ status: 'error', error: 'Internal Server Error' })
    }
})

router.delete('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params

    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
        return res.status(400).json({ status: 'error', error: 'Ingresá ids válidos de MongoDB' })
    }

    try {
        const carrito = await carritosManager.eliminarProducto(cid, pid)

        if (!carrito) {
            return res.status(404).json({ status: 'error', error: 'Carrito o producto no encontrado' })
        }

        return res.status(200).json({ status: 'success', message: 'Producto eliminado del carrito', payload: carrito })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ status: 'error', error: 'Internal Server Error' })
    }
})

router.put('/:cid', async (req, res) => {
    const { cid } = req.params
    const { products } = req.body

    if (!isValidObjectId(cid)) {
        return res.status(400).json({ status: 'error', error: 'Ingresá un id válido de MongoDB' })
    }

    if (!products || !Array.isArray(products)) {
        return res.status(400).json({ status: 'error', error: 'Se requiere un array de products' })
    }

    try {
        const carrito = await carritosManager.actualizarProductos(cid, products)

        if (!carrito) {
            return res.status(404).json({ status: 'error', error: `Carrito con id ${cid} no encontrado` })
        }

        return res.status(200).json({ status: 'success', message: 'Carrito actualizado', payload: carrito })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ status: 'error', error: 'Internal Server Error' })
    }
})

router.put('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params
    const { quantity } = req.body

    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
        return res.status(400).json({ status: 'error', error: 'Ingresá ids válidos de MongoDB' })
    }

    if (!quantity || isNaN(quantity) || quantity < 1) {
        return res.status(400).json({ status: 'error', error: 'quantity debe ser un número mayor a 0' })
    }

    try {
        const carrito = await carritosManager.actualizarCantidad(cid, pid, +quantity)

        if (!carrito) {
            return res.status(404).json({ status: 'error', error: 'Carrito o producto no encontrado' })
        }

        return res.status(200).json({ status: 'success', message: 'Cantidad actualizada', payload: carrito })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ status: 'error', error: 'Internal Server Error' })
    }
})

router.delete('/:cid', async (req, res) => {
    const { cid } = req.params

    if (!isValidObjectId(cid)) {
        return res.status(400).json({ status: 'error', error: 'Ingresá un id válido de MongoDB' })
    }

    try {
        const carrito = await carritosManager.vaciarCarrito(cid)

        if (!carrito) {
            return res.status(404).json({ status: 'error', error: `Carrito con id ${cid} no encontrado` })
        }

        return res.status(200).json({ status: 'success', message: 'Carrito vaciado', payload: carrito })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ status: 'error', error: 'Internal Server Error' })
    }
})
