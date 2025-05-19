const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Token = require("../models/tokenModel");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const sendEmail = require("../utils/sendEmail");


//generate token
const generateToken = (id) =>{
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "1d"})
}

//Register User
const registerUser = asyncHandler( async (req, res)=> {
   const {name, email, password} = req.body
    
  // Validation
  if(!name || !email || !password) {
    res.status(400)
    throw new Error("Please fill in all required fields")
  }
   if( password.length <8 ){
    res.status(400)
    throw new Error("Password must be up to 8 characters")
   }

 // Check if user email already exists
  const userExists = await User.findOne({email})

  if(userExists) {
    res.status(400)
    throw new Error("Email has already been registered.")
  }


  //Create new user
  const user = await User.create({
    name : name,
    email,
    password,
  })

   //Generate Token
   const token = generateToken(user._id)

   //Send HTTP-only cookie
   res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), //1day
    sameSite: "none",
    secure: true,
   });

  if(user){
    const {_id, name, email, image, mobile, bio} = user
    res.status(201).json({
        _id, name, email, image, mobile, bio, token,
    });
  } else {
    res.status(400)
    throw new Error("Invalid user data")
  }
});

//Login User
const loginUser = asyncHandler ( async (req, res) =>{
    
    const {email, password} = req.body

    //Validate Request
    if(!email || !password) {
        res.status(400);
        throw new Error("Please enter email and password")
    }

    //Check if User EXIST

    const user = await User.findOne({email})

    if(!user) {
        res.status(400);
        throw new Error("User not found, please signup");
    }

    //User exists, check if password is correct
    const passwordIsCorrect = await bcrypt.compare(password, user.password)

     //Generate Token
   const token = generateToken(user._id)

   //Send HTTP-only cookie
   res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), //1day
    sameSite: "none",
    secure: true,
   });

    if(user && passwordIsCorrect){
        const {_id, name, email, image, mobile, bio} = user
    res.status(200).json({
        _id, 
        name,
        email,
        image,
        mobile,
        bio,
        token,
    });
    } else{
        res.status(400);
        throw new Error("Invalid email or password");
    }
});

//Logout User
const logout = asyncHandler ( async(req, res) =>{
    res.cookie("token", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(0),
        sameSite: "none",
        secure: true,
       });
       return res.status(200).json({ message: "Successfully Logged Out" });
});

// Get User Data
const getUser = asyncHandler( async(req, res)=>{
   const user  = await User.findById(req.user._id)

   if(user){
    const {_id, name, email, image, mobile, bio} = user
    res.status(200).json({
        _id, name, email, image, mobile, bio,
    });
  } else {
    res.status(400)
    throw new Error("User Not Found")
  }
});

//Get Login Status

const loginStatus = asyncHandler( async(req, res) =>{
    const token = req.cookies.token;
    if(!token){
        return res.json(false);
    }
    //Verify Token
    const verified =jwt.verify(token, process.env.JWT_SECRET)
    if(verified){
        return res.json(true);
    }
    return res.json(false);
});

//Update user
const updateUser = asyncHandler (async (req, res) =>{
    const user = await User.findById(req.user._id);
    if(user){
        const {name, email, image, mobile, bio} = user;
       user.email =  email;
       user.name = req.body.name || name;
       user.mobile = req.body.mobile || mobile;
       user.bio = req.body.bio || bio;
       user.image = req.body.image || image;

       const updatedUser = await user.save()
       res.status(200).json({
        name: updatedUser.name, 
        email: updatedUser.email, 
        image: updatedUser.image, 
        mobile: updatedUser.mobile, 
        bio: updatedUser.bio,

       });
    } else {
        res.status(404);
        throw new Error("User not found")
    }

});


//change password
 const changePassword = asyncHandler (async (req, res) =>{
    const user = await User.findById(req.user._id);
    const { oldPassword, password } = req.body
   
    if(!user){
        res.status(400);
        throw new Error("User not found, please sign up.");
    }
    
    //validate
    if(!oldPassword || !password){
        res.status(400);
        throw new Error("Please add old and new password");
    }

    //check if old password matches password in the db
    const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password)

    //Save new password
    if(user && passwordIsCorrect){
        user.password = password
        await user.save();
        res.status(200).send("Password change successful")
    } else
        {res.status(400);
        throw new Error("Old password is incorrect");

    }
});

//forgotpassword
const forgotPassword = asyncHandler ( async (req, res) =>{
    const {email} = req.body
    const user = await User.findOne({email})

    if(!user){
        res.status(404)
        throw new Error("User does not exist")
    }

    //Delete token if it exists in db
    let token = await Token.findOne({userId : user._id})
    if(token){
        await token.deleteOne()
    }
    
    //Create reset token
    let resetToken = crypto.randomBytes(32).toString("hex") + user._id
    console.log(resetToken);
    // Hash token before shaking to db
    const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex")

    //Save Token to db
    await new Token({
        userId: user._id,
        token: hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now()+ 30 * (60* 1000) // 30mins

    }).save();

    //Construct a reset url
     const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`

    //Reset Email
    const message = `
    <h2>Hello ${user.name}</h2>
    <p>Please use the url below to reset your password</p>
    <p>This Reser link is valid for only 30 minutes.</p>
    
    <a href=${resetUrl} clicktracking=off>${resetUrl}</a>

    <p>Regards...</p>
    <p>GSV</p>
    `;
    
    const subject = "Password Reset Request";
    const  send_to = user.email;
    const  sent_from = process.env.EMAIL_USER;

    try{
        await sendEmail(subject, message, send_to, sent_from, sent_from);
        res.status(200).json({success: true, message: "Reset Email Sent"});
    }catch (error){
        // res.status(500);
        // throw new Error("Email not sent, please try again");
        res.status(500).json({
    success: false,
    message: "Email not sent, please try again",
    error: error.message, 
});

    }
 
});

//Reset password
const resetPassword  = asyncHandler (async (req, res) => {
    const {password } = req.body
    const {resetToken} = req.params

    //hash token, then compare to tiken in db
    const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

    //find token in db
    const userToken = await Token.findOne({
        token: hashedToken,
        expiresAt: {$gt: Date.now()}
    })
    if(!userToken){
        res.status(404);
        throw new Error("Invalid or Expired Token.")
    }

    //Find User
    const user = await User.findOne({_id: userToken.userId})
    user.password = password
    await user.save()
    res.status(200).json({
        message:"Password reset succssful, Please Login",
    });

});

module.exports = {
    registerUser,
    loginUser,
    logout,
    getUser,
    loginStatus,
    updateUser,
    changePassword,
    forgotPassword,
    resetPassword,

}

