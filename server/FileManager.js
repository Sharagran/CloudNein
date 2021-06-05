const fs = require("fs");
const db = require("./Database");
const uuidv4 = require('uuid').v4;
const util = require('util');
const path = require('path')

const readdir = util.promisify(fs.readdir);

// tags = keywords
function uploadFiles(req, userID, username, tags = []) {
    for (const key in req.files) {
        const file = req.files[key];

        // save file to disk
        const savePath = file.destination + username + "/" + file.originalname;
        fs.rename(file.path, savePath, function (error) {
            if (error)
                throw error;
            console.log(file.destination)
            //TODO: save file metadata in db
            const id = uuidv4();
            db.createData("file", {
                id: id,
                path: savePath,
                owner: userID,
                tags: tags,
                fileSize: file.size,    //FIXME: might be wrong format
                // expires: null,
                // comment: "comment"
            });

        });
    }


    var responseJSON = {
        message: req.files.length + ' files uploaded successfully'
    };
    return responseJSON;
}

async function createFolder(Path) {
    //TODO: test if function works
    var folderPath = path.join(__dirname, '../UserFiles', Path);

    fs.mkdirSync(folderPath);
    await db.createDataPromise('folder', {
        name: folderPath,
        files: []
    });

    return true;
}

async function getPath(id) {
    var path = await db.readDataPromise('file', {id: id})
    return path;
}

async function getFiles(userID) {
    var error, files = await db.readDataPromise('file',{owner: userID})
    return files;
}

function commentFile(fileID, userID, comment) {
    throw { name: "NotImplementedError", message: "too lazy to implement" };

    //TODO: add new comment db entry
}

function editFile(fileID, newContent) {
    throw { name: "NotImplementedError", message: "too lazy to implement" };

    fs.writeFile(file, newContent, function (error) {

    });
}

function moveFile(oldPath, newPath) {
    throw { name: "NotImplementedError", message: "too lazy to implement" };

    fs.rename(oldPath, newPath, function (error) {
        if (error)
            throw error;

        //TODO: update file metadata in db

    });
}

// react route https://ncoughlin.com/posts/react-router-variable-route-parameters/
function share(path, expires = -1, deleteAfter = false, callback) {
    // check if file exists
    fs.stat(path, function (error, stats) {
        if (error)
            callback({ message: "Path does not exist" }, null);

        if (stats.isFile() && !stats.isSymbolicLink()) {
            const shareID = uuidv4(); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
            db.createData("share", {
                shareID: shareID,
                sharedItem: path,
                deleteAfter: deleteAfter, //TODO:
                expires: expires    //TODO:
            }, function () {
                callback(null, shareID);
                //TODO: create route to file in react
            });

        } else {
            callback({ message: "Not a file" }, null);
        }

    });
}

async function addTag(fileID, tag) {
    //TODO: fix callback hell & remove useless callbacks

    var error, result = await db.readDataPromise('tag', { name: tag });
    if (error)
        console.error(error);

    var tagExists = result.length > 0;

    if (tagExists) {
        var error, result = await db.updateDataPromise('tag', { name: tag }, { $push: { files: fileID } });
        if (error)
            console.error(error);

        console.log("tag updated");
    } else {
        // If tag doesnt exist
        var error, result = await db.createDataPromise('tag', {
            name: tag,
            files: [fileID]
        });
        if (error)
            console.error(error);

        console.log("tag created");
    }

    // update file tags
    var error, result = await db.updateData('file', { id: fileID }, { $push: { tags: tag } });
    if (error)
        console.error(error);

    console.log("file tags updated");
}

function createUploadSettings() {
    db.readData('settings', { User: "Admin" }, (error, result) => {
        if (error) throw error;
        if (result.length == 0) {
            db.createData('settings', { User: "Admin", limit: 100000000 })
        } else {
            console.log("Settings are already available");
        }
    })
}

async function getSettings() {
    var error, result = await db.readDataPromise('settings', { User: "Admin" });
    return result[0].limit / 1000000
    console.log("Send settings");
}

async function setSettings(limit) {
    var error, result = await db.updateDataPromise('settings', { User: "Admin" }, { $set: { limit: limit } });
    console.log("Settings updated");
}


async function checkUploadLimit(userID) {
    var size = 0;
    var error, resultRead = await db.readDataPromise('settings', { User: "Admin" });
    var limit = resultRead[0].limit

    console.log(limit);

    var error, result = await db.readDataPromise('file', { owner: userID });
    console.log(result);
    for (var i = 0; i < result.length; i++) {
        size += result[i].fileSize
    }

    if (size > limit) {
        console.log("Not enough space");
    } {
        console.log("Regular upload");
    }
}



module.exports = {
    uploadFiles: uploadFiles,
    createFolder: createFolder,
    addTag: addTag,
    getPath: getPath,
    getFiles: getFiles,
    commentFile: commentFile,
    editFile: editFile,
    moveFile: moveFile,
    share: share,
    checkUploadLimit: checkUploadLimit,
    createUploadSettings: createUploadSettings,
    getSettings: getSettings,
    setSettings: setSettings
}
