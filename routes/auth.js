const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Register User
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Create verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Create new user
        user = new User({
            name,
            email,
            password,
            verificationToken
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Send verification email
        const verificationUrl = `${process.env.BASE_URL}/api/auth/verify-email/${verificationToken}`;
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify Your Email',
            html: `
                <h1>Email Verification</h1>
                <p>Please click the link below to verify your email:</p>
                <a href="${verificationUrl}">${verificationUrl}</a>
            `
        });

        res.json({ msg: 'Registration successful. Please check your email to verify your account.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Verify Email
router.get('/verify-email/:token', async (req, res) => {
    try {
        const user = await User.findOne({ verificationToken: req.params.token });
        
        if (!user) {
            return res.status(400).send('<h2>Invalid or expired verification link.</h2>');
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        // Redirect to thank you page
        return res.redirect('/thank-you.html');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Login User
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        if (!user.isVerified) {
            return res.status(400).json({ msg: 'Please verify your email before logging in.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        // Optionally, generate a JWT token here
        // const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ msg: 'Login successful' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Resend Verification Email
router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'No account found with that email.' });
        }
        if (user.isVerified) {
            return res.status(400).json({ msg: 'This account is already verified.' });
        }
        // Generate a new token
        user.verificationToken = crypto.randomBytes(32).toString('hex');
        await user.save();
        const verificationUrl = `${process.env.BASE_URL}/api/auth/verify-email/${user.verificationToken}`;
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify Your Email',
            html: `
                <h1>Email Verification</h1>
                <p>Please click the link below to verify your email:</p>
                <a href="${verificationUrl}">${verificationUrl}</a>
            `
        });
        res.json({ msg: 'Verification email resent. Please check your inbox.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router; 