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
    },
    refreshToken:{
       type: String
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
    const  refreshToken = jwt.sign({_id: user._id},'refreshtokensecret',{expiresIn:'48h'})
    user.refreshToken=refreshToken
    await user.save()
    return {token}
}


const User = mongoose.model('Users', userSchema)
module.exports = User
