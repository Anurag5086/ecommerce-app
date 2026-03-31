const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { createOrder, getOrderById, getAllOrders, updateOrderStatus, getAllOrdersForAdmin } = require('../controllers/orderController');

router.post('/create', authMiddleware, createOrder);
router.get('/admin/orders', authMiddleware, getAllOrdersForAdmin);
router.get('/', authMiddleware, getAllOrders);
router.get('/:id', authMiddleware, getOrderById);
router.put('/:id', authMiddleware, updateOrderStatus);

module.exports = router;