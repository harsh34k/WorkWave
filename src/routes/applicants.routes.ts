import { Router } from "express";
import validate from "../middleware/authValidator.middleware"
import { upload } from "../middleware/multer.middleware"
import { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, getAllAppliedJobs } from "../controllers/applicant.controllers";
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
    validate<RegistrationData>(registrationSchema),
    registerUser
)


router.route("/login").post(validate<LoginData>(loginSchema), loginUser)

//secured routes
router.route("/logout").post(verifyJWT("applicant"), logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT("applicant"), changeCurrentPassword)
router.route("/current-user").get(verifyJWT("applicant"), getCurrentUser)
router.route("/update-account").patch(verifyJWT("applicant"), updateAccountDetails)

router.route("/avatar").patch(verifyJWT("applicant"), upload.single("avatar"), updateUserAvatar)
router.get('/c/applied-jobs', verifyJWT('applicant'), getAllAppliedJobs);


export default router