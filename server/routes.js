const path = require("path");
const multer = require('multer');
const db = require("./Database");
const auth = require("./Authentication");
const fm = require('./FileManager');
const express = require("express");
const fs = require("fs");

var upload = multer({ dest: `${__dirname}/../UserFiles/` });
var router = express.Router();

router.post('/login', async (req, res) => {
    var user = await auth.login(req.body.user.username, req.body.user.password);
    var token = auth.signIn(user);
    //auth.verify(token); //FIXME: DEBUG ONLY
    res.send({token: token, user: user});
});


//Verarbeitet die empfangenen Daten beim Registrieren
router.post('/register', (req, res) => {
    auth.register(req.body.user.mail, req.body.user.username, req.body.user.password);
});

//Erzeugt ein neues Passwort, updatet dies in der DB und sendet eine Mail an den User
router.post('/forgotPassword', (req, res) => {
    auth.forgotPassword(req.body.email.email);
});

router.post('/settings', (req, res) => {
    //Daten des User erfragen, wie? Per Session?

    db.readData("User", { Username: req.body.user.previousUsername},  (error, result) =>{
        if (error) {
            throw error;}
            if(req.body.user.username == undefined){
                db.readData("User", { Email: req.body.user.mail },  (error, result) => {
                    console.log(result);
                    if (error) {
                        throw error;
                    }else if(result.length == 0){
                        db.updateData("User", { Email: req.body.user.previousMail }, { $set: { Email: req.body.user.mail } }, (error, result) => {
                            if (error) throw error;
                            console.log("Mail updated");
                        })
                    }
                })
            }else if (req.body.user.mail == undefined) {
                db.readData("User", { Username: req.body.user.username },  (error, result) => {
                    if (error) {
                        throw error;
                    }else if(result.length == 0){
                        db.updateData("User", { Username: req.body.user.previousUsername }, { $set: { Username: req.body.user.username } }, (error, result) => {
                            if (error) throw error;
                            console.log("Username updated");
                            fs.rename("../UserFiles/"+ req.body.user.previousUsername, "../UserFiles/"+ req.body.user.username, function(err) {
                                if (err) {
                                  console.log(err)
                                } else {
                                  console.log("Successfully renamed the directory.")
                                }
                              })
                        })
                    }
                })
            }
    })
})

router.post('/upload', upload.array("files"), function (req, res) {
    var responseJSON = fm.uploadFiles(req);
    res.end(JSON.stringify(responseJSON));
});


// FIXME: Debug only (all get routes should be handled with react)
router.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/login.html'));
});

router.get('/dbtest', function (req, res) {
    db.readData("test", { value1: "test1" }, (error, result) => {
        console.log(result);
    });
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
    fm.shareFile("../UserFiles/Sharangran-hinten.png", 3000, 10, function (error, link) {
        if(error)
            console.log(error.message);
        console.log(link);
    });
})

router.get('*', function (req, res) {
    res.status(404).sendFile(__dirname + '/public/error.html');
});

module.exports = router;
