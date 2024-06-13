const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const tf = require('@tensorflow/tfjs-node');
const crypto = require('crypto');
const mathjs = require('mathjs');

const TrainingDatasetModel = require('./Database/TrainingDatasetModel');
const ItemModel = require('./Database/ItemModel');
const CustomerModel = require('./Database/CustomerModel');
const OrderModel = require('./Database/OrderModel');
const saveLogoutTimeStamp = require('./SavePredictors/saveLogoutTimeStamp');
const saveInteractionTimeStamp = require('./SavePredictors/saveInteractionTimeStamp');
const saveTransactions = require('./SavePredictors/saveTransactions');

const adminLogin = require('./Login/adminLogin');
const customerLogin = require('./Login/customerLogin');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect(process.env.MONGODB_URL).then(()=>{
    console.log('Connected to database.');
}).catch(error=>{
    console.log('Not connected to database', error);
});

// Upload customer churn training dataset to MongoDB
/*
const fs = require('fs');
const {parse} = require('csv-parse');

const datasetPath = './ChurnTrainingDataset/ecom-user-churn-data.csv';
const parseOption = parse({delimiter:',', from_line:2});

fs.createReadStream(datasetPath)
.pipe(parseOption)
.on("data", async (row)=>{

    const trainingDataset = new TrainingDatasetModel(
        {
            ses_rec : row[1],
            ses_rec_avg : row[2],
            ses_rec_sd : row[3],
            ses_rec_cv : row[4],
            user_rec : row[5],
            ses_n : row[6],
            int_n : row[7],
            int_n_r : row[8],
            tran_n : row[9],
            tran_n_r : row[10],
            rev_sum : row[11],
            rev_sum_r : row[12],
            target_class : row[13]
        }
    );

    await trainingDataset.save().then(response=>{
        //
    }).catch(error=>{
        console.log(error);
    });
})
.on("error", (error)=>{
    console.log(error);
})
.on("end", ()=>{
    console.log('Finished read file.');
});
*/

// Load dataset from MongoDB
/*
TrainingDatasetModel.find().then(results=>{
    console.log(results.length);

    const xs = [];
    const ys = [];

    for (var i = 0; i < results.length; i++) {
        const x = [
            results[i].ses_rec,
            results[i].ses_rec_avg,
            results[i].ses_rec_sd,
            results[i].ses_rec_cv,
            results[i].user_rec,
            results[i].ses_n,
            results[i].int_n,
            results[i].int_n_r,
            results[i].tran_n,
            results[i].tran_n_r,
            results[i].rev_sum,
            results[i].rev_sum_r
        ]

        const y = [
            results[i].target_class
        ]

        xs.push(x);
        ys.push(y);
    }

    //console.log(xs[0], ys[0]);

    const x_tensor = tf.tensor(xs);
    const y_tensor = tf.tensor(ys);

    // Train prediction model

    const model = tf.sequential({
        layers: [
            tf.layers.dense({inputShape: [12], units: 4, activation: 'relu'}),
            tf.layers.dense({units: 4, activation: 'relu'}),
            tf.layers.dense({units: 1, activation: 'sigmoid'})
        ]
    });

    model.compile({
        optimizer: 'rmsprop',
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
    });

    model.fit(x_tensor, y_tensor, {
        batchSize: 100,
        epochs: 200,
        validationSplit: 0.3
    }).then(info=>{
        console.log('Train arccuracy', info.history.acc[199]);
        console.log('Validation accuracy', info.history.val_acc[199]);

        const prediction = model.predict(tf.randomNormal([5, 12]));
        prediction.print();

        // Save the model
        model.save('file://' + path.join(__dirname + '/ChurnModel')).then(response=>{
            console.log('Saved', response);

        }).catch(error=>{
            console.log(error);
        });

    }).catch(error=>{
        console.log(error);
    });

}).catch(error=>{
    console.log(error);
});
*/

// Load saved model
tf.loadLayersModel('file://' + path.join(__dirname + '/ChurnModel/model.json')).then(model=>{
    console.log('Loaded saved model.');
    
    /*
    const predictions = model.predict(tf.randomNormal([3, 12]));
    predictions.print();

    predictions.data().then(values=>{
        console.log(values, values[1]);
    }).catch(error=>{
        console.log(error);
    });
    */

}).catch(error=>{
    console.log(error);
});

