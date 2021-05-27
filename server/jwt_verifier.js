const jwt = require('jsonwebtoken');
const config = require('./config.json');

module.exports = authenticateJWT;

function authenticateJWT (req, res, next) {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, config.secret, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            next();
        });
    } else {
        console.log('No token specified');
        //res.sendStatus(401);
    }
};
