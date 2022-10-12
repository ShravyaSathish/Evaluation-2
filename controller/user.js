const User = require('../model/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')


const findMyCredentials = async(req, res, next)=>{
    const user = await User.findOne({number: req.body.number})
    if(!user){
        throw new Error({error:'Unable to login'})
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password)
    if(!isMatch){
        throw new Error({error:'Unable to login'})
    }
    req.user = user
    next()
}

const auth = async(req, res, next)=>{
    try{
        const token = req.header('Authorization').replace('Bearer ', '')
        const decode = jwt.verify(token, 'secret')
        const user = await User.findOne({_id:decode._id, 'tokens.token':token})
        if(!user){
            throw new Error('Unable to Authenticate')
        }
        req.user = user
        next()
    }catch(e){
        res.status(401).send({error:'Please authenticate'})
    }
}
module.exports = {findMyCredentials, auth}