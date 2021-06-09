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
    var expirationDate = await db.readDataPromise('settings', { User: "Admin" })
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
            date.setDate(date.getDate() + parseInt(expirationDate[0].days))
            //expires = expires || new Date('2038');
            expires = date.toISOString();
            console.log(expires);

            db.createData("file", {
                id: id,
                path: savePath,
                owner: userID,
                tags: tags,
                fileSize: file.size,    //FIXME: might be wrong format
                expires: expires,
                downloads: 0
                //maxDownloads: null
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

function createUploadSettings() {
    db.readData('settings', { User: "Admin" }, (error, result) => {
        if (error) throw error;
        if (result.length == 0) {
            db.createData('settings', { User: "Admin", limit: 100000000, days: 7 })

        } else {
            console.log("Settings are already available");
        }
    })
}

async function getSharedFiles(shareID) {
    var error, result = await db.readDataPromise('shared', { shareID: shareID })
    return result
}

async function getDataLimit() {
    var error, result = await db.readDataPromise('settings', { User: "Admin" });
    return result[0].limit / 1000000;
}

async function getExpirationDate() {
    var error, result = await db.readDataPromise('settings', { User: "Admin" });
    return result[0].days
}

async function setDataLimit(limit) {
    var error, result = await db.updateDataPromise('settings', { User: "Admin" }, { $set: { limit: limit } });
    console.log("DataLimit updated");
}

async function setExpirationDate(days) {
    var error, result = await db.updateDataPromise('settings', { User: "Admin" }, { $set: { days: days } });
    console.log("Expiratio nDate updated");
}

async function checkUploadLimit(userID) {
    var size = 0;
    var error, resultRead = await db.readDataPromise('settings', { User: "Admin" });
    var limit = resultRead[0].limit

    console.log(limit);

    var error2, result = await db.readDataPromise('file', { owner: userID });
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


//TODO: return result
function checkFileExpirations(fileID) {
    var query = fileID ? { id: fileID } : {};

    db.readData('file', query, function (error, result) {
        result.forEach(file => {
            var fileExpiration = Date.parse(file.expires);

            // expired
            if (Date.now >= fileExpiration) {
                deleteFile(file.id);
            }
        });
    });
}

//TODO: return result
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

function getSharelinkUsages(shareID) {
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


//Abstract class
class dbEntry {
    constructor(obj) {
        if (new.target === dbEntry) {
            throw new TypeError("Cannot construct Abstract instances directly");
        }
    
        if (obj) {
            Object.assign(this, obj);
            this.type = new.target.name;
        } else {
            throw new Error("No object specified");
        }
    }

    get expired() {
        let expirationDate = Date.parse(this.expires);

        if (Date.now >= expirationDate) {
            return true;
        } else {
            return false;
        }
    }
}

class CloudItem {
    constructor() {

    }

    share() {

    }
}

class File extends dbEntry {
    constructor(obj) {
        super(obj);
    }

    static parse(obj) {
        return new File(obj);
    }

    comment(text) {
        db.updateData('file', { id: this.id }, { $set: { comment: text }})
    }

    move(newPath) {
        throw { name: "NotImplementedError", message: "too lazy to implement" };
    }

    delete() {
        db.deleteData('file', { id: this.id }, function () {
            console.log(`${this.path} deleted`);
        });
    }

    async addTag(tag) {
        var error, result = await db.readDataPromise('tag', { name: tag });
        if(error) {
            console.error(error);
            return error;
        }
        var tagExists = result.length > 0;

        if (tagExists) {
            db.updateData('tag', { name: tag }, { $push: { files: this.id } }, function () {
                console.log("tag updated");
            });
        } else {
            // If tag doesnt exist
            db.createData('tag', {
                name: tag,
                files: [this.id]
            }, function () {
                console.log("tag created");
            });
        }

        // update file tags
        db.updateData('file', { id: this.id }, { $push: { tags: tag } }, function () {
            console.log("file tags updated");
        });
    }

    download() {

    }

}

class Folder extends CloudItem {

}

class shareLink extends dbEntry {
    constructor(obj) {
        super(obj);
    }

    delete() {
        db.deleteData('shared', { shareID: this.shareID }, function () {
            console.log(`${this.sharedItem} deleted`);
        });
    }

}
