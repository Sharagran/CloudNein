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

// FIXME: debug only
// logging all request (debug mode)
app.use(function (req, res, next) {
    console.log(`${req.ip} ${req.method} ${req.url}`);
    console.log(req.headers)
    next()
})

app.use('/', routes);

// handles all code errors (error middleware must be the last middleware)
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500);

    var responseJSON = {
        code: 500,
        message: `Error: ${err.message}`
    };
    res.end(JSON.stringify(responseJSON));
    //next(err) // falls keine response gesendet wird kümmert sich express darum mit next(error)
});


app.listen(PORT, () => {
    console.log(`app listening at ${PORT}`);
    db.connect();
});

