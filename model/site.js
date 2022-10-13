const mongoose = require('mongoose')
const validator = require('validator')
const {Schema} = mongoose
const siteSchema = Schema({
    siteUrl: {
        type: String,
        required: true
    },
    siteName:{
        type: String,
        required: true
    },
    userName:{
        type: String,
        unique: true,
        required: true
    },
    sitePassword: {
        type: String,
        required: true,
        trim: true,
        minlength: 8,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Invalid password')
            }
        }
    },
    notes:{
        type: String,
        required: true
    },
    sector:{
        type: String,
        enum:['Social Media','Payment','Course'],
        required: true
    },
    image:{
        type: Buffer
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})

const Site = mongoose.model('Sites', siteSchema)
module.exports = Site