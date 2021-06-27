const adminAccountService = require('../models/modelServices/adminAccountService');
const userAccountService = require('../models/modelServices/userAccountService');
const formidable = require('formidable');
const cloudinary = require('../config/Cloudinary/index');

const ITEM_PER_PAGE = 7;
const currentTab = 'accounts'
class AccountsController{
    //[GET] /accounts
    async index(req, res){
        const role = req.query.role;
        const page = req. query.page || 1;
        const key = req.query.key;
        var paginate = undefined;

        const query = {};
        if(key) {
            query.username = new RegExp(key,'i');
        }
        if(role) {
            query.role = role;
            paginate = await adminAccountService.list(query, page, ITEM_PER_PAGE);
        }
        

        if(paginate) {

            res.render('accounts/accounts', {
                currentTab,
                role: role,
                accounts: paginate.docs,
                currentPage: paginate.page,
                hasPrevPage: paginate.hasPrevPage,
                hasNextPage: paginate.hasNextPage,
                totalPages: paginate.totalPages,
                key,
            });
        } else
        res.render('accounts/accounts', {currentTab});
    }

    // [POST] accounts/store-admin-account
    async storeAdminAccount(req, res, next) {
        try {
            const form = formidable({multiples: true});

            form.parse(req, async (err, fields, files) => {
                try{
                    if(err) {
                        next(err);
                        return;
                    }

                    const img = files.adminImg;
                    if(img && img.size>0) {
                        const result = await cloudinary.uploadToCloudinary(img.path, 'admin-img');
                        fields.public_id_avt = result.public_id;
                        fields.avt_img = result.secure_url;
                    }

                    await adminAccountService.addAdmin(fields);
                    res.redirect('/accounts');
                }catch(err) { next(err) };
            });
           
        } catch(err) { next(err) }; 
    }

    // [GET] accounts/my-profile
    async showMyProfile(req, res, next) {
        if(!req.user) next(err);
        else {
            res.render('accounts/my-profile', {user: req.user});
        }
    }

    // [GET] accounts/:id/view
    async view(req, res, next) {

        const id = req.params.id;
        const type = req.params.type;
        var account;
        if(type == "user" ) {
            account = await userAccountService.findbyId(id);
        } else if (type == "admin") {
            account = await adminAccountService.getAdmin(id);
        }

        res.render('accounts/account-detail', {account});
    }

}





module.exports = new AccountsController;