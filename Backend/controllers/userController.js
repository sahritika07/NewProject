import UserModel from "../models/User.js"
import CrudModel from "../models/NewUser.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import transporter from "../config/emailConfig.js"


class UserController{
    static userRegistration=async(req,res) =>{
        const {name,email,password,password_confirmation,tc} = req.body
        const user = await UserModel.findOne({email:email})
        if(user){
            res.send({"status":"failed","message":"Email already exists"})
        }else{
            if(name && email && password && password_confirmation && tc ){
                if(password === password_confirmation){
                    try{
                        const salt = await bcrypt.genSalt(10)
                        const hashPassword = await bcrypt.hash(password,salt)
                        const doc = new UserModel({
                        name: name,
                        email:email,
                        password:hashPassword,
                        tc:tc

                     })
                     await doc.save()
                     const saved_user = await  UserModel.findOne({email:email})

                     // Generating JWT token
                     const token = jwt.sign({userID:saved_user._id}, process.env.JWT_SECRET_KEY,{expiresIn: '5d'})

                     res.status(201).send({"status":"success","message":"Registration Successful", "token":token}) 
                    }catch(error){
                        console.log(error)
                        res.send({"status":"failed","message":"Unable to Register"}) 
                    }
                }else{
                    res.send({"status":"failed","message":"Password and ConfirmPassword does not match"}) 
                }
            }else{
                res.send({"status":"failed","message":"All fields are required"})
            }
        }
    }

    static userLogin= async(req,res)=>{
        console.log("Login Entered")
        try {
           const {email,password} = req.body
           if(email && password){
            const user = await UserModel.findOne({email:email})
            if(user!=null){
                 const isMatch = await bcrypt.compare(password,user.password)
                 if((user.email === email) && isMatch){
                    const token = jwt.sign({userID:user._id}, process.env.JWT_SECRET_KEY,{expiresIn: '5d'})
                    res.send({"status":"success","message":"Login Success","token":token,"user":user})
                 }else{
                    res.send({"status":"failed","message":"Email or Password is not Valid"})
                 }
            }else{
                res.send({"status":"failed","message":"You are not a registered user"})
            }
           }else{
            res.send({"status":"failed","message":"All fields are required"})
           }
        } catch (error) {
            console.log(error)
            res.send({"status":"failed","message":"Unable to Login"})
        }
    }


    static changeUserPassword = async(req,res)=>{
        const {password, password_confirmation}=req.body;
        if(password && password_confirmation){
            if(password !== password_confirmation){
                res.send({"status":"failed","message":"New Password and confirm New Password does not match"})
            }else{
                const salt = await bcrypt.genSalt(10)
                const newHashPassword = await bcrypt.hash(password,salt)
                // console.log(req.user._id)
                await UserModel.findByIdAndUpdate(req.user._id, {$set: {password: newHashPassword}})
                res.send({"status":"success","message":"Password Changed Successfully"})
            }
        }else{
            res.send({"status":"failed","message":"All fields are required"})
        }
    }

    static loggedUser = async(req,res)=>{
        res.send({"user":req.user})
    }

