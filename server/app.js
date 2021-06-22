const express = require("express");
const app = express();
const db = require("./Database");
const parser = require("body-parser");
const cors = require("cors");
const routes = require('./routes')
const errorHandler = require('./error_handler');
const verifier = require('./jwt_verifier');

const PORT = 80;
// public routes that don't require authentication
const excluded_urls = [
    '/',
    '/login',
    '/register',
    '/forgotPassword',

    // '/dbtest',
    // '/test',
    '/error'
];


// Middleware
app.use(express.static("public"));
app.use(cors());
app.use(parser.urlencoded({ extended: true, limit: "50mb" }));
app.use(parser.json({ extended: true, limit: "50mb" }))
app.use(express.json())

// FIXME: debug only
// logging all request (debug mode)
app.use(function (req, res, next) {
    console.log(`${req.ip} ${req.method} ${req.url}`);
    // console.log(req.headers)
    next();
})

// FIXME: Wahrscheinlich überflüssig da Frontend von react gehandelt wird.
// Wird vieleicht später nützlich wenn react über express gehostet wird und nicht mehr über den development server (nach dem build)

// app.use(expressJwt({ secret: config.secret, algorithms: ['HS256'] }).unless({
//     path: excluded_urls
// }));

app.use(verifier(excluded_urls));

app.use('/', routes);


// handles all code errors (error middleware must be the last middleware)
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`app listening at ${PORT}`);
    db.connect();
});

