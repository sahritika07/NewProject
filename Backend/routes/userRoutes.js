// import express from 'express';

// const router = express.Router();
// import UserController from '../controllers/userController.js';
// import checkUserAuth from '../middlewares/auth-middleware.js';

// //Public Routes

// router.post('/register', UserController.userRegistration)
// router.post('/login', UserController.userLogin)
// router.post('/send-reset-password-email', UserController.sendUserPassResetEmail)
// router.post('/reset-password/:id/:token', UserController.userPasswordReset)
// router.post('/users', UserController.addUser);



// // Delete users
// router.delete('/deleteUsers', UserController.deleteUser );
// router.put('/updateUsers', UserController.updateUser );

// //Route Level Middleware - To Protect Route

// router.use('/changepassword', checkUserAuth)
// router.use('/loggeduser', checkUserAuth)


// //Protected Routes

// router.post('/changepassword', UserController.changeUserPassword)
// router.get('/loggeduser', UserController.loggedUser)
// router.get('/users', UserController.getAllUsers);

// export default router


import express from 'express';
import multer from 'multer';

const router = express.Router();

import UserController from '../controllers/userController.js';
import checkUserAuth from '../middlewares/auth-middleware.js';
import uploadOnCloudinary from '../utils/cloudinary.js'

// Public Routes
router.post('/register', UserController.userRegistration);
router.post('/login', UserController.userLogin);
router.post('/send-reset-password-email', UserController.sendUserPassResetEmail);
router.post('/reset-password/:id/:token', UserController.userPasswordReset);
router.post('/users', UserController.addUser);

// Delete users
router.delete('/deleteUsers', UserController.deleteUser);
router.put('/updateUsers', UserController.updateUser);

router.put('/update-user-image', UserController.updateUserWithImage);


// Route Level Middleware - To Protect Route
router.use('/changepassword', checkUserAuth);
router.use('/loggeduser', checkUserAuth);

// Protected Routes
router.post('/changepassword', UserController.changeUserPassword);
router.get('/loggeduser', UserController.loggedUser);

// Updated route to support sorting
router.get('/users', UserController.getAllUsers);
const upload = multer({ dest: 'uploads/' }); // Temporary folder for file uploads

// Define the route
router.post('/usersurl', upload.single('image'), async (req, res) => {
    try {
        const localFilePath = req.file.path; // Get the file path from multer

        // Call the uploadOnCloudinary function
        const uploadResult = await uploadOnCloudinary(localFilePath);

        if (!uploadResult) {
            return res.status(500).json({ message: 'Upload to Cloudinary failed' });
        }

        // Send a success response
        res.status(200).json({
            message: 'Upload successful',
            data: uploadResult,
        });
    } catch (error) {
        console.error('Error uploading file:', error.message);
        res.status(500).json({
            message: 'An error occurred during upload',
            error: error.message,
        });
    }
});


router.get('/exportUser', UserController.exportUser);




export default router;
