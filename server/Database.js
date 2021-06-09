const mongo = require("mongodb").MongoClient;
const util = require('util');
let db;

const create = util.promisify(createData);
const read = util.promisify(readData);
const update = util.promisify(updateData);
const _delete = util.promisify(deleteData);

function connect () {
    mongo.connect("mongodb://localhost:27017/", {useNewUrlParser: true, useUnifiedTopology: true}, (error, client) => {
        if(error) throw error;
        db = client.db("cloudnein");
    });
}

function createData (collectionName, data, callback = defaultCallBack) {
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

function readData (collectionName, query = {}, callback = defaultCallBack, sort = {}) {
    var collection = db.collection(collectionName);
    collection.find(query).sort(sort).toArray(function (error, result) {
        if (error) throw error;
        callback(error, result);
    });
}

function updateData (collectionName, query = {}, values = {}, callback = defaultCallBack) {
    var collection = db.collection(collectionName);
    collection.updateMany(query, values, (error, result) => {
        if (error) throw error;
        callback(error, result)
    });
}

function deleteData (collectionName, query = {}, callback = defaultCallBack) {
    var collection = db.collection(collectionName);
    collection.deleteMany(query, (error, result) => {
        if (error) throw error;
        callback(error, result);
    });
}

function defaultCallBack(result) {
    console.log("default callback: " + result);
}

async function createDataPromise(collectionName, data) {
    return await create(collectionName, data);
}

async function readDataPromise(collectionName, query = {}) {
    return await read(collectionName, query);

}

async function updateDataPromise(collectionName, query = {}, values = {}) {
    return await update(collectionName, query, values);

}

async function deleteDataPromise(collectionName, query = {}) {
    return await _delete(collectionName, query);
}

module.exports = {
    connect: connect,

    createData: createData,
    readData: readData,
    updateData: updateData,
    deleteData: deleteData,

    createDataPromise: createDataPromise,
    readDataPromise: readDataPromise,
    updateDataPromise: updateDataPromise,
    deleteDataPromise: deleteDataPromise
}

