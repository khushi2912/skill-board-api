const jwt = require('jsonwebtoken')
const mongoose = require('mongoose');

const Student = require('../models/student');
const Superuser = require('../models/superuser');
const UnverifiedProfile = require('../models/unverifiedProfiles');
const Otp = require('../models/otp');

const Email = require('../controllers/email');


//create and send an OTP
function getOTP() {
    return Math.floor(100000 + Math.random() * 900000);
}

exports.cleanCollection = async(req, res) => {
    Otp.remove({})
        .then(doc => {
            console.log("removed all residue OTPs");
        })
}

//send an OTP to the user
exports.resetStudentPassword = async(req, res) => {
    let randomNumber = getOTP();
    let id = req.params.id;
    let email = "";
    await Student.findById({ _id: id })
        .then(doc => {
            email = doc.email;
        })
        .catch(err => {
            res.status(401).json({
                message: "internal server error",
                error: err
            })
        })

    const otp = new Otp({
        _id: new mongoose.Types.ObjectId,
        otp: randomNumber,
        role: "student",
        email: email,
        userId: id
    });

    Email.forgot_password(email, randomNumber);
    await otp.save()
        .then(doc => {
            res.status(200).json({
                message: "doc",
                otp: doc
            })
        })
        .catch(err => {
            res.status(401).json({
                message: "internal server error",
                error: err
            })
        })
}

exports.resetUnverifiedProfilePassword = async(req, res) => {
    let randomNumber = getOTP();
    let id = req.params.id;
    let email = "";
    await UnverifiedProfile.findById({ _id: id })
        .then(doc => {
            email = doc.email;
        })
        .catch(err => {
            res.status(401).json({
                message: "internal server error",
                error: err
            })
        })

    const otp = new Otp({
        _id: new mongoose.Types.ObjectId,
        otp: randomNumber,
        role: "unverifiedProfile",
        email: email,
        userId: id
    });

    Email.forgot_password(email, randomNumber);
    await otp.save()
        .then(doc => {
            res.status(200).json({
                message: "doc",
                otp: doc
            })
        })
        .catch(err => {
            res.status(401).json({
                message: "internal server error",
                error: "err"
            })
        })
}

exports.resetSuperuserPassword = async(req, res) => {
    let randomNumber = getOTP();
    let id = req.params.id;
    let email = "";
    await Superuser.findById({ _id: id })
        .then(doc => {
            email = doc.email;
        })
        .catch(err => {
            res.status(401).json({
                message: "internal server error",
                error: "err"
            })
        })

    const otp = new Otp({
        _id: new mongoose.Types.ObjectId,
        otp: randomNumber,
        role: "superuser",
        email: email,
        userId: id
    });

    await otp.save()
        .then(doc => {
            res.status(200).json({
                message: "doc",
                otp: doc
            })
        })
        .catch(err => {
            res.status(401).json({
                message: "internal server error",
                error: "err"
            })
        })
}

//verify the OTPs
exports.verifyOTP = async(req, res) => {
    await Otp.findOne({ otp: req.body.OTP })
        .then(doc => {
            const token = jwt.sign({
                id: doc.userId,
                role: doc.role,
                task: "forgot password"
            }, process.env.JWT_KEY, {
                expiresIn: 60 * 10 //token valid for next 10 mins only
            })

            res.status(200).json({
                message: "use this token for sending updated password",
                token: token
            })

        })
        .catch(err => {
            res.status(401).json({
                message: "internal server error",
                error: err
            })
        })
    await Otp.findOneAndDelete({ otp: req.body.OTP })
        .catch(err => {
            res.status(401).json({
                message: "internal server error",
                error: err
            })
        })
}