import express from "express";
import {
  createAddress,
  deleteAddress,
  getAddressesByUserId,
  updateAddress,
} from "../controllers/addresses-controllers.js";
import authCheck from "../middleware/auth-check.js";

const router = express.Router();

router.use(authCheck);

router.get("/:uid", getAddressesByUserId);
router.post("/", createAddress);
router.patch("/:aid", updateAddress);
router.delete("/:aid", deleteAddress);

export default router;
