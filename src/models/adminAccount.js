const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const Schema = mongoose.Schema;

const AdminAccount = new Schema({
    username: String,
    password: String,
    name: String,
    address: String,
    phoneNumber: String,
    role: Number,
    status: { type: String, default: 'ACTIVE' },

}, { timestamps: true });

AdminAccount.plugin(mongoosePaginate);

// Model name => collection
module.exports = mongoose.model('AdminAccount', AdminAccount, 'AdminAccount');