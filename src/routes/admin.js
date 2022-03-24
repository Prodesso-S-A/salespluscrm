const express = require('express')
const router=require('express').Router();
const passport = require('passport')
const User = require('../models/User')
const Rol = require('../models/Rol')
const Menu = require('../models/Menu')

//Usuarios
router.get('/usuario',isAuthenticated, async(req,res)=>{
    const usuario = await User.find().lean()
    res.render('./admin/usuarios',{usuario})
})
router.post('/usuario', async (req,res)=>{
    const {nombre,email,password,confirm_password}=req.body
    const errors = []
    if(errors.length>0){
        res.render('signup',{errors,nombre,email,password,confirm_password})
    }else{
        const emailUser = await User.findOne({email:email}).lean()
        if(emailUser){
            req.flash('error_msg','Usuario ya existe')
            res.redirect('/usuario')
        }else{

            const newUser = new User({nombre,email,password})
            newUser.password = await newUser.encryptPassword(password)
            await newUser.save()
            req.flash('success_msg','Usuario agregado')
            res.redirect('/usuario')
        }
       
    }
 
})
// Roles
router.get('/rol',isAuthenticated, async(req,res)=>{
    const rol = await Rol.find().lean()
    res.render('./admin/roles',{rol})
})
router.post('/rol', async (req,res)=>{
    const {nombre}=req.body
    const errors = []
    if(errors.length>0){
        res.render('rol',{errors,nombre})
    }else{
        const rolAdd = await Rol.findOne({nombre:nombre}).lean()
        if(rolAdd){
            req.flash('error_msg','Rol ya existe')
            res.redirect('/rol')
        }else{

            const newRol = new Rol({nombre})
            await newRol.save()
            req.flash('success_msg','Rol agregado')
            res.redirect('/rol')
        }
       
    }
 
})
//Menus
router.get('/menu',isAuthenticated, async(req,res)=>{
    const menu = await Menu.find().lean()
    res.render('./admin/menus',{menu})
})
router.post('/menu', async (req,res)=>{
    const {Nombre,MenuPadre,Class,Segmento,Modulo,Url}=req.body
    const errors = []
    if(errors.length>0){
        res.render('menu',{errors,Nombre,MenuPadre,Class,Segmento,Url,Modulo})
    }else{
        const menuAdd = await Menu.findOne({Nombre:Nombre}).lean()
        if(menuAdd){
            req.flash('error_msg','Menu ya existe')
            res.redirect('/menu')
        }else{

            const newMenu = new Menu({Nombre,idMenuPadre:MenuPadre,Class,Segmento,Url,Modulo})
            await newMenu.save()
            req.flash('success_msg','Menu agregado')
            res.redirect('/menu')
        }
       
    }
 
})


function isAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('../')
}
module.exports = router;