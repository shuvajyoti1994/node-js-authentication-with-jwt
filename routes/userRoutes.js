import express from 'express';
const router = express.Router();
import UserController from '../controllers/usercontroller.js';
import checkUser from '../middlewares/auth-middleware.js'

//Use middleware to Protect routes
router.use('/changepassword',checkUser)
router.use('/loggeduser',checkUser)



//Public Routes
router.post('/register',UserController.userRegistration)

router.post('/login',UserController.userLogin)

router.post('/send-reset-password',UserController.sendUserPasswordResetEmail)


router.post('/reset-password/:id/:token',UserController.userPasswordReset)


//Protected Routes
router.post('/changepassword',UserController.changeUserPassword)
router.get('/loggeduser',UserController.loggedUser)



export default router;