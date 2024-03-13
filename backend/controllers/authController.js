const db = require('./../models/connection');
const asyncErrorHandler = require('./../utils/asyncErrorHandler');
const jwt = require('jsonwebtoken');
const CustomError = require('./../utils/customError');

const Vendor = db.db.Vendor;
const Address = db.db.Address;

const signToken = id => {
    return jwt.sign({ id }, process.env.SECRET_STR, {
        expiresIn: process.env.LOGIN_EXPIRES
    });

}



// ===========================================SIGNUP==================================================== //

exports.signup = asyncErrorHandler(async (req, res, next) => {
    const { shopName, contact, email, password, confirmPassword, addressDetails } = req.body;

    // Check if the vendor with the provided email already exists
    const existingVendor = await Vendor.findOne({ where: { email } });
    if (existingVendor) {
        throw new CustomError("Vendor with this email already exists", 400);
    }


    // Create a new vendor with the provided data
    const newVendor = await Vendor.create({
        shopName,
        contact,
        email,
        password,
        confirmPassword,
    });


    // Create a new address associated with the new vendor
    const newAddress = await Address.create({
        ...addressDetails,
        role: "vendor",
        roleId: newVendor.id,
    });

    // Generate JWT token
    const token = signToken(newVendor.id);

    // Return token to the client

    res.status(201).json({
        status: "success",
        token: token,
        data: {
            vendor: newVendor,
            add: newAddress,
        },
    });
});

// ===========================================LOGIN==================================================== //

exports.login = asyncErrorHandler(async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
        const error = new CustomError('Please provide email ID & Password for login in!', 400);
        return next(error);
    }

    //Check if vendor exists
    const vendor = await Vendor.findOne({
        where: {
            email
        }
    })



    //if vendor exists and password match
    if (!vendor || !(await vendor.comparePasswordInDb(password, vendor.password))) {
        const error = new CustomError('Incorrect email or password', 400);
        return next(error);
    }

    const token = signToken(vendor.id);

    res.status(200).json({
        status: 'success',
        token,
        vendor
    })
});


