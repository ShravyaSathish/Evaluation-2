const User = require('../model/user')
const Otp = require('../model/otp')
const otpGenerator = require('otp-generator')
const _ = require("underscore")
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')


const findMyCredentials = async(req, res)=>{
    const user = await User.findOne({number: req.body.number})
    if(!user){
        throw new Error({error:'Unable to login'})
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password)
    if(!isMatch){
        throw new Error({error:'Unable to login'})
    }
    //Generate Otp
    const OTP = otpGenerator.generate(6, { alphabets: false, upperCase: false, specialChar: false })
    const number = req.body.number
    console.log(OTP)
    const otp = new Otp({number: number, otp: OTP})
    const salt = await bcrypt.genSalt(10)
    otp.otp = await bcrypt.hash(otp.otp, salt)
    const result = await otp.save()
    res.status(200).send('Otp sent successfully!')
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

const verifyOtp = async(req, res)=>{   
    const otpHolder = await Otp.find({number: req.body.number})
    if(otpHolder.length === 0){
        return res.status(400).send('OTP Expired!')
    }
    const rightOtpFind = otpHolder[otpHolder.length - 1]
    const validUser = await bcrypt.compare(req.body.otp, rightOtpFind.otp)
    if(rightOtpFind.number === req.body.number && validUser){
        const user = new User(_.pick(req.body,["number","password"]))
        const result = await user.save()
        const token = await user.generateAuthtoken() 
    
        return res.status(200).send({message:'Successfull verified otp', data: result, token})
    }
    else{
        return res.status(400).send('Otp was wrong')
    } 
}

const sendPasswordReset = async(req, res)=>{
    try{
        const OTP = otpGenerator.generate(6, { alphabets: false, upperCase: false, specialChar: false })
        const number = req.body.number
        console.log(OTP)
        const otp = new Otp({number: number, otp: OTP})
        const salt = await bcrypt.genSalt(10)
        otp.otp = await bcrypt.hash(otp.otp, salt)
        const result = await otp.save()
        res.status(200).send('Otp sent successfully!')
    }
    catch(e){
        res.status(400).send({error:'Invalid Update'})
    }
}

const forgotpassword = async(req, res)=>{
    try{
        const number = req.body.number
        const userData = await User.findOne({number:number})
        if(userData){
            const user = new User(_.pick(req.body,["number","password"]))
            await user.save()
            const token = await user.generateAuthtoken()
            const data = await User.updateOne({number:number}, {$set:{tokens:token}})
            sendPasswordReset(userData.number, token)
            res.status(200).send({msg:'check your inbox and reset password'})
        }
    }catch(e){
        console.log(e)
        res.status(400).send({error:'Email does not exists'})
    }   
}
module.exports = {findMyCredentials, auth, verifyOtp, forgotpassword}