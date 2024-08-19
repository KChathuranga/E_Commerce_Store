import User from "../models/userModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";

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
})

export {createUser}