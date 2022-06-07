//Global Variables
module.exports = function (app) {
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash('success_msg')
        res.locals.error_msg = req.flash('error_msg')
        res.locals.warning_msg = req.flash('warning_msg')
        res.locals.error = req.flash('error')
        res.locals.user = req.user || null;
        next()
    })
}