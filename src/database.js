const mongoose = require('mongoose')
const express = require('express');
const app = express();
app.set('ENV', process.env.ENV || 'CRMDEV');
mongoose.connect('mongodb+srv://admin:Baumer8945.@eqm.pcblw.mongodb.net/'+app.get('ENV')+'?authSource=admin&replicaSet=atlas-h6ch0g-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(db => console.log('Db is connected'))
    .catch(err => (console.error(err)))
