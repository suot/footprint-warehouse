let mongoose = require('mongoose');

const db = require('../dbConnectionString');

mongoose.connect(db.db_Warehouse1);


let cityWhSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId
    },
    country: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    latlng:{
        lat:{
            type: Number,
            required: true,
        },
        lng:{
            type: Number,
            required: true,
        }
    }
});


module.exports = mongoose.model('City_wh', cityWhSchema, 'cities_wh');