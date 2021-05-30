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
            db.createData("File", {
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
    fs.readdir("../UserFiles/" + userID, function(err, files) {
        if(err) throw err;
        files.forEach(function(file) {
            res.push(file);
        })
    })
    return res;
}

function commentFile(fileID, userID, comment) {
    throw {name : "NotImplementedError", message : "too lazy to implement"};

    //TODO: add new comment db entry
}

function editFile(fileID, newContent) {
    throw {name : "NotImplementedError", message : "too lazy to implement"};

    fs.writeFile(file, newContent, function (error) {
        
    });
}

function moveFile(oldPath, newPath) {
    throw {name : "NotImplementedError", message : "too lazy to implement"};

    fs.rename(oldPath, newPath, function (error) {
        if(error)
            throw error;

        //TODO: update file metadata in db

    });
}

// react route https://ncoughlin.com/posts/react-router-variable-route-parameters/
function share(path, expires = -1, deleteAfter = false, callback) {
    // check if file exists
    fs.stat(path, function (error, stats) {
        if(error)
            callback({message: "Path does not exist"}, null);

        if(stats.isFile() && !stats.isSymbolicLink()) {
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
            callback({message: "Not a file"}, null);
        }

    });
}

module.exports = {
    uploadFiles: uploadFiles,
    getPath: getPath,
    getFiles: getFiles,
    commentFile: commentFile,
    editFile: editFile,
    moveFile: moveFile,
    share: share
}
