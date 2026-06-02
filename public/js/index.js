const socket = io()

socket.on('productoNuevo', producto => {
    console.log('Nuevo producto:', producto)
    if (window.location.pathname.startsWith('/products')) {
        window.location.reload()
    }
})

socket.on('productoEliminado', id => {
    console.log('Producto eliminado:', id)
    if (window.location.pathname.startsWith('/products')) {
        window.location.reload()
    }
})
