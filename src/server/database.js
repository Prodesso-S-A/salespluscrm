const mongoose = require('mongoose')
const express = require('express');
const app = express();
app.set('ENV', process.env.ENV || 'CRMDEV');
mongoose.connect('mongodb+srv://devprodesso:devapp.CRM2022@prodessosystems.o5ljv.mongodb.net/'+app.get('ENV')+'?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(db => console.log('Db is connected'))
    .catch(err => (console.error(err)))
    