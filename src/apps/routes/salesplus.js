const router = require('express').Router();
const SPModels = require('../models').salesplus
const AdminModel = require('../models').admin
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
router.get('/cliente', use(async (req, res) => {
    const data = await SPModels.Cliente.find({ idOrganizacion: req.user.idOrg }).lean()
    res.render('./salesplus/clientes', { data })
}))
router.get('/metaVentas', use(async (req, res) => {
    res.render('./salesplus/vendedores')
}))
router.post('/saveMeta/:id', use(async (req, res) => {
    const { meta } = req.body
    const id = req.params.id
    await AdminModel.Organigrama.findOneAndUpdate({ idUser: id }, { meta },
        async function (err, doc, numbersAffected) {
            const newInsertMsg = new SPModels.ComentarioCliente({ idCliente: id, tipoComentario: "MetaUpdate", comentario: "Operación Marcada como Pagada Por : " + req.user.User + "(" + req.user.NombreRol + ")", idOrganizacion: req.user.idOrg, usuarioCreador: req.user._id })
            await newInsertMsg.save()
        })
    res.send("Realizado")
}))
router.get('/organigrama', use(async (req, res) => {
    const organigrama = await AdminModel.Organigrama.aggregate([
        {
            $project: {
                "idOrganizacion": { "$toObjectId": "$idOrganizacion" },
                "idJefe": { "$toObjectId": "$idJefe" },
                "idUser": { "$toObjectId": "$idUser" }
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
    console.log(organigrama)
    res.render('./salesplus/organigrama', { organigrama })
}))
router.post('/organigrama', use(async (req, res) => {
    const { usuario, Jefe } = req.body
    const dataInsert = await AdminModel.Organigrama.findOne({ idUser: usuario[0] }).lean()
    if (dataInsert) {
        req.flash('error_msg', 'Usuario ya existe en el Organigrama')
        res.redirect('/organigrama')
    } else {
        const newInsert = new AdminModel.Organigrama({ idUser: usuario[0], idJefe: Jefe[0], idOrganizacion: req.user.idOrg, usuarioCreador: req.user._id })
        await newInsert.save();
        req.flash('success_msg', 'Organigrama agregado')
        res.redirect('/organigrama')
    }
}))
//GET UNIQUE
router.get('/cliente/:id', use(async (req, res) => {
    const id = req.params.id
    const data = await SPModels.Cliente.find({ _id: id }).lean()
    res.send(data[0])
}))
router.get('/comentarios/:id', use(async (req, res) => {
    const id = req.params.id
    const data = await SPModels.ComentarioCliente.find({ idCliente: id, tipoComentario: "ComentarioAgregado" }).sort({ fechaCreacion: -1 }).lean()
    res.send(data)
}))
router.post('/comentarios', use(async (req, res) => {
    const { idCliente, comentario } = req.body

    const newInsertMsg = new SPModels.ComentarioCliente({ idCliente: idCliente, tipoComentario: "ComentarioAgregado", comentario, idOrganizacion: req.user.idOrg, usuarioCreador: req.user._id })
    await newInsertMsg.save()

    res.send("Realizado")
}))
router.delete('/comentarios/:id', use(async (req, res) => {
    const id = req.params.id
    const model = await SPModels.ComentarioCliente.findByIdAndDelete({ _id: id });
    res.send("Realizado")
}))
router.get('/operaciones/:id', use(async (req, res) => {
    const id = req.params.id
    const data = await SPModels.OperacionCliente.find({ idCliente: id }).lean()
    res.send(data)
}))
router.post('/operaciones', use(async (req, res) => {
    const { idCliente, folioFiscal, folio, serie, montoFactura, fechaFactura, fechaLimite } = req.body
    const dataInsert = await SPModels.OperacionCliente.findOne({ folioFiscal: folioFiscal }).lean()
    if (dataInsert) {
    } else {
        const newInsert = new SPModels.OperacionCliente({ idCliente, folioFiscal, folio, serie, montoFactura, fechaFactura, fechaLimite, idOrganizacion: req.user.idOrg, usuarioCreador: req.user._id })
        await newInsert.save()
        const newInsertMsg = new SPModels.ComentarioCliente({ idCliente: idCliente, tipoComentario: "OperacionAgregada", comentario: "Operación agregada Por : " + req.user.User + "(" + req.user.NombreRol + ")", idOrganizacion: req.user.idOrg, usuarioCreador: req.user._id })
        await newInsertMsg.save()
    }
    res.send("Realizado")
}))
router.delete('/operaciones/:id', use(async (req, res) => {
    const id = req.params.id
    console.log(id)
    const model = await SPModels.OperacionCliente.findByIdAndDelete({ _id: id });
    res.send("Realizado")
}))
router.post('/operacionesPayment/:id', use(async (req, res) => {
    const id = req.params.id
    const FP = Date.now()
    await SPModels.OperacionCliente.findOneAndUpdate({ _id: id }, { estadoFactura: "Pagada", fechaPago: FP },
        async function (err, doc, numbersAffected) {
            const newInsertMsg = new SPModels.ComentarioCliente({ idCliente: id, tipoComentario: "OperacionPayment", comentario: "Operación Marcada como Pagada Por : " + req.user.User + "(" + req.user.NombreRol + ")", idOrganizacion: req.user.idOrg, usuarioCreador: req.user._id })
            await newInsertMsg.save()
        })
    res.send("Realizado")
}))
// POST INSERT
router.post('/cliente', upload.single("myFile"), use(async (req, res) => {
    const fs = require('fs')
    console.log(req.user)
    const newFile = await File.create({
        name: req.file.filename,
    });
    const { nombreCliente, rfcCliente, vendedor, tag, nombreContacto, puestoContacto, celularContacto, whatsappContacto, eMailContacto, pais, estado, codigoPostal, direccion, giro } = req.body
    const dataInsert = await SPModels.Cliente.findOne({ nombreCliente: nombreCliente }).lean()
    if (dataInsert) {
        req.flash('error_msg', 'Cliente ya existe en el sistema')
        res.redirect('/cliente')
    } else {
        const newInsert = new SPModels.Cliente({ nombreCliente, rfcCliente, tag: tag[0],idVendedor:vendedor[0], nombreContacto, puestoContacto, celularContacto, whatsappContacto, eMailContacto, pais, estado, codigoPostal, direccion, giro, foto: req.file.filename, idOrganizacion: req.user.idOrg, usuarioCreador: req.user._id })
        await newInsert.save(async function (err, doc, numbersAffected) {
            const newInsertMsg = new SPModels.ComentarioCliente({ idCliente: doc._id, tipoComentario: "CreacionCliente", comentario: "Cliente Creado Por : " + req.user.User + "(" + req.user.NombreRol + ")", idOrganizacion: req.user.idOrg, usuarioCreador: req.user._id })
            await newInsertMsg.save()
            req.flash('success_msg', 'Cliente agregado')
            res.redirect('/cliente')
        });
    }

}))
// POST UPDATE
router.post('/cliente/:id', upload.single("myFile"), async (req, res) => {
    const id = req.params.id
    console.log(req.body)
    const { nombreCliente, rfcCliente, nombreContacto, puestoContacto, celularContacto,vendedor, whatsappContacto, eMailContacto, pais, estado, codigoPostal, direccion, giro } = req.body
    await SPModels.Cliente.findOneAndUpdate({ _id: id }, { nombreCliente, rfcCliente,idVendedor:vendedor[0], nombreContacto, puestoContacto, celularContacto, whatsappContacto, eMailContacto, pais, estado, codigoPostal, direccion, giro, idOrganizacion: req.user.idOrg, usuarioCreador: req.user._id })
    const newInsertMsg = new SPModels.ComentarioCliente({ idCliente: id, tipoComentario: "ModificacionCliente", comentario: "Cliente Modificado Por : " + req.user.User + "(" + req.user.NombreRol + ")", idOrganizacion: req.user.idOrg, usuarioCreador: req.user._id })
    await newInsertMsg.save()
    req.flash('success_msg', 'Cliente modificado')
    res.redirect('/cliente')
})
// POST DELETE
router.delete('/cliente/:id', use(async (req, res) => {
    const id = req.params.id
    const model = await SPModels.Cliente.findByIdAndDelete({ _id: id });
    if (!model) {
        req.flash('error_msg', 'No se puede eliminar')
        res.redirect('/cliente')
    } else {
        req.flash('success_msg', 'Cliente eliminado')
        res.redirect('/cliente')
    }
}))
//GET
router.get('/tag', use(async (req, res) => {
    const data = await SPModels.Tag.find({ idOrganizacion: req.user.idOrg }).lean()
    const control = []
    control.push({
        boton: {
            btnName: "Agregar"
        },
        modal: {
            title: "Añadir Tag",
            urlAction: '/tag',
            campos: [
                { titulo: "Nombre", tipo: "input", vhidden: "", valor: "nombre", ph: "Captura el nombre del tag" },
                { titulo: "Color", tipo: "color", vhidden: "", valor: "colorTag", ph: "Captura el color del tag" }
            ]
        },
        tabla: {

            headers: ["Nombre", 'Tag'],
            columns: ['nombre', 'colorTag'],
            rows: data,
            editUrl: "/tag/",
            idEdit: "_id",
            deleteUrl: "/tag/",
            idDelete: "_id"
        }
    })
    res.render('./salesplus/tags', { control })
}))
//GET UNIQUE
router.get('/tag/:id', use(async (req, res) => {
    const id = req.params.id
    const data = await SPModels.Tag.find({ _id: id }).lean()
    console.log(data[0])
    res.send(data[0])
}))
// POST INSERT
router.post('/tag', use(async (req, res) => {
    const { nombre, colorTag } = req.body
    const dataInsert = await SPModels.Tag.findOne({ nombre: nombre }).lean()
    if (dataInsert) {
        req.flash('error_msg', 'Tag ya existe en el sistema')
        res.redirect('/tag')
    } else {
        const newInsert = new SPModels.Tag({ nombre, colorTag, idOrganizacion: req.user.idOrg, usuarioCreador: req.user._id })
        await newInsert.save();
        req.flash('success_msg', 'Tag agregado')
        res.redirect('/tag')
    }
}))
// POST UPDATE
router.post('/tag/:id', use(async (req, res) => {
    const { nombre, colorTag } = req.body
    const id = req.params.id
    await SPModels.Tag.findOneAndUpdate({ _id: id }, { nombre, colorTag, idOrganizacion: req.user.idOrg, usuarioCreador: req.user._id });
    req.flash('success_msg', 'Tag modificado')
    res.redirect('/tag')

}))
// POST DELETE
router.delete('/tag/:id', use(async (req, res) => {
    const id = req.params.id
    const model = await SPModels.Tag.findByIdAndDelete({ _id: id });
    if (!model) {
        req.flash('error_msg', 'No se puede eliminar')
        res.redirect('/tag')
    } else {
        req.flash('success_msg', 'Tag eliminado')
        res.redirect('/tag')
    }
}))
router.get('/embudo', use(async (req, res) => {
    const data = await SPModels.Tag.aggregate([
        {
            $project: {
                "idTag": { "$toString": "$_id" },
                "Tag": "$nombre",
                "colorTag": 1
            }
        },
        {
            $lookup: {
                "localField": "idTag",
                "from": "clientes",
                "foreignField": "tag",
                "pipeline": [{
                    $project: {
                        "nombreCliente": "$nombre",
                        "idCliente": "$_id"
                    }
                }],
                "as": "clientes"
            }
        }
    ])
    console.log(data)
    const control = []
    control.push({
        boton: {
            btnName: "Agregar"
        },
        modal: {
            title: "Añadir Tag",
            urlAction: '/embudo',
            campos: [
                { titulo: "Nombre", tipo: "input", vhidden: "", valor: "nombre", ph: "Captura el nombre del tag" },
                { titulo: "Color", tipo: "color", vhidden: "", valor: "colorTag", ph: "Captura el color del tag" }
            ]
        },
        tabla: {

            headers: ["Nombre", 'Tag'],
            columns: ['nombre', 'colorTag'],
            rows: data,
            editUrl: "/tag/",
            idEdit: "_id",
            deleteUrl: "/tag/",
            idDelete: "_id"
        }
    })
    res.render('./salesplus/embudo', { data, control })
}))
router.post('/embudo', use(async (req, res) => {
    const { nombre, colorTag } = req.body
    const dataInsert = await SPModels.Tag.findOne({ nombre: nombre }).lean()
    if (dataInsert) {
        req.flash('error_msg', 'Tag ya existe en el sistema')
        res.redirect('/embudo')
    } else {
        const newInsert = new SPModels.Tag({ nombre, colorTag, idOrganizacion: req.user.idOrg, usuarioCreador: req.user._id })
        await newInsert.save();
        req.flash('success_msg', 'Tag agregado')
        res.redirect('/embudo')
    }
}))
module.exports = router;
