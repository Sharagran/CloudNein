const express = require("express");
const app = express();
const path = require("path");
const fileUpload = require('express-fileupload'); //https://www.npmjs.com/package/express-fileupload
const db = require("./Database");
const parser = require("body-parser");
const { hash_password } = require("./Authentication");




const PORT = 80;

// Middleware
app.use(fileUpload({
    //limits: { fileSize: 50 * 1024 * 1024 }    //upload limit in bytes für alle files
}));
app.use(express.static("public"));

app.use(parser.urlencoded({ extended: false })); 

app.listen(PORT, () => {
    console.log(`app listening at ${PORT}`);
    db.connect();
});


/* TODO: Login
* validate client login credentials
* save sessionID on server (database?)
* send sessionID to client
*/

app.post('/login', (req, res) => {
    //res.send(`Full name is:${req.body.username} ${req.body.password}.`);
    console.log(`${req.body.username} ${req.body.password}`);
  });
  
  //Verarbeitet die empfangenen Daten beim Registrieren
app.post('/register', (req, res) => {

    //prüfen, ob Name und Email vorhanden sind, wen nicht dann hashen und speichern
    db.readData("User", {Email:req.body.mail}, (error, result) => {
        if(error) {
            throw error;
        }else if(result.length >0) {
            console.log("Username or Email ist already taken");
        }else {
            hash_password(req.body.password, (err, hash) => {
                if(error) throw error;
                db.createData("User", [{Username:req.body.username, Password:hash, Email:req.body.mail}], (error, result) => {
                    if(error) throw error;
                    console.log(result);
                }); 
            });
        }
    });
  });

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/login.html'));
});

app.get('/dbtest', function (req, res) {
    db.readData("test", {value1:"test1"}, (error, result) => {
        console.log(result);
    });
});

// https://stackoverflow.com/a/6059938
app.route('/upload')
.get(function (req, res) {
    res.sendFile(__dirname + "/public/upload.html");
}).post(function (req, res) {
    // upload
    if(req.files) {
        let file = req.files.file;
        //req.query.uploadPath
        let uploadPath = __dirname + '/UserFiles/' + file.name;
        
        file.mv(uploadPath, function(err) {
            if (err) {
                return res.status(500).send(err);
            }
            res.send('File uploaded!');
          });
    } else {
        res.send("No files uplaoded");
    }
});


app.get(['/myfiles', '/myfiles/:path'], function (req, res) {
    // download
    var path = req.params.path;

    if(path) {
        res.send(path);
    } else {
        res.send("myfiles");
    }
    
})

app.get('*', function (req, res) {
    res.status(404).sendFile(__dirname + '/public/error.html');
});