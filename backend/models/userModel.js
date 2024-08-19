import mongoose from "mongoose";

const userSchema = mongoose.Schema(
    {
        userName:{
            type: 'string',
            required: true,
        },
        email:{
            type: 'string',
            required: true,
            unique: true,
        },
        password:{
            type: 'string',
            required: true,
        },
        isAdmin:{
            type: 'boolean',
            required: true,
            default: false,
        }
    },
    {
        timeStamps: true,
    }
);

const User = mongoose.model('User', userSchema);

export default User;