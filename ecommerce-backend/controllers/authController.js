const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.register = async (req, res, next) => {
    try{
        const {name, email, password, contactNumber, address, isAdmin} = req.body;

        const existingUser = await User.findOne({ email });
        if(existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const user = new User({
            name, 
            email,
            password,
            address,
            contactNumber,
            isAdmin
        });

        await user.save();

        res.status(201).json({ message: 'User registered successfully', user });
    }catch(err){
        next(err)
    }
}

exports.login = async (req, res, next) => {
    try{
        const {email, password} = req.body;

        const user = await User.findOne({ email });
        if(!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if(!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            {
                id: user._id,
                isAdmin: user.isAdmin
            },
            process.env.JWT_SECRET
            )

        res.status(200).json({ message: 'Login successful', token });
    }catch(err){
        next(err)
    }
}

exports.googleLogin = async (req, res, next) => {
    try {
        const { token } = req.body;

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, name } = payload;

        let user = await User.findOne({ email });
        if (!user) {
            user = new User({
                name,
                email,
                password: Math.random().toString(36).slice(-8) // Generate a random password for Google users
            });
            await user.save();
        }

        const jwtToken = jwt.sign(
            {
                id: user._id,
                isAdmin: user.isAdmin
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Google login successful', token: jwtToken });  
    } catch (err) {
        next(err);
    }
};

exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ user });
    } catch (err) {
        next(err);
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        const { name, email, contactNumber, address } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (email && email !== user.email) {
            const existing = await User.findOne({ email: String(email).trim().toLowerCase() });
            if (existing && String(existing._id) !== String(user._id)) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            user.email = String(email).trim().toLowerCase();
        }

        if (typeof name === 'string') user.name = name.trim();
        if (typeof contactNumber === 'string') user.contactNumber = contactNumber.trim();
        if (typeof address === 'string') user.address = address.trim();

        await user.save();
        const safeUser = user.toObject();
        delete safeUser.password;
        res.status(200).json({ message: 'Profile updated successfully', user: safeUser });
    } catch (err) {
        next(err);
    }
};