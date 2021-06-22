/* eslint-disable no-unused-vars */

const fs = require("fs");
const db = require("./Database");
const uuidv4 = require('uuid').v4;
const { join } = require('path');
var cron = require('node-cron');
const nodemailer = require("nodemailer");
var { zip } = require('zip-a-folder');
var archiver = require('archiver');

// every minute==0 (every hour)
cron.schedule('0 * * * *', () => {
    try {
        checkFileExpirations();
        checkSharelinkExpirations();
    } catch (error) {
        console.error("Error during Scheduled task");
        console.error(error.stack);
    }
});

//#region File management

async function deleteProfilePicture(userID) {
    var filename = fs.readdirSync(`${__dirname}/../ProfilePictures/`)
    console.log(filename);
    filename.forEach(file => {
        if (file === userID + ".png") {
            fs.unlinkSync(`${__dirname}/../ProfilePictures/${userID}.png`)
        }
    })
}

function uploadProfilePicture(req, userID) {
    for (const key in req.files) {
        const file = req.files[key];
        file.originalname = userID;
        const savePath = `${__dirname}/../ProfilePictures/${file.originalname}.png`;
        fs.rename(file.path, savePath, function (error) {
            if (error)
                throw error;
        })
    }
    return true
}

async function uploadFiles(req, userID, username, expires, tags = []) {

    var expirationDate = await db.readDataPromise('settings', { User: "Admin" })
    for (const key in req.files) {
        const file = req.files[key];

        // save file to disk
        //const savePath = file.destination + username + "/" + file.originalname;
        const savePath = `${__dirname}/../UserFiles/${username}/${file.originalname}`;
        fs.rename(file.path, savePath, function (error) {
            if (error)
                throw error;

            const id = uuidv4();
            var date = new Date();
            date.setDate(date.getDate() + parseInt(expirationDate[0].days))
            expires = date.toISOString();
            console.log(expires);

            db.createData("file", {
                id: id,
                name: file.originalname,
                comment: "",
                owner: userID,
                tags: tags,
                fileSize: file.size,
                expires: expires,
                parent: null,
                isFolder: false,
                downloads: 0,
                maxDownloads: null
            });

        });
    }
    var responseJSON = {
        message: req.files.length + ' files uploaded successfully'
    };
    return responseJSON;

}
//TODO: max downloads for files/folders
async function createFolder(parentID, name, userID) {
    const id = uuidv4();

    await db.createDataPromise('file', {
        id: id,
        name: name,
        comment: "",
        owner: userID,
        tags: [],
        fileSize: null,
        expires: null,
        parent: parentID,
        isFolder: true,
        downloads: 0,
        maxDownloads: null
    });

    return true;
}

async function getFolderContent(id, userid) {
    var files;
    if (id) {
        files = await db.readDataPromise('file', { parent: id });
    } else {
        //Home directory
        files = await db.readDataPromise('file', { owner: userid, parent: null });
    }
    return files;
}

async function getFile(id) {
    var file = await db.readDataPromise('file', { id: id })
    return file[0];
}

async function getFiles(userID) {
    var error, files = await db.readDataPromise('file', { owner: userID })
    return files;
}

function getProfilePicture(userID) {
    try {
        var img = fs.readFileSync(`${__dirname}/../ProfilePictures/${userID}.png`)
        var base64 = Buffer.from(img).toString('base64');
        base64 = 'data:image/png;base64,' + base64;
        return base64;
    } catch (error) {
        console.log(error);
    }
}

async function getActualPath(fileID) {
    var file = await getFile(fileID);
    var user = await db.readDataPromise('user', { id: file.owner });
    var username = user[0].username;
    var homePath = `${__dirname}/../UserFiles/${username}/`;
    var filePath = file.name;

    if (file.isFolder) {
        return join(homePath);
    } else {
        return join(homePath + filePath);
    }

}

async function moveFile(fileID, folderID) {
    if (fileID == folderID) return false;

    if(folderID == 'null') {
        folderID = null;
    } else {
        var folder = await getFile(folderID);
        if (folder.isFolder == false) return false;
    }

    await db.updateDataPromise('file', { id: fileID }, { $set: { parent: folderID } });

    return true;
}

async function deleteItem(fileID) {
    var file = await getFile(fileID);

    if (file.isFolder) {
        deleteFolder(fileID);
    } else {
        deleteFile(fileID)
    }
}

