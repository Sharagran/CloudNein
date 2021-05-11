const mongo = require("mongodb").MongoClient;
let db;

exports.connect = () => {
    mongo.connect("mongodb://localhost:27017/", {useNewUrlParser: true, useUnifiedTopology: true}, (error, client) => {
        if(error) throw error;
        db = client.db("cloudnein");
    });
}

exports.createData = (collectionName, data, callback) => {
    var collection = db.collection(collectionName);
    if (!Array.isArray(data)) {
        collection.insertOne(data, (error, result) => {
            if (error) throw error;
            callback(error, result);
        });
    }
    else {
        collection.insertMany(data, (error, result) => {
            if (error) throw error;
            callback(error, result);
        });
    }
}

exports.readData = function (collectionName, query = {}, callback) {
    collection = db.collection(collectionName);
    collection.find(query).toArray(function (error, result) {
        if (error) throw error;
        callback(error, result);
    });
}