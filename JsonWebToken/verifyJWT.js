const jwt = require('jsonwebtoken');
require('dotenv').config();

function verifyJWT(req, res, next) {
    const authorization = req.get('Authorization');
    const [_, token] = authorization.split(' ');

    jwt.verify(
        token,
        process.env.JWT_SECRET,
        (error, decoded)=>{
            if (error != null) {
                console.log('verify token error', error);
                res.status(401).json({
                    message: 'Token is not valid.'
                });
                return;
            }

            req.payload = decoded;
            next();
        }
    );
}

module.exports = verifyJWT;
