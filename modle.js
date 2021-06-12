const mongoose = require('mongoose');

// creat schema=================================

const registerSchema = new mongoose.Schema({
    username: { type: String, require: true },
    email: { type: String, require: true },
    password: { type: String, require: true },
    massage: String,
});

// schema created===============================

module.exports = new mongoose.model('user', registerSchema);