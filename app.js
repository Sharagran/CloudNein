const express = require("express");
const app = express();
const path = require("path");
const fileUpload = require('express-fileupload'); //https://www.npmjs.com/package/express-fileupload

const PORT = 80;

// Middleware
app.use(fileUpload({
    //limits: { fileSize: 50 * 1024 * 1024 }    //upload limit in bytes für alle files
}));
app.use(express.static("public"));

app.listen(PORT, () => {
    console.log(`app listening at ${PORT}`);
});


/* TODO: Login
* validate client login credentials
* save sessionID on server (database?)
* send sessionID to client
*/

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/authentication/login.html'));
});

// https://stackoverflow.com/a/6059938
app.post('/upload', function (req, res) {
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
        //res.send("myfiles");
        res.sendFile(__dirname + "/public/upload.html")
    }
    
})

app.get('*', function (req, res) {
    res.status(404).sendFile(__dirname + '/public/error.html');
});