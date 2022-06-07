const Error = require('../apps/models/global/Error')

module.exports = function (app) {
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
        errormsg.push({ Mensaje: "Error: " + err, stack: "Stack: " + err.stack, code: typeof err.http_code != 'undefined' ? err.http_code : '0', url: req.originalUrl, userid: typeof req.user != 'undefined' ? req.user._id : '0', organizationid: typeof req.user != 'undefined' ? req.user.idOrg : '0', timeerror: dformat })
        const newError = new Error({ Mensaje: "Error: " + err, stack: "Stack: " + err.stack, code: typeof err.http_code != 'undefined' ? err.http_code : '0', url: req.originalUrl, userid: typeof req.user != 'undefined' ? req.user._id : '0', organizationid: typeof req.user != 'undefined' ? req.user.idOrg : '0', timeerror: dformat })

        newError.save()
        res.render('error', { errormsg, title: 'error', layout: 'login' })
    })
   

}