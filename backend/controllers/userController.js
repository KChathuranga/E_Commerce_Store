import User from "../models/userModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import bcrypt from "bcryptjs";
import createToken from "../utils/createToken.js";

const createUser = asyncHandler(async(req,res) => {
    const {username, email, password} = req.body;
    
    if(!username){
        throw new Error("please fill the User Name");
    }
    else if(!email){
        throw new Error("please fill the Email");
    }
    else if(!password){
        throw new Error("please fill the Password");
    }

    const userExists = await User.findOne({email});
    if(userExists) res.status(400).send("User already exists");

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    const newUser = new User({username, email, password: hashedPassword});

    try {
        await newUser.save();
        createToken(res, newUser._id);

        res
            .status(201)
            .json({
                _id:newUser._id, 
                username:newUser.username, 
                email:newUser.email, 
                isAdmin:newUser.isAdmin
            });

    } catch (error) {
        res.status(400)
        throw new Error("Invalied user data");
    }
})

export {createUser}