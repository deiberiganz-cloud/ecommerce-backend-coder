const socket = io()

// Cuando se crea un producto nuevo, actualizamos la vista
socket.on('productoNuevo', producto => {
    console.log('Nuevo producto:', producto)
    if (window.location.pathname.startsWith('/products')) {
        window.location.reload()
    }
})

// Cuando se elimina un producto, actualizamos la vista
socket.on('productoEliminado', id => {
    console.log('Producto eliminado:', id)
    if (window.location.pathname.startsWith('/products')) {
        window.location.reload()
    }
})
