const router = require("express").Router()
const Message = require("../models/messageModel")
const verifyUser = require("../middleware/verifyUser")

//Add message
router.post("/send", verifyUser, async (req,res) => {
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

//get all messages
router.post("/getmessages", verifyUser, async(req,res) => {
    try {
        const {from,to} = req.body
        const messages = await Message.find({users:{$all:[from,to]}}).sort({updatedAt:1})
        const projectMessages = messages.map((msg) => {
            return{
                fromSelf: msg.sender.toString() === from,
                message: msg.message.text
            }
        })
        res.status(200).json(projectMessages) 
    } catch (error) {
        console.error(error)
        res.status(500).json({message:"Bad request"})
    }
})
module.exports = router