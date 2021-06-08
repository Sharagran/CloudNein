const fs = require("fs");
const db = require("./Database");
const uuidv4 = require('uuid').v4;
const util = require('util');
const path = require('path');
var cron = require('node-cron');
const nodemailer = require("nodemailer");
var { zip } = require('zip-a-folder');

const readdir = util.promisify(fs.readdir);

// every minute 0 (every hour)
cron.schedule('0 * * * *', () => {
    try {
        checkFileExpirations();
        checkSharelinkExpirations();
    } catch (error) {
        console.error("Error during Scheduled task");
        console.error(error);
    }

});



// tags = keywords
function uploadFiles(req, userID, username, expires, tags = []) {
    for (const key in req.files) {
        const file = req.files[key];

        // save file to disk
        const savePath = file.destination + username + "/" + file.originalname;
        fs.rename(file.path, savePath, function (error) {
            if (error)
                throw error;
            console.log(file.destination); //FIXME: debug only
            //TODO: save file metadata in db
            const id = uuidv4();
            expires = expires || new Date('2038');
            expires = expires.toISOString();
            console.log(expires);

            db.createData("file", {
                id: id,
                path: savePath,
                owner: userID,
                tags: tags,
                fileSize: file.size,    //FIXME: might be wrong format
                expires: expires,
                // comment: "comment"
            });

        });
    }


    var responseJSON = {
        message: req.files.length + ' files uploaded successfully'
    };
    return responseJSON;
}
//TODO: max downloads for files/folders

//TODO: expires for folder
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

async function getFile(id) {
    var file = await db.readDataPromise('file', { id: id })
    return file[0];
}

async function getFiles(userID) {
    var error, files = await db.readDataPromise('file', { owner: userID })
    return files;
}

function commentFile(fileID, userID, comment) {
    throw { name: "NotImplementedError", message: "too lazy to implement" };

    //TODO: add new comment db entry
}

function moveFile(fileID, path) {
    throw { name: "NotImplementedError", message: "too lazy to implement" };

    fs.rename(oldPath, newPath, function (error) {
        if (error)
            throw error;

        //TODO: update file metadata in db

    });
}

// react route https://ncoughlin.com/posts/react-router-variable-route-parameters/
function share(itemID, expires, usages, callback) {
    //TODO: delete file/folder after X downloads
    //TODO: link usages
    var file = getFile(itemID);
    console.log(file);


    const shareID = uuidv4(); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
    var date = new Date();
    date.setDate(date.getDate() + expires )
    //expires = expires || new Date('2038');
    expires = date.toISOString();
    usages = usages || -1;

    db.createData("shared", {
        shareID: shareID,
        sharedItem: file,
        usages: usages,
        expires: expires
    }, function () {
        callback(null, shareID);
    });

}

async function downloadFile(id, res) {
    //TODO: check usages

    var file = await getFile(id); 
    res.download(file.path);

    //TODO: countdown usages in db
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

//#region TODO: call those functions before each item access
function checkFileExpirations(fileID) {
    var query = fileID ? { id: fileID } : {};

    db.readData('file', query, function (error, result) {
        result.forEach(file => {
            var fileExpiration = Date.parse(file.expires);

            // expired
            if (Date.now >= fileExpiration) {
                db.deleteData('file', { _id: file._id }, function () {
                    console.log(`${file.path} deleted`);
                });
            }
        });
    });
}

function checkSharelinkExpirations(shareID) {
    var query = shareID ? { shareID: shareID } : {};

    db.readData('shared', query, function (error, result) {
        result.forEach(shareEntry => {
            var shareExpiration = Date.parse(shareEntry.expires);

            // expired
            if (Date.now >= shareExpiration) {
                db.deleteData('shared', { _id: shareEntry._id }, function () {
                    console.log(`share link "${shareEntry.shareID}" deleted`);
                });
            }
        });
    });
}

function sendLink(receiver, shareID, fileID, fileName, callback) {

    const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: 'cloudneinofficial@gmail.com', pass: 'CloudNein' }, });
    var mailOptions = { 
        from: 'cloudneinofficial@gmail.com', 
        to: receiver,
        subject: 'CloudNein Files',
        text: "Link to files: " + "https://localhost:3000/sharefile?shareID="+ shareID +"&fileName=" + fileName +"&fileID=" + fileID
    };
    
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error(error);
        throw error;
      } else {
        console.log('Email sent: ' + info.response);
        callback(error, info);
      };
    });
  };


//#endregion

async function compressFolder(path) {
    var zipPath = path + '.zip';
    await zip(path, zipPath);
    return zipPath;
}


module.exports = {
    uploadFiles: uploadFiles,
    createFolder: createFolder,
    addTag: addTag,
    getFile: getFile,
    getFiles: getFiles,
    commentFile: commentFile,
    moveFile: moveFile,
    downloadFile: downloadFile,
    share: share,
    checkUploadLimit: checkUploadLimit,
    createUploadSettings: createUploadSettings,
    getSettings: getSettings,
    setSettings: setSettings,
    sendLink: sendLink,
    checkFileExpirations: checkFileExpirations,
    checkSharelinkExpirations: checkSharelinkExpirations
}
