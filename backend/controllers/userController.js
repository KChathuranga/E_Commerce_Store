import User from "../models/userModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import bcrypt from "bcryptjs";
import createToken from "../utils/createToken.js";


//Create a new User
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

// Login user
const loginUser = asyncHandler(async(req, res)=>{
    const {email, password} = req.body;

    const exitingUser = await User.findOne({email})

    if(exitingUser){
        const isPasswordValid = await bcrypt.compare(password, exitingUser.password)

        if(isPasswordValid) {
            createToken(res, exitingUser._id)

            res
            .status(201)
            .json({
                _id:exitingUser._id, 
                username:exitingUser.username, 
                email:exitingUser.email, 
                isAdmin:exitingUser.isAdmin
            });
            return;
        }
    }
})

//Log out User
const logoutCurrentUser = asyncHandler(async(req, res)=>{
   res.cookie('jwt', '',{
    httpOnly: true,
    expires: new Date(0),
   })

   res.status(200).json({message: "Logged out successfully."});

});

const getAllUsers = asyncHandler(async(req, res)=>{
    const users = await User.find({})
    res.json(users)
});

const getCurrentUserProfile = asyncHandler(async(req, res)=>{
    const user = await User.findById(req.user._id);

    if (user){
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email
        })
    } else {
        res.status(404)
        throw new Error("User not found.")
    }
});

const updateCurrentUserProfile = asyncHandler(async(req, res)=>{
    const user = await User.findById(req.user._id);

    if (user){
        user.username = req.body.username || user.username
        user.email = req.body.email || user.email

        if(req.body.password){
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(req.body.password, salt)
            user.password = hashedPassword
        }

        const updatedUser = await user.save();

        res.json({
            _id : updatedUser._id,
            username : updatedUser.username,
            email : updatedUser.email,
            isAdmin : updatedUser.isAdmin
        });
    } else {
        res.status(404)
        throw new Error("User not found.")
    }
});

const deleteUserById = asyncHandler(async(req, res) => {
    const user = await User.findById(req.params.id)

    if (user) {
        if (user.isAdmin){
            res.status(400)
            throw new Error("Cannot delete admin user")
        }
        await User.deleteOne({_id: user._id})
        res.json({message: "User deleted."})
    } else {
        res.status(404)
        throw new Error("User not found.");
    }
});

const getUserById = asyncHandler(async(req, res) => {
    const user = await User.findById(req.params.id).select("-password")

    if (user) {
        res.json(user)
    } else {
        res.status(404)
        throw new Error("User not found.");
    }
});

const updateUserById = asyncHandler(async(req, res) => {
    const user = await User.findById(req.params.id)

    if (user) {
        user.username = req.body.username || user.username
        user.email = req.body.email || user.email
        user.isAdmin = Boolean(req.body.isAdmin)

        const updatedUser = await user.save()

        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin
        })
    } else {
        res.status(404)
        throw new Error("User not found.");
    }
});

export {
    createUser, 
    loginUser, 
    logoutCurrentUser, 
    getAllUsers, 
    getCurrentUserProfile, 
    updateCurrentUserProfile,
    deleteUserById,
    getUserById,
    updateUserById
};