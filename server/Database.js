const mongo = require("mongodb").MongoClient;
let db;

const util = require('util');
const create = util.promisify(createData);
const read = util.promisify(readData);
const update = util.promisify(updateData);
const _delete = util.promisify(deleteData);


function connect() {
    mongo.connect("mongodb://localhost:27017/", { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
        if (error) throw error;
        db = client.db("cloudnein");
    });
}

//#region db functions
function createData(collectionName, data, callback) {
    var collection = db.collection(collectionName);
    if (!Array.isArray(data)) {
        collection.insertOne(data, (error, result) => {
            if (error) {
                console.error(error);
                return;
            }
            callback(result);
        });
    } else {
        collection.insertMany(data, (error, result) => {
            if (error) {
                console.error(error);
                return;
            }
            callback(result);
        });
    }
}

function readData(collectionName, query = {}, callback) {
    var collection = db.collection(collectionName);
    collection.find(query).toArray(async function (error, result) {
        if (error) {
            console.error(error);
            return;
        }
        callback(result);
    });
}

function updateData(collectionName, query = {}, values = {}, callback) {
    var collection = db.collection(collectionName);
    collection.updateMany(query, values, (error, result) => {
        if (error) {
            console.error(error);
            return;
        }
        callback(result)
    });
}

function deleteData(collectionName, query = {}, callback) {
    var collection = db.collection(collectionName);
    collection.deleteMany(query, (error, result) => {
        if (error) {
            console.error(error);
            return;
        }
        callback(result);
    });
}
//#endregion


//#region User
async function insertUser(id, username, password_hash, email) {
    return await create('user', [{
        id: id,
        username: username,
        password: password_hash,
        email: email
    }]);
}

async function getUserByEmail(email) {
    return await read('user', { email: email });
}

async function getUserByUsername(username) {
    return await read('user', { username: username });
}

async function changeUsername(userID, newUsername) {
    return await update('user', { id: userID }, { $set: { username: newUsername } });
}

async function changePassword(email, password_hash) {
    return await update("user", { email: email }, { $set: { password: password_hash } });
}

async function changeEmail(userID, newMail) {
    return await update('user', { id: userID }, { $set: { email: newMail } });
}

async function isUsernameTaken(username) {
    try {
        var result = await read('user', { username: username });

        if (result.length > 0) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        throw error;
    }
}

async function isEmailTaken(email) {
    try {
        var result = await read('user', { email: email });

        if (result.length > 0) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        throw error;
    }
}
//#endregion


//#region Files & Folder

async function insertFile(id, path, owner, tags, fileSize, expires, maxDownloads, comment, isFolder) {
    return await create("file", {
        id: id,
        path: path,
        owner: owner,
        tags: tags,
        fileSize: fileSize,
        expires: expires,
        downloads: 0,
        maxDownloads: maxDownloads,
        comment: comment,
        isFolder: isFolder
    });
}

async function getFile(id) {
    return await read('file', { id: id });
}

async function getUserFiles(userID) {
    return await read('file', { owner: userID });
}

async function changeFileComment(id, text) {
    return await update('file', { id: id }, { $set: { comment: text } });
}

async function deleteFile(id) {
    return await _delete('file', { id: id });
}

async function insertFolder(id, name) {
    return await create('folder', {
        id: id,
        name: name,
        files: []
    });
}

async function getFolder(id) {
    return await read('folder', { id: id })
}

async function deleteFolder(id) {
    return await _delete('folder', { id: id });
}

//#endregion


//#region Tag
async function tagExists(tag) {
    try {
        var result = await read('tag', { name: tag });

        if (result.length > 0) {
            return true;
        } else {
            return false;
        }

    } catch (error) {
        throw error;
    }
}

async function getTag(tag) {
    return await read('tag', { name: tag });
}

async function insertTag(tag, fileID) {
    return await create('tag', {
        name: tag,
        files: [fileID]
    });
}

async function updateTagFiles(tag, fileID) {
    return await update('tag', { name: tag }, { $push: { files: fileID } });
}

async function updateFileTags(fileID, tag) {
    return await update('file', { id: fileID }, { $push: { tags: tag } });
}

async function addTag(fileID, tag) {
    try {
        var exists = await tagExists(tag);
        if(exists) {
            updateTagFiles(tag, fileID);
        } else {
            insertTag(tag, fileID);
        }
        updateFileTags(fileID, tag);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

async function deleteTag(fileID, tag) {
    update('file', { id: fileID }, { $pull: { tags: [tag] } }); //TODO: test me
    _delete('tag', { name: tag });

    return true;
}
//#endregion


//#region Sharelink
async function insertSharelink(shareID, file, usages, expires) {
    return await create("shared", {
        shareID: shareID,
        sharedItem: file,
        usages: usages,
        expires: expires
    });
}

async function deleteSharelink(shareID) {
    return await _delete('shared', { shareID: shareID });
}

//#endregion


//#region Settings
async function insertSettings(user, limit, days) {
    return await create('settings', {
        user: user,
        limit: limit,
        days: days
    });
}

async function getSettings(user) {
    return await read('settings', { user: user });
}

async function setDataLimit(user, limit) {
    return await update('settings', { user: user }, { $set: { limit: limit } });
}

async function setExpirationDate(user, days) {
    return await update('settings', { user: user }, { $set: { days: days } });
}

async function settingsExist(user) {
    try {
        var result = read('settings', { user: user });

        if (result.length > 0) {
            return true;
        } else {
            return false;
        }

    } catch (error) {
        throw error;
    }
}
//#endregion

module.exports = {
    connect: connect,

    insertUser: insertUser,
    getUserByEmail: getUserByEmail,
    getUserByUsername: getUserByUsername,
    changeUsername: changeUsername,
    changePassword: changePassword,
    changeEmail: changeEmail,
    isUsernameTaken: isUsernameTaken,
    isEmailTaken: isEmailTaken,

    insertFile: insertFile,
    getFile: getFile,
    getUserFiles: getUserFiles,
    changeFileComment: changeFileComment,
    deleteFile: deleteFile,
    insertFolder: insertFolder,
    getFolder: getFolder,
    deleteFolder: deleteFolder,

    addTag: addTag,
    getTag: getTag,
    deleteTag: deleteTag,

    insertSharelink: insertSharelink,
    deleteSharelink: deleteSharelink,

    insertSettings: insertSettings,
    getSettings: getSettings,
    setDataLimit: setDataLimit,
    setExpirationDate: setExpirationDate,
    settingsExist: settingsExist
}

