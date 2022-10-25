const mongoose = require('mongoose')
const {Schema} = mongoose
const refreshToken = Schema({

})

const RefreshToken = mongoose.model('Sites', refreshToken)
module.exports = RefreshToken