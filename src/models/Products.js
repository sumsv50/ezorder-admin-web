const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;


const Product = new Schema({
    type: Number,
    name: String,
    price: Number,
    img: [Object],
    slug: String,
    description: String,
    available: Boolean,
    slug: { type: String, slug: ['name', 'author'], unique: true },
}, { timestamps: true });

Product.plugin(mongoosePaginate);

// Model name => collection
module.exports = mongoose.model('Product', Product, 'MenuItem');

