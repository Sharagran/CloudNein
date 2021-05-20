const express = require("express");
const app = express();
const db = require("./Database");
const parser = require("body-parser");
const routes = require('./routes')

const PORT = 80;


// Middleware
app.use(express.static("public"));

app.use(parser.urlencoded({ extended: false })); 

app.listen(PORT, () => {
    console.log(`app listening at ${PORT}`);
    db.connect();
});

routes(app);
