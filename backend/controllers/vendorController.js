const { db } = require("../models/connection");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const CustomError = require("../utils/customError");
const signToken = require("../utils/signToken");

const Vendor = db.Vendor;
const Address = db.Address;
// vivek-------------
// ------------- CREATE A VENDOR --------------

exports.createVendor = asyncErrorHandler(async (req, res, next) => {
  // vivek
  const { firstName, lastName, shopName, email, contact, password, confirmPassword, address_lane1, address_lane2, landmark, pincode, state, role } =
    req.body;
  // const vendor = await Vendor.create({
  //   firstName,
  //   lastName,
  //   shopName,
  //   email,
  //   password,
  //   confirmPassword,
  // });
  // let vendorAddress = null;
  // if (vendor && vendor.id) {
  //   const roleId = vendor.id;
  //   vendorAddress = await Address.create({
  //     address_lane1,
  //     address_lane2,
  //     landmark,
  //     pincode,
  //     state,
  //     contact,
  //     role,
  //     roleId,
  //   });
  // }

  // ---------- CREATE WITH ASSOCIATIONS --------------
  const vendor = await Vendor.create(
    //vivek
    {
      firstName,
      lastName,
      shopName,
      email,
      password,
      confirmPassword,
      Address_Details: {
        address_lane1,
        address_lane2,
        landmark,
        pincode,
        state,
        contact,
        role,
        // roleId,
      },
    },
    {
      include: [db.vendorsAddress],
    }
  ); //vivek

  // to prenent showind password in responses
  vendor.password = undefined;

  const token = signToken(vendor.id);

  res.cookie("jwt", token, {
    maxAge: process.env.LOGIN_EXPIRES,
    // secure:true,
    httpOnly: true,
  });

  res.status(201).json({
    status: "success",
    data: {
      vendor,
    },
  });
});

// ------------- GET ALL  VENDORS --------------

exports.getAllVendors = asyncErrorHandler(async (req, res, next) => {
  const vendors = await Vendor.findAll({
    include: [
      {
        model: Address,
        as: "Address_Details",
        // attributes: [],
      },
    ],
    attributes: ["id", "firstName", "lastName", "shopName", "email"],
  });

  res.status(200).json({
    status: "success",
    count: vendors.length,
    data: {
      vendors,
    },
  });
});

// // ------------- GET A SPECIFIC VENDOR --------------

exports.getASpecificVendor = asyncErrorHandler(async (req, res, next) => {
  const id = req.params.id;
  const vendor = await Vendor.findOne({
    include: [
      {
        model: Address,
        as: "Address_Details",
        // attributes: [],
      },
    ],
    attributes: ["id", "firstName", "lastName", "shopName", "email"],
    where: {
      id,
    },
  });
  if (!id || !vendor) {
    if (!id) {
      const error = new CustomError("please give id in parameters", 400);
      return next(error);
    }
    if (!vendor) {
      const error = new CustomError("Vendor for the given id does not exist", 404);
      return next(error);
    }
  }

  res.status(200).json({
    status: "success",
    data: {
      vendor,
    },
  });
});

// ------------- DELETE A VENDOR -----------
exports.deleteVendor = asyncErrorHandler(async (req, res, next) => {
  const id = req.params.id;
  const vendor = await Vendor.findByPk(id, {
    include: [
      {
        model: Address,
        as: "Address_Details",
        // attributes: [],
      },
    ],

    where: {
      id,
    },
  });
  if (!id || !vendor) {
    if (!id) {
      const error = new CustomError("please give id in parameters", 400);
      return next(error);
    }
    if (!vendor) {
      const error = new CustomError("Vendor for the given id does not exist", 404);
      return next(error);
    }
  }

  await Vendor.destroy({ where: { id } });
  await Address.destroy({ where: { role: "vendor", roleId: id } });

  res.status(200).json({
    status: "success",
    message: "vendor has been deleted successfully.",
  });
});

// -------------- UPDATE VENDOR -------------

exports.updateVendor = asyncErrorHandler(async (req, res, next) => {
  const id = req.params.id;
  const vendor = await Vendor.findByPk(id, {
    include: [
      {
        model: Address,
        as: "Address_Details",
      },
    ],

    where: {
      id,
    },
  });
  if (!id || !vendor) {
    if (!id) {
      const error = new CustomError("please give id in parameters", 400);
      return next(error);
    }
    if (!vendor) {
      const error = new CustomError("Vendor for the given id does not exist", 404);
      return next(error);
    }
  }
  const { firstName, lastName, shopName, email, contact, password, confirmPassword, address_lane1, address_lane2, landmark, pincode, state, role } =
    req.body;

  if (password || confirmPassword) {
    const error = new CustomError("you can not update password using this end point", 400);
    return next(error);
  }
  if (role) {
    const error = new CustomError("you can not update role using this end point", 400);
    return next(error);
  }
  const updateVendor = await Vendor.update(
    { firstName, lastName, shopName, email },
    {
      where: { id },
      returning: true,
      plain: true,
    }
  );

  // console.log(updateVendor[1].dataValues);
  // to prevent showing password in response.
  updateVendor[1].dataValues.password = undefined;

  const updateVendorAddress = await Address.update(
    { address_lane1, address_lane2, landmark, pincode, state, contact },
    {
      where: { role: "vendor", roleId: id },
      returning: true,
      plain: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: {
      updatedVendor: updateVendor[1].dataValues,
      updatedVendorAddress: updateVendorAddress[1].dataValues,
    },
  });
});

// ============ update Vendor Password================
exports.updatePassword = asyncErrorHandler(async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const vendor = req.vendor;

    // Update password in the database

    // Check if current password matches
    const isPasswordValid = await vendor.comparePasswordInDb(currentPassword, vendor.password);
    if (!isPasswordValid) {
      const error = new CustomError("Current password is incorrect", 400);
      return next(error);
    }

    if (newPassword !== confirmPassword) {
      const error = new CustomError("New password and confirm password do not match", 400);
      return next(error);
    }

    vendor.password = newPassword;
    vendor.lastPasswordChange = Date.now(); // Update the timestamp of the last password change
    await vendor.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
});
