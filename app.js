const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const AdministratorModel = require('./Database/AdministratorModel');
const verifyJWT = require('./JsonWebToken/verifyJWT');
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

app.post('/adminlogin', (req, res)=>{
    const userName = req.body.userName;
    const password = req.body.password;
    console.log('user name:', userName, 'password:', password);

    AdministratorModel.findOne({userName: userName}).then(result=>{
        const administrator = result;
        console.log('login found administrator', administrator);

        crypto.pbkdf2(password, administrator.salt, 100, 512, 'sha-256', (error, derivedKey)=>{
            if (error != null) {
                console.log('administrator login error', error);
                res.status(500).send();
                return;
            }

            const derivedPassword = derivedKey.toString('base64');
            console.log('password:', derivedPassword);

            if (derivedPassword === administrator.password) {
                jwt.sign(
                    {
                        userName: userName,
                        role: 'administrator'
                    },
                    process.env.JWT_SECRET,
                    {
                        algorithm: 'HS256',
                        expiresIn: '8h'
                    },
                    (error, token)=>{
                        if (error != null) {
                            console.log('sign jwt error', error);
                            res.sendStatus(500);
                            return;
                        }

                        console.log('token:', token);
                        res.status(200).json({
                            message: 'Logged in',
                            token: token,
                            userName: userName,
                            role: 'administrator'
                        });
                    }
                );
            }
            else {
                console.log('administrator login fail: password not match');
                res.status(401).json({
                    message: 'User name and password not match'
                });
            }
        });
    });

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

app.post('/additem', verifyJWT, upload.single('image'), (req, res)=>{
    console.log(req.payload);

    if (req.payload.role !== 'administrator') {
        console.log('Not administrator cannot add item');
        res.status(403).json({
            message: 'Not allowed to add item.'
        });
        return;
    }

    console.log(req.file, req.body);

    const item = new ItemModel({
        itemName: req.body.itemName,
        description: req.body.description,
        weight: req.body.weight,
        price: req.body.price,
        quantity: req.body.quantity,
        createdBy: req.payload.userName,
        imageFilename: req?.file?.filename
    });

    item.save().then(response=>{
        console.log(response);

        res.sendStatus(201);

    }).catch(error=>{
        console.log(error);

        if (error.code === 11000) {     //Duplicate error
            console.log('duplicate itme name')
            res.status(400).json({
                message: 'Item name already exists.'
        });
            return;
        }

        res.sendStatus(500);
    });
});

app.get('/inventory', verifyJWT, (req, res)=>{
    console.log(req.payload);

    if (req.payload.role !== 'administrator') {
        console.log('Not administrator cannot view inventory');
        res.status(403).json({
            message: 'Not allowed to view inventory.'
        });
        return;
    }

    ItemModel.find({}).then(results=>{
        console.log(results);

        res.status(200).json({
            items: results
        });
    }).catch(error=>{
        console.log(error);

        res.status(500).send();
    });
});

app.get('/item', (req, res)=>{
    console.log(req.query.imageFilename);

    res.sendFile(path.join(__dirname + '/uploads/' + req.query.imageFilename));
});

app.post('/edititem', verifyJWT, upload.single('image'), (req, res)=>{
    console.log(req.payload);

    if (req.payload.role !== 'administrator') {
        console.log('Not administrator cannot edit item');
        res.status(403).json({
            message: 'Not allowed to edit item.'
        });
        return;
    }

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

    ItemModel.findByIdAndUpdate(req.body.itemId, editFields).then(response=>{
        console.log(response);

        res.sendStatus(200);

    }).catch(error=>{
        console.log(error);

        res.sendStatus(500);
    })
});

app.delete('/item', verifyJWT, (req, res)=>{
    console.log(req.payload);

    if (req.payload.role !== 'administrator') {
        console.log('Not administrator cannot delete item');
        res.status(403).json({
            message: 'Not allowed to delete item.'
        });
        return;
    }

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
