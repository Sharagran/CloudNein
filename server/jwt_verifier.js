const jwt = require('jsonwebtoken');
const config = require('./config.json');

module.exports = jwt_verifier;


function jwt_verifier(exluded_urls) {
    if(!Array.isArray(exluded_urls)) {
        throw new Error("verifier can only have an array as parameter");
    }

    return function (req, res, next) {
        if(exluded_urls.includes(req.originalUrl)) {
            console.log("skip verifier");   //FIXME: debug only
            return next();
        } else {
            return authenticate(req, res, next);
        }
    }

}

function authenticate (req, res, next) {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, config.secret, (err, user) => {
            if (err) {
                if(err.name == 'TokenExpiredError') {
                    console.log("Expired");
                    return next(); //TODO: redirect to login page (login expired)
                } else {
                    console.error(err.stack);
                    return res.sendStatus(403);
                }
            }

            req.user = user;
            next();
        });
    } else {
        console.log('No token specified');
        //TODO: Send user to login page?
        next();
    }
}
