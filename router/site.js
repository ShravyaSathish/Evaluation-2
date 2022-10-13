const express = require('express')
const Site = require('../model/site')
const multer = require('multer')
const router = new express.Router()

router.post('/site/create', async (req, res)=>{
    const site = new Site(req.body)
    site.save().then(()=>{
        res.status(200).send(site)
        console.log('Successfully added site')
    }).catch((e)=>{
        res.status(400).send({error:'Enter valid details'})
    })
})

router.get('/sites', async(req, res)=>{
    try{
        const site = await Site.find({})
        res.status(200).send(site)
    }
    catch(e){
        res.status(400).send({error:'Unable to get the data'})
    }
})

router.patch('/site/:id', async (req, res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['siteUrl','siteName','userName','sitePassword','notes','sector']
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))
    if(!isValidOperation){
        return res.status(400).send({error:"Invalid Updates Please Try Again"})
    }
    try { 
        const _id = req.params.id
        const site = await Site.findById(_id)
        updates.forEach((update)=>site[update] = req.body[update])
        await site.save()
        if(!site){
            return res.status(200).send()
        }
        res.send(site)
   }
   catch(e){
    console.log(e)
        res.status(400).send({e:'Invalid update'})
   }
})

const upload =  multer({
    dest:'images',
    limits:{
        fileSize:1000000
    },
    fileFilter(req, file, callback){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return callback(new Error('Invalid Upload'))
        }
        callback(undefined, true)
    }
})
router.post('/upload/logo', upload.single('logo'), async(req, res)=>{
    res.status(200).send()
}, (error, req, res, next)=>{
    res.status(400).send({error: error.message})
})



module.exports = router