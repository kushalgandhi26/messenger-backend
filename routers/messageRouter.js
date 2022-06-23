const router = require("express").Router()
const Message = require("../models/messageModel")

//Add message
router.post("/send",async (req,res) => {
    try {
        const {from,to,msg} = req.body
        const data = new Message({message:{text:msg},users:[from,to],sender:from})
        const saved_msg = await data.save()
        if(saved_msg){
            return res.status(200).json({message:"Success"})
        }
        return res.status(401).json({message:"Internal Server Error"}) 
    } catch (error) {
        console.error(error)
        res.status(500).json({message:"Bad request"})
    }
})

module.exports = router