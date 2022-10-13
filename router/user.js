const express = require('express')
const User = require('../model/user')
const router = new express.Router()
const {findMyCredentials, auth} = require('../controller/user')
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

//passed number - not completed
router.put('/forgotpassword', async(req, res)=>{
    try{
        const user = User.findOne({number: req.body.number})
        if(user){
            const token = await user.generateAuthtoken() 
            const data = await User.updateOne({number:number},{$set:{'tokens.token':token}})
            res.status(200).send({success: true, msg:'please check your inbox and reset password'})
        }else{
              res.status(200).send({success: true, msg:'does not exist'})
        }
    }catch(error){
        res.status(400).send({error})
    }
})



module.exports = router