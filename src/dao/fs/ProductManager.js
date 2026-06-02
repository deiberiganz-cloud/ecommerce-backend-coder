import fs from 'fs'
import path from 'path'
import __dirname from '../utils.js'

export class ProductManager {

    constructor() {
        this.path = path.join(__dirname, '../dao/fs/products.json')
        this._initFile()
    }

    _initFile() {
        if (!fs.existsSync(this.path)) {
            fs.writeFileSync(this.path, JSON.stringify([]))
        }
    }

    _leer() {
        return JSON.parse(fs.readFileSync(this.path, 'utf-8'))
    }

    _escribir(productos) {
        fs.writeFileSync(this.path, JSON.stringify(productos, null, 2))
    }

    getAll() {
        return this._leer()
    }

    getById(id) {
        return this._leer().find(p => p.id === id) || null
    }

    create(data) {
        const productos = this._leer()
        const id = productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1
        const nuevo = { id, status: true, thumbnails: [], ...data }
        productos.push(nuevo)
        this._escribir(productos)
        return nuevo
    }

    update(id, data) {
        const productos = this._leer()
        const index = productos.findIndex(p => p.id === id)
        if (index < 0) return null
        delete data.id
        productos[index] = { ...productos[index], ...data }
        this._escribir(productos)
        return productos[index]
    }

    delete(id) {
        const productos = this._leer()
        const index = productos.findIndex(p => p.id === id)
        if (index < 0) return null
        const eliminado = productos.splice(index, 1)[0]
        this._escribir(productos)
        return eliminado
    }
}
