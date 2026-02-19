const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
    email:{type:String,unique:true,required:true,lowercase:true},
    passwordHash:{type:String,required:true},
    name:{type:String},
    isVerified:{type:Boolean,default:false},
    emailVerificationToken:{type:String},
    emailVerificationExpires:{type:Date},
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    refreshTokens:[{token:String,createdAt:Date}]
},{timestamps:true});

module.exports=mongoose.model('User',userSchema);