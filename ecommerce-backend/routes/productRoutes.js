const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const optionalAuth = require('../middlewares/optionalAuth');
const { getAllProducts, getProduct, deleteProduct, updateProduct, createProduct } = require('../controllers/productController');

router.get('/list', optionalAuth, getAllProducts);
router.get('/:id', optionalAuth, getProduct);
router.delete('/:id', authMiddleware, deleteProduct);
router.put('/:id', authMiddleware, updateProduct);
router.post('/create', authMiddleware, createProduct);

module.exports = router;