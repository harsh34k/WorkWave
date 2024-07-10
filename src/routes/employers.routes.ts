import { Response, Router } from "express";
import validate from "../middleware/authValidator.middleware"
import { upload } from "../middleware/multer.middleware"
import { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, getAllCreatedJobs } from "../controllers/employers.controllers";
import { RegistrationData, registrationSchema } from "../Validators/registrationValidator";
import { LoginData, loginSchema } from "../Validators/loginValidator";
import { verifyJWT } from "../middleware/auth";


const router = Router()

// router.route("/register").post(
//     registerUser
// )
router.route("/register").post(
    upload.fields([
        {
            name: "avatarUrl",
            maxCount: 1
        },
    ]),
    // upload.single('avatarUrl'),
    validate<RegistrationData>(registrationSchema),
    registerUser
)


router.route("/login").post(validate<LoginData>(loginSchema), loginUser)

//secured routes
router.route("/logout").post(verifyJWT("employer"), logoutUser) //verifyJWT("employer"),
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").put(verifyJWT("employer"), changeCurrentPassword)
router.route("/current-user").get(verifyJWT("employer"), getCurrentUser)
router.route("/update-account").patch(verifyJWT("employer"), updateAccountDetails)

router.route("/avatar").patch(verifyJWT("employer"), upload.single("avatar"), updateUserAvatar)
router.get('/c/created-jobs', verifyJWT('employer'), getAllCreatedJobs);
router.get('/set-random-cookie', (_, res: Response) => {
    const randomValue = "hello"; // Generate a random UUID
    const options = {
        httpOnly: true,
        // secure: process.env.NODE_ENV === 'production', // Set secure flag in production
    };
    console.log("in setting random cookie");


    res.cookie('randomCookie', randomValue, options);
    res.status(200).json({ message: 'Random cookie set', value: randomValue });
    return "great";
});


export default router