const express = require('express')
const router=require('express').Router();
const passport = require('passport')
const use = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

router.get('/', use((req, res) => {
    res.render('login',{ title: 'login', layout: 'login' })
}))
router.post('/login/signin',passport.authenticate('local',{failureRedirect:'/',failureFlash:true}),  function(req, res) {
	res.redirect('../dashboard');
})
router.post('/login/unlock',passport.authenticate('local',{failureRedirect:'/',failureFlash:true}),  function(req, res) {
	const {url}=req.body
	res.redirect(url);
})
router.get('/dashboard', use((req, res) => {
    res.render('index')
}))
router.get('/lock',isAuthenticated, use((req, res) => {
    var path = req.headers.referer
    path=path.replace('https://', '')
    path=path.replace('http://', '')
    if (path.length>0){
        var url=path
        path = path.split('/')
        url=url.replace(path[0], '')
    }
    req.logOut()
    obj = new Object()
    obj.email = res.locals.user.email
    obj.url=url
    res.render('./lockout',{ title: 'lockout', layout: 'login',obj } )
}))
function isAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('../')
}
router.get('/logout', use((req,res)=>{
    req.logOut()
    res.redirect('/')
}))
module.exports = router;
