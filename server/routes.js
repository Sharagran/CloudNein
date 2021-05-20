const path = require("path");
const multer = require('multer');
const db = require("./Database");
const { hash_password, compare_hash, sendNewPassword, generatePassword} = require("./Authentication");
const fs = require("fs");

var upload = multer({dest: `${__dirname}/../UserFiles/`});

module.exports = function (app) {

    app.get('/', function (req, res) {
        res.sendFile(path.join(__dirname + '/public/login.html'));
    });

    app.post('/login', (req, res) => {
        //res.send(`Full name is:${req.body.username} ${req.body.password}.`);
        db.readData("User", {Username:req.body.username}, (error, result) =>{
            if(error) {
                throw error;
            }else if (result.length > 0)
                compare_hash(req.body.password, result[0].Password, (error, match) => {
                    if(error) {
                        throw error;
                    }else {
                        console.log("Matching password: " + match);
                    };
                });
            else{
                console.log("Login fehlgeschlagen");
            };
        });
    });
      
    //Verarbeitet die empfangenen Daten beim Registrieren
    app.post('/register', (req, res) => {
        //prüfen, ob Name und Email vorhanden sind, wen nicht dann hashen und speichern
        console.log(req.body.mail);
        db.readData("User", {Username:req.body.username, Email:req.body.mail}, (error, result) => {
            if(error) {
                throw error;
            }else if(result.length > 0) {
                console.log("Username or Email ist already taken");
            }else {
                console.log(result);
                hash_password(req.body.password, (error, hash) => {
                    if(error) throw error;
                    db.createData("User", [{Username:req.body.username, Password:hash, Email:req.body.mail}], (error, result) => {
                        if(error) throw error;
                        console.log(result);
                    }); 
                });
            };
        });
    });
    
    //Erzeugt ein neues Passwort, updatet dies in der DB und sendet eine Mail an den User
    app.post('/forgotPassword', (req, res) =>{
        db.readData('User', {Email:req.body.email}, (error, result) => {
            if(error) {
                throw error;
            }else if(result.length < 1) {
                console.log("Email nicht gefunden");
            }else {
                newPassword = generatePassword();
                hash_password(newPassword, (error,hash) =>{
                    if(error) throw error;
                    db.updateData("User",{Email:req.body.email}, { $set:{ Password:hash}}, (error,result) => {
                        if(error) throw error;
                        console.log(result);
                    })
                    sendNewPassword(result[0].Email, newPassword, (error, info) =>{
                        if(error) throw error;
                    });
                })
            };
        });
    });
    
    app.get('/dbtest', function (req, res) {
        db.readData("test", {value1:"test1"}, (error, result) => {
            console.log(result);
        });
    });
    
    // https://stackoverflow.com/a/6059938
    app.get('/upload', function (req, res) {
        res.sendFile(__dirname + "/public/upload.html");
    });
    app.post('/upload', upload.array("files"), function (req, res) {
        for (const key in req.files) {
            const file = req.files[key];
    
            fs.rename(file.path, file.destination+file.originalname, function (error) {
                if(error)
                    throw error;
            });
        }
        var responseJSON = {
            message: req.files.length + ' files uploaded successfully'
        };
        res.end(JSON.stringify(responseJSON));
    });
    
    app.get(['/myfiles', '/myfiles/:path'], function (req, res) {
        // download
        var path = req.params.path;
    
        if(path) {
            res.send(path);
        } else {
            res.send("myfiles");
        }
    });
    
    app.get('/files/:id', function (req, res) {
        
    });
    
    // Error route must be the last
    app.get('*', function (req, res) {
        res.status(404).sendFile(__dirname + '/public/error.html');
    });

}
