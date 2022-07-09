import jwt from "jsonwebtoken";
import UserModel from "../models/User.js";

const checkUser = async(req, res, next)=>{
    let token;
    const {authorization} = req.headers;
    if(authorization && authorization.startsWith('Bearer')){
        try {
            //Get Token from Header
            token = authorization.split(" ")[1]
            
            //Verify Token
            const {userID} = jwt.verify(token, process.env.JWT_SECRET_KEY)

            //Get User from token
            req.user = await UserModel.findById(userID).select('-password')
            next()
        } catch (error) {
            console.log(error);
            res.status(500).send({error:"Unauthorized User"})
        }
    }
    if(!token){
        res.status(500).send({error:"Unauthorized User,No token"})

    }
}

export default checkUser;