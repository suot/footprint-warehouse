let mongoose = require('mongoose');
const db = require('../dbConnectionString');
mongoose.connect(db.db_Warehouse);

let typeWhSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        default: new mongoose.Types.ObjectId()
    },
    type: String
});


module.exports = mongoose.model('Type_wh', typeWhSchema, 'types_wh');