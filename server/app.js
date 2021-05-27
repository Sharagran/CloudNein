const express = require("express");
const app = express();
const db = require("./Database");
const parser = require("body-parser");
const cors = require("cors");
const routes = require('./routes')
const expressJwt = require('express-jwt');
const config = require('./config.json');  // generate secret: require('crypto').randomBytes(64).toString('hex')
const errorHandler = require('./error_handler');
const verifier = require('./jwt_verifier');

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

app.use(expressJwt({ secret: config.secret, algorithms: ['HS256'] }).unless({
    path: [
        // public routes that don't require authentication
        '/',
        '/login',
        '/register',
        '/forgotPassword',

        '/dbtest',
        '/test',
        '/error'
    ]
}));

app.use(verifier);

app.use('/', routes);


//FIXME: debug only
app.use(function (req, res, next) {
    console.log(req.user);
});

// handles all code errors (error middleware must be the last middleware)
app.use(errorHandler);


app.listen(PORT, () => {
    console.log(`app listening at ${PORT}`);
    db.connect();
});

