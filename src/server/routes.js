//Routes
const Routes = require('../app/routes')
require('../app/config/auth')
require('../app/config/permission')
module.exports = function (app) {
    app.use(Routes.jsons)
    app.use(Routes.initPublic)
    //app.use(isAuthenticated)
    app.use(Routes.initAuth)
    app.use(Routes.init)
    //app.use(isAuthorized)
    app.use(Routes.admin)
    app.use(Routes.salesplus)
    //app.use(Routes.dataplus)
}