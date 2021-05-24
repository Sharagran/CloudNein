const path = require("path");
const multer = require('multer');
const db = require("./Database");
const { hash_password, compare_hash, sendNewPassword, generatePassword } = require("./Authentication");
const fm = require('./FileManager');
const express = require("express");

var upload = multer({ dest: `${__dirname}/../UserFiles/` });
var router = express.Router();

router.post('/login', (req, res) => {
    db.readData("User", { Username: req.body.user.username }, (error, result) => {
        if (error) {
            throw error;
        } else if (result.length > 0)
            compare_hash(req.body.user.password, result[0].Password, (error, match) => {
                if (error) {
                    throw error;
                } else {
                    console.log("Matching password: " + match);
                };
            });
        else {
            console.log(req.body.user.password, req.body.user.username);
            console.log("Login fehlgeschlagen");
        };
    });
});

//Verarbeitet die empfangenen Daten beim Registrieren
router.post('/register', (req, res) => {
    //prüfen, ob Name und Email vorhanden sind, wen nicht dann hashen und speichern
    console.log(req.body.user.mail);
    db.readData("User", { Username: req.body.user.username, Email: req.body.user.mail }, (error, result) => {
        if (error) {
            throw error;
        } else if (result.length > 0) {
            console.log("Username or Email ist already taken");
        } else {
            console.log(result);
            hash_password(req.body.user.password, (error, hash) => {
                if (error) throw error;
                db.createData("User", [{ Username: req.body.user.username, Password: hash, Email: req.body.user.mail }], (error, result) => {
                    if (error) throw error;
                    console.log(result);
                });
            });
        };
    });
});

//Erzeugt ein neues Passwort, updatet dies in der DB und sendet eine Mail an den User
router.post('/forgotPassword', (req, res) => {
    console.log(req.body.email.mail);
    db.readData('User', { Email: req.body.email.email }, (error, result) => {
        if (error) {
            throw error;
        } else if (result.length < 1) {
            console.log("Email nicht gefunden");
        } else {
            newPassword = generatePassword();
            hash_password(newPassword, (error, hash) => {
                if (error) throw error;
                db.updateData("User", { Email: req.body.email.email }, { $set: { Password: hash } }, (error, result) => {
                    if (error) throw error;
                    console.log(result);
                })
                sendNewPassword(result[0].Email, newPassword, (error, info) => {
                    if (error) throw error;
                });
            })
        };
    });
});

router.post('/settings', (req, res) => {
    //Daten des User erfragen, wie? Per Session?
    db.readData("User", { Username: "Andre14"},  (error, result) =>{
        if (error) {
            throw error;}
            if(req.body.user.username == undefined){
                db.readData("User", { Email: req.body.user.mail },  (error, result) => {
                    if (error) {
                        throw error;
                    }else if(result.length == 0){
                        db.updateData("User", { Username: "Andre14" }, { $set: { Email: req.body.user.mail } }, (error, result) => {
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
                        db.updateData("User", { Username: "Andre14" }, { $set: { Username: req.body.user.username } }, (error, result) => {
                            if (error) throw error;
                            console.log("Username updated");
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

router.get('*', function (req, res) {
    res.status(404).sendFile(__dirname + '/public/error.html');
});

module.exports = router;
