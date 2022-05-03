$(document).ready(function () {
    var quantitiy = 0;
    $("table").each(function(){
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
                "Segmento": { required: !0 },
                "Url": { required: !0 },
                "Modulo": { required: !0 },
                "password": { required: !0 },
                "lic": { required: !0 },
                "rol": { required: !0 },
                "mod": { required: !0 },
                "confirm_password": { equalTo: "#password" },
                "Permisos": {required: true},
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
                "Segmento": "Escribe el Segmento",
                "Url": "Selecciona el icono",
                "Modulo": "Escribe el Segmento",
                "lic": "Selecciona la licencia a asignar",
                "rol": "Selecciona el Rol",
                "mod": "Selecciona el Modulo",
                "Permisos":  "Selecciona al menos uno"
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
        valueField: '_id',
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


});
