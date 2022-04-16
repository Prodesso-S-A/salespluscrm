const express = require('express');
const path = require('path');
const Handlebars = require('handlebars');
const { create } = require('express-handlebars');
const methodOverride = require('method-override');
const sessions = require('express-session');
const flash = require('connect-flash')
const passport = require('passport');
const Error = require('../src/models/Error')
const Org = require('../src/models/Organizacion')
const User = require('../src/models/User')
//Init
const app = express();
require('./database')
require('./config/passport')
// Settings
app.set('port', process.env.PORT || 3000);

app.set('views', path.join(__dirname, 'views'));
var hbs = create({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    }

});
app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

hbs.handlebars.registerHelper('ifCond', function (v1, v2, options) {
    if (v1 == v2) {
        return options.fn(this);
    }
    return options.inverse(this);
});
hbs.handlebars.registerHelper('dateFormat', require('handlebars-dateformat'));
hbs.handlebars.registerHelper('json', function (obj) {
    return new Handlebars.SafeString(JSON.stringify(obj))
})
hbs.handlebars.registerHelper("porcentajeAvance", function (fi, ff, options) {
    var moment = require('moment');  
    var FI = moment(moment(fi).format('L')); 
    var FF = moment(moment(ff).format('L'));
    var FH = moment(moment().format('L'));
    var meta=FF.diff(FI, 'days')
    var real=FH.diff(FI, 'days')
    var porc = (real / meta) * 100
    if (!options.data.root) {
        options.data.root = {};
    }
    options.data.root["Porcentaje"] = porc;
    return Math.floor(porc)
});
hbs.handlebars.registerHelper( "when",function(operand_1, operator, operand_2, options) {

    var operators = {
     'eq': function(l,r) { return l == r; },
     'noteq': function(l,r) { return l != r; },
     'gt': function(l,r) { return Number(l) > Number(r); },
     'gteq': function(l,r) { return Number(l) >= Number(r); },
     'or': function(l,r) { return l || r; },
     'and': function(l,r) { return l && r; },
     '%': function(l,r) { return (l % r) === 0; }
    }
    , result = operators[operator](operand_1,operand_2);
  
    if (result) return options.fn(this);
    else  return options.inverse(this);
  });
//Midelwares
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(sessions({
    secret: 'mysecretapp',
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
//Global Variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    res.locals.user = req.user || null;
    next()
})

//Routes
app.use(require('./routes/index'))
app.use(require('./routes/admin'))
//Static Files
app.use(express.static(path.join(__dirname, 'public')))
Number.prototype.padLeft = function (base, chr) {
    var len = (String(base || 10).length - String(this).length) + 1;
    return len > 0 ? new Array(len).join(chr || '0') + this : this;
}
app.use(function (err, req, res, next) {
    var errormsg = []
    var d = new Date,
        dformat = [(d.getMonth() + 1).padLeft(),
        d.getDate().padLeft(),
        d.getFullYear()].join('/') +
            ' ' +
            [d.getHours().padLeft(),
            d.getMinutes().padLeft(),
            d.getSeconds().padLeft()].join(':');
    errormsg.push({ Mensaje: "Error: " + err, stack: "Stack: " + err.stack, code: typeof err.http_code != 'undefined' ? err.http_code : '0', url: req.originalUrl, userid: typeof req.user != 'undefined' ? req.user._id : '0', organizationid: typeof req.user != 'undefined' ? req.user.idOrganizacion : '0', timeerror: dformat })
    const newError = new Error({ Mensaje: "Error: " + err, stack: "Stack: " + err.stack, code: typeof err.http_code != 'undefined' ? err.http_code : '0', url: req.originalUrl, userid: typeof req.user != 'undefined' ? req.user._id : '0', organizationid: typeof req.user != 'undefined' ? req.user.idOrganizacion : '0', timeerror: dformat })

    newError.save()
    console.log(errormsg)
    res.render('error', { errormsg, title: 'error', layout: 'login' })
})
//Server Listening
app.listen(app.get('port'), () => {
    console.log('Server on port ', app.get('port'));
});