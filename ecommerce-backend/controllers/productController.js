const Product = require('../models/Product');

exports.createProduct = async (req, res, next) => {
    try{
        const { title, description, mrpPrice, discountedPrice, categoryId, inStock, images, rating, numOfReviews } = req.body;

        if(!title || !description || !mrpPrice || !discountedPrice || !categoryId){
            return res.status(400).json({ message: 'Title, description, mrpPrice, discountedPrice and categoryId are required' });
        }

        if(!req.user.isAdmin){
            return res.status(403).json({ message: 'Only admins can create products' });
        }

        const product = new Product({ title, description, mrpPrice, discountedPrice, categoryId, inStock, images, rating, numOfReviews });
        await product.save();

        res.status(201).json({ message: 'Product created successfully', product });
    }catch(err){
        next(err);
    }
}

exports.getProduct = async (req, res, next) => {
    try{
        const { id } = req.params;

        const product = await Product.findById(id);
        if(!product){
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ product });
    }catch(err){
        next(err);
    }
}

exports.getAllProducts = async (req, res, next) => {
    try{
        const filter = {};
        if(req.query.categoryId){
            filter.categoryId = req.query.categoryId;
        }

        const products = await Product.find(filter);

        if(products.length === 0){
            return res.status(404).json({ message: 'No products found' });
        }
        res.status(200).json({ products });
    }catch(err){
        next(err);
    }
}

exports.updateProduct = async (req, res, next) => {
    try{
        const { id } = req.params;
        const { title, description, mrpPrice, discountedPrice, categoryId, inStock, images, rating, numOfReviews, isActive } = req.body;

        if(!req.user.isAdmin){
            return res.status(403).json({ message: 'Only admins can update products' });
        }

        const product = await Product.findByIdAndUpdate(id, { title, description, mrpPrice, discountedPrice, categoryId, inStock, images, rating, numOfReviews, isActive }, { new: true });
        if(!product){
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product updated successfully', product });
    }catch(err){
        next(err);
    }
}

exports.deleteProduct = async (req, res, next) => {
    try{
        const { id } = req.params;

        if(!req.user.isAdmin){
            return res.status(403).json({ message: 'Only admins can delete products' });
        }

        const product = await Product.findByIdAndDelete(id);
        if(!product){
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product deleted successfully' });
    }catch(err){
        next(err);
    }
}