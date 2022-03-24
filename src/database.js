const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://admin:Baumer8945.@eqm.pcblw.mongodb.net/CRMDEV?authSource=admin&replicaSet=atlas-h6ch0g-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(db => console.log('Db is connected'))
    .catch(err => (console.error(err)))
// mongoose.connect('mongodb://localhost:27017/CRM?readPreference=primary&appname=MongoDB%20Compass&ssl=false', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// }).then(db => console.log('Db is connected'))
//     .catch(err => (console.error(err)))