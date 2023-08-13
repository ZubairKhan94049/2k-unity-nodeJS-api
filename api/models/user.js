const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    country: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    username: { type: String, required: true },
    height: { type: Number, required: true },
    forgotToken: {type : String, default : ""},
});

module.exports = mongoose.model('User', userSchema);
