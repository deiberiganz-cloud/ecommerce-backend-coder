import mongoose from 'mongoose'

export const conectarDB = async (url) => {
    try {
        await mongoose.connect(url, {
            dbName: 'ecommerce'
        })
        console.log('DB online...!!!')
    } catch (error) {
        console.log(`Error al conectar DB: ${error.message}`)
        process.exit(1)
    }
}
// dd