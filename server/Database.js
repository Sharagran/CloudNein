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

function readData (collectionName, query = {}, callback = defaultCallBack, limit = 0, sort = {}) {
    collection = db.collection(collectionName);
    collection.find(query).limit(0).sort(sort).toArray(function (error, result) {
        if (error) throw error;
        callback(error, result);
    });
}

function updateData (collectionName, query = {}, values = {}, callback = defaultCallBack) {
    collection = db.collection(collectionName);
    collection.updateMany(query, values, (error, result) => {
        if (error) throw error;
        callback(error, result)
    });
}

function deleteData (collectionName, query = {}, callback = defaultCallBack) {
    collection = db.collection(collectionName);
    collection.deleteMany(query, (error, result) => {
        if (error) throw error;
        callback(error, result);
    });
}

function defaultCallBack(result) {
    console.log("default callback: " + result);
}

async function createDataSync(collectionName, data) {
    try {
        return await create(collectionName, data);
    } catch (error) {
        throw error;
    }
    
}

async function readDataSync(collectionName, query = {}) {
    try {
        return await read(collectionName, query);
    } catch (error) {
        throw error;
    }
}

async function updateDataSync(collectionName, query = {}, values = {}) {
    try {
        return await update(collectionName, query, values);
    } catch (error) {
        throw error;
    }
}

async function deleteDataSync(collectionName, query = {}) {
    try {
        return await _delete(collectionName, query);
    } catch (error) {
        throw error;
    }
}

module.exports = {
    connect: connect,

    createData: createData,
    readData: readData,
    updateData: updateData,
    deleteData: deleteData,

    createDataSync: createDataSync,
    readDataSync: readDataSync,
    updateDataSync: updateDataSync,
    deleteDataSync: deleteDataSync
}

