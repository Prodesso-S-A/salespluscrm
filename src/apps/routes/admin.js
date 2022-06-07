const router = require('express').Router();
const AdminModels = require('../models').admin
const uuid = require('uuid');
const use = require('../config/error')
const File = require("../models/global").File;
const multer = require("multer");
const { v4: uuidv4 } = require('uuid');
// ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./src/apps/public/files");
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        cb(null, `${uuidv4()}.${ext}`);
    },
});
const multerFilter = (req, file, cb) => {
    if (file.mimetype.split("/")[1] === "jpg" || file.mimetype.split("/")[1] === "jpeg" || file.mimetype.split("/")[1] === "png") {
        cb(null, true);
    } else {
        cb(new Error("Not a JPG/JPEG/PNG File!!"), false);
    }
};
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});
//GET
router.get('/usuario', use(async (req, res) => {
    const usuario = await AdminModels.User.aggregate([
        {
            $project: {
                "idOrg": { "$toObjectId": "$idOrganizacion" },
                "idRol": { "$toObjectId": "$Rol" },
                "idUser": { "$toString": "$_id" },
                "User": "$nombre",
                "id": 1,
                "email": 1,
                "Licencia": 1,
                "NombreRol": 1
            }
        },
        {
            $lookup: {
                "localField": "idOrg",
                "from": "organizacions",
                "foreignField": "_id",
                "pipeline": [{
                    $project: {
                        "NombreOrg": "$Nombre",
                        "RFCOrg": "$RFC"
                    }
                }],
                "as": "Org"
            }
        },
        {
            $lookup: {
                "localField": "Licencia",
                "from": "licencias",
                "foreignField": "Token",
                "pipeline": [{
                    $project: {
                        "Licencia": 1,
                        "sinceDate": 1,
                        "expiredDate": 1
                    }
                }],
                "as": "Lic"
            }
        },
        {
            $lookup: {
                "localField": "idRol",
                "from": "rols",
                "foreignField": "_id",
                "pipeline": [{
                    $project: {
                        "NombreRol": "$nombre"
                    }
                }],
                "as": "roles"
            }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$roles", 0] }, "$$ROOT"] } }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$Lic", 0] }, "$$ROOT"] } }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$Org", 0] }, "$$ROOT"] } }
        },
        {
            $project: {
                "roles": 0
            }
        },
        {
            $project: {
                "Lic": 0
            }
        },
        {
            $project: {
                "Org": 0
            }
        }

    ])
    const control = []
    control.push({
        boton: {
            btnName: "Agregar"
        },
        modal: {
            title: "Añadir Usuario",
            urlAction: '/usuario',
            campos: [
                { titulo: "Nombre", tipo: "input", vhidden: "", valor: "nombre", ph: "Captura tu nombre completo" },
                { titulo: "email", tipo: "email", vhidden: "", valor: "email", ph: "Captura tu email" },
                { titulo: "Organización", tipo: "ms", vhidden: "idOrg", valor: "organizacion", ph: "" },
                { titulo: "Licencia", tipo: "ms", vhidden: "lic", valor: "licencia", ph: "" },
                { titulo: "Rol", tipo: "ms", vhidden: "rl", valor: "rol", ph: "" },
                { titulo: "Password", tipo: "password", vhidden: "", valor: "password", ph: "Captura tu password" },
                { titulo: "Confima tú password", tipo: "password", vhidden: "", valor: "confirm_password", ph: "Captura nuevamente tu password" }
            ]
        },
        tabla: {

            headers: ["Nombre", "Correo", "Organización", "Fecha de creación del Usuario", "Fecha efectiva de licencia", "Fecha expiración licencia", "Rol", "Duración de Licencia", "Status de Licencia"],
            columns: ['User', 'email', 'NombreOrg', 'dateFormat createdAt', 'dateFormat sinceDate', 'dateFormat expireDate', 'NombreRol', 'porcentajeAvance-sinceDate-expireDate', 'LicenciaActiva'],
            rows: usuario,
            editUrl: "/usuario/",
            idEdit: "idUser",
            deleteUrl: "/usuario/",
            idDelete: "idUser"
        }
    })
    res.render('./admin/usuarios', { control })
}))
router.get('/rol', use(async (req, res) => {
    const org = await AdminModels.Organizacion.aggregate([
        {
            $project: {
                "idOrg": { "$toString": "$_id" },
                "Nombre": 1,
                "_id": 0
            }
        },
        {
            $lookup: {
                "localField": "idOrg",
                "from": "rols",
                "foreignField": "idOrganizacion",
                "as": "Rol"
            }
        }
    ])
    const rol = await AdminModels.Rol.find().lean()
    const permiso = await AdminModels.Permiso.find().lean()
    const modulo = await AdminModels.Modulo.find().lean()
    res.render('./admin/roles', { rol, permiso, modulo, org })

}))
router.get('/icono', use(async (req, res) => {
    const icono = await AdminModels.IconoMenu.find().lean()
    res.render('./admin/iconos', { icono })
}))
router.get('/Permiso', use(async (req, res) => {
    const permiso = await AdminModels.Permiso.find().lean()
    res.render('./admin/Permiso', { permiso })
}))
router.get('/menu', use(async (req, res) => {
    const menu = await AdminModels.Menu.aggregate([
        {
            $project: {
                "idOrg": { "$toObjectId": "$idOrganizacion" },
                "idModOrg": { "$toObjectId": "$idModulo" },
                "Segmento": 1,
                "Class": 1,
                "ClassPadre": 1,
                "idMenuPadre": 1,
                "Nombre": 1,
                "idMod": 1
            }
        },
        {
            $lookup: {
                "localField": "idOrg",
                "from": "organizacions",
                "foreignField": "_id",
                "pipeline": [{
                    $project: {
                        "NombreOrg": "$Nombre"
                    }
                }],
                "as": "Org"
            }
        },
        {
            $lookup: {
                "localField": "idModOrg",
                "from": "moduloorganizacions",
                "foreignField": "idModulo",
                "pipeline": [{
                    $project: {
                        "idMod": { "$toObjectId": "$idModulo" }
                    }
                }],
                "as": "ModOrgs"
            }
        },
        {
            $lookup: {
                "localField": "idModOrg",
                "from": "modulos",
                "foreignField": "_id",
                "pipeline": [{
                    $project: {
                        "Modulo": "$Nombre"
                    }
                }],
                "as": "Mods"
            }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$Org", 0] }, "$$ROOT"] } }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$Mods", 0] }, "$$ROOT"] } }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$ModOrgs", 0] }, "$$ROOT"] } }
        },
        {
            $project: {
                "Mods": 0,
                "Org": 0,
                "ModOrgs": 0
            }
        }

    ])
    console.log(menu)
    res.render('./admin/menus', { menu })
}))
router.get('/moduloorganizacion', use(async (req, res) => {
    const modOrg = await AdminModels.Moduloorganizacion.aggregate([
        {
            $project: {
                "idOrg": { "$toObjectId": "$idOrganizacion" },
                "idMod": { "$toObjectId": "$idModulo" }
            }
        },
        {
            $lookup: {
                "localField": "idOrg",
                "from": "organizacions",
                "foreignField": "_id",
                "as": "Org"
            }
        },
        {
            $lookup: {
                "localField": "idMod",
                "from": "modulos",
                "foreignField": "_id",
                "as": "Mod"
            }
        }
    ])
    res.render('./admin/moduloorganizacion', { modOrg })
}))
router.get('/modulo', use(async (req, res) => {
    const modulo = await AdminModels.Modulo.find().lean()
    res.render('./admin/modulos', { modulo })
}))
router.get('/organizacion', use(async (req, res) => {
    const organizacion = await AdminModels.Organizacion.find().lean()
    res.render('./admin/organizacion', { organizacion })
}))
router.get('/organizacionlicencia', use(async (req, res) => {
    const licencias = await AdminModels.Organizacion.aggregate([
        {
            $project: {
                "idOrgStr": { "$toString": "$_id" },
                "_id": 0,
                "Nombre": 1
            }
        },
        {
            $lookup: {
                "localField": "idOrgStr",
                "from": "licencias",
                "foreignField": "idOrganizacion",
                "as": "licencias"
            }
        },
        { $addFields: { total: { $size: "$licencias" } } }
    ])
    res.render('./admin/organizacionlicencia', { licencias })
}))
//GET UNIQUE
router.get('/usuario/:id', use(async (req, res) => {
    const id = req.params.id
    const usuario = await AdminModels.User.aggregate([
        {
            $project: {
                "idOrg": { "$toObjectId": "$idOrganizacion" },
                "idRol": { "$toObjectId": "$Rol" },
                "idUser": { "$toString": "$_id" },
                "User": "$nombre",
                "id": 1,
                "email": 1,
                "Licencia": 1,
                "NombreRol": 1
            }
        },
        {
            $lookup: {
                "localField": "idOrg",
                "from": "organizacions",
                "foreignField": "_id",
                "pipeline": [{
                    $project: {
                        "NombreOrg": "$Nombre",
                        "RFCOrg": "$RFC"
                    }
                }],
                "as": "Org"
            }
        },
        {
            $lookup: {
                "localField": "Licencia",
                "from": "licencias",
                "foreignField": "Token",
                "pipeline": [{
                    $project: {
                        "Licencia": 1,
                        "sinceDate": 1,
                        "expiredDate": 1
                    }
                }],
                "as": "Lic"
            }
        },
        {
            $lookup: {
                "localField": "idRol",
                "from": "rols",
                "foreignField": "_id",
                "pipeline": [{
                    $project: {
                        "NombreRol": "$nombre"
                    }
                }],
                "as": "roles"
            }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$roles", 0] }, "$$ROOT"] } }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$Lic", 0] }, "$$ROOT"] } }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$Org", 0] }, "$$ROOT"] } }
        },
        {
            $project: {
                "roles": 0
            }
        },
        {
            $project: {
                "Lic": 0
            }
        },
        {
            $project: {
                "Org": 0
            }
        }

    ])
    const usermodel = await usuario.find(e => e.idUser === id)
    res.send(usermodel)
}))
router.get('/usuarioConfig', use(async (req, res) => {
    console.log(req.user)
    res.render('./admin/usuarioconfig')
}))
router.get('/rol/:id', use(async (req, res) => {
    const id = req.params.id
    const org = await AdminModels.Organizacion.aggregate([
        { $match: { id: id } },
        {
            $project: {
                "idOrg": { "$toString": "$_id" },
                "Nombre": 1,
                "_id": 0
            }
        },
        {
            $lookup: {
                "localField": "idOrg",
                "from": "rols",
                "foreignField": "idOrganizacion",
                "as": "Rol"
            }
        }
    ])
    const rol = await AdminModels.Rol.find().lean()
    const permiso = await AdminModels.Permiso.find().lean()
    const modulo = await AdminModels.Modulo.find().lean()
    res.render('./admin/roles', { rol, permiso, modulo, org })

}))
router.get('/menu/:id', use(async (req, res) => {
    const id = req.params.id
    const menu = await AdminModels.Menu.find({ _id: id })
    res.send(menu)
}))
router.get('/moduloorganizacion/:id', use(async (req, res) => {
    const id = req.params.id
    const modOrg = await AdminModels.ModuloOrganizacion.aggregate([
        { $match: { id: id } },
        {
            $project: {
                "idOrg": { "$toObjectId": "$idOrganizacion" },
                "idMod": { "$toObjectId": "$idModulo" }
            }
        },
        {
            $lookup: {
                "localField": "idOrg",
                "from": "organizacions",
                "foreignField": "_id",
                "as": "Org"
            }
        },
        {
            $lookup: {
                "localField": "idMod",
                "from": "modulos",
                "foreignField": "_id",
                "as": "Mod"
            }
        }
    ])
    res.render('./admin/moduloorganizacion', { modOrg })
}))
router.get('/modulo/:id', use(async (req, res) => {
    const id = req.params.id
    const modulo = await AdminModels.Modulo.find().lean()
    res.render('./admin/modulos', { modulo })
}))
router.get('/organizacion/:id', use(async (req, res) => {
    const id = req.params.id
    const organizacion = await AdminModels.Organizacion.find().lean()
    res.render('./admin/organizacion', { organizacion })
}))
router.get('/organizacionlicencia/:id', use(async (req, res) => {
    const id = req.params.id
    const licencias = await AdminModels.Organizacion.aggregate([
        { $match: { id: id } },
        {
            $project: {
                "idOrgStr": { "$toString": "$_id" },
                "_id": 0,
                "Nombre": 1
            }
        },
        {
            $lookup: {
                "localField": "idOrgStr",
                "from": "licencias",
                "foreignField": "idOrganizacion",
                "as": "licencias"
            }
        },
        { $addFields: { total: { $size: "$licencias" } } }
    ])
    res.render('./admin/organizacionlicencia', { licencias })
}))
// POST INSERT
router.post('/usuario', use(async (req, res) => {

    const { nombre, email, password, confirm_password, organizacion, rol, licencia } = req.body
    const errors = []
    if (errors.length > 0) {
        res.render('signup', { errors, nombre, email, password, confirm_password })
    } else {
        const emailUser = await AdminModels.User.findOne({ email: email }).lean()
        if (emailUser) {
            req.flash('error_msg', 'Usuario ya existe en el sistema')
            res.redirect('/usuario')
        } else {

            const newUser = new AdminModels.User({ nombre, email, password, idOrganizacion: organizacion[0], Rol: rol[0], Licencia: licencia[0] })
            newUser.password = await newUser.encryptPassword(password)
            await newUser.save();
            await AdminModels.Licencias.findOneAndUpdate({ Token: licencia[0] }, { Asignada: true });
            req.flash('success_msg', 'Usuario agregado')
            res.redirect('/usuario')
        }

    }

}))
router.post('/rol', use(async (req, res) => {
    const { nombre, organizacion } = req.body
    const permiso = []
    for (var key in req.body) {
        if (req.body.hasOwnProperty(key)) {
            if (key != 'nombre' && key != 'organizacion' && key != 'idOrg') {
                var K = req.body[key]
                for (let element of K) {
                    p = element.split('|')
                    perm = await AdminModels.Permiso.findOne({ Nombre: p[0] })
                    modulo = await AdminModels.Modulo.findOne({ Nombre: p[1] })
                    permiso.push({ idModulo: modulo._id.valueOf(), idtipoPermiso: perm._id.valueOf(), valor: true })
                }
            }
        }
    }
    const errors = []
    if (errors.length > 0) {
        res.render('rol', { errors, nombre })
    } else {
        const rolAdd = await AdminModels.Rol.findOne({ nombre: nombre }).lean()
        if (rolAdd) {
            req.flash('error_msg', 'Rol ya existe')
            res.redirect('/rol')
        } else {

            const newRol = new AdminModels.Rol({ nombre: nombre, idOrganizacion: typeof AdminModels.User.idOrganizacion != 'undefined' ? AdminModels.User.idOrganizacion : organizacion[0], Permisos: permiso })
            await newRol.save()
            req.flash('success_msg', 'Rol agregado')
            res.redirect('/rol')
        }

    }

}))
router.post('/icono', use(async (req, res) => {
    const { IconoClass } = req.body
    const errors = []
    if (errors.length > 0) {
        res.render('icono', { IconoClass })
    } else {
        const iconoAdd = await AdminModels.IconoMenu.findOne({ iconoClass: IconoClass }).lean()
        if (iconoAdd) {
            req.flash('error_msg', 'Icono ya existe')
            res.redirect('/icono')
        } else {

            const newIcono = new AdminModels.IconoMenu({ iconoClass: IconoClass })
            await newIcono.save()
            req.flash('success_msg', 'Icono agregado')
            res.redirect('/icono')
        }

    }

}))
router.post('/menu', use(async (req, res) => {
    const { nombre, Segmento, moduloorg, menuPadre, ClassPadre, Class, organizacion } = req.body
    const errors = []
    if (errors.length > 0) {
        res.render('menu', { errors, Nombre, MenuPadre, Class, Segmento, Url, Modulo })
    } else {
        const menuAdd = await AdminModels.Menu.findOne({ Nombre: nombre, idOrganizacion: organizacion[0] }).lean()
        if (menuAdd) {
            req.flash('error_msg', 'Menu ya existe')
            res.redirect('/menu')
        } else {

            const newMenu = new AdminModels.Menu({ Nombre: nombre, idMenuPadre: menuPadre[0], ClassPadre: ClassPadre[0], Class: Class[0], Segmento: Segmento[0], idModulo: moduloorg[0], idOrganizacion: organizacion[0] })
            await newMenu.save()
            req.flash('success_msg', 'Menu agregado')
            res.redirect('/menu')
        }

    }

}))
router.post('/moduloorganizacion', use(async (req, res) => {
    const { idOrg, mod } = req.body
    const errors = []
    if (errors.length > 0) {
        res.render('moduloorganizacion', { idOrg, mod })
    } else {
        const moduloOrgAdd = await AdminModels.ModuloOrganizacion.findOne({ idModulo: mod, idOrganizacion: idOrg }).lean()
        if (moduloOrgAdd) {
            req.flash('error_msg', 'Modulo/Organización ya existe')
            res.redirect('/moduloorganizacion')
        } else {

            const newModuloOrg = new AdminModels.ModuloOrganizacion({ idModulo: mod, idOrganizacion: idOrg })
            await newModuloOrg.save()
            req.flash('success_msg', 'Modulo/Organización agregado')
            res.redirect('/moduloorganizacion')
        }
    }
}))
router.post('/modulo', use(async (req, res) => {
    const { nombre, Url } = req.body
    const errors = []
    if (errors.length > 0) {
        res.render('menu', { Nombre })
    } else {
        const moduloAdd = await AdminModels.Modulo.findOne({ Nombre: nombre }).lean()
        if (moduloAdd) {
            req.flash('error_msg', 'Modulo ya existe')
            res.redirect('/modulo')
        } else {

            const newModulo = new AdminModels.Modulo({ Nombre: nombre, Url: Url[0] })
            await newModulo.save()
            await AdminModels.Url.findOneAndUpdate({ Url: Url[0] }, { Asignada: true });
            req.flash('success_msg', 'Modulo agregado')
            res.redirect('/modulo')
        }

    }

}))
router.post('/organizacion', use(async (req, res) => {
    const { Nombre, RFC } = req.body
    const errors = []
    if (errors.length > 0) {
        res.render('organizacion', { errors, Nombre, RFC })
    } else {
        const orgAdd = await AdminModels.Organizacion.findOne({ Nombre: Nombre }).lean()
        if (orgAdd) {
            req.flash('error_msg', 'Organización ya existe')
            res.redirect('/organizacion')
        } else {
            const newOrg = new AdminModels.Organizacion({ Nombre, RFC })
            await newOrg.save()
            req.flash('success_msg', 'Organizacion agregada')
            res.redirect('/organizacion')
        }
    }
}))
router.post('/organizacionlicencia', use(async (req, res) => {
    const { idOrg, quantity, tipolicencia, fecha } = req.body
    const errors = []
    fexp = new Date(fecha)
    fsince = new Date(fecha)
    if (errors.length > 0) {
        res.render('organizacionlicencia', { idOrg, quantity, tipolicencia, fecha })
    } else {
        try {
            for (var i = 0; i < quantity; i++) {
                if (tipolicencia == "Mensual") {
                    fexp.setMonth(fsince.getMonth() + 1)
                } else if (tipolicencia == "Anual") {
                    fexp.setMonth(fsince.getMonth() + 12)
                } else if (tipolicencia == "Temporal") {
                    fexp.setDate(fsince.getDate() + 14);
                }
                const newLicencia = new AdminModels.Licencias({ idOrganizacion: idOrg, sinceDate: fsince, expireDate: fexp, Token: uuid.v4() })
                await newLicencia.save()
            }
        } finally {
            req.flash('success_msg', 'Licencias agregadas')
            res.redirect('/organizacionlicencia')
        }
    }

}))
// POST INSERT
router.post('/usuario/:id', use(async (req, res) => {
    const { nombre, email, password, confirm_password, organizacion, rol, licencia } = req.body
    const id = req.params.id
    const Usuario = await AdminModels.User.findOne({ _id: id }).lean()
    await AdminModels.Licencias.findOneAndUpdate({ Token: Usuario.Licencia }, { Asignada: false });
    await AdminModels.User.findOneAndUpdate({ _id: id }, { nombre, email, idOrganizacion: organizacion[0], Rol: rol[0], Licencia: licencia[0] });
    await AdminModels.Licencias.findOneAndUpdate({ Token: licencia[0] }, { Asignada: true });
    req.flash('success_msg', 'Usuario modificado')
    res.redirect('/usuario')

}))
router.post('/usuarioedit/:id', upload.single("myFile"), async (req, res) => {
    const { nombre, email } = req.body
    const id = req.params.id
    console.log(req.file)
    if (req.file != undefined) {
        const newFile = await File.create({
            name: req.file.filename,
        });
        await AdminModels.User.findOneAndUpdate({ _id: id }, { nombre, email, foto: req.file.filename });
    } else {
        await AdminModels.User.findOneAndUpdate({ _id: id }, { nombre, email });
    }

    req.flash('success_msg', 'Usuario modificado')
    res.redirect('/usuarioConfig')

})
router.post('/rol', use(async (req, res) => {
    const { nombre, organizacion } = req.body
    const permiso = []
    for (var key in req.body) {
        if (req.body.hasOwnProperty(key)) {
            if (key != 'nombre' && key != 'organizacion' && key != 'idOrg') {
                var K = req.body[key]
                for (let element of K) {
                    p = element.split('|')
                    perm = await AdminModels.Permiso.findOne({ Nombre: p[0] })
                    modulo = await AdminModels.Modulo.findOne({ Nombre: p[1] })
                    permiso.push({ idModulo: modulo._id.valueOf(), idtipoPermiso: perm._id.valueOf(), valor: true })
                }
            }
        }
    }
    const errors = []
    if (errors.length > 0) {
        res.render('rol', { errors, nombre })
    } else {
        const rolAdd = await AdminModels.Rol.findOne({ nombre: nombre }).lean()
        if (rolAdd) {
            req.flash('error_msg', 'Rol ya existe')
            res.redirect('/rol')
        } else {

            const newRol = new AdminModels.Rol({ nombre: nombre, idOrganizacion: typeof AdminModels.User.idOrganizacion != 'undefined' ? AdminModels.User.idOrganizacion : organizacion[0], Permisos: permiso })
            await newRol.save()
            req.flash('success_msg', 'Rol agregado')
            res.redirect('/rol')
        }

    }

}))
router.post('/icono', use(async (req, res) => {
    const { IconoClass } = req.body
    const errors = []
    if (errors.length > 0) {
        res.render('icono', { IconoClass })
    } else {
        const iconoAdd = await AdminModels.iconoClass.findOne({ iconoClass: IconoClass }).lean()
        if (iconoAdd) {
            req.flash('error_msg', 'Icono ya existe')
            res.redirect('/icono')
        } else {

            const newIcono = new AdminModels.iconoClass({ iconoClass: IconoClass })
            await newIcono.save()
            req.flash('success_msg', 'Icono agregado')
            res.redirect('/icono')
        }

    }

}))
router.post('/menu', use(async (req, res) => {
    const { nombre, Segmento, mod, Url, menuPadre, Class } = req.body
    const errors = []
    if (errors.length > 0) {
        res.render('menu', { errors, Nombre, MenuPadre, Class, Segmento, Url, Modulo })
    } else {
        const menuAdd = await AdminModels.Menu.findOne({ Nombre: nombre }).lean()
        if (menuAdd) {
            req.flash('error_msg', 'Menu ya existe')
            res.redirect('/menu')
        } else {

            const newMenu = new AdminModels.Menu({ Nombre: nombre, idMenuPadre: menuPadre[0], Class: Class[0], Segmento, Url, Modulo: mod, idOrganizacion: req.user.idOrganizacion })
            await newMenu.save()
            req.flash('success_msg', 'Menu agregado')
            res.redirect('/menu')
        }

    }

}))
router.post('/moduloorganizacion', use(async (req, res) => {
    const { idOrg, mod } = req.body
    const errors = []
    if (errors.length > 0) {
        res.render('moduloorganizacion', { idOrg, mod })
    } else {
        const moduloOrgAdd = await AdminModels.ModuloOrganizacion.findOne({ idModulo: mod, idOrganizacion: idOrg }).lean()
        if (moduloOrgAdd) {
            req.flash('error_msg', 'Modulo/Organización ya existe')
            res.redirect('/moduloorganizacion')
        } else {

            const newModuloOrg = new AdminModels.ModuloOrganizacion({ idModulo: mod, idOrganizacion: idOrg })
            await newModuloOrg.save()
            req.flash('success_msg', 'Modulo/Organización agregado')
            res.redirect('/moduloorganizacion')
        }
    }
}))
router.post('/modulo', use(async (req, res) => {
    const { Nombre } = req.body
    const errors = []
    if (errors.length > 0) {
        res.render('menu', { Nombre })
    } else {
        const moduloAdd = await AdminModels.Modulo.findOne({ Nombre: Nombre }).lean()
        if (moduloAdd) {
            req.flash('error_msg', 'Modulo ya existe')
            res.redirect('/modulo')
        } else {

            const newModulo = new AdminModels.Modulo({ Nombre })
            await newModulo.save()
            req.flash('success_msg', 'Modulo agregado')
            res.redirect('/modulo')
        }

    }

}))
router.post('/organizacion', use(async (req, res) => {
    const { Nombre, RFC } = req.body
    const errors = []
    if (errors.length > 0) {
        res.render('organizacion', { errors, Nombre, RFC })
    } else {
        const orgAdd = await AdminModels.Organizacion.findOne({ Nombre: Nombre }).lean()
        if (orgAdd) {
            req.flash('error_msg', 'Organización ya existe')
            res.redirect('/organizacion')
        } else {
            const newOrg = new AdminModels.Organizacion({ Nombre, RFC })
            await newOrg.save()
            req.flash('success_msg', 'Organizacion agregada')
            res.redirect('/organizacion')
        }
    }
}))
router.post('/organizacionlicencia', use(async (req, res) => {
    const { idOrg, quantity, tipolicencia, fecha } = req.body
    const errors = []
    fexp = new Date(fecha)
    fsince = new Date(fecha)
    if (errors.length > 0) {
        res.render('organizacionlicencia', { idOrg, quantity, tipolicencia, fecha })
    } else {
        try {
            for (var i = 0; i < quantity; i++) {
                if (tipolicencia == "Mensual") {
                    fexp.setMonth(fsince.getMonth() + 1)
                } else if (tipolicencia == "Anual") {
                    fexp.setMonth(fsince.getMonth() + 12)
                } else if (tipolicencia == "Temporal") {
                    fexp.setDate(fsince.getDate() + 14);
                }
                const newLicencia = new AdminModels.Licencia({ idOrganizacion: idOrg, sinceDate: fsince, expireDate: fexp, Token: uuid.v4() })
                await newLicencia.save()
            }
        } finally {
            req.flash('success_msg', 'Licencias agregadas')
            res.redirect('/organizacionlicencia')
        }
    }

}))
// POST DELETE
router.delete('/usuario/:id', use(async (req, res) => {
    const id = req.params.id
    const model = await AdminModels.User.findByIdAndDelete({ _id: id });
    if (!model) {
        req.flash('error_msg', 'No se puede eliminar')
        res.redirect('/usuario')
    } else {
        req.flash('success_msg', 'Usuario eliminado')
        res.redirect('/usuario')
    }
}))
router.delete('/rol/:id', use(async (req, res) => {
    const id = req.params.id
    const rolAdd = await AdminModels.Rol.findByIdAndDelete({ _id: id })
    if (!rolAdd) {
        req.flash('error_msg', 'No se puede eliminar')
        res.redirect('/rol')
    } else {
        req.flash('success_msg', 'Rol eliminado')
        res.redirect('/rol')
    }

}))
router.delete('/menu/:id', use(async (req, res) => {
    const id = req.params.id
    const menuAdd = await AdminModels.Menu.findByIdAndDelete({ _id: id })
    if (!menuAdd) {
        req.flash('error_msg', 'No se puede eliminar')
        res.redirect('/menu')
    } else {
        req.flash('success_msg', 'Menu eliminado')
        res.redirect('/menu')
    }

}))
router.delete('/moduloorganizacion/:id', use(async (req, res) => {
    const id = req.params.id
    const moduloOrgAdd = await AdminModels.ModuloOrganizacion.findByIdAndDelete({ _id: id })
    if (!moduloOrgAdd) {
        req.flash('error_msg', 'No se puede eliminar')
        res.redirect('/moduloorganizacion')
    } else {
        req.flash('success_msg', 'Modulo/Organización eliminado')
        res.redirect('/moduloorganizacion')
    }
}))
router.delete('/modulo/:id', use(async (req, res) => {
    const id = req.params.id
    const moduloAdd = await AdminModels.Modulo.findByIdAndDelete({ _id: id })
    if (!moduloAdd) {
        req.flash('error_msg', 'No se puede eliminar')
        res.redirect('/modulo')
    } else {
        req.flash('success_msg', 'Modulo eliminado')
        res.redirect('/modulo')
    }
}))
router.delete('/organizacion/:id', use(async (req, res) => {
    const id = req.params.id
    const orgAdd = await AdminModels.Organizacion.findByIdAndDelete({ _id: id })
    if (!orgAdd) {
        req.flash('error_msg', 'No se puede eliminar')
        res.redirect('/organizacion')
    } else {
        req.flash('success_msg', 'Organizacion eliminada')
        res.redirect('/organizacion')
    }
}))
router.delete('/organizacionlicencia/:id', use(async (req, res) => {
    const id = req.params.id
    const { idOrg, quantity, tipolicencia, fecha } = req.body
    const errors = []
    fexp = new Date(fecha)
    fsince = new Date(fecha)
    if (errors.length > 0) {
        res.render('organizacionlicencia', { idOrg, quantity, tipolicencia, fecha })
    } else {
        try {
            for (var i = 0; i < quantity; i++) {
                if (tipolicencia == "Mensual") {
                    fexp.setMonth(fsince.getMonth() + 1)
                } else if (tipolicencia == "Anual") {
                    fexp.setMonth(fsince.getMonth() + 12)
                } else if (tipolicencia == "Temporal") {
                    fexp.setDate(fsince.getDate() + 14);
                }
                const newLicencia = new AdminModels.Licencia({ idOrganizacion: idOrg, sinceDate: fsince, expireDate: fexp, Token: uuid.v4() })
                await newLicencia.save()
            }
        } finally {
            req.flash('success_msg', 'Licencias agregadas')
            res.redirect('/organizacionlicencia')
        }
    }

}))
module.exports = router;
