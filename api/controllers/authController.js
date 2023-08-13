const { default: mongoose } = require("mongoose");
const User = require("../modals/user");
const bcrypt = require("bcrypt");
const nodeMailer = require("nodemailer");
const randomString = require("randomstring");
const jwt = require("jsonwebtoken");



const sendResetPasswordMail = async (res, name, email, token) => {
    try {
        let transporter = nodeMailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.SMPT_EMAIL,
                pass: process.env.SMPT_KEY,
            },
        });

        transporter.sendMail({
            from: 'apptexcontrol@gmail.com', // Replace with your email address
            to: email,
            subject: 'Password Reset',
            html: `
                <h3>Hello ${name},</h3>
                <p>You have requested to reset your password. Use the following link for verification:</p>
                <p><strong><a href="http://localhost:3000/users/reset-password?token=${token}">Click Here</a></strong></p>
                <p>If you didn't request this reset, you can safely ignore this email.</p>
                <p>Regards,</p>
                <p>Your Application Team</p>
            `,
        }, (err, info) => {
            if (err) {
                return res.status(200).json({
                    success: false,
                    message: "Email sending failed",
                    error: err.message,
                });
            } else {
                console.log(`SUCCESSSED ${info.response}`);
                return res.status(200).json({
                    success: true,
                    message: `We sent an email to ${email}, please check`,
                });
            }
        });

    } catch (error) {
        return res.status(200).json({
            success: false,
            message: "SMTP Server not working ...",
            error: err.message,
        })
    }
};

module.exports = {
    signup: async (req, res, next) => {
        User.find({ email: req.body.email }).exec().then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    message: `${req.body.email} already exist`,
                });
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err,
                        });
                    } else {
                        const newUser = new User({
                            _id: new mongoose.Types.ObjectId(),
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            email: req.body.email,
                            password: hash,
                            gender: req.body.gender,
                            country: req.body.country,
                            dateOfBirth: new Date(req.body.dateOfBirth),
                            username: req.body.username,
                            height: req.body.height,
                        });
                        newUser.save()
                            .then(result => {
                                res.status(201).json({
                                    message: "User created",
                                    result: result,
                                });
                            })
                            .catch(error => {
                                res.status(500).json({
                                    error: error,
                                })
                            });
                    }
                });
            }
        });
    },
    login: async (req, res, next) => {
        User.find({ email: req.body.email })
            .exec()
            .then(user => {
                if (user.length < 1) {
                    return res.status(401).json({
                        message: "Auth Failed, USER NOT FOUND",
                    });
                }
                bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                    if (err) {
                        return res.status(401).json({
                            message: "Auth Failed: PASSWORD COMPARISION ERROR",
                        })
                    }
                    if (result) {
                        const token = jwt.sign(
                            {
                                email: user[0].email,
                                userId: user[0]._id,
                            },
                            process.env.JWT_KEY,
                            {
                                expiresIn: "1h",

                            }
                        );
                        return res.status(200).json({
                            message: "Auth Succeeded",
                            token: token,
                        });
                    } else {
                        return res.status(401).json({
                            message: "Auth Failed",
                        })
                    }
                });
            })
            .catch(err => {
                return res.status(500).json({
                    error: err,
                });
            });
    },

    delete: async (req, res, next) => {
        const id = req.params.userID;
        User.findByIdAndDelete(id).exec().then(result => {
            return res.status(200).json({
                message: "User Deleted Successfully"
            })
        }).catch(err => {
            return res.status(500).json({
                error: err,
            });
        })

    },

    get_all_users: async (req, res, next) => {
        User.find().exec().then(docs => {
            return res.status(200).json(docs);
        }).catch(err => {
            return res.status(404).json({
                error: err,
            })
        });
    },

    forgot_password: async (req, res, next) => {
        try {
            try {
                const uEmail = req.body.email;
                const user = await User.findOne({ email: uEmail });

                console.log("User found:", user);

                if (user) {
                    const rndString = randomString.generate();
                    user.forgotToken = rndString; // Update the forgotToken field
                    await user.save(); // Save the updated user back to the database

                    sendResetPasswordMail(res, user.name, user.email, rndString);
                    return res.status(200).json({
                        success: true,
                        message: "Please check your email",
                        OTP: rndString
                    });
                } else {
                    console.log("User not found");
                    return res.status(200).json({
                        message: "USER NOT FOUND",
                    });
                }
            } catch (error) {
                console.error("Error updating user:", error);
                return res.status(500).json({
                    success: false,
                    message: "An error occurred while updating user data.",
                });
            }

        } catch (error) {
            return res.status(200).json({
                success: false,
                message: "AN ERROR HAS OCCURED",
                error: error,
            });
        }
    },

    reset_password: async (req, res, next) => {
        const reqToken = req.query.token;
        const newPassword = req.body.newPassword;
        console.log(newPassword);
        if (newPassword.length < 8) {
            return res.status(200).json({
                message: "Password length must be greater than 7",
            })
        } else {
            const userData = await User.findOne({ forgotToken: reqToken });
            if (userData) {
                bcrypt.hash(newPassword, 10, (err, hash) => {

                    if (err) {
                        return res.status(500).json({
                            error: err,
                        });
                    } else {
                        userData.password = hash;
                        userData.forgotToken = ""; // Reset Token 

                        userData.save().then(result => {
                            res.status(201).json({
                                message: "Password Changed ...",
                                result: result,
                            });
                        })
                            .catch(error => {
                                res.status(500).json({
                                    error: error,
                                });
                            });
                    }
                });

            } else {
                return res.status(400).json({
                    message: "User not found",
                })
            }
        }

    }

}