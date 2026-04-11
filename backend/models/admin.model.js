import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const adminSchema = new Schema({
    email: {
        type: String,
        match: /^\S+@\S+\.\S+$/,
        lowercase: true,
        unique: true,
        trim: true
    },
    username: {
        type: String,
        required: [true, "Username is required"],
        trim: true,
        unique: true,
        min: 2,
        max: 20
    },
    //either admin or user
    //user is added for future update by developer
    role: {
        type: String,
        enum: ['admin', 'user', 'developer'],
        default: 'user',
        required: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        trim: true,
        minLength: 8,
        maxLength: 30,
    },
    refreshToken: {
        type: String
    }
}, {
    timestamps: true
});

adminSchema.pre("save", async function (next) {
    try {
        if (this.isModified("password")) {
            this.password = await bcrypt.hash(this.password, 10);
        }
        next();
    } catch (error) {
        console.error("Error while hashing password:", error);
    }
})

adminSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}


//-------- TO-DO => Add env variables -----------------------------
    //generate access token and refresh token
    //for login  
adminSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        username: this.username,
        role: this.role
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        })
}


adminSchema.methods.generateRefreshToken = function () {
     return jwt.sign(
        {
            _id: this._id,      
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

adminSchema.methods.setRefreshToken = function (refreshToken) {
    this.refreshToken = refreshToken;
    return this;
}


export const Admin = mongoose.model("Admin", adminSchema);


