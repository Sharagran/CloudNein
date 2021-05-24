const fs = require("fs");
const db = require("./Database");
const uuidv4 = require('uuid').v4;

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

// react route https://ncoughlin.com/posts/react-router-variable-route-parameters/
function shareFile(file, expires = -1, usages = -1) {
    throw {name : "NotImplementedError", message : "too lazy to implement"};

    const shareLink = uuidv4(); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'

    db.createData("User", { Username: req.body.user.username, Password: hash, Email: req.body.user.mail });
    //TODO: add db entry

    return shareLink;
}

module.exports = {
    uploadFiles: uploadFiles,
    getFiles: getFiles
}