// Test prediction model
/*
TrainingDatasetModel.find().then(results=>{

    const xs = [];
    const ys = [];
    
    for (var i = 0; i < results.length; i++) {
        const x = [
            results[i].ses_rec,
            results[i].ses_rec_avg,
            results[i].ses_rec_sd,
            results[i].ses_rec_cv,
            results[i].user_rec,
            results[i].ses_n,
            results[i].int_n,
            results[i].int_n_r,
            results[i].tran_n,
            results[i].tran_n_r,
            results[i].rev_sum,
            results[i].rev_sum_r
        ];

        xs.push(x);
        ys.push(results[i].target_class);
    }

    const xs_tensor = tf.tensor(xs);

    tf.loadLayersModel('file://' + path.join(__dirname, '/ChurnModel/model.json')).then(model=>{
        
        const predictions = model.predict(xs_tensor);

        predictions.data().then(predicted=>{
            
            var truePositive = 0;
            var falsePositive = 0;
            var trueNegative = 0;
            var falseNegative = 0;

            for (var j = 0; j < ys.length; j++) {

                if (predicted[j] >= 0.5) {
                    if (ys[j] === 1) {
                        truePositive += 1;
                    }
                    else {
                        falsePositive += 1
                    }
                } 
                else if (predicted[j] < 0.5) {
                    if (ys[j] === 0) {
                        trueNegative += 1;
                    }
                    else {
                        falseNegative += 1;
                    }
                }

            }

            console.log('True positive:', truePositive);
            console.log('False positive:', falsePositive);
            console.log('True negative:', trueNegative);
            console.log('False negative:', falseNegative);

        }).catch(error=>{
            console.log('Download predicted values error', error);
        });

    }).catch(error=>{
        console.log('Load model error', error);
    })

}).catch(error=>{
    console.log('Load training dataset error', error);
});
*/

// Create two dummy customers with prediction parameters
/*
const salt1 = crypto.randomBytes(32).toString('base64');
crypto.pbkdf2('My$Password123', salt1, 100, 512, 'sha-256', (error, derivedKey)=>{
    if (error != null) {
        console.log('create customer error', error);
        return;
    }

    const derivedPassword = derivedKey.toString('base64');

    const Customer1 = new CustomerModel({
        userName: 'Customer 1',
        password: derivedPassword,
        salt: salt1,
        logoutTimeStamps: [
            {
                timeStamp: new Date('2024-05-02')
            },
            {
                timeStamp: new Date('2024-05-14')
            },
            {
                timeStamp: new Date('2024-05-19')
            }
        ],
        interactionTimeStamps: [
            {
                timeStamp: new Date('2024-05-01')
            },
            {
                timeStamp: new Date('2024-05-10')
            },
            {
                timeStamp: new Date('2024-05-11')
            },
            {
                timeStamp: new Date('2024-05-16')
            },
            {
                timeStamp: new Date('2024-05-18')
            }
        ],
        transactions: [
            {
                timeStamp: new Date('2024-05-12'),
                amount: 30
            }
        ],
        created: new Date('2024-05-01')
    });

    Customer1.save().then(response=>{
        console.log('dummy customer save success', response);

        const order = new OrderModel({
            customerName: 'Customer 1',
            items: [
                {
                    itemName: 'Book 2',
                    weight: 0.1,
                    price: 15,
                    quantity: 2
                }
            ],
            amount: 30,
            created: new Date('2024-05-12')
        });

        order.save().then(response=>{
            console.log('dummy order save success', response);
        }).catch(error=>{
            console.log('dummy order save error', error);
        })

    }).catch(error=>{
        console.log('dummy customer save error', error);
    });
});

const salt2 = crypto.randomBytes(32).toString('base64');
crypto.pbkdf2('My$Password123', salt2, 100, 512, 'sha-256', (error, derivedKey)=>{
    if (error != null) {
        console.log('create customer error', error);
        return;
    }

    const derivedPassword = derivedKey.toString('base64');

    const Customer2 = new CustomerModel({
        userName: 'Customer 2',
        password: derivedPassword,
        salt: salt2,
        logoutTimeStamps: [
            {
                timeStamp: new Date('2024-05-19')
            }
        ],
        interactionTimeStamps: [
            {
                timeStamp: new Date('2024-05-18')
            }
        ],
        created: new Date('2024-05-01')
    });

    Customer2.save().then(response=>{
        console.log('dummy customer save success', response);
    }).catch(error=>{
        console.log('dummy customer save error', error);
    });
});
*/

