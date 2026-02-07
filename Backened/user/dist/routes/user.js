import express from 'express';
import { getAllusers, loginUser, myProfile, verifyUser, getAUser, updateName } from '../controllers/user.js';
import { isAuth } from '../middleware/isAuth.js';
const router = express.Router();
router.post("/login", loginUser);
router.post("/verify", verifyUser);
router.get("/me", isAuth, myProfile);
router.get("/user/all", isAuth, getAllusers);
router.get("/user/:id", getAUser);
router.post("/user/update", isAuth, updateName);
export default router;
//# sourceMappingURL=user.js.map