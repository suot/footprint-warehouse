let mongoose = require('mongoose');

const db = require('../dbConnectionString');
mongoose.connect(db.db_Warehouse1);

let factSchema = new mongoose.Schema({
    //_id: String,
    city: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'City_wh'
    },
    start: Date,
    type: String,
    userId: String,
    cost: Number,
    rating: Number,
    footprints: [],
    createdAt: Date
})



module.exports = mongoose.model('Fact', factSchema, 'fact')
