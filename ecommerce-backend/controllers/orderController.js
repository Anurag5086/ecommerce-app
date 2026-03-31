const Order = require('../models/Order');

// Create a new order
exports.createOrder = async (req, res) => {
    try {
        let { products, totalAmount, paymentMethod, razorpayPaymentId } = req.body;

        if(paymentMethod !== 'Razorpay' && paymentMethod === 'COD'){
            razorpayPaymentId = null; // Clear Razorpay payment ID for COD orders
        }

        const order = new Order({
            userId: req.user.id,
            products,
            totalAmount,
            paymentMethod,
            razorpayPaymentId
        });
        await order.save();
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('products.productId')
            .populate('userId', 'name email contactNumber address');
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (!req.user.isAdmin && String(order.userId?._id || order.userId) !== String(req.user.id)) {
            return res.status(403).json({ message: 'Not allowed to view this order' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all orders for the logged-in user
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id }).populate('products.productId');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const allowedStatus = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Only admins can update order status' });
        }
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllOrdersForAdmin = async (req, res) => {
    try {

        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 5;

        if(!req.user.isAdmin){
            return res.status(403).json({ message: 'Only admins can access all orders' });
        }

        const skipValue = (page - 1) * limit;

        const orders = await Order.find()
            .populate('products.productId', 'title')
            .populate('userId', 'name email contactNumber address')
            .skip(skipValue)
            .limit(limit)
            .sort({ createdAt: -1 });
        res.json({
            orders,
            totalPages: Math.ceil(await Order.countDocuments() / limit)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};