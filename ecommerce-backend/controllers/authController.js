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