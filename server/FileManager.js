const fs = require("fs");
const { join } = require('path');
const db = require("./Database");
const uuidv4 = require('uuid').v4;
var cron = require('node-cron');
const nodemailer = require("nodemailer");
var archiver = require('archiver');



/** checks for expired files & shareLinks every hour (minute==0) */
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
/**
 * uploads a file to the server, saves it to the disk & database and sets the maximum save duration
 * @param req express request
 * @param userID userID
 * @param username username
 * @param tags file tags
 * @returns json response
 */
async function uploadFiles(req, userID, username, tags = []) {

    var expirationDate = await db.readDataPromise('settings', { User: "Admin" })
    for (const key in req.files) {
        const file = req.files[key];

        const savePath = `${__dirname}/../UserFiles/${username}/${file.originalname}`;
        fs.rename(file.path, savePath, function (error) {
            if (error)
                throw error;

            const id = uuidv4();
            var date = new Date();
            date.setDate(date.getDate() + parseInt(expirationDate[0].days))
            var expires = date.toISOString();

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

/**
 * Creates a new Folder and stores the information in the database.
 * @param  parentID null if ther is no parten otherwise the partent fileID
 * @param  name name of the folder.
 * @param  userID 
 * @returns 
 */
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

/**
 * Get all files that stored in a folder.
 * @param  id id of the folder.
 * @param  userid 
 * @returns array with the stored file information.
 */
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

/**
 * Get all information from a file
 * @param  id fileID
 * @returns stored file information
 */
async function getFile(id) {
    var file = await db.readDataPromise('file', { id: id })
    return file[0];
}

/**
 * Get the path from an file
 * @param  fileID 
 * @returns Path to the users folder if the id is a foler otherwise path to the users folder with the file path
 */
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


/**
 * Deletes a file/folder
 * @param fileID fileID
 */
async function deleteItem(fileID) {
    var file = await getFile(fileID);

    if (file.isFolder) {
        deleteFolder(fileID);
    } else {
        deleteFile(fileID)
    }
}

  /** recursive function to delete a folder from db & all its content from db & disk */
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

/** function to remove file from db & disk */
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

    console.log(`${fileID} deleted`);
}

//#endregion

//#region File attributes
/**
 * Moves a file inside a folder
 * @param fileID id of the file that is supposed to be moved
 * @param folderID id of the folder which the file is supposed to be moved in
*/
async function moveFile(fileID, folderID) {
    if (fileID == folderID) return false;

    if (folderID == 'null') {
        folderID = null;
    } else {
        var folder = await getFile(folderID);
        if (folder.isFolder == false) return false;
    }

    await db.updateDataPromise('file', { id: fileID }, { $set: { parent: folderID } });

    return true;
}

/**
 * Add a comment to a file or folder and store it in the database
 * @param  fileID 
 * @param  text The comment.
 */
function commentFile(fileID, text) {
    db.updateData('file', { id: fileID }, { $set: { comment: text } })
}

/**
 * Add a comment to a file or folder and store it in the database
 * @param  fileID 
 * @param  tag 
 * @returns 
 */
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

/**
 * @param fileID fileID
 * @param maxDownloads new maximum downloads for the specified file
 * @returns 
 */
async function setMaxDownloads(fileID, maxDownloads) {
    try {
        await db.updateDataPromise('file', { id: fileID }, { $set: { maxDownloads: maxDownloads } });
        return true;
    } catch (error) {
        console.error(error.stack);
        return false;
    }
}
//#endregion

//#region Settings

/**
 * Create admin settings to set the upload limit and the expiration date.
 */
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

/**
 * Get the stoed upload limit from the database.
 * @returns upload limit in mb
 */
async function getDataLimit() {
    try {
        var error, result = await db.readDataPromise('settings', { User: "Admin" });
        return result[0].limit / 1000000;
    } catch (error) {
        console.error(error.stack);
    }
}

/**
 * Calculates the used space from a user from the database enties.
 * @param  userID 
 * @returns used space from the user
 */
async function usedSpace(userID) {
    var size = 0;
    try {
        var error, result = await db.readDataPromise('file', { owner: userID });

        result.forEach(file => {
            size += file.fileSize
        })
        return parseFloat(size / 1000000).toFixed(2);
    } catch (error) {
        console.error(error.stack);
    }
}

/**
 * Checks if the used space and the to uploaded file size bigger than the upload limit.
 * @param  fileSize size of the files that should be uploaded
 * @param  userID 
 * @returns True if the folder size and the file size lesser than the upload limit otherwise false.
 */
async function spaceCheck(fileSize, userID) {
    var folderSize = await checkUploadLimit(userID)
    var dataLimit = await getDataLimit() * 1000000

    if (folderSize + fileSize <= dataLimit) {
        return true;
    } else {
        console.log(("not enough space"));
        return false;
    }

}

/**
 * Gets the number of days after which a file is deleted
 * @returns number of days
 */
async function getExpirationDate() {
    var error, result = await db.readDataPromise('settings', { User: "Admin" });
    return result[0].days
}

/**
 * Set the upload data limit
 * @param  limit upload limit in byte
 */
async function setDataLimit(limit) {
    await db.updateDataPromise('settings', { User: "Admin" }, { $set: { limit: limit } });
    console.log("DataLimit updated");
}

/**
 * Set the number for the exporation date
 * @param  days number of days
 */
async function setExpirationDate(days) {
    await db.updateDataPromise('settings', { User: "Admin" }, { $set: { days: days } });
    console.log("Expiration Date updated");
}

async function checkUploadLimit(userID) {
    var size = 0;

    var error, result = await db.readDataPromise('file', { owner: userID });
    for (var i = 0; i < result.length; i++) {
        size += result[i].fileSize
    }

    return size;
}
//#endregion

//#region UserProfile

/**
 * Uploads a png to the server and store it with the userID as the name.
 * @param  req includes a png 
 * @param  userID 
 * @returns true if the png is stored at the server
 */
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

/**
 * Delete the current profile picture to store a new one.
 * @param  userID 
 */
async function deleteProfilePicture(userID) {
    var filename = fs.readdirSync(`${__dirname}/../ProfilePictures/`)
    filename.forEach(file => {
        if (file === userID + ".png") {
            fs.unlinkSync(`${__dirname}/../ProfilePictures/${userID}.png`)
        }
    })
}

/**
 * Checks if a profile picture is available and sends
 * @param  userID 
 * @returns the users profile picture
 */
function getProfilePicture(userID) {
    try {

        var fileNames = fs.readdirSync(`${__dirname}/../ProfilePictures/`)
        var available;
        fileNames.forEach(file => {
            if (file == `${userID}.png`) { available = true }
        })

        if (available) {
            var img = fs.readFileSync(`${__dirname}/../ProfilePictures/${userID}.png`)
            var base64 = Buffer.from(img).toString('base64');
            base64 = 'data:image/png;base64,' + base64;
            return base64;
        }
    } catch (error) {
        console.error(error.stack);
    }
}
//#endregion

//#region Download
/**
 * Create a .zip file from the files that are stored in a folder.
 * @param  path location of the files.
 * @param  folderID 
 * @returns path where the .zip is stored.
 */
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


/**
 * Download a file if the file isn't expired and the actual downloads lesser than max downloads.
 * Download a zip if it's a folder-
 * @param  id 
 * @param  res 
 * @returns 
 */
async function downloadFile(id, res) {
    var file = await getFile(id);
    if (file.maxDownloads && file.downloads >= file.maxDownloads) {
        return;
    }

    if (isExpired(file)) {
        deleteItem(file.id);
        return;
    }

    var filePath = await getActualPath(file.id);
    console.log('download: ', filePath);

    if (file.isFolder) {
        var zipPath = await compressFolder(filePath, file.id);
        zipPath = join(zipPath);
        await new Promise(r => setTimeout(r, 500)); // 500ms delay need or downloaded zip file will be invalid
        res.download(zipPath);
    } else {
        res.download(filePath);
    }
}

//#endregion

//#region Share

/**
 * Create the information which are required for the share link and store them in the database.
 * @param  itemID file or folder 
 * @param  expires 
 * @param  usages counter how man the download can be confirmed
 * @param  callback shareID
 */
async function share(itemID, expires, usages, callback) {
    const shareID = uuidv4();
    var date = new Date();
    date.setDate(date.getDate() + expires)
    expires = date.toISOString();

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

/**
 * Get the fileID information which are stored in the shareID in the database.
 * @param  shareID 
 * @returns array with shared files.
 */
async function getSharedFiles(shareID) {
    var error, result = await db.readDataPromise('shared', { shareID: shareID })
    return result[0]
}

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

/**
 * Checks if the usages are available. If not deletes the database entry.
 * @param  shareID 
 * @returns false by default. True if the usages counter is lesser than 0.
 */
async function checkSharelinkUsages(shareID) {
    var query = shareID ? { shareID: shareID } : {};
    var shareLinkUsed = false;

    var error, result = await db.readDataPromise('shared', query)
    result.forEach(shareEntry => {
        var usages = shareEntry.usages;
        if (usages <= 0) {
            shareLinkUsed = true;
            db.deleteDataPromise('shared', { _id: shareEntry._id }, function () {
                console.log(`share link "${shareEntry.shareID}" deleted`);
            });
        }
    });
    return shareLinkUsed;
}


/**
 * Checks if a file in the database is expired and delte the entry
 * @param  fileID 
 */
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

/**
 * Checks if a database entry is expired.
 * @param  shareEntry 
 * @returns true if the actual date is greater than the exopration data otherwise false
 */
function isExpired(shareEntry) {
    var expires = shareEntry.expires;
    var expiration = Date.parse(expires);

    if (Date.now() >= expiration) {
        return true;
    } else {
        return false;
    }
}

/**
 * Decrease the usage counter by 1 if it's greater than 0.
 * @param  shareID 
 * @returns true if the decrement is done.
 */
async function decreaseUsages(shareID) {
    var actualUsages = await db.readDataPromise('shared', { shareID: shareID })
    if (actualUsages[0].usages > 0) {
        await db.updateDataPromise('shared', { shareID: shareID }, { $set: { usages: actualUsages[0].usages - 1 } })
        return true;
    }
}

/**
 * Increase the download counter of a file by 1.
 * @param  fileID 
 * @returns true if the increment is done
 */
async function increaseDownloads(fileID) {
    var file = await db.readDataPromise('file', { id: fileID })
    await db.updateDataPromise('file', { id: fileID }, { $set: { downloads: file[0].downloads + 1 } })
    return true;
}

/**
 * Sends the share link to a selected email.
 * @param  receiver email
 * @param  shareID 
 * @param  callback 
 */
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
    setMaxDownloads: setMaxDownloads,
}
