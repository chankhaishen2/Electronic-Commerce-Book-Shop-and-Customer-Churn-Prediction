const CustomerModel = require('../Database/CustomerModel');

function saveInteractionTimeStamp(req, res, next) {
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

        const interactionTimeStamps = customer.interactionTimeStamps == null ? [] : customer.interactionTimeStamps;
        interactionTimeStamps.push({
            timeStamp: new Date(Date.now())
        });

        CustomerModel.findByIdAndUpdate(customer._id, {interactionTimeStamps: interactionTimeStamps}).then(response=>{
            console.log('Updated interaction time stamp', response);

            next();

        }).catch(error=>{
            console.log('Update interaction time stamp error');
            next();
        })

    }).catch(error=>{
        console.log('Find customer error', error);
        next();
    })
}

module.exports = saveInteractionTimeStamp;