async function deleteFolder(folderID) {
    var files = await getFolderContent(folderID);

    files.forEach(file => {
        if (file.isFolder) {
            deleteFolder(file.id);
        } else {
            deleteFile(file.id);
        }
    });
    // delete current folder
    db.deleteData('file', { id: folderID });
    console.log(`folder ${folderID} deleted`);
}

async function deleteFile(fileID) {
    var path = await getActualPath(fileID);
    // remove from disk
    fs.unlink(path, function (error) {
        if (error) {
            console.error(error.stack);
            return;
        }
    });
    // remove from db
    db.deleteData('file', { id: fileID });

    console.log(`${fileID}/${path} deleted`);
}

//#endregion

//#region File attributes
function commentFile(fileID, text) {
    db.updateData('file', { id: fileID }, { $set: { comment: text } })
}

async function addTag(fileID, tag) {
    var file = await getFile(fileID);
    if (file.tags.includes(tag)) {
        // File already has tag -> tag already has file
        console.log(`tag: '${tag}' already linked to ${fileID}`);
        return;
    }

    var error, result = await db.readDataPromise('tag', { name: tag });
    if (error)
        console.error(error.stack);

    var tagExists = result.length > 0;

    if (tagExists) {
        var error2, result2 = await db.updateDataPromise('tag', { name: tag }, { $push: { files: fileID } });
        if (error2)
            console.error(error2.stack);

        console.log("tag updated");
    } else {
        // If tag doesnt exist
        var error3, result3 = await db.createDataPromise('tag', {
            name: tag,
            files: [fileID]
        });
        if (error3)
            console.error(error3.stack);

        console.log("tag created");
    }

    // update file tags
    var error4, result4 = await db.updateData('file', { id: fileID }, { $push: { tags: tag } });
    if (error4)
        console.error(error4.stack);

    console.log("file tags updated");
}

//TODO: return result (call those functions before each item access)
function checkFileExpirations(fileID) {
    var query = fileID ? { id: fileID } : {};

    db.readData('file', query, function (error, result) {
        result.forEach(file => {
            var fileExpiration = Date.parse(file.expires);

            // expired
            if (Date.now() >= fileExpiration) {
                deleteItem(file.id);
            }
        });
    });
}

function isExpired(shareEntry) {
    var expires = shareEntry.expires;
    if (expires) {
        var expiration = Date.parse(expires);
        if (Date.now() >= expiration) {
            return true;
        }

    }

    // expires == null || Date.now < expiration
    return false;
}

async function spaceCheck(fileSize, userID) {
    var folderSize = await checkUploadLimit(userID)
    var dataLimit = await getDataLimit() * 1000000
    
    if (folderSize + fileSize <= dataLimit) {
        console.log("enough space")
        return true;
    } else {
        console.log(("not enough space"));
        return false;
    }

}
//#endregion

//#region Settings
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

async function getDataLimit() {
    try {
        var error, result = await db.readDataPromise('settings', { User: "Admin" });
        return result[0].limit / 1000000;
    } catch (error) {
        console.log(error);
    }
}

async function usedSpace(userID) {
    var size = 0;
    try {
        var error, result = await db.readDataPromise('file', { owner: userID });

        result.forEach(file => {
            size += file.fileSize
        })
        return parseFloat(size / 1000000).toFixed(2);
    } catch (error) {
        console.log(error);
    }
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

    var error2, result = await db.readDataPromise('file', { owner: userID });
    for (var i = 0; i < result.length; i++) {
        size += result[i].fileSize
    }

    return size
}
//#endregion

//#region Download
async function compressFolder(path, folderID) {

    var archive = archiver('zip', { gzip: true, zlib: { level: 9 } });
    var files = await getFolderContent(folderID);
    var folder = await getFile(folderID);
    var outputPath = `${path}/${folder.name}.zip`;
    var output = fs.createWriteStream(outputPath);

    archive.on('error', function (err) {
        throw err;
    });

    archive.pipe(output);


    for (var i = 0; i < files.length; i++) {
        const file = files[i];
        archive.file(path + file.name, { name: file.name });
    }

    await archive.finalize();
    return outputPath;
}



