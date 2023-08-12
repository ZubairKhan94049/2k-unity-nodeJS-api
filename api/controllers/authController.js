const { default: mongoose } = require("mongoose");
const User = require("../modals/user");
const bcrypt = require("bcrypt");

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
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash,
                        });
                        user.save()
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
                console.log(`LENGTH IS : ${user.length}`);
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

    delete: async (req, res, next)=>{
        const id = req.params.userID;
        User.findByIdAndDelete(id).exec().then(result=> {
            return res.status(200).json({
                message : "User Deleted Successfully"
            })
        }).catch(err => {
            return res.status(500).json({
                error : err,
            });
        })
    
    },

    get_all_users : async (req, res, next)=>{
        User.find().select('email').exec().then(docs => {
            return res.status(200).json(docs);
        }).catch(err => {
            return res.status(404).json({
                error : err,
            })
        });
    },

}