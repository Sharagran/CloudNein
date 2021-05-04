var express = require("express");
var app = express();

app.use(express.static("public"));

app.listen(80, () => {
    console.log("app listening at port 80");
});

app.get('/', (req, res) => {
    res.send('yo');
});