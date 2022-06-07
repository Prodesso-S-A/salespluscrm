//Init
require('./database')
require('../app/config/passport')
const app = require('./settings').app
var hbs = require('./settings').hbs

require('./handlebars')(hbs)
require('./middleware')(app)
require('./globals')(app)
require('./routes')(app)
require('./errorhandler')(app)

//Server Listening

app.listen(app.get('port'), () => {
    console.log('Server on port ', app.get('port'));
});