    static sendUserPassResetEmail = async(req,res)=>{
        const {email}= req.body
        if(email){
            const user = await UserModel.findOne({email:email})
            
            if(user){
                const secret = user._id+process.env.JWT_SECRET_KEY
                const token = jwt.sign({userID: user._id},secret,{expiresIn: '15m'})
                const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`
                console.log(link)
                // Send email

                let info = await transporter.sendMail({
                   from: process.env.EMAIL_FROM,
                   to : user.email,
                   subject:"PROJECT - Password Reset Link",
                   html:`<a href=${link}>Click Here</a> to Reset Your Password`,
                   

                })
                res.send({"status":"success","message":"Password Reset Email Sent... Please Check Your Email" , "info": info }) 
            }else{
                res.send({"status":"failed","message":"Email doesn't exists"}) 
            }
        }else{
            res.send({"status":"failed","message":"Email is required"}) 
        }
    }

    static userPasswordReset = async(req,res)=>{
        const {password,password_confirmation}= req.body
        const {id,token} = req.params
        const user = await UserModel.findById(id)
        
        const new_secret = user._id + process.env.JWT_SECRET_KEY
        try {
            jwt.verify(token, new_secret)
            if(password && password_confirmation){
                if(password !== password_confirmation){
                    res.send({"status":"failed","message":"New Password and Confirm password doesn't match"})
                }else{
                    const salt = await bcrypt.genSalt(10)
                    const newHashPassword = await bcrypt.hash(password,salt)
                    await UserModel.findByIdAndUpdate(user._id, {$set: {password: newHashPassword}})
                    res.send({"status":"success","message":"Password Reset Successfully"})
                }

            }else{
                res.send({"status":"failed","message":"All fields are required"})
            }
        } catch (error) {
            console.log(error)
            res.send({"status":"failed","message":"InValid Token"})
        }
    }

    static addUser = async (req, res) => {
        console.log("User details",req.body)
        const { name, email, roles, addedBy } = req.body; // Destructure data from request body
    
    
        try {
          // Check if all required fields are provided
          if (!name || !email || !roles ) {
            return res.status(400).send({
              status: 'failed',
              message: 'All fields (name, email, roles) are required',
            });
          }
    
          // Check if the user already exists
          const existingUser = await UserModel.findOne({ email });
          if (existingUser) {
            return res.status(400).send({
              status: 'failed',
              message: 'User with this email already exists',
            });
          }
    
          // Hash the password
    
          // Create new user object
          const newUser = new CrudModel({
            name,
            email,            
            roles,
            addedBy// Assuming roles are comma-separated
          });
          console.log("Error",newUser)
    
          // Save new user to the database
          await newUser.save();
    
          // Send success response
          res.status(201).send({
            status: 'success',
            message: 'Data added successfully',
            user: newUser
          });
    
        } catch (error) {
          console.error(error);
          res.status(500).send({
            status: 'failed',
            message: 'Server error while adding user',
          });
        }
      };

        
        // Function to get all users
        static getAllUsers = async (req, res) => {
          console.log(req.query);
          const { id, search } = req.query;
          console.log(search);
          try {
            let users;
            // Fetch users based on the search term
            if (search?.length > 0) {
              users = await CrudModel.find({
                addedBy: id,
                $or: [
                  { name: { $regex: search, $options: "i" } }, // Match 'name' field (case-insensitive)
                  { email: { $regex: search, $options: "i" } }, // Match 'email' field (case-insensitive)
                ],
              });
            } else {
              users = await CrudModel.find({ addedBy: id });
            }
        
            // If no users found, send a response
            if (!users.length) {
              return res.status(404).send({
                status: "failed",
                message: "No users found",
              });
            }
        
            // Send users data as response
            res.status(200).send({
              status: "success",
              users: users,
            });
          } catch (error) {
            console.error(error);
            res.status(500).send({
              status: "failed",
              message: "Server error while fetching users",
            });
          }
        };
        



   static deleteUser = async (req, res) => {
    try {
      const { id } = req.query;
      console.log(req.query)  // Get user ID from request params

      // Try to find and delete the user by ID
      const deletedUser = await CrudModel.findByIdAndDelete(id);

      // If user is not found
      if (!deletedUser) {
        return res.status(404).send({
          status: 'failed',
          message: 'User not found',
        });
      }

      // If the user is deleted, send success response
      res.status(200).send({
        status: 'success',
        message: 'User deleted successfully',
        deletedUser,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        status: 'failed',
        message: 'Server error while deleting user',
      });
    }
  };

  // Static method to update user details
  static updateUser = async (req, res) => {
    try {
      const { id } = req.query; // Get the user ID from query parameters
      const updateData = req.body; // Get the new user data from the request body

      // Find user by ID and update the user's details
      const updatedUser = await CrudModel.findByIdAndUpdate(id, updateData, { new: true });

      // If no user is found
      if (!updatedUser) {
        return res.status(404).send({
          status: 'failed',
          message: 'User not found',
        });
      }

      // If user updated successfully
      res.status(200).send({
        status: 'success',
        message: 'User updated successfully',
        updatedUser,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        status: 'failed',
        message: 'Server error while updating user',
      });
    }
  };


  static getAllUsers = async (req, res) => {
    console.log(req.query);
    const { id, search, page = 2, limit = 5 } = req.query; // Defaults: page 1, 10 results per page
    console.log(search);
    
    try {
      let query = { addedBy: id };
  
      // Add search criteria if 'search' is provided
      if (search?.length > 0) {
        query.$or = [
          { name: { $regex: search, $options: "i" } }, // Match 'name' field (case-insensitive)
          { email: { $regex: search, $options: "i" } }, // Match 'email' field (case-insensitive)
        ];
      }
  
      // Calculate pagination values
      const skip = (page - 1) * limit;
  
      // Fetch users with pagination
      const users = await CrudModel.find(query)
        .skip(skip)
        .limit(parseInt(limit)); // Limit the number of results
  
      // Count total documents for the query
      const totalUsers = await CrudModel.countDocuments(query);
  
      // If no users found, send a response
      if (!users.length) {
        return res.status(404).send({
          status: "failed",
          message: "No users found",
        });
      }
  
      // Send paginated response
      res.status(200).send({
        status: "success",
        users: users,
        totalUsers: totalUsers, // Total number of users
        totalPages: Math.ceil(totalUsers / limit), // Total pages
        currentPage: parseInt(page), // Current page
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        status: "failed",
        message: "Server error while fetching users",
      });
    }
  };
  
}



export default UserController