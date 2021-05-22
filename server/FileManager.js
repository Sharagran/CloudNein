const fs = require("fs");
const db = require("./Database");

function uploadFiles(req, userID) {
    for (const key in req.files) {
        const file = req.files[key];

        // save file to disk
        fs.rename(file.path, file.destination + file.originalname, function (error) {
            if (error)
                throw error;

            //TODO: save file metadata in db

        });
    }


    var responseJSON = {
        message: req.files.length + ' files uploaded successfully'
    };
    return responseJSON;
}

function getFiles(userID) {
    throw {name : "NotImplementedError", message : "too lazy to implement"};

    //TODO: get all user files
}

function commentFile() {
    throw {name : "NotImplementedError", message : "too lazy to implement"};

    //TODO: add new comment db entry
}

function editFile(file, newContent) {
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

function shareFile() {
    throw {name : "NotImplementedError", message : "too lazy to implement"};

    //TODO: modify file access & create share link
}

module.exports = {
    uploadFiles: uploadFiles,
    getFiles: getFiles
}
