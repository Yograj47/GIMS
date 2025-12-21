import User from "../models/User.Model.js"
import asyncHandler from "express-async-handler"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from "../config/emailConfig.js";  //

// @desc Register user
// @access Public
// @route POST /api/v1/users/
export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

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
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
        name,
        email,
        password: hashedPassword
    })

    //Jwt Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });

    // Verify user creation and send payload
    if (user) {
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Welcome to GIMS!',
            text: `Hello ${user.name},\n\nThank you for registering at GIMS. We're excited to have you on board!\n\nBest regards,\nThe GIMS Team`
        }

        try {
            await transporter.sendMail(mailOptions);
        } catch (emailError) {
            console.error("Email sending failed:", emailError);
        }

        res.status(201).json({
            accessToken: token,
            user: { id: user._id, name: user.name, email: user.email }
        })
    } else {
        res.status(400)
        throw new Error("Invalid user data")
    }
})

// @desc Login user
// @access Public
// @route POST /api/v1/users/login
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;


    // Check if user already existed or not
    const user = await User.findOne({ email });

    if (!user) {
        res.status(400)
        throw new Error("User does not exist")
    }

    // Check password
    const checkPasword = await bcrypt.compare(password, user.password);
    if (!checkPasword) {
        res.status(400)
        throw new Error("Invalid Credentials")
    }

    //Jwt Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });

    // sending payload
    res.status(200).json({
        accessToken: token,
        user: { id: user._id, name: user.name, email: user.email }
    })
})


