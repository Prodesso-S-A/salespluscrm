const router = require('express').Router();
const AdminModels = require('../models').admin
const SPModels = require('../models').salesplus
const use = require('../config/error')
//Jsons POST
router.post('/iconoJson', use(async (req, res) => {
    const icono = await AdminModels.IconoMenu.find().lean()
    res.send(icono)
}))
router.post('/userJson', use(async (req, res) => {
    const user = await AdminModels.User.find().lean()
    res.send(user)
}))
router.post('/vendedorJson', use(async (req, res) => {
    const rol = await AdminModels.Rol.findOne({ nombre: "Vendedor" })
    const user = await AdminModels.User.find({ Rol: rol._id }).lean()
    res.send(user)
}))
router.get('/vendedorJson', use(async (req, res) => {
    const ventas = await SPModels.OperacionCliente.aggregate([
        {
            $project: {
                "idCliente": { "$toObjectId": "$idCliente" },
                "montoFactura": 1,
                "montoPagado": 1,
            }
        },
        {
            $lookup: {
                "localField": "idCliente",
                "from": "clientes",
                "foreignField": "_id",
                "pipeline": [{
                    $project: {
                        "idVendedor": "$idVendedor",
                    }
                }],
                "as": "Cli"
            }
        },
        {
            $lookup: {
                "localField": "Cli.idVendedor",
                "from": "users",
                "foreignField": "_id",
                "pipeline": [{
                    $project: {
                        "nombreVendedor": "$nombre"
                    }
                }],
                "as": "Vend"
            }
        },
        {
            $lookup: {
                "localField": "Cli.idVendedor",
                "from": "vendedors",
                "foreignField": "_id",
                "pipeline": [{
                    $project: {
                        "meta": "$meta"
                    }
                }],
                "as": "metaVend"
            }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$Cli", 0] }, "$$ROOT"] } }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$Vend", 0] }, "$$ROOT"] } }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$metaVend", 0] }, "$$ROOT"] } }
        },
        {
            $project: {
                "Cli": 0
            }
        },
        {
            $project: {
                "Vend": 0
            }
        },
        {
            $project: {
                "metaVend": 0
            }
        }
    ])
    res.send(ventas)
}))
router.get('/vendedorChartJson', use(async (req, res) => {
    const ventas = await SPModels.OperacionCliente.aggregate([
        {
            $project: {
                "idCli": { "$toObjectId": "$idCliente" },
                "montoFactura": 1,
                "estadoFactura": 1,
                "mesFactura": { $dateToString: { format: "%m", date: "$fechaFactura" } },
                "yearFactura": { $dateToString: { format: "%Y", date: "$fechaFactura" } },
                _id: 0
            }
        },
        {
            $lookup: {
                "localField": "idCli",
                "from": "clientes",
                "foreignField": "_id",
                "pipeline": [{
                    $project: {
                        "idVend": { "$toObjectId": "$idVendedor" },
                        "idVendedor": 1,
                        _id: 0
                    }
                }],
                "as": "Cli"
            }
        },
        {
            $lookup: {
                "localField": "Cli.idVend",
                "from": "users",
                "foreignField": "_id",
                "pipeline": [{
                    $project: {
                        "nombreVendedor": "$nombre",
                        _id: 0
                    }
                }],
                "as": "Vend"
            }
        },
        {
            $lookup: {
                "localField": "Cli.idVendedor",
                "from": "organigramas",
                "foreignField": "idUser",
                "pipeline": [{
                    $project: {
                        "meta": "$meta",
                        _id: 0
                    }
                }],
                "as": "metaVend"
            }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$Vend", 0] }, "$$ROOT"] } }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$Cli", 0] }, "$$ROOT"] } }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$metaVend", 0] }, "$$ROOT"] } }
        },
        {
            $project: {
                "metaVend": 0,
                "Cli": 0,
                "Vend": 0,
                "idCli": 0,
                "idVend": 0,
                "idVendedor": 0
            }
        }
    ])
    res.send(ventas)
}))
router.post('/vendedorChartJson', use(async (req, res) => {
    const ventas = await SPModels.OperacionCliente.aggregate([
        {
            $project: {
                "idCli": { "$toObjectId": "$idCliente" },
                "montoFactura": 1,
                "estadoFactura": 1,
                "mesFactura": { $dateToString: { format: "%m", date: "$fechaFactura" } },
                "yearFactura": { $dateToString: { format: "%Y", date: "$fechaFactura" } },
                _id: 0
            }
        },
        {
            $lookup: {
                "localField": "idCli",
                "from": "clientes",
                "foreignField": "_id",
                "pipeline": [{
                    $project: {
                        "idVend": { "$toObjectId": "$idVendedor" },
                        "nombreCliente": 1,
                        "idVendedor": 1,
                        _id: 0
                    }
                }],
                "as": "Cli"
            }
        },
        {
            $lookup: {
                "localField": "Cli.idVend",
                "from": "users",
                "foreignField": "_id",
                "pipeline": [{
                    $project: {
                        "nombreVendedor": "$nombre",
                        _id: 0
                    }
                }],
                "as": "Vend"
            }
        },
        {
            $lookup: {
                "localField": "Cli.idVendedor",
                "from": "organigramas",
                "foreignField": "idUser",
                "pipeline": [{
                    $project: {
                        "meta": "$meta",
                        _id: 0
                    }
                }],
                "as": "metaVend"
            }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$Vend", 0] }, "$$ROOT"] } }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$Cli", 0] }, "$$ROOT"] } }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$metaVend", 0] }, "$$ROOT"] } }
        },
        {
            $project: {
                "metaVend": 0,
                "Cli": 0,
                "Vend": 0,
                "idCli": 0,
                "idVend": 0,
                "idVendedor": 0
            }
        }
    ])
    res.send(ventas)
}))
router.post('/organigramaJson', use(async (req, res) => {
    const organigrama = await AdminModels.Organigrama.aggregate([
        {
            $project: {
                "idOrganizacion": { "$toObjectId": "$idOrganizacion" },
                "idJefe": { "$toObjectId": "$idJefe" },
                "idUser": { "$toObjectId": "$idUser" },
                "meta": 1
            }
        },
        {
            $lookup: {
                "localField": "idOrganizacion",
                "from": "organizacions",
                "foreignField": "_id",
                "pipeline": [{
                    $project: {
                        "NombreOrg": "$Nombre",
                    }
                }],
                "as": "Org"
            }
        },
        {
            $lookup: {
                "localField": "idUser",
                "from": "users",
                "foreignField": "_id",
                "pipeline": [{
                    $project: {
                        "nombreUsuario": "$nombre",
                        "idPuesto": { "$toObjectId": "$Rol" },
                        "fotoUsuario": "$foto",
                    }
                }],
                "as": "Usuarios"
            }
        },
        {
            $lookup: {
                "localField": "Usuarios.idPuesto",
                "from": "rols",
                "foreignField": "_id",
                "pipeline": [{
                    $project: {
                        "puesto": "$nombre"
                    }
                }],
                "as": "puestos"
            }
        },
        {
            $lookup: {
                "localField": "idJefe",
                "from": "users",
                "foreignField": "_id",
                "pipeline": [{
                    $project: {
                        "nombreJefe": "$nombre",
                        "idPuestoJefe": { "$toObjectId": "$Rol" },
                        "fotoJefe": "$foto",
                    }
                }],
                "as": "Jefes"
            }
        },
        {
            $lookup: {
                "localField": "Jefes.idPuestoJefe",
                "from": "rols",
                "foreignField": "_id",
                "pipeline": [{
                    $project: {
                        "puestoJefe": "$nombre"
                    }
                }],
                "as": "puestoJefes"
            }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$Org", 0] }, "$$ROOT"] } }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$Usuarios", 0] }, "$$ROOT"] } }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$puestos", 0] }, "$$ROOT"] } }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$Jefes", 0] }, "$$ROOT"] } }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$puestoJefes", 0] }, "$$ROOT"] } }
        },
        {
            $project: {
                "Org": 0
            }
        },
        {
            $project: {
                "Usuarios": 0
            }
        },
        {
            $project: {
                "puestos": 0
            }
        },
        {
            $project: {
                "Jefes": 0
            }
        }
        ,
        {
            $project: {
                "puestoJefes": 0
            }
        }

    ])
    res.send(organigrama)
}))
router.get('/organigramaJson', use(async (req, res) => {
    const organigrama = await AdminModels.Organigrama.aggregate([
        {
            $project: {
                "idOrganizacion": { "$toObjectId": "$idOrganizacion" },
                "idJefe": { "$toObjectId": "$idJefe" },
                "idUser": { "$toObjectId": "$idUser" },
                "meta": 1
            }
        },
        {
            $lookup: {
                "localField": "idOrganizacion",
                "from": "organizacions",
                "foreignField": "_id",
                "pipeline": [{
                    $project: {
                        "NombreOrg": "$Nombre",
                    }
                }],
                "as": "Org"
            }
        },
        {
            $lookup: {
                "localField": "idUser",
                "from": "users",
                "foreignField": "_id",
                "pipeline": [{
                    $project: {
                        "nombreUsuario": "$nombre",
                        "idPuesto": { "$toObjectId": "$Rol" },
                        "fotoUsuario": "$foto",
                    }
                }],
                "as": "Usuarios"
            }
        },
        {
            $lookup: {
                "localField": "Usuarios.idPuesto",
                "from": "rols",
                "foreignField": "_id",
                "pipeline": [{
                    $project: {
                        "puesto": "$nombre"
                    }
                }],
                "as": "puestos"
            }
        },
        {
            $lookup: {
                "localField": "idJefe",
                "from": "users",
                "foreignField": "_id",
                "pipeline": [{
                    $project: {
                        "nombreJefe": "$nombre",
                        "idPuestoJefe": { "$toObjectId": "$Rol" },
                        "fotoJefe": "$foto",
                    }
                }],
                "as": "Jefes"
            }
        },
        {
            $lookup: {
                "localField": "Jefes.idPuestoJefe",
                "from": "rols",
                "foreignField": "_id",
                "pipeline": [{
                    $project: {
                        "puestoJefe": "$nombre"
                    }
                }],
                "as": "puestoJefes"
            }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$Org", 0] }, "$$ROOT"] } }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$Usuarios", 0] }, "$$ROOT"] } }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$puestos", 0] }, "$$ROOT"] } }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$Jefes", 0] }, "$$ROOT"] } }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$puestoJefes", 0] }, "$$ROOT"] } }
        },
        {
            $project: {
                "Org": 0
            }
        },
        {
            $project: {
                "Usuarios": 0
            }
        },
        {
            $project: {
                "puestos": 0
            }
        },
        {
            $project: {
                "Jefes": 0
            }
        }
        ,
        {
            $project: {
                "puestoJefes": 0
            }
        }

    ])
    res.send(organigrama)
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
        { $match: { idOrganizacion: idOrg } },
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
    console.log(modOrg)
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
    var segmentos = await AdminModels.Menu.distinct("Segmento", { 'idModulo': { $in: idMod }, idOrganizacion: userModel[0].idOrg }).lean()
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
        ligSeg.push({ "Segmento": seg, "MenuPadre": lig })
    }
    usrMenu.push({ "Ligas": ligSeg })
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
    const tag = await SPModels.Tag.find({ idOrganizacion: req.user.idOrg }).lean()
    res.send(tag)
}))

