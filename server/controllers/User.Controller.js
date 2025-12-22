import User from "../models/User.Model.js"
import asyncHandler from "express-async-handler"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from "../config/emailConfig.js";  

/**
 * Register a new user
 * @route POST /api/v1/users/
 * @access Public
 * @param {Object} req.body - expects `{ name, email, password }`
 * @returns 201 with message on success; sets `token` cookie.
 */
export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body || {};

    // Validate required fields
    if (!name || !email || !password) {
        res.status(400)
        throw new Error("Please fill all the fields")
    }

    // Check if user already existed or not
    const userExist = await User.findOne({ email });

    if (userExist) {
        res.status(400)
        throw new Error("User already exists")
    }

    //Hash password
    // Generate a per-user salt and hash the password before storing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
        name,
        email,
        password: hashedPassword
    })

    //Jwt Token 
    // Create JWT containing the user's id. Expiry is intentionally long
    // so the cookie persists; adjust as your security policy requires.
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });

    // Set cookie
    // Set the JWT as an HttpOnly cookie to be used by `userAuth` middleware
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    // Verify user creation and send message
    if (user) {
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Welcome to GIMS!',
            text: `Hello ${user.name},\n\nThank you for registering at GIMS. We're excited to have you on board!\n\nBest regards,\nThe GIMS Team`
        }

        // Attempt to send a welcome email; do not fail the request if email fails.
        try {
            await transporter.sendMail(mailOptions);
        } catch (emailError) {
            console.error("Email sending failed:", emailError);
        }

        res.status(201).json({
            message: "User registered successfully",
        })
    } else {
        res.status(400)
        throw new Error("Invalid user data")
    }
})

/**
 * Authenticate a user and set a session cookie
 * @route POST /api/v1/users/login
 * @access Public
 * @param {Object} req.body - expects `{ email, password }`
 * @returns 200 with message on success; sets `token` cookie.
 */
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};


    // Check if user already existed or not
    const user = await User.findOne({ email });

    if (!user) {
        res.status(400)
        throw new Error("User does not exist")
    }

    // Check password
    // Compare provided password with hashed password stored in DB
    const checkPasword = await bcrypt.compare(password, user.password);
    if (!checkPasword) {
        res.status(400)
        throw new Error("Invalid Credentials")
    }

    //Jwt Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });

    // Set cookie
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    // sending payload
    res.status(200).json({
        message: "User logged in successfully",
    })
})


// @desc Send Verify OTP
/**
 * Send a verification OTP to the user's registered email
 * @route POST /api/v1/users/send-verify-otp
 * @access Public
 * @param {Object} req.body - expects `{ userId }`
 * @returns 200 when OTP sent, 4xx/5xx on error
 */
export const sendVerifyOtp = asyncHandler(async (req, res) => {
    const userId = req.userId;
    console.log(userId);
    
    const user = await User.findById(userId);

    console.log(user);
    
    if (!user) {
        return res.status(404).json({ message: "User not found." });
    }

    if (user.isVerfied) {
        // Already verified users should not receive a new OTP
        return res.status(400).json({ message: "User is already verified." });
    }

    // Generate a 6-digit numeric OTP and expiry timestamp (10 minutes)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes from now

    // Persist OTP and expiry on the user record before sending email
    user.verifyOpt = otp;
    user.verifyOptExpiryAt = otpExpiry;
    await user.save();

    // Prepare and send email with OTP. If sending fails, report error.
    const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: 'Your Verification OTP',
        text: `Your OTP for account verification is: ${otp}\nThis OTP is valid for 10 minutes.\n\nBest regards,\nThe GIMS Team`
    };

    try {
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: "OTP sent to email." });
    } catch (emailError) {
        console.error('Email sending failed:', emailError);
        return res.status(500).json({ message: "Failed to send OTP email." });
    }
});

// @desc Verify User
/**
 * Verify the OTP sent to a user's email and mark the account as verified
 * @route POST /api/v1/users/verify-email
 * @access Public
 * @param {Object} req.body - expects `{ userId, otp }`
 * @returns 200 on success; clears OTP fields on the user record.
 */
export const verifyEmail = asyncHandler(async (req, res) => {
    const { otp } = req.body;
    const userId = req.userId;

    if (!userId || !otp) {
        return res.status(400).json({ message: "Missing Details" });
    }

    const user = await User.findById(userId);

    // Validate user and OTP
    if (!user) {
        return res.status(400).json({ message: "User not found" });
    }

    // Check OTP presence and match
    if (!user.verifyOpt || user.verifyOpt !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check OTP expiry timestamp
    if (!user.verifyOptExpiryAt || Date.now() > user.verifyOptExpiryAt) {
        return res.status(400).json({ message: "OTP Expired" });
    }

    // Mark verified and clear OTP fields
    user.isVerfied = true;
    user.verifyOpt = '';
    user.verifyOptExpiryAt = 0;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });

});