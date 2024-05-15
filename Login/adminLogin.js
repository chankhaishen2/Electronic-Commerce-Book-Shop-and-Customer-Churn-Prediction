const crypto = require('crypto');

const AdministratorModel = require('../Database/AdministratorModel');

require('dotenv').config();

function adminLogin(req, res, next) {
    const authorization = req.header('Authorization');

    if (authorization == null) {
        console.log('No authorization');
        res.setHeader("WWW-Authenticate", "Basic");
        res.sendStatus(401);
        return;
    }
    
    const [_, credentials] = authorization.split(' ');
    const decodedCredentials = atob(credentials);
    const [userName, password] = decodedCredentials.split(':');

    console.log('user name:', userName, 'password:', password);

    AdministratorModel.findOne({userName: userName}).then(result=>{
        const administrator = result;
        console.log('login found administrator', administrator);

        if (result == null) {
            console.log('no such username');
            
            res.setHeader("WWW-Authenticate", "Basic");
            res.sendStatus(401);

            return;
        }

        crypto.pbkdf2(password, administrator.salt, 100, 512, 'sha-256', (error, derivedKey)=>{
            if (error != null) {
                console.log('administrator login error', error);
                res.sendStatus(500);
                return;
            }

            const derivedPassword = derivedKey.toString('base64');
            console.log('password:', derivedPassword);

            if (derivedPassword === administrator.password) {
                req.userName = userName;
                next();
            }
            else {
                console.log('administrator login fail: password not match');
                
                res.setHeader("WWW-Authenticate", "Basic");
                res.sendStatus(401);
            }
        });
    });
}

module.exports = adminLogin;
