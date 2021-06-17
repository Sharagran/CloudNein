/* eslint-disable no-unused-vars */

const path = require("path");
const multer = require('multer');
const auth = require("./Authentication");
const fm = require('./FileManager');
const express = require("express");


var upload = multer({ dest: `${__dirname}/../UserFiles/` });
var router = express.Router();

router.post('/login', async (req, res) => {
    fm.createUploadSettings();
    var user = await auth.login(req.body.user.username, req.body.user.password);
    var token = auth.sign(user);
    res.send({ token: token, user: user });
});


//Verarbeitet die empfangenen Daten beim Registrieren
router.post('/register', async (req, res) => {
    var success = await auth.register(req.body.user.mail, req.body.user.username, req.body.user.password);
    console.log(success);
    if (success === true) {
        res.send(true)
    } else {
        res.send(false)
    }
});

//Erzeugt ein neues Passwort, updatet dies in der DB und sendet eine Mail an den User
router.post('/forgotPassword', (req, res) => {
    auth.forgotPassword(req.body.email.email);
    res.send(true);
});

router.post('/getDataLimit', async (req, res) => {
    var dataLimit = await fm.getDataLimit();
    res.json(dataLimit);
});

router.post('/getExpirationDate', async (req, res) => {
    var expirationDate = await fm.getExpirationDate();
    res.json(expirationDate);
})

router.post('/setDataLimit', async (req, res) => {
    await fm.setDataLimit(req.body.settings.dataSizeNew);
});

router.post('/setExpirationDate', async (req, res) => {
    await fm.setExpirationDate(req.body.settings.daysNew);
});

router.post('/settings', async (req, res) => {
    var username = req.body.user.username
    var mail = req.body.user.mail
    var previousUsername = req.body.user.previousUsername

    if (username) {
        await auth.changeUsername(req.user.id, username, previousUsername)
    } else if (mail) {
        await auth.changeMail(req.user.id, mail)
    }
})

router.post('/uploadCheck', async function (req, res) {
    var spaceCheck = await fm.spaceCheck(req, req.user.id)
    if (spaceCheck) {
        res.send(spaceCheck)
    } else {
        res.send(false)
    }
});

router.post('/upload', upload.array("files"), function (req, res) {
    var responseJSON = fm.uploadFiles(req, req.user.id, req.user.username);
    res.end(JSON.stringify(responseJSON));
});

router.post('/uploadProfilePicture', upload.array("files"), async function (req, res) {
    await fm.deleteProfilePicture(req.user.id)
    var result = fm.uploadProfilePicture(req, req.user.id);
    res.send(result)
});

router.post('/getStorageSpaceInformation', async function (req, res) {
    var dataLimit = await fm.getDataLimit()
    var usedSpace = await fm.usedSpace(req.user.id)
    res.send({ dataLimit, usedSpace })
});

router.post("/share", async function (req, res) {
    var days = parseInt(req.body.shareInformation.days)
    var fileID = req.body.shareInformation.fileID
    var email = req.body.shareInformation.email
    var usages = req.body.shareInformation.usages

    fm.share(fileID, days, usages, function (error, shareID) {
        if (error) {
            console.error(error.message);
            res.send(500);
        }
        email.forEach(function (email) {
            fm.sendLink(email, shareID, (error, info) => {
                if (error) throw error;
            })
        })
    });
});

router.post('/getShareInformation', async (req, res) => {
    var sharedFiles = await fm.getSharedFiles(req.body.shareInformation.shareID)
    var files = await fm.getFile(sharedFiles)
    res.send(files)
})

router.get('/share/:id', function (req, res) {

});

router.get('/download/:id', async function (req, res) {
    fm.downloadFile(req.params.id, res);
});

//FIXME:Add download and adjust id
router.get('/downloadZip/:id', async function (req, res) {
    var path = await fm.getActualPath("53d9a7c6-b0c2-4032-9a06-2be9e7e0d04a")
    fm.compressFolder(path, "53d9a7c6-b0c2-4032-9a06-2be9e7e0d04a")
});

router.post('/storage', async function (req, res) {
    var files = await fm.getFolderContent(req.body.folderid);
    // var files = await fm.getFiles(req.user.id);
    res.json(files);
});


router.post('/getProfilePicture', function (req, res) {
    var img = fm.getProfilePicture(req.user.id)
    res.send(img)
})

router.post('/checkSharelinkExpiration', async function (req, res) {
    var result = await fm.checkSharelinkExpirations(req.body.shareInformation.shareID);
    res.send(result);
})

router.post('/checkSharelinkUsages', async function (req, res) {
    var result = await fm.checkSharelinkUsages(req.body.shareInformation.shareID)
    console.log(result);
    res.send(result);
})

router.post('/adjustUsages', async function (req, res) {
    var decrease = await fm.decreaseUsages(req.body.shareInformation.shareID)
    var increase = await fm.increaseDownloads(req.body.shareInformation.fileID)

    if(increase && decrease){
        res.send(true)
    }else {
        res.send(false)
    }
    
})

router.post('/updateFileInformation', (req, res) => {
    var tag = req.body.fileInforamtion.tag;
    var comment = req.body.fileInforamtion.comment;
    var fileID = req.body.fileInforamtion.fileID

    if (tag) {
        fm.addTag(fileID, tag);
    }
    if (comment) {
        fm.commentFile(fileID, req.user.id, comment)
    }
})


// FIXME: Debug only (all get routes should be handled with react)
router.get('/', function (req, res) {
    console.log(__dirname + '/public/login.html');
    console.log(path.join(__dirname + '/public/login.html'));
    res.sendFile(__dirname + '/public/login.html');
});

router.get('/dbtest', async function (req, res) {
    // fm.share('af3916d7-244e-4351-85a3-cf68d20e8a86', 7, null);
    console.log(req.user.id);
    if(req.user.id) {
        // fm.createFolder(null, 'TestFolder', req.user.id);
        var test = fm.moveFile('7dfeba13-43c4-4463-bdb3-a5386c244794', '7dfeba13-43c4-4463-bdb3-a5386c244794');
        console.log(test);
        // var p = await fm.getActualPath('225b8b2b-b866-4316-a8c6-44b993ab4ad0');
        // fm.compressFolder(p, '225b8b2b-b866-4316-a8c6-44b993ab4ad0');
        res.send(200);
    } else {
        res.send(500);
    }
});

router.get('/upload', function (req, res) {
    res.sendFile(__dirname + "/public/upload.html");
});

router.get('/error', function (req, res) {
    fghfghfg.error();
})

router.get('/test', function (req, res) {
    console.log("/test");
    console.log(req.user);
    res.send(req.user);
})

router.get('*', function (req, res) {
    res.status(404).sendFile(__dirname + '/public/error.html');
});

module.exports = router;
