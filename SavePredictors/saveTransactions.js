const CustomerModel = require('../Database/CustomerModel');

function saveTransactions(req, res, next) {
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

        if (customer.cartItems == null || customer.cartItems.length === 0) {
            console.log('No item in cart');
            next();
            return;
        }

        var amount = 0;
        for (var i = 0; i < customer.cartItems.length; i++) {
            amount += customer.cartItems[i].price;
        }

        const transactions = customer.transactions == null ? [] : customer.transactions;
        transactions.push({
            timeStamp: new Date(Date.now()),
            amount: amount
        });

        CustomerModel.findByIdAndUpdate(customer._id, {transactions: transactions}).then(response=>{
            console.log('Updated transaction', response);

            next();

        }).catch(error=>{
            console.log('Update transaction error');
            next();
        })

    }).catch(error=>{
        console.log('Find customer error', error);
        next();
    })
}

module.exports = saveTransactions;
