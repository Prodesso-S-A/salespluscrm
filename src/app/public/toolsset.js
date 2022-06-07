function getOPeraciones(idCliente) {
    $('#operaciones > tbody').empty();
    let url = "/operaciones/" + idCliente
    $.getJSON(url, function (dataop) {
        $.each(dataop, function (key, val) {
            console.log(val)
            let FFact = moment(val.fechaFactura).format("DD/MM/YYYY")
            let FLim = moment(val.fechaLimite).format("DD/MM/YYYY")
            let FPag = moment(val.fechaPago).format("DD/MM/YYYY hh:mm:ss")
            let btnPago = '<td><button  type="submit" onclick="paymentMark(this)" class="badge bg-success" data-url="/operacionesPayment/' + val._id + '" data-target=".paymentMark"><i class="fa fa-money m-r-5"></i></button></td><td><button  type="submit" onclick="deleteOP(this)" data-url="/operaciones/' + val._id + '"  class="badge bg-danger"><i class="fa fa-close"></i></button></td>'
            let montoFactura = '$' + parseFloat(val.montoFactura, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString()
            if (val.estadoFactura === "Por Pagar") {
                FPag = "Sin Pagar"
            } else if (val.estadoFactura === "Pagada") {
                btnPago = '<td colspan=2><button  type="submit" onclick="deleteOP(this)" data-url="/operaciones/' + val._id + '"  class="badge bg-danger"><i class="fa fa-close"></i></button></td>'
            }

            $("#operaciones > tbody:last-child").append('<tr><td>' + val.folioFiscal + '</td><td>' + val.serie + '</td><th>' + val.folio + '</td><th>' + montoFactura + '</td><td>' + val.estadoFactura + '</td><td>' + FFact + '</td><td>' + FLim + '</td><td>' + FPag + '</td>' + btnPago + '</tr>');
        });
    })
    $("#OperacionForm").addClass("visually-hidden");
    $("#addRowOP").prop('disabled', false);
}
function getComments(idCliente) {
    let url = "/comentarios/" + idCliente
    var classli = ""
    $.getJSON(url, function (datacom) {
        $('#comentarios').empty()
        $.each(datacom, function (key, val) {
            console.log(val)

            if (classli === "") {
                classli = 'class="timeline-inverted"'
            } else {
                classli = ""
            }
            var FF = moment(moment(val.fechaCreacion).toISOString());
            var FH = moment(moment(Date.now()).toISOString());
            var difd = FH.diff(FF, 'days')
            var difh = FH.diff(FF, 'hours')
            var difm = FH.diff(FF, 'minutes')
            var dif = ""
            if (difd === 0) {
                if (difh === 0) {
                    dif = "Comentado hace " + difm + " minutos"
                } else {
                    dif = "Comentado hace " + difh + " horas"
                }
            } else {
                dif = "Comentado hace " + difd + " dias"
            }

            $("#comentarios").append('<li ' + classli + '><div class="timeline-badge"><i class="glyphicon glyphicon-check"></i></div><div class="timeline-panel"><div class="timeline-heading"><p class="text-right"><button type="button" onclick="deleteCom(this)" data-url="/comentarios/' + val._id + '" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button></p><p><small class="text-muted"><i class="glyphicon glyphicon-time"></i>' + dif + '</small></p></div><div class="timeline-body"><p>' + val.comentario + '</p></div></div></li>');
        });
    })
    $("#addComent").prop('disabled', false);
}
function paymentMark(e) {
    let idCliente = $('#idCliente').val()
    let urlUPDATE = e.getAttribute("data-url");
    $.post(urlUPDATE).then(function () {
        getOPeraciones(idCliente)
    });
}
function deleteOP(e) {
    let idCliente = $('#idCliente').val()
    let urlDelete = e.getAttribute("data-url");
    $.ajax({
        url: urlDelete,
        type: 'DELETE'
    }).then(function () {
        getOPeraciones(idCliente)
    })
}
function deleteCom(e) {
    let idCliente = $('#idCliente').val()
    let urlDelete = e.getAttribute("data-url");
    $.ajax({
        url: urlDelete,
        type: 'DELETE'
    }).then(function () {
        getComments(idCliente)
    })
}

$(document).ready(function () {
    var quantitiy = 0;
    $("table").each(function () {
        var curTable = $(this);
        $(curTable).find('tr').each(function () {
            if (!$.trim($(this).text())) $(this).remove();
        });
    });
    $('.quantity-right-plus').click(function (e) {
        // Stop acting like a button
        e.preventDefault();
        // Get the field name
        var quantity = parseInt($('#quantity').val());
        // If is not undefined
        $('#quantity').val(quantity + 1);
        // Increment
    });
    $('#fecha').bootstrapMaterialDatePicker({
        weekStart: 0,
        time: false
    });
    $('#fechaFactura').bootstrapMaterialDatePicker({
        weekStart: 0,
        time: false
    });
    $('#fechaLimite').bootstrapMaterialDatePicker({
        weekStart: 0,
        time: false
    });
    $('.quantity-left-minus').click(function (e) {
        // Stop acting like a button
        e.preventDefault();
        // Get the field name
        var quantity = parseInt($('#quantity').val());

        // If is not undefined

        // Increment
        if (quantity > 0) {
            $('#quantity').val(quantity - 1);
        }
    });
    $('.slimscroll').slimscroll({
        position: "right",
        size: "5px",
        height: "400",
        color: "transparent"
    });
    $("#addComent").click(function () {
        let idCliente = $('#idCliente').val()
        let comentario = $('#comentarioCliente').val()
        $("#addComent").prop('disabled', true);
        $.post("/comentarios", { idCliente, comentario }).then(function () {
            getComments(idCliente)
        })
    });
    $("#OperacionForm").addClass("visually-hidden");
    $("#addRowOP").click(function (e, m) {
        $("#addRowOP").prop('disabled', true);
        $("#OperacionForm").removeClass("visually-hidden");
    });

    $("#addOP").click(function (e, m) {
        let idCliente = $('#idCliente').val()
        let folioFiscal = $('#folioFiscal').val()
        let serie = $('#serie').val()
        let folio = $('#folio').val()
        let montoFactura = $('#montoFactura').val()
        let fechaFactura = $('#fechaFactura').val()
        let fechaLimite = $('#fechaLimite').val()
        $.post("/operaciones", { idCliente, folioFiscal, serie, folio, montoFactura, fechaFactura, fechaLimite }).then(function () {
            getOPeraciones(idCliente)
        })

    });
    $(".needs-validation").validate(
        {
            errorClass: "invalid-feedback animated fadeInDown",
            errorElement: "div",
            errorPlacement: function (e, a) { jQuery(a).parents(".form-group").append(e) },
            highlight: function (e) { jQuery(e).closest(".form-group").removeClass("is-invalid").addClass("is-invalid") },
            success: function (e) { jQuery(e).closest(".form-group").removeClass("is-invalid"), jQuery(e).remove() },
            rules: {
                "quantity": { required: !0, number: !0 },
                "idOrg": { required: !0 },
                "tipolicencia": { required: !0 },
                "fecha": { required: !0 },
                "nombre": { required: !0 },
                "cls": { required: !0 },
                "mp": { required: !0 },
                "Class": { required: !0 },
                "ClassPadre": { required: !0 },
                "Segmento": { required: !0 },
                "Url": { required: !0 },
                "Modulo": { required: !0 },
                "password": { required: !0 },
                "lic": { required: !0 },
                "rl": { required: !0 },
                "mod": { required: !0 },
                "confirm_password": { equalTo: "#password" },
                "Permisos": { required: true },
            },
            messages: {
                "idOrg": "Selecciona una Organización",
                "quantity": "Escribe una Cantidad de Licencias",
                "tipolicencia": "Selecciona el tipo de licencia",
                "fecha": "Selecciona la fecha efectiva",
                "nombre": "Escribe el nombre",
                "cls": "Escribe la clase del icono",
                "mp": "Selecciona el menu padre",
                "Class": "Selecciona el icono",
                "ClassPadre": "Selecciona el icono",
                "Segmento": "Escribe el Segmento",
                "Url": "Selecciona la url",
                "Modulo": "Escribe el Segmento",
                "lic": "Selecciona la licencia a asignar",
                "rl": "Selecciona el Rol",
                "mod": "Selecciona el Modulo",
                "Permisos": "Selecciona al menos uno"
            }
        });
    //MagicSuggest    
    var mp = $('#menuPadre').magicSuggest({
        data: '/menuJson',
        name: 'MenuPadre',
        maxSelection: 1,
        valueField: 'idMenuPadre',
        displayField: 'idMenuPadre',
        renderer: function (data) {
            return data.idMenuPadre;
        },
        allowFreeEntries: true
    });
    var seg = $('#Segmento').magicSuggest({
        data: '/segJson',
        name: 'Segmento',
        maxSelection: 1,
        valueField: 'Segmento',
        displayField: 'Segmento',
        renderer: function (data) {
            return data.Segmento;
        },
        allowFreeEntries: true
    });
    var cls = $('#Class').magicSuggest({
        allowFreeEntries: false,
        data: '/iconoJson',
        name: 'Class',
        maxSelection: 1,
        resultsField: 'Class',
        valueField: 'iconoClass',
        displayField: 'iconoClass',
        renderer: function (data) {
            return '<icon class="' + data.iconoClass + '"/> ' + data.iconoClass
        }
    });
    var clsP = $('#ClassPadre').magicSuggest({
        allowFreeEntries: false,
        data: '/iconoJson',
        name: 'Class',
        maxSelection: 1,
        resultsField: 'Class',
        valueField: 'iconoClass',
        displayField: 'iconoClass',
        renderer: function (data) {
            return '<icon class="' + data.iconoClass + '"/> ' + data.iconoClass
        }
    });
    var url = $('#Url').magicSuggest({
        allowFreeEntries: false,
        data: '/urlJson',
        name: 'Url',
        maxSelection: 1,
        resultsField: 'Url',
        valueField: 'Url',
        displayField: 'Url',
        renderer: function (data) {
            return data.Url
        }
    });
    var org = $('#organizacion').magicSuggest({
        data: '/orgJson',
        name: 'organizacion',
        maxSelection: 1,
        valueField: '_id',
        displayField: 'Nombre',
        required: true,
        renderer: function (data) {
            return data.Nombre;
        },
        allowFreeEntries: false
    });

    var lic = $('#licencia').magicSuggest({
        data: '/licenciaJson',
        dataUrlParams: { idOrg: $('#idOrg').val() },
        name: 'licencia',
        maxSelection: 1,
        valueField: 'Token',
        displayField: 'Token',
        required: true,
        renderer: function (data) {
            if (data.Activa) {
                bg = "badge bg-success";
                valor = "Activa";
            } else {
                bg = "badge bg-danger"
                valor = "Inactiva";
            }
            return '<div class="row"><b class="font-weight-bold small">' + data.Token +
                '</b></div><div class="row"><b class="font-weight-bold small">Valida desde: ' + moment(data.sinceDate).format("DD/MM/YYYY") +
                ' Valida hasta: ' + moment(data.expireDate).format("DD/MM/YYYY") + '</b></div><span class="' + bg + '">' + valor + '</span>'
        },
        allowFreeEntries: false
    });
    var rol = $('#rol').magicSuggest({
        data: '/rolJson',
        dataUrlParams: { idOrg: $('#idOrg').val() },
        name: 'rol',
        maxSelection: 1,
        valueField: '_id',
        displayField: 'nombre',
        required: true,
        renderer: function (data) {
            return data.nombre;
        },
        allowFreeEntries: false
    });
    var cli = $('#cliente').magicSuggest({
        data: '/clienteJson',
        dataUrlParams: { idOrg: $('#idOrg').val() },
        name: 'cliente',
        maxSelection: 1,
        valueField: '_id',
        displayField: 'nombre',
        required: true,
        renderer: function (data) {
            return data.nombre;
        },
        allowFreeEntries: false
    });
    var tag = $('#tag').magicSuggest({
        data: '/tagJson',
        dataUrlParams: { idOrg: $('#idOrg').val() },
        name: 'tag',
        maxSelection: 1,
        valueField: '_id',
        displayField: 'nombre',
        required: true,
        renderer: function (data) {
            return data.nombre;
        },
        allowFreeEntries: false
    });
    var mod = $('#modulo').magicSuggest({
        data: '/modJson',
        name: 'modulo',
        maxSelection: 1,
        valueField: '_id',
        displayField: 'Nombre',
        required: true,
        renderer: function (data) {
            return data.Nombre;
        },
        allowFreeEntries: false
    });
    var modorg = $('#moduloorg').magicSuggest({
        data: '/modsOrgJson',
        dataUrlParams: { idOrg: $('#idOrg').val() },
        name: 'modulo',
        maxSelection: 1,
        valueField: 'idMod',
        displayField: 'Nombre',
        required: true,
        renderer: function (data) {
            return data.Nombre;
        },
        allowFreeEntries: false
    });
    $(org).on('selectionchange', function (e, m) {
        $('#idOrg').val(this.getValue())
        var idOrg = this.getValue()
        var row = ''
        if ($("#tblPermisos").length) {
            $("#tblPermisos").find('tbody').detach();
            $('#tblPermisos').append($('<tbody>'));
            $.post("/PermisoJson", { idOrg: idOrg }, function (perm) {
                $.post("/modOrgJson", { idOrg: idOrg }, function (mod) {
                    $.each(mod, function (imod, vmod) {
                        $.each(vmod.Mod, function (immod, vmmod) {
                            row = ""
                            row = row + '<tr><th class="row-header">' + vmmod.Nombre + '</th>'
                            $.each(perm, function (iperm, vperm) {
                                row = row + '<td><input name="Permisos[]" value="' + vperm.Nombre + '|' + vmmod.Nombre + '" type="checkbox"></td>'
                            });
                            row = row + '</tr>'
                            $("#tblPermisos > tbody").append(row);
                        });

                    });
                });
            });

        }
        if ($(lic).length) {
            lic.clear();
            $.post("/licenciaJson", { idOrg: this.getValue() }, function (data) {
                lic.setData(data)
            });
        }
        if ($(rol).length) {
            rol.clear();
            $.post("/rolJson", { idOrg: this.getValue() }, function (data) {
                rol.setData(data)
            });
        }
        if ($(modorg).length) {
            modorg.clear();
            $.post("/modsOrgJson", { idOrg: this.getValue() }, function (data) {
                modorg.setData(data)
            });
        }
    });
    $(mp).on('selectionchange', function (e, m) {
        $('#mp').val(this.getValue())
    });
    $(tag).on('selectionchange', function (e, m) {
        $('#tg').val(this.getValue())
    });
    $(clsP).on('selectionchange', function (e, m) {
        $('#clsPadre').val(this.getValue())
    });
    $(cls).on('selectionchange', function (e, m) {
        $('#cls').val(this.getValue())
    });
    $(lic).on('selectionchange', function (e, m) {
        $('#lic').val(this.getValue())
    });
    $(mod).on('selectionchange', function (e, m) {
        $('#mod').val(this.getValue())
    });
    $(modorg).on('selectionchange', function (e, m) {
        $('#mod').val(this.getValue())
    });
    $(cli).on('selectionchange', function (e, m) {
        $('#cln').val(this.getValue())
    });
    $(rol).on('selectionchange', function (e, m) {
        $('#rl').val(this.getValue())
    });

    $.validator.addMethod("strong_password", function (value, element) {
        let password = value;
        if (!(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[.@#$%&])(.{8,20}$)/.test(password))) {
            return false;
        }
        return true;
    }, function (value, element) {
        let password = $(element).val();
        if (!(/^(.{8,20}$)/.test(password))) {
            return 'Password debe contener de 8 a 20 caracteres de largo.';
        }
        else if (!(/^(?=.*[A-Z])/.test(password))) {
            return 'Password debe contener al menos una Mayuscula.';
        }
        else if (!(/^(?=.*[a-z])/.test(password))) {
            return 'Password debe contener al menos una minuscula.';
        }
        else if (!(/^(?=.*[0-9])/.test(password))) {
            return 'Password  debe contener al menos un numero.';
        }
        else if (!(/^(?=.*[.@#$%&])/.test(password))) {
            return "Password  debe contener al menos un caracer especial(.@#$%&).";
        }
        return false;
    });
    $.validator.addMethod("email", function (value, element) {
        let email = value;
        if (!(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(email))) {
            return false;
        }
        return true;
    }, "email invalido")
    function abreModal(e) {
        $.getJSON(e, function (data) {
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    $('#' + key).val(data[key]);
                }
            }
            getComments(data._id)
            getOPeraciones(data._id)
            if (data._id) {
                $('#idCliente').val(data._id);
            }

            if (data.User) {
                $('#nombre').val(data.User);
            } else if (data.Nombre) {
                $('#nombre').val(data.Nombre);
            } else if (data.nombre) {
                $('#nombre').val(data.nombre);
            }
            if (data.email) {
                $('#email').val(data.email);
            }
            if (data.telefono) {
                $('#telefono').val(data.telefono);
            }
            if (data.whatsapp) {
                $('#whatsapp').val(data.whatsapp);
            }
            if ($(tag).length) {
                $.post("/tagJson", { idOrg: $('#idOrg').val() }, function (tags) {
                    tag.setData(tags)
                }).then(function () {

                    tag.setValue([data.tag]);
                });
            }
            if ($(org).length) {
                if (data.idOrg) {
                    org.setValue([data.idOrg]);
                } else {
                    org.setValue([data.idOrganizacion]);
                }
            }
            if ($(rol).length) {
                $.post("/rolJson", { idOrg: $('#idOrg').val() }, function (roles) {
                    rol.setData(roles)
                }).then(function () {
                    rol.setValue([data.idRol]);
                });
            }
            if ($(lic).length) {
                $.post("/licenciaJson", { idOrg: $('#idOrg').val() }, function (licencias) {
                    lic.setData(licencias)
                }).then(function () {
                    lic.setValue([data.Licencia]);
                });
            }
            if ($(seg).length) {
                $.post("/segJson", function (segmento) {
                    seg.setData(segmento)
                }).then(function () {

                    seg.setValue([data.Segmento]);
                });
            }
            if ($(clsP).length) {
                $.post("/iconoJson", function (classes) {
                    cls.setData(classes)
                    clsP.setData(classes)
                }).then(function () {
                    cls.setValue([data.Class]);
                    clsP.setValue([data.ClassPadre])
                });
            }
            if ($(modorg).length) {
                $.post("/modsOrgJson", { idOrg: $('#idOrg').val() }, function (Modulos) {
                    modorg.setData(Modulos)
                }).then(function () {
                    modorg.setValue([data.idModulo]);
                });
            }
            $("#crear").addClass("visually-hidden ");

            $("#password").addClass("visually-hidden ");
            $("#confirm_password").addClass("visually-hidden ");
            $("#myFile").addClass("visually-hidden ");
            $("#confirm_password").addClass("visually-hidden ");
            $("#password").removeAttr("strong_password")
            $("#password").rules('remove', 'required');
            $("#confirm_password").removeAttr("strong_password")
            $("#confirm_password").rules('remove', 'required');
            $("#guardar").removeClass("visually-hidden ");
            $("label[for='password']").addClass("visually-hidden ");
            $("label[for='myFile']").addClass("visually-hidden ");
            $("label[for='inputGroupFile01']").addClass("visually-hidden ");

            $("#myFile").rules('remove', 'required');
            $("label[for='confirm_password']").addClass("visually-hidden ");
            //set form action
            $('#submit').attr('action', e);
        })
    }
    $('*[data-target=".add-user"]').on('click', function (e, m) {
        var url = this.getAttribute("data-url");
        abreModal(url)
    });
    $('.modal').on('hidden.bs.modal', function () {
        location.reload();
    })

    $("#submit").submit(function (e) {
        if ($(".needs-validation").valid()) {
            $("#crear").attr("disabled", true);
        } else {
            $("#crear").attr("disabled", false);
        }

        return true;
    });

});
