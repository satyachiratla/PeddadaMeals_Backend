import mongoose from "mongoose";
import { Addresses } from "../models/addresses-model.js";
import HttpError from "../models/http-error.js";
import { Users } from "../models/users-model.js";
import { handleError } from "../utils/helpers.js";

export const getAddressesByUserId = async (req, res, next) => {
  try {
    const userAddresses = await Addresses.find({ creator: req.params.uid });
    // if (!userAddresses.length) {
    //   return handleError(null, next, "No addresses found for this user", 404);
    // }
    res.status(200).json({
      addresses: userAddresses.map((address) =>
        address.toObject({ getters: true })
      ),
    });
  } catch (err) {
    handleError(err, next, "Fetching addresses failed");
  }
};

export const createAddress = async (req, res, next) => {
  const { creator, ...addressData } = req.body;

  try {
    const user = await Users.findById(creator);
    if (!user) return next(new HttpError("User not found", 404));

    const newAddress = new Addresses({ ...addressData, creator });

    const sess = await mongoose.startSession();
    sess.startTransaction();
    await newAddress.save({ session: sess });
    user.addresses.push(newAddress);
    await user.save({ session: sess });
    await sess.commitTransaction();

    res.status(201).json({ address: newAddress });
  } catch (err) {
    console.log("addressError-->", err);
    return next(new HttpError("Could not create address", 500));
  }
};

export const updateAddress = async (req, res, next) => {
  const { name, address, landmark, pincode, type } = req.body;
  const addressId = req.params.aid;

  try {
    const foundAddress = await Addresses.findById(addressId);
    if (!foundAddress) return handleError(null, next, "Address not found", 404);

    if (foundAddress.creator.toString() !== req.userData.userId) {
      return handleError(
        null,
        next,
        "You are not allowed to edit this address",
        401
      );
    }

    foundAddress.name = name;
    foundAddress.address = address;
    foundAddress.landmark = landmark;
    foundAddress.pincode = pincode;
    foundAddress.type = type;

    await foundAddress.save();

    res.status(200).json({ address: foundAddress.toObject({ getters: true }) });
  } catch (err) {
    console.log("updateErr--->", err);
    handleError(err, next, "Could not update address");
  }
};

export const deleteAddress = async (req, res, next) => {
  const addressId = req.params.aid;

  try {
    const address = await Addresses.findById(addressId).populate("creator");
    if (!address) return handleError(null, next, "Address not found", 404);

    if (address.creator.id !== req.userData.userId) {
      return handleError(
        null,
        next,
        "You are not allowed to delete this address",
        401
      );
    }

    const sess = await mongoose.startSession();
    sess.startTransaction();
    await address.deleteOne({ session: sess });
    address.creator.addresses.pull(address);
    await address.creator.save({ session: sess });
    await sess.commitTransaction();

    res.status(200).json({ message: "Address deleted successfully" });
  } catch (err) {
    handleError(err, next, "Could not delete address");
  }
};
