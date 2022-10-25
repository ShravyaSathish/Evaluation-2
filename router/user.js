const express = require('express')
const User = require('../model/user')
const router = new express.Router()
const {findMyCredentials, auth, verifyOtp, generateOtp, sendPasswordReset} = require('../controller/user')


router.post('/user/create', async(req, res)=>{
    const user = new User(req.body)
    try{
        await user.save()
        const token = await user.generateAuthtoken()        
        res.status(200).send({user, token})
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

router.post('/pass/login', findMyCredentials ,async (req, res)=>{
    try{
        const token = await req.user.generateAuthtoken()
        res.status(200).send({user: req.user, token})
    }catch(e){
        res.status(400).send({error:'Unable to login'})
    }
})

router.get('/user/:id', async(req, res)=>{
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

router.get('/logout/user', auth,async(req, res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.send("User Logged out successfully")
    }catch(e){
        console.log(e)
        res.status(400).send("Failed to logout")
    }
})

router.post('/generateOtp', generateOtp)
// router.post('/verify/otp', verifyOtp,sendPasswordReset)
router.post('/forgotPassword', verifyOtp,sendPasswordReset)
// router.post('/resetPassword', auth, sendPasswordReset)

module.exports = router

