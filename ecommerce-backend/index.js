const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const path = require('path');
const app = express();
app.use(express.json());
app.use(cors(
    {
        origin: ['http://localhost:5173', 'https://node-feb.onrender.com'], // Frontend URL
        credentials: true
    }
));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// In production, serve frontend build and return index.html for any non-API route
if (process.env.NODE_ENV === 'production') {
    const clientBuildPath = path.join(__dirname, '..', 'frontend', 'dist');
    app.use(express.static(clientBuildPath));

    // Catch-all middleware: send index.html so React Router can handle client-side routing
    // Use a middleware instead of a route pattern to avoid path-to-regexp parsing issues
    app.use((req, res, next) => {
        // If request starts with /api, pass through to API routes
        if (req.path.startsWith('/api')) return next();
        res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
}

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});