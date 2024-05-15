const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const tf = require('@tensorflow/tfjs-node');

const TrainingDatasetModel = require('./Database/TrainingDatasetModel');
const adminLogin = require('./Login/adminLogin');
const ItemModel = require('./Database/ItemModel');

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
.on("data", (row)=>{

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

    trainingDataset.save().then(response=>{
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

// Load dataset from MongoDB and train churn prediction model
/*
TrainingDatasetModel.find().then(results=>{
    //console.log(results[0]);

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
        /*
        model.save('file://' + path.join(__dirname + '/ChurnModel')).then(response=>{
            console.log('Saved', response);

        }).catch(error=>{
            console.log(error);
        });
        */
/*
    }).catch(error=>{
        console.log(error);
    });

}).catch(error=>{
    console.log(error);
});
*/

tf.loadLayersModel('file://' + path.join(__dirname + '/ChurnModel/model.json')).then(model=>{
    const prediction = model.predict(tf.randomNormal([3, 12]));
    prediction.print();

}).catch(error=>{
    console.log(error);
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

app.delete('/logout', (req, res)=>{
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
                        <button class="AddItemButton" ><a class="ButtonLink" href="/administrator/assitem.html"> Add Another Item</a> </button>
                    </div>
                </body>
            </html>
        `)

    }).catch(error=>{
        console.log(error);

        if (error.code === 11000) {     //Duplicate error
            console.log('duplicate itme name')
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

app.get('/inventory', adminLogin, (req, res)=>{
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

app.get('/oneitem', adminLogin, (req, res)=>{
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
})

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

app.listen(process.env.PORT, ()=>{
    console.log('Listening from port', process.env.PORT);
});
