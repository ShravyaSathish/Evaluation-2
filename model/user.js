const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const {Schema} = mongoose
const userSchema = new Schema({
    number:{
        type: String,
        required: true,
        minlength: 10,
        unique: true
    },
    password:{
        type: String,
        required: true,
        minlength: 4,
    }
})
userSchema.pre('save', async function(next){
    const user = this
    
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

userSchema.methods.generateAuthtoken = async function(){
    const user = this
    const token = jwt.sign({_id: user._id},'secret',{expiresIn:'1h'})
    //refresh token
    const refreshToken = jwt.sign({_id: user._id},'refreshtokensecret',{expiresIn:'48h'})
    return {token, refreshToken}
}


const User = mongoose.model('Users', userSchema)
module.exports = User
