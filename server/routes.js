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
    res.send({token: token, user: user});
});


//Verarbeitet die empfangenen Daten beim Registrieren
router.post('/register', async (req, res) => {
    var success = await auth.register(req.body.user.mail, req.body.user.username, req.body.user.password);
    console.log(success);
    if(success === true){
        res.send(true)
    }else {
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

    if(username === undefined){
        await auth.changeMail(req.user.id, req.body.user.mail, req.body.user.previousMail)
    }else if (mail === undefined){
        await auth.changeUsername(req.user.id, req.body.user.username, req.body.user.previousUsername)
    }
})

router.post('/upload', upload.array("files"), function (req, res) {
    var responseJSON = fm.uploadFiles(req, req.user.id, req.user.username);
    res.end(JSON.stringify(responseJSON));
});

router.post("/share", async function (req, res) {
    
    var days = parseInt(req.body.shareInformation.days)
    var fileID = req.body.shareInformation.fileID
    var email = req.body.shareInformation.email
    var fileName = req.body.shareInformation.fileName

    fm.share(fileID, days, 10,  function (error, shareID) {
        if(error) {
            console.error(error.message);
            res.send(500);
        }
        fm.sendLink(email, shareID, fileName, (error, info) => {
            if (error) throw error;
        })
    });
});

router.post('/getShareInformation', async (req, res) => {
    var sharedFiles = await fm.getSharedFiles(req.body.shareInformation.shareID)
    res.send(sharedFiles[0].sharedItem)
})

router.get('/share/:id', function (req, res) {

});

router.get('/download/:id', async function (req, res) {
    fm.downloadFile(req.params.id, res);
 });

router.post('/storage', async function(req, res) {
    var files = await fm.getFiles(req.user.id);
    res.json(files);
});


router.post('/updateFileInformation', (req, res) => {
  var tag = req.body.fileInforamtion.tag;
  var comment = req.body.fileInforamtion.comment;
  var fileID = req.body.fileInforamtion.fileID

    if(tag) {
        fm.addTag(fileID, tag);
    }
    if(comment) {
        fm.commentFile(fileID, req.user.id, comment)
    }
})


// FIXME: Debug only (all get routes should be handled with react)
router.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/login.html'));
});

router.get('/dbtest', function (req, res) {
    // fm.addTag('3fcc3d79-29dd-4d39-9b67-3238aeab5fd8', 'tag2');
    res.send(200);
});

router.get('/upload', function (req, res) {
    res.sendFile(__dirname + "/public/upload.html");
});

router.get(['/myfiles', '/myfiles/:path'], function (req, res) {
    // download
    var path = req.params.path;

    if (path) {
        res.send(path);
    } else {
        res.send("myfiles");
    }
});

router.get('/files/:id', function (req, res) {

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
