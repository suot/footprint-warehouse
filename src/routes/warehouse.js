const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')

const Fact = require('../models/warehouse/Fact.model');
const City_wh = require('../models/warehouse/City_wh.model');

const redis = require("redis");
const client = redis.createClient();

//synchronize data from source databases to warehouse
router.post('/warehouse/add', async function(req, res) {
    if(!req.body){
        return res.status(400).send('Request body is missing')
    }

    const travelList = req.body;
    console.log("length: ", travelList.length);

    if(travelList !== null && travelList.length>0) {
        addTravel(res, travelList, 0);
    }else{
        res.status(500).send("Failed to synchronize data to warehouse");
    }
});

addTravel = (res, travels, i) => {
    if(i < travels.length){
        let travel = travels[i];

        City_wh.findOne({ country: travel.city.country, name: travel.city.name }).then( doc => {

            if(!doc || doc.length === 0){
                let cityModel = new City_wh({
                    _id: new mongoose.Types.ObjectId(),
                    country: travel.city.country,
                    name: travel.city.name,
                    latlng: travel.city.latlng
                })

                cityModel.save().then( newCity => {

                    console.log(i, "1", newCity._id);
                    insertIntoFact(res, travels, i, newCity._id);

                }).catch(err => res.status(500))
            }else{
                console.log(i, "2", doc._id)
                insertIntoFact(res, travels, i, doc._id);
            }
        }).catch( err => res.status(500))
    }else{
        res.status(200).send("Synchronize data to warehouse successfully");
    }

    // //save into cities_wh and get cityId
    // let city = {
    //     country: travel.city.country,
    //     name: travel.city.name,
    //     latlng: travel.city.latlng
    // }
    // let promise2 = await City_wh.findOne({ country: city.country, name: city.name }).then( async doc => {
    //     if(!doc || doc.length === 0){
    //         await (new City_wh(city)).save().then( newCity => {
    //             cityId = newCity._id;
    //         }).catch(err => res.status(500))
    //     }else{
    //         cityId = doc._id;
    //     }
    //     console.log(i, 'city ', cityId)
    // }).catch( err => res.status(500))
    //
    //
    // //save into types_wh and get typeId
    // let type = {
    //     type: travel.travelType
    // };
    // let promise3 = await Type_wh.findOne({ type: type.type }).then( async doc => {
    //     if(!doc || doc.length === 0){
    //         await (new Type_wh(type)).save().then( newType => {
    //             typeId = newType._id;
    //         }).catch(err => res.status(500))
    //     }else{
    //         typeId = doc._id;
    //     }
    //     console.log(i, 'type ', typeId)
    //
    // }).catch( err => res.status(500))
    //
    // Promise.all([promise1, promise2, promise3]).then( async () => {
    //     if(cityId===''||typeId===''||startId===''){
    //         console.log("Error occurs when synchronizing: ", i, "cityId ", cityId, "typeId ", typeId, "startId ", startId);
    //     }else{
    //         let factModel = new Fact({
    //             _id: travel._id,
    //             city: cityId,
    //             type: typeId,
    //             start: startId,
    //             userId: travel.userId,
    //             rating: travel.rating,
    //             cost: travel.cost,
    //             createdAt: travel.createdAt
    //         })
    //         await factModel.save().then().catch( err => res.status(500));
    //     }
    // })
    //
};

insertIntoFact =  (res, travels, i, cityId) => {
    let factModel = new Fact({
        _id: travels[i]._id,
        city: cityId,
        type: travels[i].travelType,
        start: travels[i].startDate,
        userId: travels[i].userId,
        rating: travels[i].rating,
        cost: travels[i].cost,
        createdAt: travels[i].createdAt
    })

    factModel.save().then(()=>{}).catch( err => res.status(500));

    addTravel(res, travels, ++i);
};


// Delete sample data from warehouse
router.delete('/warehouse/delete', (req, res) => {
    let userId = 'Shq0mT4HMBRQ7EGJkeWiw3tcSal1';
    Fact.find({userId: userId}).then( async travelList => {
        if(travelList !== null && travelList.length>0) {
            for (let j = 0; j < travelList.length; j++) {
                await Fact.findByIdAndDelete(travelList[j]._id).then().catch(err => {res.status(500)});
            }
            res.status(202).send("Delete sample data from warehouse successfully!");
        }else{
            res.status(500).send("Failed to delete data from warehouse");
        }

    }).catch( err => res.status(500))
});


//query the top 10 metropolises in 2018 rankin by their average rating.
//query goes to the redis database if the key(query string) is fetched in redis, otherwise to the warehouse.
router.post('/warehouse/cityList', (req, res) => {
    if(!req.body){
        return res.status(400).send('Request body is missing')
    }

    const query = req.body;
    const redisKey = query.number.toString() + "_" + query.type.toString();

    client.get(redisKey, function(err, reply) {
        if(reply){
            console.log("returned from redis with the key of ", redisKey);
            res.status(200).send(JSON.parse(reply));
        }else{
            let type = query.type.toString();
            let number = Number.parseInt(query.number);
            // let type = "metropolis";
            // let number = 10;
            //console.log("type", type, "number", number);

            let groupBy = [
                { "$match": {$and:[{type: type}]}},
                { $lookup: {from: 'cities_wh', localField: 'city', foreignField: '_id', as: 'city1'} },
                {
                    $group: {
                        _id: "$city1",
                        avgRating: {$avg: "$rating"},
                    }
                },
                { "$sort": {avgRating: -1} }
            ];

            // Fact.find({type: type}, {start:regex}).populate('city_wh').aggregate(groupBy).sort({avgRatings: -1}).limit(3).then( cityList => {
            Fact.aggregate(groupBy).limit(number).then( result => {
                let cityList=[];
                result && result.map(row=>{
                    let record = (row._id)[0];
                    let city = {
                        name: record.name,
                        country: record.country,
                        latlng: record.latlng,
                        avgRating: row.avgRating,
                        _id: record._id
                    };
                    cityList.push(city);
                });

                console.log("returned from warehouse");
                client.set(redisKey, JSON.stringify(cityList));
                res.status(200).send(cityList);
            }).catch( () => res.status(500))
        }
    });

});



module.exports = router;