const express = require("express");
const app = express();
const PORT = 80;

app.use(express.static("public"));

app.listen(PORT, () => {
    console.log(`app listening at ${PORT}`);
});

app.get('/', function (req, res) {
    res.send('yoyo');
});

// https://stackoverflow.com/a/6059938
app.post('/upload', function (req, res) {
    // upload
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
    res.send('Error 404 page not found.', 404);
});