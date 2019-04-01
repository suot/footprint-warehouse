const db_Canada = 'mongodb+srv://footprint:footprint@cluster-warehouse-sodef.mongodb.net/footprint_Canada?retryWrites=true';
const db_Warehouse = 'mongodb+srv://footprint:footprint@cluster-warehouse-sodef.mongodb.net/footprint_Warehouse?retryWrites=true';
const db_Asia = 'mongodb+srv://footprint:footprint@footprint-asia-hk-c8waz.azure.mongodb.net/footprint_Asia?retryWrites=true';

const db = {
    "db_Canada": db_Canada,
    "db_Warehouse": db_Warehouse,
    "db_Asia": db_Asia
};
module.exports = db;

