import mongoose from "mongoose";
import { Orders } from "../models/orders-model.js";
import { Users } from "../models/users-model.js";
import { handleError } from "../utils/helpers.js";
import HttpError from "../models/http-error.js";

const getOrderById = async (req, res, next) => {
  try {
    const order = await Orders.findById(req.params.oid);
    if (!order) return handleError(null, next, "Order not found", 404);
    res.status(200).json({ order });
  } catch (err) {
    handleError(err, next, "Could not retrieve order");
  }
};

const getOrdersByUserId = async (req, res, next) => {
  try {
    const userOrders = await Orders.find({ creator: req.params.uid });
    // if (!userOrders.length)
    //   return handleError(null, next, "No orders found for this user", 404);
    res.status(200).json({
      orders: userOrders.map((order) => order.toObject({ getters: true })),
    });
  } catch (err) {
    handleError(err, next, "Fetching orders failed");
  }
};

const createOrder = async (req, res, next) => {
  const { creator, ...orderData } = req.body;

  try {
    const user = await Users.findById(creator);
    if (!user) return next(new HttpError("User not found", 404));

    const newOrder = new Orders({ ...orderData, creator });

    const sess = await mongoose.startSession();
    sess.startTransaction();
    await newOrder.save({ session: sess });
    user.orders.push(newOrder);
    await user.save({ session: sess });
    await sess.commitTransaction();

    res.status(201).json({ order: newOrder });
  } catch (err) {
    console.log("Creating order failed-->", err);
    return next(new HttpError("Could not create order", 500));
  }
};

const deleteOrderById = async (req, res, next) => {
  console.log(req.params.oid);
  try {
    const order = await Orders.findById(req.params.oid).populate("creator");
    console.log("order", order);
    if (!order) return handleError(null, next, "Order not found", 404);

    const sess = await mongoose.startSession();
    sess.startTransaction();
    await order.deleteOne({ session: sess });
    order.creator.orders.pull(order);
    await order.creator.save({ session: sess });
    await sess.commitTransaction();
    res.status(200).json({ message: "Deleted order successfully" });
  } catch (err) {
    handleError(err, next, "Could not delete order");
  }
};

export { getOrderById, getOrdersByUserId, createOrder, deleteOrderById };
