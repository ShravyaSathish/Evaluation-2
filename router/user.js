const express = require('express')
const User = require('../model/user')
const jwt = require('jsonwebtoken')
const router = new express.Router()
const {findMyCredentials, auth} = require('../controller/user')
const { application } = require('express')


router.post('/user/create', async(req, res)=>{
    const user = new User(req.body)
    try{
        await user.save()
        const token = await user.generateAuthtoken()        
        res.status(200).send({user, token})
        //otp creation
        // const OTP = otpGeneration(6, {
        //     digits: true, alphabets: false, uppercase: false, specialChars: false
        // })
        // const number = req.body.number
        // console.log(OTP)
        // const otp = new Otp({number, otp: OTP})
        // const salt = await bcrypt.genSalt(10)
        // otp.otp = await bcrypt.hash(otp.otp, salt)
        // const result = await otp.save()
        // return res.status(200).send("Otp send successsfully")

    }
    catch(error){
        console.log(error)
        res.status(400).send({error: 'Invalid Data'})
    }
})
router.get('/profile', auth, async (req, res)=>{
    try{
        res.send(req.user)
    }
    catch(e){
        res.status(401).send({e:"Unable to get the data"})
    }
})

router.get('/users/:id',  async (req, res)=>{
    const _id = req.params.id
    try{
        const user = await User.findById(_id)
        if(!user){
            return res.status(200).send()
        }
        res.send(user)
    }catch(e){
        res.status(401).send({e:'Invalid update'})
    }

})

router.patch('/users/:id', async (req, res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['number','password']
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))
    if(!isValidOperation){
        return res.status(400).send({error:"Invalid Updates Please Try Again"})
    }
    try { 
        const _id = req.params.id
        const user = await User.findById(_id)
        updates.forEach((update)=>user[update] = req.body[update])
        await user.save()
        if(!user){
            return res.status(200).send()
        }
        res.send(user)
   }
   catch(e){
        res.status(400).send({e:'Invalid update'})
   }
})

router.post('/passenger/login', findMyCredentials ,async (req, res)=>{
    try{
        const token = await req.user.generateAuthtoken()
        res.status(200).send({user: req.user, token})
    }catch(e){
        res.status(400).send({error:'Unable to login'})
    }
})

// router.put('/forgotpassword', async(req, res)=>{
//     try{
//         const {number} = 
//     }catch(error){
//         res.status(400).send({error})
//     }
// })



module.exports = router