async function downloadFile(id, res) {
    //TODO: check usages
    var file = await getFile(id);
    if (file.maxDownloads && file.downloads >= file.maxDownloads) {
        return;
    }

    if (isExpired(file)) {
        deleteItem(file.id);
        return;
    }

    var filePath = await getActualPath(file.id);
    console.log('filePath: ', filePath);

    if (file.isFolder) {
        var zipPath = await compressFolder(filePath, file.id);
        zipPath = join(zipPath);
        console.log(zipPath);
        await new Promise(r => setTimeout(r, 500)); // 500ms delay need or downloaded zip file will be invalid
        res.download(zipPath);
    } else {
        res.download(filePath);
    }

    //countdown usages in db?
    //check for deletion?
}

//#endregion

//#region Share

// react route https://ncoughlin.com/posts/react-router-variable-route-parameters/
async function share(itemID, expires, usages, callback) {
    //TODO: delete file/folder after X downloads
    //TODO: link usages

    //TODO: @Filip make expires/usages == null work (no limit)
    var file = await getFile(itemID);
    console.log(file);


    const shareID = uuidv4(); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
    if (expires && expires > 0) {
        var date = new Date();
        date.setDate(date.getDate() + expires)
        expires = date.toISOString();
    } else {
        expires = null;
    }
    usages = usages;

    db.createData("shared", {
        shareID: shareID,
        sharedItem: itemID,
        usages: usages,
        expires: expires
    }, function () {
        if (typeof callback === 'function') {
            callback(null, shareID);
        }
    });

}

async function getSharedFiles(shareID) {
    var error, result = await db.readDataPromise('shared', { shareID: shareID })
    return result[0]
}

//TODO: check before every download @Andre
async function checkSharelinkExpirations(shareID) {
    var query = shareID ? { shareID: shareID } : {};
    var shareLinkExpired = true;

    var error, result = await db.readDataPromise('shared', query);
    result.forEach(shareEntry => {
        shareLinkExpired = isExpired(shareEntry);
        if (shareLinkExpired) {
            db.deleteDataPromise('shared', { _id: shareEntry._id }, function () {
                console.log(`share link "${shareEntry.shareID}" deleted`);
            });
        }
    });

    return shareLinkExpired;
}

async function checkSharelinkUsages(shareID) {
    var query = shareID ? { shareID: shareID } : {};
    var shareLinkUsed = false;

    var error, result = await db.readDataPromise('shared', query)
    result.forEach(shareEntry => {
        var usages = shareEntry.usages;
        if (usages != null) {
            if (usages == 0) {
                shareLinkUsed = true;
                db.deleteDataPromise('shared', { _id: shareEntry._id }, function () {
                    console.log(`share link "${shareEntry.shareID}" deleted`);
                });
            }
        }
    });
    return shareLinkUsed;
}

async function decreaseUsages(shareID) {
    var actualUsages = await db.readDataPromise('shared', { shareID: shareID })
    if (actualUsages[0].usages > 0) {
        await db.updateDataPromise('shared', { shareID: shareID }, { $set: { usages: actualUsages[0].usages - 1 } })
        return true;
    }
}

async function increaseDownloads(fileID) {
    var file = await db.readDataPromise('file', { id: fileID })
    await db.updateDataPromise('file', { id: fileID }, { $set: { downloads: file[0].downloads + 1 } })
    return true;
}

function sendLink(receiver, shareID, callback) {

    const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: 'cloudneinofficial@gmail.com', pass: 'CloudNein' }, });
    var mailOptions = {
        from: 'cloudneinofficial@gmail.com',
        to: receiver,
        subject: 'CloudNein Files',
        text: "Link to files: " + "https://localhost:3000/sharefile?shareID=" + shareID
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.error(error.stack);
            throw error;
        } else {
            console.log('Email sent: ' + info.response);
            callback(error, info);
        }
    });
}

//#endregion


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
    getSharedFiles: getSharedFiles,
    compressFolder: compressFolder,
    spaceCheck: spaceCheck,
    checkSharelinkUsages: checkSharelinkUsages,
    decreaseUsages: decreaseUsages,
    getProfilePicture: getProfilePicture,
    uploadProfilePicture: uploadProfilePicture,
    deleteProfilePicture: deleteProfilePicture,
    usedSpace: usedSpace,
    getActualPath: getActualPath,
    getFolderContent: getFolderContent,
    increaseDownloads: increaseDownloads,
    deleteItem: deleteItem,
}
