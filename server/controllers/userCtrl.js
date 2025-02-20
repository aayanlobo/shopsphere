const Users = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userCtrl = {
    register: async (req, res) => {
        try {
            console.log("Incoming Request Body:", req.body); // ✅ Debugging Log

            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({ msg: "All fields are required" });
            }

            const user = await Users.findOne({ email });
            if (user) return res.status(400).json({ msg: "Email already registered" });

            if (password.length < 6) {
                return res.status(400).json({ msg: "Password should be at least 6 characters" });
            }

            //Password incryption

            const passwordHash = await bcrypt.hash(password,10);
             
            const newUser = new Users({
                name,email,password:passwordHash
            })


            
            //save mongoDB : 
            await newUser.save()
            

            // create JWT to authenticate 
             const accesstoken = createAccessToken({id:newUser._id});
             const refreshtoken = createRefreshToken({id:newUser._id});
              
            // cookies 
             res.cookie('refreshtoken', refreshtoken,{
                httpOnly: true,
                path:'/user/refreshtoken'
             })


            res.json({accesstoken});

        } catch (err) {
            console.error(err); // ✅ Logs server errors to console
            return res.status(500).json({ msg: err.message });
        }
    },
    refreshtoken: async(req,res) => {
        try {
         const rf_token = req.cookies.refreshtoken;
          if(!rf_token) return res.status(400).json({msg:"Please login or registerss"});

          jwt.verify(rf_token,process.env.REFRESH_TOKEN_SECRET,(err,user)=>{
            if(err) return res.status(400).json({msg:"Please login or Register"})
            const accesstoken = createAccessToken({id:user._id})
             res.json({user,accesstoken})
          })
         
        }
        catch(err) {
               return res.status(500).json({msg:err.message});
        }
        

        
    },

    login: async(req,res) => {
        try{
            const {email,password} = req.body;

            const user = await Users.findOne({email})
            if(!user) return res.status(400).json({msg: "User does not exist."})
            
                const isMatch = await bcrypt.compare(password,user.password)
                if(!isMatch) return res.status(400).json({msg: "Incorrect Password"});
                
                const accesstoken = createAccessToken({id:user._id})
                const refreshtoken = createRefreshToken({id:user._id})

               res.cookie('refreshtoken',refreshtoken,{
                httpOnly:true,
                path:'/user/refreshtoken'
               })
               


                res.json({accesstoken});
        } catch(err){
            return res.status(500).json({msg:err.message});
        }
    },

    logout: async(req,res) => {
        try{
                 res.clearCookie('refreshtoken',{path:'/user/refreshtoken'})
                 return res.json({msg:"log out"})
        }
        catch(err){
               return res.status(500).json({msg:err.message});
        }
    },
    getUser: async(req,res) => {
        try{
            const user = await Users.findById(req.user.id).select('-password')
            if(!user) return res.status(400).json({msg:"User Not Found"})
             res.json(user);
        }
        catch(err){
                   return res.status(500).json({msg:err.message});
        }
    }
}

const createAccessToken = (payLoad) => {
    return jwt.sign(payLoad,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1d'})
}

const createRefreshToken = (payLoad) => {
    return jwt.sign(payLoad,process.env.REFRESH_TOKEN_SECRET,{expiresIn:'7d'})
}

module.exports = userCtrl;
 