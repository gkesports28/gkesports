const jwt = require("jsonwebtoken");
require('dotenv').config()
// console.log(process.env.JWT_SECRET_KEY,"JWT_SECRET_KEY",jwt,"jwt")
// exports.authmidleware = async(req,res,next)=>{
// try{
// const token = req.headers["authorization"].split(" ")[1]
// console.log(token,process.env.JWT_SECRET_KEY,"token")
// console.log(process.env.JWT_SECRET_KEY,"JWT_SECRET_KEY")
// const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY,{ignoreExpiration:true});
// console.log(decoded,"Decoded")
// if(decoded){
//     req.user=decoded;
//     console.log(decoded,"decoded")
//     next()
// }
// else{
//     res.json({
//         success:false,
//         message:"Unothorization token"
//     })
// }
//      }catch(err){
//         res.json({
//             success:false,
//             message:"Unothorization token"
//         })
//      }
// }

exports.authmidleware = async (req, res, next) => {
    try {
        // console.log(req.cookies, 'token');
        // console.log(req.headers["authorization"].split(" ")[1], 'token');

        const token =  req.headers["authorization"].split(" ")[1];
        const decord = jwt.verify(token, process.env.JWT_SECRET_KEY, {ignoreExpiration:true});
        if(!decord){
            return res.status(401).json({
                status: "failed",
                message: "unauthorized user",
            });
        }else{
            req.user = decord;
            console.log(req.user.id)
            next();
        }
    } catch (error) {
        console.log(error, "error in auth middleware")
        res.status(500).json({
            status: "error",
            message: "Internal Server error",
        })
    }
}
