import UserModel from "../models/User.js";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";
import transporter from "../config/emailConfig.js";

class UserController {
    static userRegistration = async (req, res) => {
        const { name, email, password, password_confirmation, tc } = req.body;
        const user = await UserModel.findOne({ email: email })
        if (user) {
            return res.status(400).json({ error: 'sorry user already exists' })
        } else {
            if (name && email && password && password_confirmation && tc) {
                if (password === password_confirmation) {
                    try {
                        const salt = await bcrypt.genSalt(10)
                        const hashPassword = await bcrypt.hash(password, salt)
                        const doc = new UserModel({
                            name: name,
                            email: email,
                            password: hashPassword,
                            tc: tc
                        })
                        await doc.save()
                        const saved_user = await UserModel.findOne({email:email})
                        //Genarate JWT token
                        const token = jwt.sign({userID: saved_user._id},process.env.JWT_SECRET_KEY)
                        res.send({ success: doc,token })
                    } catch (error) {
                        res.status(500).send({ error: "Unable to register" })
                    }
                } else {
                    res.status(500).send("Password doesn't not match")
                }

            } else {
                res.status(500).send("All field are required")
            }
        }
    }
    
    static userLogin = async (req, res) => {
        try {
            const { email, password } = req.body;
            if (email && password) {
                const user = await UserModel.findOne({ email: email })
                if (user != null) {
                    const isMatch = await bcrypt.compare(password, user.password)
                    if ((user.email === email) && isMatch) {
                        const token = jwt.sign({userID: user._id},process.env.JWT_SECRET_KEY)

                        res.send({ success: "Login successfully",token })
                    } else {
                        res.status(400).send({ error: "Please register with correct credentials" })
                    }
                } else {
                    res.status(400).send({ error: "You are not a registered user" })

                }
            } else {
                res.status(400).send({ error: "All field are required" })
            }
        } catch (error) {
            console.log(error);
        }
    }

    static changeUserPassword = async (req,res) =>{
        const {password,password_confirmation} = req.body;
        if(password && password_confirmation){
            if(password !== password_confirmation){
                res.status(400).send({ error: "New Password and Confirm Password dosen't match" })  
            }else{
                const salt = await bcrypt.genSalt(10)
                const newHashPassword = await bcrypt.hash(password , salt)
                await UserModel.findByIdAndUpdate(req.user._id, {$set:{password:newHashPassword}})
                res.send({success:"Password Change Successfully"})
            }

        }else{
            res.status(400).send({ error: "All field are required" }) 
        }
    }
    static loggedUser = async(req, res)=>{
        res.send({user:req.user})
    }

    static sendUserPasswordResetEmail = async(req, res) =>{
        const {email} = req.body;
        if(email){
            const user = await UserModel.findOne({ email: email })
            if(user){
                const secret = user._id + process.env.JWT_SECRET_KEY
                const token = jwt.sign({userID:user._id}, secret, {expiresIn:'15m'})
                const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`
                console.log(link)
                //Send Email
                let info = await transporter.sendMail({
                    from:process.env.EMAIL_FROM,
                    to:user.email,
                    subject:"Password Reset Link",
                    html:`<a href=${link}>Click Here </a> to reset your password`,
                })
                res.send({success:"Email Send Successfully...",link, info})
            }else{
                res.status(400).send({ error: "Email dosen't exists" }) 

            }
        }else{
            res.status(400).send({ error: "Email are required" }) 
 
        }
    }

    static userPasswordReset = async(req, res)=>{
        const {password, password_confirmation} = req.body;
        const {id,token} = req.params;
        const user = await UserModel.findById(id)
        const new_secret = user._id + process.env.JWT_SECRET_KEY
        try {
            jwt.verify(token, new_secret)
            if(password, password_confirmation){
                if(password===password_confirmation){
                    const salt =await bcrypt.genSalt(10)
                    const newHashPassword = await bcrypt.hash(password, salt)
                    await UserModel.findByIdAndUpdate(user._id, {set:{password:newHashPassword}})
                    res.send({success:"Password send successfully.."})
                }else{
                    res.status(400).send({ error: "Password and Confirm Password dosem't Match" }) 

                }

            }else{
                res.status(400).send({ error: "All Fields are required" }) 

            }
        } catch (error) {
            console.log(error)
            res.status(400).send({ error: "Invalid User" }) 

        }
    }
}

export default UserController;