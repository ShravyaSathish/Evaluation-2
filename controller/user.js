const User = require('../model/user')
const Otp = require('../model/otp')
const otpGenerator = require('otp-generator')
const _ = require("underscore")
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const Site = require('../model/site')

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
        const user = await User.findOne({_id:decode._id, 'token':token})
        if(!user){
            throw new Error('Unable to Authenticate')
        }
        req.token = token
        req.userId = user
        req.user = user
        next()
    }catch(e){
        console.log(e)
        res.status(401).send({error:'Please authenticate'})
    }
}


const verifyOtp = async(req, res,next)=>{   
    const otpHolder = await Otp.find({number: req.body.number})
    if(otpHolder.length === 0){
        return res.status(400).send('OTP Expired!')
    }
    const rightOtpFind = otpHolder[otpHolder.length - 1]
    const validUser = await bcrypt.compare(req.body.otp, rightOtpFind.otp)
    if(rightOtpFind.number === req.body.number && validUser){
        const user = new User(_.pick(req.body,["number"]))
        next()
    }
    else{
        return res.status(400).send('Otp was wrong')
    } 
}

const sendPasswordReset = async (req, res)=>{
  try {
    const{number,password}=req.body
    console.log(number,password)
    const hashedPassword = await  bcrypt.hash(password, 8)
    const result = await User.findOneAndUpdate({number},{password:hashedPassword},{new:true})
    if(result) res.send(result)
    else res.send("couldn't update")
  } catch (error) {
    console.log(error)
    res.status(500).send("error occured")
  }
}

const generateOtp = async(req, res)=>{
    const user = await User.find({user: req.number})
    if(user){
        const OTP = otpGenerator.generate(6, { alphabets: false, upperCase: false, specialChar: false })
        const number = req.body.number
        console.log(OTP)
        const otp = new Otp({number: number, otp: OTP})
         const salt = await bcrypt.genSalt(10)
        otp.otp = await bcrypt.hash(otp.otp, salt)
        const result = await otp.save()
        res.status(200).send('Otp sent successfully!')
    }
    
} 

module.exports = {findMyCredentials, auth, verifyOtp, generateOtp, sendPasswordReset}