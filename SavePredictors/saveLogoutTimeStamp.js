const CustomerModel = require('../Database/CustomerModel');

function saveLogoutTimeStamp(req, res, next) {
    const authorization = req.header('Authorization');

    if (authorization == null) {
        console.log('No authorization');
        next();
        return;
    }
    
    const [_, credentials] = authorization.split(' ');
    const decodedCredentials = atob(credentials);
    const [userName, password] = decodedCredentials.split(':');

    console.log('user name:', userName);

    CustomerModel.findOne({userName: userName}).then(customer=>{
        console.log('Found customer', customer);

        if (customer == null) {
            console.log('No such user name');
            next();
            return;
        }

        const logoutTimeStamps = customer.logoutTimeStamps == null ? [] : customer.logoutTimeStamps;
        logoutTimeStamps.push({
            timeStamp: new Date(Date.now())
        });

        CustomerModel.findByIdAndUpdate(customer._id, {logoutTimeStamps: logoutTimeStamps}).then(response=>{
            console.log('Updated logout time stamp', response);

            next();

        }).catch(error=>{
            console.log('Update logout time stamp error');
            next();
        })

    }).catch(error=>{
        console.log('Find customer error', error);
        next();
    })
}

module.exports = saveLogoutTimeStamp;
