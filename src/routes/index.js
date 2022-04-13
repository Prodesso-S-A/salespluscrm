const express = require('express')
const router=require('express').Router();
const passport = require('passport')
router.get('/', (req, res) => {
    res.render('login',{ title: 'login', layout: 'login' })
})
router.post('/login/signin',passport.authenticate('local',{failureRedirect:'/'}),  function(req, res) {
	res.redirect('../dashboard');
})
router.post('/login/unlock',passport.authenticate('local',{failureRedirect:'/'}),  function(req, res) {
	const {url}=req.body
	res.redirect(url);
})
router.get('/dashboard', (req, res) => {
    res.render('index')
})
router.get('/lock',isAuthenticated, (req, res) => {
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
})
function isAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('../')
}
router.get('/logout', (req,res)=>{
    req.logOut()
    res.redirect('/')
})
module.exports = router;
