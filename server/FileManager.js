/* eslint-disable no-unused-vars */

const fs = require("fs");
const db = require("./Database");
const uuidv4 = require('uuid').v4;
const path = require('path');
var cron = require('node-cron');
const nodemailer = require("nodemailer");
var { zip } = require('zip-a-folder');


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
async function uploadFiles(req, userID, username, expires, tags = []) {
    var settings = await db.getSettings('Admin');
    for (const key in req.files) {
        const file = req.files[key];

        // save file to disk
        const savePath = file.destination + username + "/" + file.originalname;
        fs.rename(file.path, savePath, function (error) {
            if (error)
                throw error;
            console.log(file.destination); //FIXME: debug only

            const id = uuidv4();
            var date = new Date();
            date.setDate(date.getDate() + parseInt(settings[0].days))
            //expires = expires || new Date('2038');
            expires = date.toISOString();
            console.log(expires);

            db.insertFile(id, savePath, userID, tags, file.size, expires, null, "");
        });
    }


    var responseJSON = {
        message: req.files.length + ' files uploaded successfully'
    };
    return responseJSON;
}
//TODO: max downloads for files/folders

//TODO: expires for folder
async function createFolder(name) {
    //TODO: test if function works
    var folderPath = path.join(__dirname, '../UserFiles', name);
    const folderID = uuidv4();

    fs.mkdirSync(folderPath);
    await db.insertFolder(folderID, name);
    return true;
}

async function getFile(id) {
    var file = await db.getFile(id);
    return file[0];
}

async function getFiles(userID) {
    var files = await db.getUserFiles(userID);
    return files;
}

async function commentFile(fileID, userID, text) {
    console.log(fileID, userID, comment);
    db.changeFileComment(fileID, text);
}

function moveFile(fileID, path) {
    throw { name: "NotImplementedError", message: "too lazy to implement" };
}

function deleteFile(fileID) {
    db.deleteFile(fileID);
}

// react route https://ncoughlin.com/posts/react-router-variable-route-parameters/
async function share(itemID, expires, usages, callback) {
    //TODO: delete file/folder after X downloads
    //TODO: link usages
    var file = await getFile(itemID);
    console.log(file);


    const shareID = uuidv4(); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
    var date = new Date();
    date.setDate(date.getDate() + expires)
    //expires = expires || new Date('2038');
    expires = date.toISOString();
    usages = usages || -1;

    await db.insertSharelink(shareID, file, usages, expires);
    callback(null, shareID);
}

async function downloadFile(id, res) {
    //TODO: check usages
    var file = await getFile(id);
    if (file.downloads >= file.maxDownloads) {
        return;
    }

    if (isExpired(file)) {
        deleteFile(file.id);
        return;
    }

    res.download(file.path);

    //countdown usages in db
    //check for deletion
}

async function downloadSharedFile(shareID, res) {
    //TODO: check usages
    checkSharelinkExpirations(shareID);

    var file;// = await getFile();
    res.download(file.path);

    //countdown usages in db
    //check for deletion
}

function addTag(fileID, tag) {
    db.addTag(fileID, tag);
}

async function createUploadSettings() {
    var settingsExist = await db.settingsExist('Admin');
    if(settingsExist) {
        console.log("Settings are already available");
    } else {
        db.insertSettings('Admin', 100000000, 7);
    }
}

async function getSharedFiles(shareID) {
    // var error, result = await db.readDataPromise('shared', { shareID: shareID });   //FIXME: DB
    var result = "lol";
    return result;
}

async function getDataLimit() {
    var result = await db.getSettings('Admin');
    return result[0].limit / 1000000;
}

async function getExpirationDate() {
    var result = await db.getSettings('Admin');
    return result[0].days
}


function setDataLimit(limit) {
    console.log("updating DataLimit");
    db.setDataLimit('Admin', limit);
}

function setExpirationDate(days) {
    console.log("updating Expiration Date");
    db.setExpirationDate('Admin', days);
}

async function checkUploadLimit(userID) {
    var size = 0;
    var resultRead = await db.getSettings('Admin');
    var limit = resultRead[0].limit;

    console.log(limit);

    var result = await db.getUserFiles(userID);
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

//TODO: return result
function checkFileExpirations(fileID) {
    var query = fileID ? { id: fileID } : {};

    // db.readData('file', query, function (error, result) { //FIXME: DB
    //     result.forEach(file => {
    //         var fileExpiration = Date.parse(file.expires);

    //         // expired
    //         if (Date.now >= fileExpiration) {
    //             deleteFile(file.id);
    //         }
    //     });
    // });
}

function isExpired(file) {
    var fileExpiration = Date.parse(file.expires);

    if (Date.now >= fileExpiration) {
        return true;
    } else {
        return false;
    }
}

//TODO: return result
function checkSharelinkExpirations(shareID) {
    var query = shareID ? { shareID: shareID } : {};

    // db.readData('shared', query, function (error, result) { //FIXME: DB
    //     result.forEach(shareEntry => {
    //         var shareExpiration = Date.parse(shareEntry.expires);

    //         // expired
    //         if (Date.now >= shareExpiration) {
    //             console.log(`deleting shareLink "${shareEntry.shareID}"`);
    //             db.deleteSharelink(shareEntry.shareID);
    //         }
    //     });
    // });

}

function getSharelinkUsages(shareID) {
    // db.readData('shared', query, function (error, result) { //FIXME: DB
    //     result.forEach(shareEntry => {
    //         var shareExpiration = Date.parse(shareEntry.expires);

    //         // expired
    //         if (Date.now >= shareExpiration) {
    //             console.log(`deleting shareLink "${shareEntry.shareID}"`);
    //             db.deleteSharelink(shareEntry.shareID)
    //         }
    //     });
    // });
}

function sendLink(receiver, shareID, fileName, callback) {

    const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: 'cloudneinofficial@gmail.com', pass: 'CloudNein' }, });
    var mailOptions = {
        from: 'cloudneinofficial@gmail.com',
        to: receiver,
        subject: 'CloudNein Files',
        text: "Link to files: " + "https://localhost:3000/sharefile?shareID=" + shareID + "&fileName=" + fileName
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.error(error);
            throw error;
        } else {
            console.log('Email sent: ' + info.response);
            callback(error, info);
        }
    });
}


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
    getDataLimit: getDataLimit,
    setDataLimit: setDataLimit,
    sendLink: sendLink,
    checkFileExpirations: checkFileExpirations,
    checkSharelinkExpirations: checkSharelinkExpirations,
    getExpirationDate: getExpirationDate,
    setExpirationDate: setExpirationDate,
    getSharedFiles: getSharedFiles
}

