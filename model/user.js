const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const {Schema} = mongoose
const userSchema = new Schema({
    number:{
        type: String,
        required: true,
        minlength: 10
    },
    password:{
        type: String,
        required: true,
        minlength: 4,
    },
    tokens:[{
        token:{
            type: String,
            required: true
        }
    }],
    forgotpassword:{
        type: String,
        default: ''
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
    const token = jwt.sign({_id: user._id},'secret')
    user.tokens =user.tokens.concat({token})
    user.save()
    return token
}


const User = mongoose.model('Users', userSchema)
module.exports = User
