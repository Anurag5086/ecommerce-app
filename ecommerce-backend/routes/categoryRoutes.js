const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { getCategory, deleteCategory, updateCategory, createCategory, getAllCategories } = require('../controllers/categoryController');

router.get('/list',authMiddleware, getAllCategories);
router.get('/:id', authMiddleware, getCategory);
router.delete('/:id', authMiddleware, deleteCategory);
router.put('/:id', authMiddleware, updateCategory);
router.post('/create', authMiddleware, createCategory);

module.exports = router;