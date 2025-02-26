import express from "express";
import {
  createOrder,
  deleteOrderById,
  getOrderById,
  getOrdersByUserId,
} from "../controllers/orders-controllers.js";
import authCheck from "../middleware/auth-check.js";

const router = express.Router();

router.use(authCheck);

router.get("/:oid", getOrderById);

router.get("/user/:uid", getOrdersByUserId);

router.post("/", createOrder);

router.delete("/:oid", deleteOrderById);

export default router;
