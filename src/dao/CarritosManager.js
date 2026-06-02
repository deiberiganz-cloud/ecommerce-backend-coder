import { carritosModelo } from './models/carritosModelo.js'

export class CarritosManager {

    async create() {
        return await carritosModelo.create({ products: [] })
    }

    async getCarritoById(id) {
        try {
            return await carritosModelo.findById(id).populate('products.product').lean()
        } catch (error) {
            console.error(error)
            return null
        }
    }

    async agregarProducto(cartId, productId) {
        try {
            const carrito = await carritosModelo.findById(cartId)
            if (!carrito) return null

            const index = carrito.products.findIndex(
                p => p.product.toString() === productId
            )

            if (index >= 0) {
                carrito.products[index].quantity += 1
            } else {
                carrito.products.push({ product: productId, quantity: 1 })
            }

            await carrito.save()
            return carrito
        } catch (error) {
            console.error(error)
            return null
        }
    }

    async eliminarProducto(cartId, productId) {
        try {
            const carrito = await carritosModelo.findById(cartId)
            if (!carrito) return null

            carrito.products = carrito.products.filter(
                p => p.product.toString() !== productId
            )

            await carrito.save()
            return carrito
        } catch (error) {
            console.error(error)
            return null
        }
    }

    async actualizarProductos(cartId, products) {
        try {
            return await carritosModelo.findByIdAndUpdate(
                cartId,
                { products },
                { returnDocument: 'after' }
            )
        } catch (error) {
            console.error(error)
            return null
        }
    }

    async actualizarCantidad(cartId, productId, quantity) {
        try {
            const carrito = await carritosModelo.findById(cartId)
            if (!carrito) return null

            const index = carrito.products.findIndex(
                p => p.product.toString() === productId
            )
            if (index < 0) return null

            carrito.products[index].quantity = quantity
            await carrito.save()
            return carrito
        } catch (error) {
            console.error(error)
            return null
        }
    }

    async vaciarCarrito(cartId) {
        try {
            return await carritosModelo.findByIdAndUpdate(
                cartId,
                { products: [] },
                { returnDocument: 'after' }
            )
        } catch (error) {
            console.error(error)
            return null
        }
    }
}
