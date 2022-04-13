const express = require('express')
const router = require('express').Router();
const passport = require('passport')
const User = require('../models/User')
const Rol = require('../models/Rol')
const Menu = require('../models/Menu')
const iconoClass = require('../models/IconoMenu')
const Licencia = require('../models/Licencias')
const Permiso = require('../models/Permiso')
const Modulo = require('../models/Modulo')
const Organizacion = require('../models/Organizacion')
//Usuarios
router.get('/usuario', async (req, res) => {
    const usuario = await User.find().lean()
    res.render('./admin/usuarios', { usuario })
})
router.post('/usuario', async (req, res) => {
    const { nombre, email, password, confirm_password,organizacion } = req.body
    const errors = []
    if (errors.length > 0) {
        res.render('signup', { errors, nombre, email, password, confirm_password })
    } else {
        const emailUser = await User.findOne({ email: email }).lean()
        if (emailUser) {
            req.flash('error_msg', 'Usuario ya existe')
            res.redirect('/usuario')
        } else {

            const newUser = new User({ nombre, email, password, idOrganizacion:organizacion[0] })
            newUser.password = await newUser.encryptPassword(password)
            await newUser.save()
            req.flash('success_msg', 'Usuario agregado')
            res.redirect('/usuario')
        }

    }

})
// Roles
router.get('/rol', async (req, res) => {
    const rol = await Rol.find().lean()
    const permiso = await Permiso.find().lean()
    const modulo = await Modulo.find().lean()
    res.render('./admin/roles', { rol, permiso, modulo })

})
router.post('/rol', async (req, res) => {
    const { nombre } = req.body
    const permiso = []
    for (var key in req.body) {
        if (req.body.hasOwnProperty(key)) {
            if (key != 'nombre'){
               p = key.split('|')
               perm = await Permiso.findOne({ Nombre: p[0] })
               modulo = await Modulo.findOne({ Nombre: p[1] })
               permiso.push({idModulo:modulo._id.valueOf(),idtipoPermiso:perm._id.valueOf(),valor:true})
            }
        }
    }
    const errors = []
    if (errors.length > 0) {
        res.render('rol', { errors, nombre })
    } else {
        const rolAdd = await Rol.findOne({ nombre: nombre}).lean()
        if (rolAdd) {
            req.flash('error_msg', 'Rol ya existe')
            res.redirect('/rol')
        } else {

            const newRol = new Rol({ nombre: nombre ,Permisos:permiso })
            await newRol.save()
            req.flash('success_msg', 'Rol agregado')
            res.redirect('/rol')
        }

    }

})
//iconos
router.post('/iconoJson', async (req, res) => {
    const icono = await iconoClass.find().lean()
    res.send(icono)
})
router.post('/orgJson', async (req, res) => {
    const organizacion = await Organizacion.find().lean()
    res.send(organizacion)
})
router.post('/menuJson', async (req, res) => {
    const menu = await Menu.distinct("idMenuPadre").lean()
    res.send(menu)
})
router.get('/icono', async (req, res) => {
    const icono = await iconoClass.find().lean()
    res.render('./admin/iconos', { icono })
})
router.get('/Permiso', async (req, res) => {
    const permiso = await Permiso.find().lean()
    res.render('./admin/Permiso', { permiso })
})
router.post('/icono', async (req, res) => {
    const { IconoClass } = req.body
    const errors = []
    if (errors.length > 0) {
        res.render('icono', { IconoClass })
    } else {
        const iconoAdd = await iconoClass.findOne({ iconoClass: IconoClass }).lean()
        if (iconoAdd) {
            req.flash('error_msg', 'Icono ya existe')
            res.redirect('/icono')
        } else {

            const newIcono = new iconoClass({ iconoClass: IconoClass })
            await newIcono.save()
            req.flash('success_msg', 'Icono agregado')
            res.redirect('/icono')
        }

    }

})
//Menus
router.get('/menu', async (req, res) => {
    const menu = await Menu.find().lean()
    res.render('./admin/menus', { menu })
})
router.post('/menu', async (req, res) => {
    const { Nombre, Segmento, Modulo, Url,menuPadre,Class } = req.body
    const errors = []
    if (errors.length > 0) {
        res.render('menu', { errors, Nombre, MenuPadre, Class, Segmento, Url, Modulo })
    } else {
        const menuAdd = await Menu.findOne({ Nombre: Nombre }).lean()
        if (menuAdd) {
            req.flash('error_msg', 'Menu ya existe')
            res.redirect('/menu')
        } else {

            const newMenu = new Menu({ Nombre, idMenuPadre: menuPadre[0], Class:Class[0], Segmento, Url, Modulo })
            await newMenu.save()
            req.flash('success_msg', 'Menu agregado')
            res.redirect('/menu')
        }

    }

})
//moduloorganizacion
router.get('/moduloorganizacion', async (req, res) => {
    const menu = await Menu.find().lean()
    res.render('./admin/menus', { menu })
})
router.post('/moduloorganizacion', async (req, res) => {
    const { Nombre, MenuPadre, Class, Segmento, Modulo, Url } = req.body
    const errors = []
    if (errors.length > 0) {
        res.render('menu', { errors, Nombre, MenuPadre, Class, Segmento, Url, Modulo })
    } else {
        const menuAdd = await Menu.findOne({ Nombre: Nombre }).lean()
        if (menuAdd) {
            req.flash('error_msg', 'Menu ya existe')
            res.redirect('/menu')
        } else {

            const newMenu = new Menu({ Nombre, idMenuPadre: MenuPadre, Class, Segmento, Url, Modulo })
            await newMenu.save()
            req.flash('success_msg', 'Menu agregado')
            res.redirect('/menu')
        }

    }

})
//modulo
router.get('/modulo', async (req, res) => {
    const modulo = await Modulo.find().lean()
    res.render('./admin/modulos', { modulo })
})
router.post('/modulo', async (req, res) => {
    const { Nombre } = req.body
    const errors = []
    if (errors.length > 0) {
        res.render('menu', { Nombre })
    } else {
        const moduloAdd = await Modulo.findOne({ Nombre: Nombre }).lean()
        if (moduloAdd) {
            req.flash('error_msg', 'Modulo ya existe')
            res.redirect('/modulo')
        } else {

            const newModulo = new Modulo({ Nombre })
            await newModulo.save()
            req.flash('success_msg', 'Modulo agregado')
            res.redirect('/modulo')
        }

    }

})
//organizacion
router.get('/organizacion', async (req, res) => {
    const organizacion = await Organizacion.find().lean()
    res.render('./admin/organizacion', { organizacion })
})
router.post('/organizacion', async (req, res) => {
    const { Nombre, RFC} = req.body
    const errors = []
    if (errors.length > 0) {
        res.render('organizacion', { errors, Nombre, RFC })
    } else {
        const orgAdd = await Organizacion.findOne({ Nombre: Nombre }).lean()
        if (orgAdd) {
            req.flash('error_msg', 'Organización ya existe')
            res.redirect('/organizacion')
        } else {
            const newOrg = new Organizacion({ Nombre, RFC })
            await newOrg.save()
            req.flash('success_msg', 'Organizacion agregada')
            res.redirect('/organizacion')
        }
    }
})
//organizacionlicencia
router.get('/organizacionlicencia', async (req, res) => {
    const menu = await Menu.find().lean()
    res.render('./admin/menus', { menu })
})
router.post('/organizacionlicencia', async (req, res) => {
    const { Nombre, MenuPadre, Class, Segmento, Modulo, Url } = req.body
    const errors = []
    if (errors.length > 0) {
        res.render('menu', { errors, Nombre, MenuPadre, Class, Segmento, Url, Modulo })
    } else {
        const menuAdd = await Menu.findOne({ Nombre: Nombre }).lean()
        if (menuAdd) {
            req.flash('error_msg', 'Menu ya existe')
            res.redirect('/menu')
        } else {

            const newMenu = new Menu({ Nombre, idMenuPadre: MenuPadre, Class, Segmento, Url, Modulo })
            await newMenu.save()
            req.flash('success_msg', 'Menu agregado')
            res.redirect('/menu')
        }

    }

})
//usuariorol
router.get('/usuariorol', async (req, res) => {
    const menu = await Menu.find().lean()
    res.render('./admin/menus', { menu })
})
router.post('/usuariorol', async (req, res) => {
    const { Nombre, MenuPadre, Class, Segmento, Modulo, Url } = req.body
    const errors = []
    if (errors.length > 0) {
        res.render('menu', { errors, Nombre, MenuPadre, Class, Segmento, Url, Modulo })
    } else {
        const menuAdd = await Menu.findOne({ Nombre: Nombre }).lean()
        if (menuAdd) {
            req.flash('error_msg', 'Menu ya existe')
            res.redirect('/menu')
        } else {

            const newMenu = new Menu({ Nombre, idMenuPadre: MenuPadre, Class, Segmento, Url, Modulo })
            await newMenu.save()
            req.flash('success_msg', 'Menu agregado')
            res.redirect('/menu')
        }

    }

})
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('../')
}

module.exports = router;