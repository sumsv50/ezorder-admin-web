const express = require('express');
const router = express.Router();

const productsController = require('../../controllers/api/productsController');

// [GET] api/products
router.get('/', productsController.index);
router.get('/:id', productsController.getProduct);
// [post]api/products/:productId/edit
router.post('/:id/edit', productsController.editProduct);

module.exports = router;