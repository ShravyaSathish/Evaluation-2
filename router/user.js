const express = require('express')
const User = require('../model/user')
const router = new express.Router()
const {findMyCredentials, auth, verifyOtp, forgotpassword} = require('../controller/user')
const { number } = require('joi')


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

router.post('/passenger/login', findMyCredentials ,async (req, res)=>{
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

router.get('/logout/user', auth, async(req, res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})

//passed number - not completed
router.post('/forgotpassword', forgotpassword)

router.post('/verify/otp', verifyOtp)

module.exports = router