// get predictor values
function getPredictors(logoutTimeStamps, viewAndAddToCartTimeStamps, transactions) {
    
    logoutTimeStamps.sort((a, b)=>{return new Date(a.timeStamp).getTime() - new Date(b.timeStamp).getTime();});
    
    //console.log(logoutTimeStamps);

    var ses_rec;
    if (logoutTimeStamps.length < 2) {
        ses_rec = 31;
    }
    else {
        //console.log(logoutTimeStamps[logoutTimeStamps.length - 2].timeStamp, new Date(logoutTimeStamps[logoutTimeStamps.length - 1].timeStamp).getTime())
        
        const differenceInMilliseconds = new Date(logoutTimeStamps[logoutTimeStamps.length - 1].timeStamp).getTime() - new Date(logoutTimeStamps[logoutTimeStamps.length - 2].timeStamp).getTime();
        const differenceInDays = differenceInMilliseconds / (1000 * 3600 * 24);

        if (differenceInDays > 31) {
            ses_rec = 31;
        }
        else {
            ses_rec = differenceInDays;
        }
    }

    const listOfDayBetweenSessions = [];
    if (logoutTimeStamps.length < 2) {
        listOfDayBetweenSessions.push(99);
    }
    else {
        for (var j = 0; j < logoutTimeStamps.length - 1; j++) {
            const differenceInMilliseconds = new Date(logoutTimeStamps[j + 1].timeStamp).getTime() - new Date(logoutTimeStamps[j].timeStamp).getTime();
            const differenceInDays = differenceInMilliseconds / (1000 * 3600 * 24);

            if (differenceInDays > 99) {
                listOfDayBetweenSessions.push(99);
            }
            else {
                listOfDayBetweenSessions.push(differenceInDays);
            }
        }
    }

    const ses_rec_avg = mathjs.mean(listOfDayBetweenSessions);

    const ses_rec_sd = mathjs.std(listOfDayBetweenSessions);

    const ses_rec_cv = ses_rec_sd / ses_rec_avg;

    var user_rec;
    if (logoutTimeStamps.length < 2) {
        user_rec = 99;
    }
    else {
        const differenceInMilliseconds = new Date(logoutTimeStamps[logoutTimeStamps.length - 1].timeStamp).getTime() - new Date(logoutTimeStamps[0].timeStamp).getTime();
        const differenceInDays = differenceInMilliseconds / (1000 * 3600 * 24);

        if (differenceInDays > 99) {
            user_rec = 99;
        }
        else {
            user_rec = differenceInDays;
        }
    }

    const ses_n = logoutTimeStamps.length === 0 ? 1 : logoutTimeStamps.length;

    const int_n = viewAndAddToCartTimeStamps.length + transactions.length;

    const int_n_r = int_n / ses_n;

    const tran_n = transactions.length;

    const tran_n_r = tran_n / ses_n;

    var rev_sum = 0;
    for (var i = 0; i < transactions.length; i++) {
        rev_sum = rev_sum + transactions[i].amount;
    }

    const rev_sum_r = rev_sum / ses_n;

    return [ses_rec, ses_rec_avg, ses_rec_sd, ses_rec_cv, user_rec, ses_n, int_n, int_n_r, tran_n, tran_n_r, rev_sum, rev_sum_r];
}

// Test get predictors
/*
const [ses_rec1, ses_rec_avg1, ses_rec_sd1, ses_rec_cv1, user_rec1, ses_n1, int_n1, int_n_r1, tran_n1, tran_n_r1, rev_sum1, rev_sum_r1] = getPredictors([{timeStamp: new Date('2024-05-01')}], [], []);
console.log('test 1', 'ses_rec', ses_rec1, 'ses_rec_avg', ses_rec_avg1, 'user_rec', user_rec1);

const [ses_rec2, ses_rec_avg2, ses_rec_sd2, ses_rec_cv2, user_rec2, ses_n2, int_n2, int_n_r2, tran_n2, tran_n_r2, rev_sum2, rev_sum_r2] = getPredictors([{timeStamp: new Date('2024-05-01')}, {timeStamp: new Date('2024-01-01')}], [], []);
console.log('test 2', 'ses_rec', ses_rec2, 'ses_rec_avg', ses_rec_avg2, 'user_rec', user_rec2);

const [ses_rec3, ses_rec_avg3, ses_rec_sd3, ses_rec_cv3, user_rec3, ses_n3, int_n3, int_n_r3, tran_n3, tran_n_r3, rev_sum3, rev_sum_r3] = getPredictors([{timeStamp: new Date('2024-05-01')}, {timeStamp: new Date('2024-05-11')}], [], []);
console.log('test 3', 'ses_rec', ses_rec3, 'ses_rec_avg', ses_rec_avg3, 'user_rec', user_rec3);

const [ses_rec4, ses_rec_avg4, ses_rec_sd4, ses_rec_cv4, user_rec4, ses_n4, int_n4, int_n_r4, tran_n4, tran_n_r4, rev_sum4, rev_sum_r4] = getPredictors([], [], []);
console.log('test 4', 'ses_n', ses_n4);
*/

