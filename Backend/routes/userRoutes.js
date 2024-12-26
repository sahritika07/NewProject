import express from 'express';

const router = express.Router();
import UserController from '../controllers/userController.js';
import checkUserAuth from '../middlewares/auth-middleware.js';

//Public Routes

router.post('/register', UserController.userRegistration)
router.post('/login', UserController.userLogin)
router.post('/send-reset-password-email', UserController.sendUserPassResetEmail)
router.post('/reset-password/:id/:token', UserController.userPasswordReset)
router.post('/users', UserController.addUser);



// Delete users
router.delete('/deleteUsers', UserController.deleteUser );
router.put('/updateUsers', UserController.updateUser );

//Route Level Middleware - To Protect Route

router.use('/changepassword', checkUserAuth)
router.use('/loggeduser', checkUserAuth)


//Protected Routes

router.post('/changepassword', UserController.changeUserPassword)
router.get('/loggeduser', UserController.loggedUser)
router.get('/users', UserController.getAllUsers);

export default router