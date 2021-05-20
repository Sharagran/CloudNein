const express = require("express");
const app = express();
const db = require("./Database");
const parser = require("body-parser");
const cors = require("cors");
const routes = require('./routes')



const PORT = 80;


// Middleware
app.use(express.static("public"));
app.use(cors());
app.use(parser.urlencoded({ extended: false })); 
app.use(express.json())
app.listen(PORT, () => {
    console.log(`app listening at ${PORT}`);
    db.connect();
});


routes(app);

