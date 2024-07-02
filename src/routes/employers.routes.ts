import { Router } from "express";
import validate from "../middleware/registratioinValidator.middleware"
import { upload } from "../middleware/multer.middleware"
import { registerUser, loginUser, logoutUser } from "../controllers/employers.controllers";
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
router.route("/logout").post(verifyJWT("employer"), logoutUser)
// router.route("/refresh-token").post(refreshAccessToken)
// router.route("/change-password").post(verifyJWT, changeCurrentPassword)
// router.route("/current-user").get(verifyJWT, getCurrentUser)
// router.route("/update-account").patch(verifyJWT, updateAccountDetails)

// router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
// router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

// router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
// router.route("/history").get(verifyJWT, getWatchHistory)

export default router