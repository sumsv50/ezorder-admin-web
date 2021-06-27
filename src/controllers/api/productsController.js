const productService = require('../../models/modelServices/productsService');
const categoryService = require('../../models/modelServices/categoryService');
const formidable = require('formidable');
const cloudinary = require('../../config/Cloudinary/index');
const currentTab= 'product';
const ITEM_PER_PAGE = 10;

class ProductsController {
    // [GET] api/products/:id
    async getProduct(req, res, next) {
        try{
            const id = req.params.id;
            const product = await productService.findByID(id);
            res.json(product);
        }catch(err) {next(err)}
    }
    // [GET] api/products
    async index(req, res, next) {
        try{
            const page = req.query.page || 1;
            const category = req.query.category;
            const key = req.query.key;

            const query = {}; 
            const numOfBooks = await productService.countBooks();
            
            if(key) {
                query.name = new RegExp(key,'i');
            }
            if(category) {
                query.categoryID = category;
            };


            const paginate = await productService.list(query, page, ITEM_PER_PAGE);
            const categories = await categoryService.list();
            res.json({
                products: paginate.docs,
                numOfBooks,
                categories,
                currentTab,
                currentPage: paginate.page,
                hasPrevPage: paginate.hasPrevPage,
                hasNextPage: paginate.hasNextPage,
                totalPages: paginate.totalPages,
                currentCategory: category,
                key,
            });
         } catch(err) { next(err) };
    }
    // [PUT] /products/:id/edit
    async editProduct(req, res, next){
        const form = formidable({ multiples: true });
        let newAvatar = '';
        let changeAvatar = false;
        form.parse(req, async (err, fields, files) => {
            try{
                if (err) {
                    next(err);
                    return;
                }
                
                const currentPage = req.query.inp;

                const oldProduct = await productService.findByID(req.params.id);

                fields.img = oldProduct.img;

                //Xóa các cuốn sách đã có do người dùng chỉ định.
                var photos_remove = fields.photos_remove;
              
                photos_remove = photos_remove.split(" ");
                photos_remove.splice(0, 1);

                photos_remove.sort(function(a, b){return b - a});
                for(const index of photos_remove) {
                    fields.img.splice(+index, 1);
                }

                if(fields.img.length == 0) {
                    changeAvatar = true;
                }
             
                //Thêm vào các cuốn sách do người dùng thêm vào.
                const imgs = files.img;
        
                if(Array.isArray(imgs)){
                    for(const img of imgs) {
                        var result = await cloudinary.uploadToCloudinary(img.path, 'dish-image');
                        
                        fields.img.push(result.secure_url);
                    }
                } else if (imgs && imgs.size >0) {
                    const result = await cloudinary.uploadToCloudinary(imgs.path, 'dish-image');

                    fields.img.push(result.secure_url);
                
                }
            
                if(changeAvatar)
                {
                    if(fields.img[0]) {
                        newAvatar = fields.img[0];
                    } else {
                        newAvatar = 'null';
                    }
                }

                await productService.updateOne(req.params.id, fields);
               
                // if(currentPage > 1) {
                //     res.redirect(`/products?page=${currentPage}`);
                // } else {
                //     res.redirect('/products');
                // }
                res.json({isSuccess: true, newAvatar: newAvatar});
            } catch(err) {
                res.json({isSuccess: false});}; 
        });

    }
}

module.exports = new ProductsController;