// Predict customer churn
app.get('/predictchurn', adminLogin, (req, res)=>{

    CustomerModel.find().then(results=>{
        console.log('Find customer success', results);

        const predictionList = [];
        const xs = [];

        for (var i = 0; i < results.length; i++) {
            const logoutTimeStamps = results[i].logoutTimeStamps == null ? [] : results[i].logoutTimeStamps;
            const viewAndAddToCartTimeStamps = results[i].interactionTimeStamps == null ? [] : results[i].interactionTimeStamps;
            const transactions = results[i].transactions == null ? [] : results[i].transactions;

            const [ses_rec, ses_rec_avg, ses_rec_sd, ses_rec_cv, user_rec, ses_n, int_n, int_n_r, tran_n, tran_n_r, rev_sum, rev_sum_r] = getPredictors(logoutTimeStamps, viewAndAddToCartTimeStamps, transactions);

            predictionList.push({
                name: results[i].userName,
                ses_rec: ses_rec,
                ses_rec_avg: ses_rec_avg,
                ses_rec_sd: ses_rec_sd,
                ses_rec_cv: ses_rec_cv,
                user_rec: user_rec,
                ses_n: ses_n,
                int_n: int_n,
                int_n_r: int_n_r,
                tran_n: tran_n,
                tran_n_r: tran_n_r,
                rev_sum: rev_sum,
                rev_sum_r: rev_sum_r
            });

            xs.push([ses_rec, ses_rec_avg, ses_rec_sd, ses_rec_cv, user_rec, ses_n, int_n, int_n_r, tran_n, tran_n_r, rev_sum, rev_sum_r]);
        }

    const xs_tensor = tf.tensor(xs);

    tf.loadLayersModel('file://' + path.join(__dirname + '/ChurnModel/model.json')).then(model=>{
        console.log('Loaded model');
        
        const predictions = model.predict(xs_tensor);

        predictions.data().then(values=>{
            console.log('Downloaded predicted value', values);

            for (var j = 0; j < values.length; j++) {
                predictionList[j].churnProbability = values[j];
            }

            res.status(200).json({
                predictionList: predictionList
            });

        }).catch(error=>{
            console.log('Download predicted value error', error);
            res.sendStatus(500);
        });

    }).catch(error=>{
        console.log('Load model error', error);
        res.sendStatus(500);
    });

    }).catch(error=>{
        console.log('Find customer error', error);
        res.sendStatus(500);
    });
});

app.get('/administrator/churnpredictions.html', adminLogin, (req, res)=>{
    res.sendFile(path.join(__dirname + '/Administrator/churnpredictions.html'));
});

// Register Administrator
/*
const salt = crypto.randomBytes(32).toString('base64');
crypto.pbkdf2('My$Password123', salt, 100, 512, 'sha-256', (error, derivedKey)=>{
    if (error != null) {
        console.log('register administrator error', error);
        return;
    }

    const derivedPassword = derivedKey.toString('base64');

    const Administrator = new AdministratorModel({
        userName: 'Admin 1',
        password: derivedPassword,
        salt: salt
    });

    Administrator.save().then(response=>{
        console.log('register administrator save success', response);
    }).catch(error=>{
        console.log('register administrator save error', error);
    });
});
*/

app.delete('/logout', saveLogoutTimeStamp, (req, res)=>{
    res.setHeader('WWW-Authenticate', 'Basic');
    res.sendStatus(401);
});

