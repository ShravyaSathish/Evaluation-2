const mongoose = require('mongoose')
const {Schema} = mongoose
const otpSchema = Schema({
    number:{
        type: String,
        required: true,
    },
    otp:{
        type: String,
    },
    createdAt:{
        type: Date,
        default: Date.now,
        index:{
            expires: 300
        }
    }
},{ timestamps: true})

const Otp = mongoose.model('Otp', otpSchema)
module.exports = Otp
