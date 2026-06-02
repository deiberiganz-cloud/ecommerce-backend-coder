import mongoose from 'mongoose'
import paginate from 'mongoose-paginate-v2'

const productosEsquema = new mongoose.Schema(
    {
        title:       { type: String,  required: true },
        description: { type: String,  required: true },
        code:        { type: String,  required: true, unique: true },
        price:       { type: Number,  required: true },
        status:      { type: Boolean, default: true },
        stock:       { type: Number,  required: true },
        category:    { type: String,  required: true },
        thumbnails:  { type: [String], default: [] }
    },
    {
        timestamps: true
    }
)

productosEsquema.plugin(paginate)

export const productosModelo = mongoose.model('products', productosEsquema)
