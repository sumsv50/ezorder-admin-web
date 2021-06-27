const Products = require('../Products');
const {bodyToMongoose} = require('../../util/bodyToMongoose');



module.exports.list = async (query, page, itemPerPage) => {
    const paginate = await Products.paginate(query, {
        select: 'name price available img',
        page: page,
        limit: itemPerPage,
        lean: true,
    });
    return paginate;
}

module.exports.countProducts = async (query) => {
    const numOfProducts = await Products.countDocuments(query);
    return numOfProducts;
}


module.exports.store = async (reqBody) => {
    const formData = bodyToMongoose(reqBody);
    const menuItem = new Products(formData);
    await menuItem.save();
}

module.exports.findByID = async (productID) => {
    product = await Products.findById(productID).lean();
    return product;   
}

module.exports.updateOne = async (id, reqBody) => {
    await Products.updateOne({_id: id}, bodyToMongoose(reqBody));
}

module.exports.deleteByID = async (id) => {
    await Products.deleteOne({_id: id});
}

