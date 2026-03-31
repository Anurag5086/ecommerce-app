const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { getAllProducts, getProduct, deleteProduct, updateProduct, createProduct } = require('../controllers/productController');

router.get('/list',authMiddleware, getAllProducts);
router.get('/:id', authMiddleware, getProduct);
router.delete('/:id', authMiddleware, deleteProduct);
router.put('/:id', authMiddleware, updateProduct);
router.post('/create', authMiddleware, createProduct);

module.exports = router;