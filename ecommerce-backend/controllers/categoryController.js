const Category = require('../models/Category');

exports.createCategory = async (req, res, next) => {
    try{
        const { title, description } = req.body;

        if(!title || !description){
            return res.status(400).json({ message: 'Title and description are required' });
        }

        if(!req.user.isAdmin){
            return res.status(403).json({ message: 'Only admins can create categories' });
        }

        const category = new Category({ title, description });
        await category.save();

        res.status(201).json({ message: 'Category created successfully', category });
    }catch(err){
        next(err);
    }
}

exports.getCategory = async (req, res, next) => {
    try{
        const { id } = req.params;

        const category = await Category.findById(id);
        if(!category){
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json({ category });
    }catch(err){
        next(err);
    }
}

exports.getAllCategories = async (req, res, next) => {
    try{
        const categories = await Category.find();

        if(categories.length === 0){
            return res.status(404).json({ message: 'No categories found' });
        }
        res.status(200).json({ categories });
    }catch(err){
        next(err);
    }
}

exports.updateCategory = async (req, res, next) => {
    try{
        const { id } = req.params;
        const { title, description, isActive } = req.body;

        if(!req.user.isAdmin){
            return res.status(403).json({ message: 'Only admins can update categories' });
        }

        const category = await Category.findByIdAndUpdate(id, { title, description, isActive }, { new: true });
        if(!category){
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json({ message: 'Category updated successfully', category });
    }catch(err){
        next(err);
    }
}

exports.deleteCategory = async (req, res, next) => {
    try{
        const { id } = req.params;

        if(!req.user.isAdmin){
            return res.status(403).json({ message: 'Only admins can delete categories' });
        }

        const category = await Category.findByIdAndDelete(id);
        if(!category){
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json({ message: 'Category deleted successfully' });
    }catch(err){
        next(err);
    }
}