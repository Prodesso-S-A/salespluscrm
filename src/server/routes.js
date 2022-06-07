//Routes
const Routes = require('../apps/routes')
require('../apps/config/auth')
require('../apps/config/permission')
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