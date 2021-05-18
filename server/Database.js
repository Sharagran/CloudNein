const mongo = require("mongodb").MongoClient;
let db;

exports.connect = () => {
    mongo.connect("mongodb://localhost:27017/", {useNewUrlParser: true, useUnifiedTopology: true}, (error, client) => {
        if(error) throw error;
        db = client.db("cloudnein");
    });
}

exports.createData = (collectionName, data, callback = defaultCallBack) => {
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

exports.readData = (collectionName, query = {}, callback = defaultCallBack, limit = 0, sort = {}) => {
    collection = db.collection(collectionName);
    collection.find(query).limit(0).sort(sort).toArray(function (error, result) {
        if (error) throw error;
        callback(error, result);
    });
}

exports.updateData = (collectionName, query = {}, values = {}, callback = defaultCallBack) => {
    collection = db.collection(collectionName);
    collection.updateMany(query, values, (error, result) => {
        if (error) throw error;
        callback(error, result)
    });
}

exports.deleteData = (collectionName, query = {}, callback = defaultCallBack) => {
    collection = db.collection(collectionName);
    collection.deleteMany(query, (error, result) => {
        if (error) throw error;
        callback(error,result);
    });
}

function defaultCallBack(error, result) {
    if(error) throw error;
    console.log("default callback: " + result);
}