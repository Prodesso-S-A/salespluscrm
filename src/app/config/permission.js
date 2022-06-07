isAuthorized = (req, res, next) => {
    if (!req.headers.referer) {
        var errormsg = []
        var d = new Date,
            dformat = [(d.getMonth() + 1).padLeft(),
            d.getDate().padLeft(),
            d.getFullYear()].join('/') +
                ' ' +
                [d.getHours().padLeft(),
                d.getMinutes().padLeft(),
                d.getSeconds().padLeft()].join(':');
        errormsg.push({ Mensaje: "Error: No tienes permitido acceder a esta seccion", stack: "", code: 403, url: req.originalUrl, userid: typeof req.user != 'undefined' ? req.user._id : '0', organizationid: typeof req.user != 'undefined' ? req.user.idOrg : '0', timeerror: dformat })
        res.render('error', { errormsg, title: 'error', layout: 'login' })
    } else {
        var path = req.headers.referer
        path = path.replace('https://', '')
        path = path.replace('http://', '')
        if (path.length > 0) {
            var url = path
            path = path.split('/')
            url = url.replace(path[0], '')
        }
        const Ligas = req.user.userMenu[0].Ligas[0].MenuPadre
        if (url == "/dashboard") {
            return next();
        } else {
            for (const i in Ligas) {
                if (Ligas[i].Menu.Url == url) {
                    return next();
                }
                else {
                    var errormsg = []
                    var d = new Date,
                        dformat = [(d.getMonth() + 1).padLeft(),
                        d.getDate().padLeft(),
                        d.getFullYear()].join('/') +
                            ' ' +
                            [d.getHours().padLeft(),
                            d.getMinutes().padLeft(),
                            d.getSeconds().padLeft()].join(':');
                    errormsg.push({ Mensaje: "Error: No tienes permitido acceder a esta seccion", stack: "", code: 403, url: req.originalUrl, userid: typeof req.user != 'undefined' ? req.user._id : '0', organizationid: typeof req.user != 'undefined' ? req.user.idOrg : '0', timeerror: dformat })
                    res.render('error', { errormsg, title: 'error', layout: 'login' })
                }
            }
        }
    }
}