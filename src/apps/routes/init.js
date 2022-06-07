const router = require('express').Router();

router.get('/lock', (req, res) => {
    var path = req.headers.referer
    path = path.replace('https://', '')
    path = path.replace('http://', '')
    if (path.length > 0) {
        var url = path
        path = path.split('/')
        url = url.replace(path[0], '')
    }
    req.logOut()
    obj = new Object()
    obj.email = res.locals.user.email
    obj.url = url
    res.render('./lockout', { title: 'lockout', layout: 'login', obj })
})
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        res.redirect('/')
    })
})
module.exports = router;
