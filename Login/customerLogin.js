const crypto = require('crypto');

const CustomerModel = require('../Database/CustomerModel');

function customerLogin(req, res, next) {
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

    CustomerModel.findOne({userName: userName}).then(customer=>{
        console.log('login found customer', customer);

        if (customer == null) {
            console.log('no such username');
            
            res.setHeader("WWW-Authenticate", "Basic");
            res.sendStatus(401);

            return;
        }

        crypto.pbkdf2(password, customer.salt, 100, 512, 'sha-256', (error, derivedKey)=>{
            if (error != null) {
                console.log('customer login error', error);
                res.sendStatus(500);
                return;
            }

            const derivedPassword = derivedKey.toString('base64');
            console.log('password:', derivedPassword);

            if (derivedPassword === customer.password) {
                req.userName = userName;
                next();
            }
            else {
                console.log('customer login fail: password not match');
                
                res.setHeader("WWW-Authenticate", "Basic");
                res.sendStatus(401);
            }
        });
    }).catch(error=>{
        console.log('Find customer error', error);
    });
}

module.exports = customerLogin;
