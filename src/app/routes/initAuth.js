const router = require('express').Router();
const Licencia = require('../models/admin/Licencias')
router.get('/dashboard', (req, res) => {
    res.render('index')
})
router.get('/sessions', (req, res) => {
    var sessionArr = [{ id: 0, sesiones: 0 }]
    req.sessionStore.all((err, sessions) => {
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
        res.send(sessionArr)
    })
})
router.get('/validaLicencias', async (req, res) => {
    const lic = await Licencia.findOne({ Token: req.user.Licencia }).lean()
    var moment = require('moment');
    var FF = moment(lic.expireDate)
    var FH = moment()
    const diffDays = FF.diff(FH, "days");
    if (diffDays <= 0) {
        req.flash('error_msg', 'La licencia ha expirado, Favor de contactar con el equipo de ventas de Prodesso')
        res.redirect('/')
    } else if (diffDays <= 30) {
        req.flash('warning_msg', 'La licencia esta apunto de vencer, te quedan ' + diffDays + ' dias. Favor de renovar la licencia.')
        res.redirect('dashboard')
    } else {
        res.redirect('dashboard')
    }

})
module.exports = router;