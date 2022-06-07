const passport = require('passport');
const { Rol, Modulo, User, Permiso, Menu, Moduloorganizacion } = require('../models/admin');
const LocalStrategy = require('passport-local').Strategy
passport.use(new LocalStrategy({
    usernameField: 'email'
},
    async (email, password, done) => {
        const user = await User.findOne({ email: email })
        if (!user) {
            return done(null, false, { message: 'Usuario no encontrado' })
        } else {
            const match = await user.matchPassword(password)
            if (match) {
                return done(null, user)
            } else {
                return done(null, false, { message: 'Pasword Incorrecto' })
            }
        }
    }));

passport.serializeUser((user, done) => {
    done(null, user.id);
})

passport.deserializeUser(async (id, done) => {
    User.findById(id, async (err, user) => {
        var userModel = []

        userModel = await User.aggregate([
            { $match: { email: user.email } },
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
                    "foto":1
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
        const rol = await Rol.findOne({ _id: userModel[0].idRol }, { _id: 0, Permisos: 1 }).lean()
        for (let f of rol.Permisos) {
            idMod.push(f.idModulo)
        }
        var segmentos = await Menu.distinct("Segmento", { 'idModulo': { $in: idMod }, idOrganizacion: userModel[0].idOrg  }).lean()
        for (let seg of segmentos) {
            var menuPadre = await Menu.distinct("idMenuPadre", { 'idModulo': { $in: idMod }, 'Segmento': { $in: seg }, idOrganizacion: userModel[0].idOrg }).lean()
            for (let mp of menuPadre) {
                var menus = await Menu.find({ idMenuPadre: mp, Segmento: seg }).lean()
                for (let menu of menus) {
                    while (men.length) { men.pop(); }
                    for (let perm of rol.Permisos) {
                        if (perm.idModulo == menu.idModulo) {
                            idTP.push(perm.idtipoPermiso)
                        }
                    }
                    var tipoPermiso = await Permiso.find({ '_id': { $in: idTP } }, { _id: 0, Nombre: 1 }).lean()
                    for (let x of tipoPermiso) {
                        permarr.push(x.Nombre)
                    }
                    var mod = await Modulo.findOne({ _id: menu.idModulo }).lean()
                    men.push({ NombreMenu: menu.Nombre,iconoPadre: menu.ClassPadre, icono: menu.Class, Permiso: permarr, Url: mod.Url })
                }
                lig.push({ "NombreMenuPadre": mp, "Menu": men[0] })
               
            }
            ligSeg.push({"Segmento":seg,"MenuPadre":lig})
        }
        usrMenu.push({"Ligas":ligSeg}) 
        usr['userMenu'] = usrMenu
        done(err, usr)
    })
})