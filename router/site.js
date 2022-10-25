const express = require('express')
const Site = require('../model/site')
const multer = require('multer')
const {auth} = require('../controller/user')
const router = new express.Router()

router.post('/site/create', auth,  async (req, res)=>{
        const {siteUrl, siteName, userName, sitePassword, notes, sector} = req.body
        const newSite = new Site({
        siteUrl:siteUrl,
        siteName:siteName,
        userName:userName,
        sitePassword:sitePassword,
        notes:notes,
        sector:sector,
        userId:req.userId
    })
    
    try{
        await newSite.save()
        res.status(201).send(newSite)
    }catch(error){
        res.status(400).send({error:"Unable to create Site"})
    }
})

router.get('/sites',auth,async(req, res)=>{
    try{
        const site = await Site.find({userId:req.userId})
        res.status(200).send(site)
    }
    catch(e){
        res.status(400).send({error:'Unable to get the data'})
    }
})

router.get('/site/search',auth,async (req, res)=>{
    try{
        const search = req.query.search || req.body.search
        const regex = new RegExp(search, "i")
        await Site.find({userId:req.userId, $text:{$search:regex}}, (error, docs)=>{
        if(docs){
            res.status(200).send(docs)
        }else{
            res.send(error)
        }
    }).clone()
    }catch(error){
        console.log(error)
        res.send({message:error.message})
    }
    
})

router.post('/sector/site',auth,async(req,res)=>{
    try {
        const sector = req.body.sector
        response = await Site.find({
            userId:req.userId,
            sector: `${sector}`
        })
        res.send(response)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

router.patch('/site/:id', auth,async (req, res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['siteUrl','siteName','sitePassword','notes','sector']
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
    res.status(200).send({message:"Logo uploaded successfully!"})
}, (error, req, res, next)=>{
    res.status(400).send({error: error.message})
})



module.exports = router