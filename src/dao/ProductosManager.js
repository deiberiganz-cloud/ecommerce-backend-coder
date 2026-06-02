import { productosModelo } from './models/productosModelo.js'

export class ProductosManager {

    async getProductos({ limit = 10, page = 1, query, sort } = {}) {
        try {
            const filtro = {}
            if (query) {
                if (query === 'true' || query === 'false') {
                    filtro.status = query === 'true'
                } else {
                    filtro.category = { $regex: query, $options: 'i' }
                }
            }

            const sortOption = {}
            if (sort === 'asc')  sortOption.price = 1
            if (sort === 'desc') sortOption.price = -1

            const {
                docs: payload,
                totalPages,
                hasPrevPage,
                prevPage,
                hasNextPage,
                nextPage,
                page: currentPage
            } = await productosModelo.paginate(filtro, {
                lean: true,
                limit: parseInt(limit),
                page: parseInt(page),
                sort: sortOption
            })

            const buildLink = (p) => {
                if (!p) return null
                let link = `/api/products?limit=${limit}&page=${p}`
                if (query) link += `&query=${query}`
                if (sort)  link += `&sort=${sort}`
                return link
            }

            return {
                status: 'success',
                payload,
                totalPages,
                prevPage,
                nextPage,
                page: currentPage,
                hasPrevPage,
                hasNextPage,
                prevLink: buildLink(prevPage),
                nextLink: buildLink(nextPage)
            }
        } catch (error) {
            console.error(error)
            throw error
        }
    }

    async getProductoById(id) {
        try {
            return await productosModelo.findById(id).lean()
        } catch (error) {
            console.error(error)
            return null
        }
    }

    async getProductoBy(filtro = {}) {
        try {
            return await productosModelo.findOne(filtro)
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

    async update(id, data) {
        try {
            delete data._id
            return await productosModelo.findByIdAndUpdate(id, data, { returnDocument: 'after' })
        } catch (error) {
            console.error(error)
            return null
        }
    }

    async delete(id) {
        try {
            return await productosModelo.findByIdAndDelete(id)
        } catch (error) {
            console.error(error)
            return null
        }
    }
}
