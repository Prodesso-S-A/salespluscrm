const express = require('express');
const path = require('path');
const app = express();
const { create } = require('express-handlebars');
// Settings
app.set('port', process.env.PORT || 3000);
var dir = __dirname.replace('server', 'app')
app.set('dir', dir)
app.set('views', path.join(app.get('dir'), 'views'));
app.use(express.static(path.join(app.get('dir'), 'public')))
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
module.exports.app = app
module.exports.hbs = hbs