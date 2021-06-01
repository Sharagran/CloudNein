const fs = require("fs");
const db = require("./Database");
const uuidv4 = require('uuid').v4;
const util = require('util');

const readdir = util.promisify(fs.readdir);

// tags = keywords
function uploadFiles(req, tags, userID,) {
    for (const key in req.files) {
        const file = req.files[key];

        // save file to disk
        const savePath = file.destination + file.originalname;
        fs.rename(file.path, savePath, function (error) {
            if (error)
                throw error;

            //TODO: save file metadata in db
            const id = uuidv4();
            db.createData("file", {
                id: id,
                path: savePath,
                owner: userID,
                tags: tags,
                fileSize: file.size,    //FIXME: might be wrong format
                // expires: null,
                // comments: [
                //     { author: authorID, text: text },
                // ]
            });

        });
    }


    var responseJSON = {
        message: req.files.length + ' files uploaded successfully'
    };
    return responseJSON;
}

function getPath(id) {
    var path; //get file path
    return path;
}

function getFiles(userID) {
    //throw {name : "NotImplementedError", message : "too lazy to implement"};

    //TODO: get all user files
    var res = [];
    var files = fs.readdirSync("../UserFiles/" + userID)
    files.forEach(function (file) {
        res.push(file);
    })
    return res;
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
            //TODO: add db entry
            db.createData("share", {
                shareID: shareID,
                sharedItem: path,
                deleteAfter: deleteAfter,
                expires: expires
            }, function () {
                callback(null, shareID);
                //TODO: create route to file in react
            });

        } else {
            callback({ message: "Not a file" }, null);
        }

    });
}

function addTag(fileID, tag) {
    //TODO: test if this function works
    //TODO: fix callback hell & remove useless callbacks
    var tagExists;

    db.readData('tag', { name: tag },
        (error, result) => {
            if (error)
                console.error(error);

            tagExists = result.length > 0;
        });

    if (tagExists) {
        db.updateData('tag', { name: tag }, { $push: { files: fileID } },
            (error, result) => {
                console.log("updating tag");
                if (error)
                    console.error(error);

                console.log(result);
            });
    } else {
        // If tag doesnt exist
        db.createData('tag', {
            name: tag,
            files: [fileID]
        }, (error, result) => {
            console.log("creating tag");
            if (error)
                console.error(error);

            console.log(result);
        });
    }

    // update file tags
    db.updateData('file', { id: fileID }, { $push: { tags: tag } },
        (error, result) => {
            console.log("updating file tags");
            if (error)
                console.error(error);

            console.log(result);
        });
}

function createUploadSettings(){
    db.readData('settings', {User: "Admin"}, (error, result) => {
        if(error) throw error;
        if(result.length == 0){
            db.createData('settings', { User: "Admin", limit: 100000000})
        }else{
            console.log("Settings are already available");
        }
    })
}

async function getSettings(){
    var error, result = await db.readDataPromise('settings', {User : "Admin"});
    return result[0].limit/1000000
}

async function setSettings(limit){
    var error, result = await db.updateDataPromise('settings', {User : "Admin"}, { $set: { limit: limit }});
    console.log("Settings updated");
}


async function checkUploadLimit(userID){
    var size = 0;
    var error, resultRead = await db.readDataPromise('settings', {User : "Admin"});
    var limit = resultRead[0]. limit 

    console.log(limit);

    var error, result = await db.readDataPromise('file', { owner: userID});
    console.log(result);
    for(var i = 0; i < result.length; i++){
        size += result[i].fileSize
    }

    if(size > limit){
        console.log("Not enough space");
    }{
        console.log("Regular upload");
    }
}



module.exports = {
    uploadFiles: uploadFiles,
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
