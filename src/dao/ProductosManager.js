import { productosModelo } from './models/productosModelo.js'

export class ProductosManager {

    async getProductos({ limit = 10, page = 1, query, sort } = {}) {

        // Armamos el filtro según el query
        let filtro = {}
        if (query) {
            if (query === 'true' || query === 'false') {
                filtro.status = query === 'true'
            } else {
                filtro.category = { $regex: query, $options: 'i' }
            }
        }

        // Armamos el orden por precio
        let sortOption = {}
        if (sort === 'asc')  sortOption = { price: 1 }
        if (sort === 'desc') sortOption = { price: -1 }

        let {
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

        // Armamos los links de paginación
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
    }

    async getProductoById(id) {
        try {
            return await productosModelo.findById(id).lean()
        } catch (error) {
            return null
        }
    }

    async getProductoBy(filtro = {}) {
        return await productosModelo.findOne(filtro)
    }

    async create(producto) {
        return await productosModelo.create(producto)
    }

    async update(id, data) {
        delete data._id
        return await productosModelo.findByIdAndUpdate(id, data, { returnDocument: 'after' })
    }

    async delete(id) {
        return await productosModelo.findByIdAndDelete(id)
    }
}
