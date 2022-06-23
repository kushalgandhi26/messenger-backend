const router = require("express").Router()
const User = require("../models/userModel")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const verifyUser = require("../middleware/verifyUser")

// Register User
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body
        var regExpEmail = /([A-Z]|[a-z]|[^<>()\[\]\\\/.,;:\s@"]){4,}\@([A-Z]|[a-z]|[^<>()\[\]\\\/.,;:\s@"]){4,}\.(com|net)/;
        var regExpPassword = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/;
        if(!name || !email || !password){
            return res.status(400).json({ message: "Enter Required Fields" })
        }
        if(name.length < 4){
            return res.status(400).json({ message: "Name should be of 3 characters" })
        }
        if(!regExpEmail.test(email)){
            return res.status(400).json({ message: "Inappropriate Email" })
        }
        if(!regExpPassword.test(password)){
            return res.status(400).json({ message: "Enter Strong Password" })
        }
        const existing_user = await User.findOne({ email })
        if (existing_user) {
            return res.status(400).json({ message: "Account already exists." })
        }
        const salt = await bcrypt.genSalt()
        const password_hash = await bcrypt.hash(password, salt)
        const new_user = new User({ name, email, password: password_hash })
        const saved_user = await new_user.save()
        const token = jwt.sign(
            { user_id: saved_user._id, email },
            process.env.TOKEN_KEY
        );
        return res.status(200).json({ token,user: { _id:saved_user._id, name, email } })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Internal Server Error" })
    }
})

// Login User
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body
        if(!email || !password){
            return res.status(400).json({ message: "Enter Required Fields" })
        }
        const existing_user = await User.findOne({ email })
        if (!existing_user) {
            return res.status(401).json({ message: "Invalid credentials" })
        }
        const correct_paassword = await bcrypt.compare(password, existing_user.password)
        if (!correct_paassword) {
            return res.status(401).json({ message: "Invalid credentials" })
        }
        const token = jwt.sign(
            { user_id: existing_user._id, email },
            process.env.TOKEN_KEY
        );
        return res.status(200).json({ token,user: {_id:existing_user._id,name: existing_user.name, email: existing_user.email } })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal Server Error" })
    }
})


//Get all Users
router.get("/getUsers/:id", verifyUser, async(req,res) => {
    try {
        const users = await User.find({_id:{$ne:req.params.id}}).select(["email","name","_id"])
        return res.status(200).json(users)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Internal Server Error" })
    }
})

module.exports = router