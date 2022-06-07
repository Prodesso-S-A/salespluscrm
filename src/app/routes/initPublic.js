const router = require('express').Router();
const passport = require('passport')

router.get('/', (req, res) => {
    req.session.destroy((err) => {
    })
    res.render('./login', { title: 'login', layout: 'login' })
})
router.post('/login/signin', passport.authenticate('local', { failureRedirect: '/', failureFlash: true }), async function (req, res) {
    var sessionArr = [{ id: '0', sesiones: 0 }]
    var ses = []
    await req.sessionStore.all((err, sessions) => {
        if (sessions != undefined) {
            sessions.forEach(se => {
                index = sessionArr.map(function (x) {
                    return x.id;
                }).indexOf(se.passport.user);
                if (index >= 0) {
                    sessionArr[index].sesiones = sessionArr[index].sesiones + 1;
                } else {
                    sessionArr.push({ id: se.passport.user, sesiones: 1 })
                }
            });
            ses = sessionArr.find(a => a.id == req.user.id)
            if (ses.sesiones > 2) {
                req.flash('error_msg', 'Limite de sesiones alcanzado')
                res.redirect('/')
            } else {
                res.redirect('../validaLicencias');
            }
        }
        else {
            res.redirect('../validaLicencias');
        }

    })
})
router.post('/login/unlock', passport.authenticate('local', { failureRedirect: '/', failureFlash: true }), function (req, res) {
    const { url } = req.body
    res.redirect(url);
})

module.exports = router;
