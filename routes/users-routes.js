import express from "express";
import {
  deleteUser,
  forgortPassword,
  getUserById,
  getUsers,
  logout,
  refreshAccessToken,
  resetPassword,
  signin,
  signup,
  updateProfile,
} from "../controllers/users-controllers.js";
import { check } from "express-validator";
import authCheck from "../middleware/auth-check.js";

const router = express.Router();

router.get("/", getUsers);
router.get("/:uid", getUserById);
router.post(
  "/signup",
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 8 }),
  ],
  signup
);
router.post("/signin", signin);

router.post("/user/refresh-token", refreshAccessToken);
router.post("/user/logout", logout);

router.post("/forgot-password", forgortPassword);
router.post("/reset-password", resetPassword);

router.use(authCheck);

router.patch("/:uid", updateProfile);

router.delete("/:uid", deleteUser);

export default router;
