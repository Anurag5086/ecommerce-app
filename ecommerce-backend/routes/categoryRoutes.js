const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const optionalAuth = require('../middlewares/optionalAuth');
const { getCategory, deleteCategory, updateCategory, createCategory, getAllCategories } = require('../controllers/categoryController');

router.get('/list', optionalAuth, getAllCategories);
router.get('/:id', optionalAuth, getCategory);
router.delete('/:id', authMiddleware, deleteCategory);
router.put('/:id', authMiddleware, updateCategory);
router.post('/create', authMiddleware, createCategory);

module.exports = router;