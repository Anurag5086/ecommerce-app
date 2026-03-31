const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
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
        origin: ['http://localhost:5173', 'https://ecommerce-app-4rhg.onrender.com'], // Frontend URL
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
    const possibleBuildPaths = [
        path.join(__dirname, '..', 'ecommerce-frontend', 'dist'),
        path.join(process.cwd(), '..', 'ecommerce-frontend', 'dist'),
        path.join(process.cwd(), 'ecommerce-frontend', 'dist'),
        path.join(process.cwd(), 'dist')
    ];

    const clientBuildPath = possibleBuildPaths.find((p) =>
        fs.existsSync(path.join(p, 'index.html'))
    );

    if (clientBuildPath) {
        app.use(express.static(clientBuildPath));

        // Catch-all middleware: send index.html so React Router can handle client-side routing
        app.use((req, res, next) => {
            if (req.path.startsWith('/api')) return next();
            res.sendFile(path.join(clientBuildPath, 'index.html'));
        });
    } else {
        console.warn('Frontend dist not found; API routes only in this deployment.');
    }
}

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});