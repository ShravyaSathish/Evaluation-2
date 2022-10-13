const express = require('express')
const userRouter = require('./router/user')
const siteRouter = require('./router/site')
require('./db/mongoose')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

//Registering router
app.use(userRouter)
app.use(siteRouter)

app.listen(port, ()=>{
    console.log('Server is up on ' +port)
})
