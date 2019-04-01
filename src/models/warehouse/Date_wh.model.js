let mongoose = require('mongoose');
const db = require('../dbConnectionString');
mongoose.connect(db.db_Warehouse);

let dateWhSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        default: new mongoose.Types.ObjectId()
    },
    date: Number,
    month: Number,
    year: Number
});


module.exports = mongoose.model('Date_wh', dateWhSchema, 'dates_wh');