app.get('/administrator/additem.html', adminLogin, (req, res)=>{
    res.sendFile(path.join(__dirname + '/Administrator/additem.html'));
});

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, 'uploads/');
    },
    filename: (req, file, callback) => {
      callback(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({storage: storage})

app.post('/additem', adminLogin, upload.single('image'), (req, res)=>{
    console.log(req.userName);

    console.log(req.file, req.body);

    const item = new ItemModel({
        itemName: req.body.itemName,
        description: req.body.description,
        weight: req.body.weight,
        price: req.body.price,
        quantity: req.body.quantity,
        createdBy: req.userName,
        imageFilename: req?.file?.filename
    });

    item.save().then(response=>{
        console.log(response);

        res.status(201).send(`
            <html lang='en'>
                <head>
                    <title>Add Item</title>
                <head>

                <style>
                    .AdminSubmitButton {
                        background-color: #24133f;
                        color: #ffffff;
                        font-size: 20px;
                        padding: 10px 30px;
                        border-radius: 5px;
                        margin: 20px
                    }

                    .AddItemButton {
                        background-color: #409f42;
                        padding: 10px 15px;
                        font-size: 20px;
                        border-radius: 10px;
                        float: center;
                    }

                    .ButtonLink {
                        text-decoration: none;
                        color: #000000;
                    }

                    .ButtonLink2 {
                        text-decoration: none;
                        color: #ffffff;
                    }

                    .Content {
                        margin: 30px;
                        text-align: center;
                    }
            
                    .Content h1 {
                        font-size: 40px;
                    }
                </style>

                <body>
                    <div class="Content">
                        <h1>Item is Added.</h1>
                        <button class="AdminSubmitButton" ><a class="ButtonLink2" href="/administrator/inventory.html">Inventory</a> </button>
                        <button class="AddItemButton" ><a class="ButtonLink" href="/administrator/additem.html"> Add Another Item</a> </button>
                    </div>
                </body>
            </html>
        `);

    }).catch(error=>{
        console.log(error);

        if (error.code === 11000) {     //Duplicate error
            console.log('duplicate item name')
            res.status(400).send(`
                <html lang='en'>
                    <head>
                        <title>Add Item</title>
                    <head>

                    <style>
                        .Content {
                            margin: 30px;
                            text-align: center;
                        }
                
                        .Content h1 {
                            font-size: 40px;
                        }
                    </style>

                    <body>
                        <div class="Content">
                            <h1>Item name already exists.</h1>
                        </div>
                    </body>
                </html>
            `);
            return;
        }

        res.sendStatus(500);
    });
});

app.get('/administrator/inventory.html', adminLogin, (req, res)=>{
    res.sendFile(path.join(__dirname + '/Administrator/inventory.html'));
});

app.get('/items', (req, res)=>{
    console.log(req.userName);

    ItemModel.find({}).then(results=>{
        console.log(results);

        res.status(200).json({
            items: results
        });
    }).catch(error=>{
        console.log(error);

        res.sendStatus(500);
    });
});

app.get('/item', (req, res)=>{
    console.log(req.query.imageFilename);

    res.sendFile(path.join(__dirname + '/uploads/' + req.query.imageFilename));
});

app.get('/administrator/edititem.html', (req, res)=>{
    res.sendFile(path.join(__dirname + '/Administrator/edititem.html'));
});

app.get('/oneitem', (req, res)=>{
    console.log(req.query.itemid);

    ItemModel.findById(req.query.itemid).then(result=>{
        console.log(result);

        res.status(200).json({
            item: result
        });

    }).catch(error=>{
        console.log(error);
        res.sendStatus(500);
    })
});

app.post('/edititem', adminLogin, upload.single('image'), (req, res)=>{
    console.log(req.userName);

    console.log(req.file, req.body);

    var editFields;
    
    if (req.file != null) {
        editFields = {
            description: req.body.description,
            weight: req.body.weight,
            price: req.body.price,
            quantity: req.body.quantity,
            imageFilename: req.file.filename,
            lastUpdated: Date.now()
        }
    }
    else {
        editFields = {
            description: req.body.description,
            weight: req.body.weight,
            price: req.body.price,
            quantity: req.body.quantity,
            lastUpdated: Date.now()
        }
    }

    ItemModel.findOneAndUpdate({itemName: req.body.itemName}, editFields).then(response=>{
        console.log(response);

        res.status(200).send(`
            <html lang='en'>
                <head>
                    <title>Add Item</title>
                <head>

                <style>
                    .AdminSubmitButton {
                        background-color: #24133f;
                        color: #ffffff;
                        font-size: 20px;
                        padding: 10px 30px;
                        border-radius: 5px;
                        margin: 20px
                    }

                    .ButtonLink2 {
                        text-decoration: none;
                        color: #ffffff;
                    }

                    .Content {
                        margin: 30px;
                        text-align: center;
                    }
            
                    .Content h1 {
                        font-size: 40px;
                    }
                </style>

                <body>
                    <div class="Content">
                        <h1>Item is Edited.</h1>
                        <button class="AdminSubmitButton" ><a class="ButtonLink2" href="/administrator/inventory.html">Inventory</a> </button>
                    </div>
                </body>
            </html>
        `);

    }).catch(error=>{
        console.log(error);

        res.sendStatus(500);
    })
});

app.delete('/item', adminLogin, (req, res)=>{
    console.log(req.userName);

    console.log(req.query.itemId);

    ItemModel.findByIdAndDelete(req.query.itemId).then(response=>{
        console.log(response);

        res.sendStatus(204);

    }).catch(error=>{
        console.log(error);

        res.sendStatus(500);
    });
});

app.get('/customer/home.html', (req, res)=>{
    res.status(200).sendFile(path.join(__dirname, '/Customer/home.html'));
});

app.get('/checklogin', (req, res)=>{
    const authorization = req.get('Authorization');

    console.log('authorization', authorization);

    if (authorization == null) {
        res.status(200).json({
            message: 'Not logged in'
        });
    }
    else {
        res.status(200).json({
            message: 'Logged in'
        });
    }
});

app.get('/customerlogin', customerLogin, (req, res)=>{
    res.sendStatus(200);
});

app.get('/customer/register.html', (req, res)=>{
    res.status(200).sendFile(path.join(__dirname, '/Customer/register.html'));
});

app.get('/checkduplicate', (req, res)=>{
    const userName = req.query.username;
    console.log('check duplicate', userName);

    CustomerModel.findOne({userName: userName}).then(customer=>{
        console.log('Found customer', customer);

        if (customer == null) {
            res.status(200).json({
                message: 'No duplicate'
            });
        }
        else {
            res.status(200).json({
                message: 'Duplicate'
            });
        }
    }).catch(error=>{
        console.log(error);
        res.sendStatus(500);
    });
});

app.post('/register', (req, res)=>{
    console.log('register', req.body);

    const salt = crypto.randomBytes(32).toString('base64');
    crypto.pbkdf2(req.body.password, salt, 100, 512, 'sha-256', (error, derivedKey)=>{
        
        if (error != null) {
            console.log('hash password error', error);
            res.sendStatus(500);
            return;
        }

        const password = derivedKey.toString('base64');

        const customer = new CustomerModel({
            userName: req.body.userName,
            password: password,
            salt: salt
        });

        customer.save().then(response=>{
            console.log(response);
    
            res.status(201).send(`
                <html lang='en'>
                    <head>
                        <title>Register</title>
                    <head>
    
                    <style>
                        .CustomerSubmitButton {
                            background-color: #3d2707;
                            color: #ffffff;
                            font-size: 20px;
                            padding: 10px 30px;
                            border-radius: 5px;
                            margin: 20px
                        }
                        
                        .ButtonLink {
                            text-decoration: none;
                            color: #ffffff;
                        }
    
                        .Content {
                            margin: 30px;
                            text-align: center;
                        }
                
                        .Content h1 {
                            font-size: 40px;
                        }
                    </style>
    
                    <body>
                        <div class="Content">
                            <h1>Registration is completed.</h1>
                            <button class="CustomerSubmitButton" ><a class="ButtonLink" href="/customer/home.html">Home</a> </button>
                        </div>
                    </body>
                </html>
            `);
    
        }).catch(error=>{
            console.log(error);
    
            if (error.code === 11000) {     //Duplicate error
                console.log('duplicate customer user name')
                res.status(400).send(`
                    <html lang='en'>
                        <head>
                            <title>Register</title>
                        <head>
    
                        <style>
                            .Content {
                                margin: 30px;
                                text-align: center;
                            }
                    
                            .Content h1 {
                                font-size: 40px;
                            }
                        </style>
    
                        <body>
                            <div class="Content">
                                <h1>User name already exists.</h1>
                            </div>
                        </body>
                    </html>
                `);
                return;
            }
    
            res.sendStatus(500);
        });
    });
});

app.get('/customer/itemdetails.html', saveInteractionTimeStamp, (req, res)=>{
    res.status(200).sendFile(path.join(__dirname + '/Customer/itemdetails.html'));
});

app.post('/addtocart', customerLogin, saveInteractionTimeStamp, (req, res)=>{
    console.log(req.body);
    console.log(req.userName);

    CustomerModel.findOne({userName: req.userName}).then(customer=>{
        console.log('Found customer', customer);

        const cartItems = customer.cartItems;

        var isItemInCart = false;

        for (var i = 0; i < cartItems.length; i++) {
            if (cartItems[i].itemName === req.body.itemName) {
                cartItems[i].quantity = cartItems[i].quantity + 1;
                isItemInCart = true;
                break;
            }
        }

        if (!isItemInCart) {
            cartItems.push({
                itemName: req.body.itemName,
                weight: req.body.weight,
                price: req.body.price,
                quantity: 1,
                imageFilename: req.body.imageFilename
            });
        }

        CustomerModel.findOneAndUpdate({userName: req.userName}, {cartItems: cartItems}).then(response=>{
            console.log('Updated cart items', response);

            res.status(201).send(`
                <h1>Item is added to cart.</h1>
            `);

        }).catch(error=>{
            console.log('Update cart item error', error);
            res.sendStatus(500);
        });

    }).catch(error=>{
        console.log('Find customer error', error);
        res.sendStatus(500);
    });
});

app.get('/customer/cart.html', customerLogin, (req, res)=>{
    res.sendFile(path.join(__dirname, '/Customer/cart.html'));
});

app.get('/cartitems', customerLogin, (req, res)=>{
    console.log(req.userName);

    CustomerModel.findOne({userName: req.userName}).then(customer=>{        
        console.log('Found customer', customer);

        res.status(200).json({
            cartItems: customer.cartItems
        });

    }).catch(error=>{
        console.log('Find customer error', error);
        res.sendStatus(500);
    });
});

app.post('/addone', customerLogin, (req, res)=>{
    console.log(req.userName, req.query.itemName);

    CustomerModel.findOne({userName: req.userName}).then(customer=>{
        console.log('Found customer', customer);

        const cartItems = customer.cartItems;

        for (var i = 0; i < cartItems.length; i++) {
            if (cartItems[i].itemName === req.query.itemName) {
                cartItems[i].quantity += 1;
                break;
            }
        }

        CustomerModel.findOneAndUpdate({userName: req.userName}, {cartItems: cartItems}).then(response=>{
            console.log('Updated cart items', response);

            res.sendStatus(201);

        }).catch(error=>{
            console.log('Update cart items error', error);
            res.sendStatus(500);
        });

    }).catch(error=>{
        console.log('Find customer error', error);
        res.sendStatus(500);
    });
});

app.delete('/minusone', customerLogin, (req, res)=>{
    console.log(req.userName, req.query.itemName);

    CustomerModel.findOne({userName: req.userName}).then(customer=>{
        console.log('Found customer', customer);

        const cartItems = customer.cartItems;
        var isQuantityZero = false;
        var toRemove;

        for (var i = 0; i < cartItems.length; i++) {
            if (cartItems[i].itemName === req.query.itemName) {
                
                cartItems[i].quantity -= 1;

                if (cartItems[i].quantity === 0) {
                    isQuantityZero = true;
                    toRemove = i;
                }

                break;
            }
        }

        if (isQuantityZero) {
            cartItems.splice(toRemove, 1);
        }

        CustomerModel.findOneAndUpdate({userName: req.userName}, {cartItems: cartItems}).then(response=>{
            console.log('Updated cart items', response);

            res.sendStatus(204);

        }).catch(error=>{
            console.log('Update cart item error', error);
            res.sendStatus(500);
        });

    }).catch(error=>{
        console.log('Find customer error', error);
        res.sendStatus(500);
    });
});

function checkQuantity(req, res, next) {
    console.log(req.userName);

    CustomerModel.findOne({userName: req.userName}).then(customer=>{
        console.log('Found customer', customer);

        if (customer.cartItems == null || customer.cartItems.length === 0) {
            console.log('No item in cart');
            
            res.status(400).json({
                message: 'No item in cart.'
            });

            return;
        }

        const cartItems = customer.cartItems;
        const checkQuantityPromises = [];
        const itemQuantities = [];

        for (var i = 0; i < cartItems.length; i++) {

            const promise = new Promise((resolve, reject)=>{

                ItemModel.findOne({itemName: cartItems[i].itemName}).then(item=>{
                    console.log('Found item', item);

                    itemQuantities.push({
                        itemName: item.itemName,
                        quantity: item.quantity
                    });

                    resolve();

                }).catch(error=>{
                    console.log('Find item error', error);
                    reject();
                });

            });

            checkQuantityPromises.push(promise);
        }

        Promise.all(checkQuantityPromises).then(()=>{
            console.log('Checked quantity', itemQuantities);

            const itemLeftQuantities = [];

            for (var i = 0; i < cartItems.length; i++) {

                for (var j = 0; j < itemQuantities.length; j++) {

                    if (cartItems[i].itemName === itemQuantities[j].itemName) {

                        const leftQuantity = itemQuantities[j].quantity - cartItems[i].quantity;

                        if (leftQuantity < 0) {
                            console.log(cartItems[i].itemName, 'is out of stock.');

                            res.status(400).json({
                                message: cartItems[i].itemName + ' is out of stock.'
                            });
                            
                            return;
                        }

                        itemLeftQuantities.push({
                            itemName: cartItems[i].itemName,
                            leftQuantity: leftQuantity
                        });

                        break;
                    }
                }
            }

            console.log('Left quantities', itemLeftQuantities);
            req.itemLeftQuantities = itemLeftQuantities;
            next();

        }).catch(error=>{
            console.log('Check quantity error', error);
            res.sendStatus(500);
        });

    }).catch(error=>{
        console.log('Find customer error', error);
        res.sendStatus(500);
    });
}

function placeOrder(req, res, next) {
    console.log(req.userName, req.itemLeftQuantities);

    CustomerModel.findOne({userName: req.userName}).then(customer=>{
        console.log('Found customer', customer);

        const cartItems = customer.cartItems;
        var amount = 0;
        const items = [];

        for (var i = 0; i < cartItems.length; i++) {
            amount += cartItems[i].price * cartItems[i].quantity;

            items.push({
                itemName: cartItems[i].itemName,
                weight: cartItems[i].weight,
                price: cartItems[i].price,
                quantity: cartItems[i].quantity
            })
        }

        console.log('Amount', amount);

        const order = new OrderModel({
            customerName: req.userName,
            items: items,
            amount: amount
        });

        order.save().then(response=>{
            console.log('Saved order', response);

            CustomerModel.findOneAndUpdate({userName: req.userName}, {cartItems: []}).then(response=>{
                console.log('Cleared cart', response);

                const updateItemPromises = [];

                for (var i = 0; i < req.itemLeftQuantities.length; i++) {

                    const promise = new Promise((resolve, reject)=>{
                        
                        ItemModel.findOneAndUpdate({itemName: req.itemLeftQuantities[i].itemName}, {quantity: req.itemLeftQuantities[i].leftQuantity}).then(response=>{
                            console.log('Updated item left quantity', response);
                            resolve();

                        }).catch(error=>{
                            console.log('Update item left quantity error', error);
                            reject();
                        });
                    });

                    updateItemPromises.push(promise);
                }

                Promise.all(updateItemPromises).then(()=>{
                    console.log('Updated all item');
                    next();

                }).catch(error=>{
                    console.log('Update all item error', error);
                    res.sendStatus(500);
                })

            }).catch(error=>{
                console.log('Clear cart error', error);
                res.sendStatus(500);
            })

        }).catch(error=>{
            console.log('Save order error' ,error);
            res.sendStatus(500);
        })

    }).catch(error=>{
        console.log('Find customer error', error);
        res.sendStatus(500);
    });
}

app.post('/placeorder', customerLogin, checkQuantity, saveTransactions, placeOrder, (req, res)=>{
    res.status(201).send(`
        <h1>The order has been placed.</h1>
    `);
});

app.get('/administrator/orders.html', adminLogin, (req, res)=>{
    res.status(200).sendFile(path.join(__dirname, '/Administrator/orders.html'));
});

app.get('/ordersforadmin', adminLogin, (req, res)=>{
    console.log(req.userName);

    OrderModel.find().then(orders=>{
        console.log('Found orders', orders);

        res.status(200).json({
            orders: orders
        });

    }).catch(error=>{
        console.log('Find order error', error);
        res.sendStatus(500);
    });
});

app.get('/customer/orders.html', customerLogin, (req, res)=>{
    res.status(200).sendFile(path.join(__dirname, '/Customer/orders.html'));
});

app.get('/ordersforcustomer', customerLogin, (req, res)=>{
    console.log(req.userName);

    OrderModel.find({customerName: req.userName}).then(orders=>{
        console.log('Found orders', orders);

        res.status(200).json({
            orders: orders
        });

    }).catch(error=>{
        console.log('Find orders error', error);
        res.sendStatus(500);
    });
});

app.get('/administrator/orderdetails.html', adminLogin, (req, res)=>{
    res.status(200).sendFile(path.join(__dirname, '/Administrator/orderdetails.html'));
});

app.get('/oneorderforadmin', adminLogin, (req, res)=>{
    console.log(req.userName, req.query.orderId);

    OrderModel.findOne({_id: req.query.orderId}).then(order=>{
        console.log('Found order', order);

        if (order == null) {
            
            res.status(400).json({
                message: 'No such order.'
            });

            return;
        }

        res.status(200).json({
            order: order
        });

    }).catch(error=>{
        console.log('Find order error', error);
        res.sendStatus(500);
    });
});

app.get('/customer/orderdetails.html', customerLogin, (req, res)=>{
    res.status(200).sendFile(path.join(__dirname, '/Customer/orderdetails.html'));
});

app.get('/oneorderforcustomer', customerLogin, (req, res)=>{
    console.log(req.userName, req.query.orderId);

    OrderModel.findOne({_id: req.query.orderId, customerName: req.userName}).then(order=>{
        console.log('Found order', order);

        if (order == null) {

            res.status(400).json({
                message: 'No such order.'
            });

            return;
        }

        res.status(200).json({
            order: order
        });

    }).catch(error=>{
        console.log('Find order error', error);
        res.sendStatus(500);
    });
});

app.listen(process.env.PORT, ()=>{
    console.log('Listening from port', process.env.PORT);
});
