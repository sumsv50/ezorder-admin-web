const mongoose = require('mongoose')
const formidable = require('formidable');
const fs = require('fs'); 
const fsPromise = fs.promises;

const productService = require('../models/modelServices/productsService');
const categoryService = require('../models/modelServices/categoryService');
const cloudinary = require('../config/Cloudinary/index');

const currentTab= 'product';
const ITEM_PER_PAGE = 10;

class ProductsController {

    // [GET] /products
    async index(req, res, next) {
        try{
            const page = req.query.page || 1;
            const type = req.query.type;
            const key = req.query.key;

            const query = {}; 
            const numOfProducts = await productService.countProducts({});
            const numOfBevarage = await productService.countProducts({type:1});
            const numOfFood = await productService.countProducts({type:2});
            if(key) {
                query.name = new RegExp(key,'i');
            }
            if(type) {
                query.type = type;
            };


            const paginate = await productService.list(query, page, ITEM_PER_PAGE);
            res.render('products/products', {
                products: paginate.docs,
                numOfProducts,
                numOfBevarage,
                numOfFood,
                currentTab,
                currentPage: paginate.page,
                hasPrevPage: paginate.hasPrevPage,
                hasNextPage: paginate.hasNextPage,
                totalPages: paginate.totalPages,
                currentType: type,
                key,
            });
         } catch(err) { next(err) };
    }
    // [GET] /products/create-product
    async createProduct(req, res){
        const categories = await categoryService.list();
        res.render('products/create-product', { categories, currentTab })
    }

    // [POST] /products/store
    async storeProduct(req, res, next) {
        try {
            const form = formidable({ multiples: true });

            form.parse(req, async (err, fields, files) => {
                try{
                    if (err) {
                        next(err);
                        return;
                    }

                    const imgs = files.img;
                    var arrImg = [];
            
                    if(Array.isArray(imgs)){
                        for(const img of imgs) {
                            var result = await cloudinary.uploadToCloudinary(img.path, 'dish-image');
                            
                            arrImg.push(result.secure_url);
                        }
                    } else if (imgs && imgs.size >0) {
                        const result = await cloudinary.uploadToCloudinary(imgs.path, 'dish-image');

                        arrImg.push(result.secure_url);
                    
                    }
                    fields.img = arrImg;
                    
                    await productService.store(fields);
                    
                    const numOfBooks = await productService.countProducts();
                    const page = Math.ceil(numOfBooks / ITEM_PER_PAGE);
                    
                    if(page > 1) {
                        res.redirect('/products?page=' + page);
                    } else {
                        res.redirect('/products');
                    };
                }catch(err){ next(err) };
            });
        } catch (err) { next(err) };
    }

    // [POST] /products/store-category
    async storeCategory(req, res, next) {
        try {
            await categoryService.store(req.body);
            res.redirect('/products');
        } catch (err) { next(err) };
    }

    // [GET] /products/:id/edit
    async edit(req, res, next){
        try{
            const currentPage = req.query.inp || 1;
            const categories = await categoryService.list();
            const product = await productService.findByID(req.params.id);
            product.categoryID = product.categoryID.toString();
           
            res.render('products/edit-product', { product, categories, currentTab, currentPage });  
        } catch(err) { next(err) }; 
    }

    // [PUT] /products/:id
    async update(req, res, next){
        const form = formidable({ multiples: true });

        form.parse(req, async (err, fields, files) => {
            try{
                if (err) {
                    next(err);
                    return;
                }
                
                const currentPage = req.query.inp;

                const oldProduct = await productService.findByID(req.params.id);
                const categoryID_old = oldProduct.categoryID;

                fields.img = oldProduct.img;

                //Xóa các cuốn sách đã có do người dùng chỉ định.
                var photos_remove = fields.photos_remove;
                photos_remove = photos_remove.split(" ");
                photos_remove.splice(0, 1);

                photos_remove.sort(function(a, b){return b - a});
                for(const index of photos_remove) {
                    var public_id = oldProduct.img[+index].public_id;
                    if(public_id) {
                        cloudinary.delete_resources(public_id, {});
                    }
                    fields.img.splice(+index, 1);
                }

                
                //Thêm vào các cuốn sách do người dùng thêm vào.
                const imgs = files.img;
        
                if(Array.isArray(imgs)){
                    for(const img of imgs) {
                        var result = await cloudinary.uploadToCloudinary(img.path, 'books');
                        
                        fields.img.push({url: result.secure_url, public_id: result.public_id});
                    }
                } else if (imgs && imgs.size >0) {
                    const result = await cloudinary.uploadToCloudinary(imgs.path, 'books');

                    fields.img.push({url: result.secure_url, public_id: result.public_id});
                
                }

                await productService.updateOne(req.params.id, fields);
                if(categoryID_old != fields.categoryID){
                    await categoryService.decreaseNum(categoryID_old);
                    await categoryService.increaseNum(fields.categoryID);
                   
                }
                if(currentPage > 1) {
                    res.redirect(`/products?page=${currentPage}`);
                } else {
                    res.redirect('/products');
                }
            } catch(err) {next(err)}; 
        });

    }

    // [DELETE] /products/:id
    async delete(req, res, next){
        try{
            await productService.deleteByID(req.params.id);
            res.redirect('/products');
        } catch(err) { next(err) };
    }
}


module.exports = new ProductsController;

