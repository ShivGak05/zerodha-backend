const {Schema}=require("mongoose");
const UserSchema=new Schema({
    email:{
        type:String,
        required:[true,"Your email address is required!"],
        unique:true,
    },
    username:{
        type:String,
        required:true,
    },
    password:{
        type:String,
    }
});
module.exports={UserSchema};