router.get('/usr', use(async (req, res) => {
    var userModel = []

    userModel = await AdminModels.User.aggregate([
        { $match: { email: req.user.email } },
        { $limit: 1 },
        {
            $project: {
                "idOrg": { "$toObjectId": "$idOrganizacion" },
                "idRol": { "$toObjectId": "$Rol" },
                "User": "$nombre",
                "id": 1,
                "email": 1,
                "Licencia": 1,
                "NombreRol": 1,
                "foto": 1
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
    var permarr = []
    var men = []
    var lig = []
    var ligSeg = []
    var idTP = []
    var idMod = []
    var rol = await AdminModels.Rol.findOne({ _id: userModel[0].idRol }, { _id: 0, Permisos: 1 }).lean()
    for (let f of rol.Permisos) {
        idMod.push(f.idModulo)
    }
    var segmentos = await AdminModels.Menu.distinct("Segmento", { 'idModulo': { $in: idMod }, idOrganizacion: userModel[0].idOrg }).lean()
    for (let seg of segmentos) {
        var menuPadre = await AdminModels.Menu.distinct("idMenuPadre", { 'idModulo': { $in: idMod }, 'Segmento': { $in: seg }, idOrganizacion: userModel[0].idOrg }).lean()
        for (let mp of menuPadre) {
            var menus = await AdminModels.Menu.find({ idMenuPadre: mp, Segmento: seg }).lean()
            for (let menu of menus) {
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
                men.push({ NombreMenu: menu.Nombre, iconoPadre: menu.ClassPadre, icono: menu.Class, Permiso: permarr, Url: mod.Url })
                idTP=[]
                permarr=[]
            }
            lig.push({ "NombreMenuPadre": mp, "Menu": men })

        }
        ligSeg.push({ "Segmento": seg, "MenuPadre": lig })
    }
    usrMenu.push({ "Ligas": ligSeg })
    usr['userMenu'] = usrMenu
    res.send(usr)
}))



module.exports = router;
