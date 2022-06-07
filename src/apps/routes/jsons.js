const router = require('express').Router();
const AdminModels = require('../models').admin
const SPModels = require('../models').salesplus
const use = require('../config/error')
//Jsons POST
router.post('/iconoJson', use(async (req, res) => {
    const icono = await AdminModels.IconoMenu.find().lean()
    res.send(icono)
}))
router.post('/urlJson', use(async (req, res) => {
    const url = await AdminModels.Url.find({ Asignada: false }).lean()
    res.send(url)
}))
router.post('/PermisoJson', use(async (req, res) => {
    const permiso = await AdminModels.Permiso.find().lean()
    res.send(permiso)
}))
router.post('/orgJson', use(async (req, res) => {
    const organizacion = await AdminModels.Organizacion.find().lean()
    res.send(organizacion)
}))
router.post('/menuJson', use(async (req, res) => {
    const menu = await AdminModels.Menu.distinct("idMenuPadre").lean()
    res.send(menu)
}))
router.post('/segJson', use(async (req, res) => {
    const seg = await AdminModels.Menu.distinct("Segmento").lean()
    res.send(seg)
}))
router.post('/modJson', use(async (req, res) => {
    const modulo = await AdminModels.Modulo.find().lean()
    res.send(modulo)
}))
router.post('/rolJson', use(async (req, res) => {
    const { idOrg } = req.body
    const rol = await AdminModels.Rol.find({ idOrganizacion: idOrg }).lean()
    res.send(rol)
}))
router.post('/modOrgJson', use(async (req, res) => {
    const { idOrg } = req.body

    const modOrg = await AdminModels.Moduloorganizacion.aggregate([
        { $match: { idOrganizacion: idOrg[0] } },
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
                "pipeline": [{
                    $project: {
                        "NombreOrg": "$Nombre",
                        "RFCOrg": "$RFC"
                    }
                }],
                "foreignField": "_id",
                "as": "Org"
            }
        },
        {
            $lookup: {
                "localField": "idMod",
                "from": "modulos",
                "pipeline": [{
                    $project: {
                        "NombreMenu": "$Nombre",
                    }
                }],
                "foreignField": "_id",
                "as": "Mod"
            }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$Org", 0] }, "$$ROOT"] } }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$Mod", 0] }, "$$ROOT"] } }
        },
        {
            $project: {
                "Mod": 0
            }
        },
        {
            $project: {
                "Org": 0
            }
        }
    ])
    res.send(modOrg)
}))
router.post('/modsOrgJson', use(async (req, res) => {
    const { idOrg } = req.body
    const modOrg = await AdminModels.Moduloorganizacion.aggregate([
        { $match: { idOrganizacion: idOrg[0] } },
        {
            $project: {
                "idMod": { "$toObjectId": "$idModulo" }
            }
        },
        {
            $lookup: {
                "localField": "idMod",
                "from": "modulos",
                "foreignField": "_id",
                "as": "mods"
            }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$mods", 0] }, "$$ROOT"] } }
        },
        {
            $project: {
                "mods": 0
            }
        }
    ])
    res.send(modOrg)
}))
router.post('/licenciaJson', use(async (req, res) => {
    const { idOrg } = req.body
    const licencia = await AdminModels.Licencias.find({ Activa: true, Asignada: false, idOrganizacion: idOrg }).lean()
    res.send(licencia)
}))
//Jsons GET
router.get('/iconoJson', use(async (req, res) => {
    const icono = await AdminModels.IconoMenu.find().lean()
    res.send(icono)
}))
router.get('/urlJson', use(async (req, res) => {
    const url = await AdminModels.Url.find({ Asignada: false }).lean()
    res.send(url)
}))
router.get('/PermisoJson', use(async (req, res) => {
    const permiso = await AdminModels.Permiso.find().lean()
    res.send(permiso)
}))
router.get('/orgJson', use(async (req, res) => {
    const organizacion = await AdminModels.Organizacion.find().lean()
    res.send(organizacion)
}))
router.get('/menuJson', use(async (req, res) => {
    const menu = await AdminModels.Menu.distinct("idMenuPadre").lean()
    res.send(menu)
}))
router.get('/segJson', use(async (req, res) => {
    const seg = await AdminModels.Menu.distinct("Segmento").lean()
    res.send(seg)
}))
router.get('/permisosJson', use(async (req, res) => {
    var userModel = []

    userModel = await AdminModels.User.aggregate([
        { $match: { email: "envy.and.malice@gmail.com" } },
        { $limit: 1 },
        {
            $project: {
                "idOrg": { "$toObjectId": "$idOrganizacion" },
                "idRol": { "$toObjectId": "$Rol" },
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
                        "expireDate": 1
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
    var usrMenu = []
    var usr = userModel[0]
    const permarr = []
    const men = []
    const lig = []
    const ligSeg = []
    const idTP = []
    const idMod = []
    const rol = await AdminModels.Rol.findOne({ _id: userModel[0].idRol }, { _id: 0, Permisos: 1 }).lean()
    for (let f of rol.Permisos) {
        idMod.push(f.idModulo)
    }
    var segmentos = await AdminModels.Menu.distinct("Segmento", { 'idModulo': { $in: idMod }, idOrganizacion: userModel[0].idOrg  }).lean()
    for (let seg of segmentos) {
        var menuPadre = await AdminModels.Menu.distinct("idMenuPadre", { 'idModulo': { $in: idMod }, 'Segmento': { $in: seg }, idOrganizacion: userModel[0].idOrg }).lean()
        for (let mp of menuPadre) {
            var menus = await AdminModels.Menu.find({ idMenuPadre: mp, Segmento: seg }).lean()
            for (let menu of menus) {
                while (men.length) { men.pop(); }
                for (let perm of rol.Permisos) {
                    if (perm.idModulo == menu.idModulo) {
                        idTP.push(perm.idtipoPermiso)
                    }
                }
                var tipoPermiso = await AdminModels.Permiso.find({ '_id': { $in: idTP } }, { _id: 0, Nombre: 1 }).lean()
                for (let x of tipoPermiso) {
                    permarr.push(x.Nombre)
                }
                var mod = await AdminModels.Modulo.findOne({ _id: menu.idModulo }).lean()
                men.push({ NombreMenu: menu.Nombre, icono: menu.Class, Permiso: permarr, Url: mod.Url })
            }
            lig.push({ "NombreMenuPadre": mp, "Menu": men[0] })
           
        }
        ligSeg.push({"Segmento":seg,"MenuPadre":lig})
    }
    usrMenu.push({"Ligas":ligSeg}) 
    console.log(usrMenu)
    usr['userMenu'] = usrMenu

    res.send(usr)
}))
router.get('/modJson', use(async (req, res) => {
    const modulo = await AdminModels.Modulo.find().lean()
    res.send(modulo)
}))
router.get('/rolJson', use(async (req, res) => {
    const { idOrg } = req.body
    var rol
    if (idOrg) {
        rol = await AdminModels.Rol.find({ idOrganizacion: idOrg }).lean()
    } else {
        rol = await AdminModels.Rol.find({ idOrganizacion: idOrg }).lean()
    }
    res.send(rol)
}))
router.get('/modOrgJson', use(async (req, res) => {
    const { idOrg } = req.body
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
                "pipeline": [{
                    $project: {
                        "NombreOrg": "$Nombre",
                        "RFCOrg": "$RFC"
                    }
                }],
                "foreignField": "_id",
                "as": "Org"
            }
        },
        {
            $lookup: {
                "localField": "idMod",
                "from": "modulos",
                "pipeline": [{
                    $project: {
                        "NombreMenu": "$Nombre",
                    }
                }],
                "foreignField": "_id",
                "as": "Mod"
            }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$Org", 0] }, "$$ROOT"] } }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$Mod", 0] }, "$$ROOT"] } }
        },
        {
            $project: {
                "Mod": 0
            }
        },
        {
            $project: {
                "Org": 0
            }
        }
    ])
    res.send(modOrg)
}))
router.get('/modsOrgJson', use(async (req, res) => {
    const { idOrg } = req.body
    const modOrg = await AdminModels.Moduloorganizacion.aggregate([
        { $match: { idOrganizacion: idOrg[0] } },
        {
            $project: {
                "idMod": { "$toObjectId": "$idModulo" }
            }
        },
        {
            $lookup: {
                "localField": "idMod",
                "from": "modulos",
                "foreignField": "_id",
                "as": "mods"
            }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$mods", 0] }, "$$ROOT"] } }
        },
        {
            $project: {
                "mods": 0
            }
        }
    ])
    res.send(modOrg)
}))
router.get('/licenciaJson', use(async (req, res) => {
    const { idOrg } = req.body
    const licencia = await AdminModels.Licencias.find({ Activa: true, Asignada: false, idOrganizacion: idOrg }).lean()
    res.send(licencia)
}))
router.post('/clienteJson', use(async (req, res) => {
    const cliente = await SPModels.Cliente.find({ idOrganizacion: req.user.idOrg }).lean()
    res.send(cliente)
}))
router.post('/tagJson', use(async (req, res) => {
    const tag = await SPModels.Tag.find({ idOrganizacion:  req.user.idOrg  }).lean()
    res.send(tag)
}))
router.post('/clienteUpdate', use(async (req, res) => {
    const { tag,cliente } = req.body
    await SPModels.Cliente.findOneAndUpdate({ _id: cliente },{ tag:tag, idOrganizacion: req.user.idOrg, usuarioCreador: req.user._id });
    req.flash('success_msg', 'Cliente modificado')
    res.redirect('/cliente')
}))
module.exports = router;
