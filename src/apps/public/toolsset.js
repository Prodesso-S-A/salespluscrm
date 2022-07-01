async function getOPeraciones(idCliente) {
    $('#operaciones > tbody').empty();
    let url = "/operaciones/" + idCliente
    return $.getJSON(url, function (dataop) {
        $.each(dataop, function (key, val) {
            console.log(val)
            let FFact = moment(val.fechaFactura).format("DD/MM/YYYY")
            let FLim = moment(val.fechaLimite).format("DD/MM/YYYY")
            let FPag = moment(val.fechaPago).format("DD/MM/YYYY hh:mm:ss")
            let btnPago = '<td><button type="button" onclick="paymentMark(this)" class="btnE" data-url="/operacionesPayment/' + val._id + '" data-target=".paymentMark"><i class="fa fa-plus"></i></button></td><td><button type="button" onclick="deleteOP(this)" data-url="/operaciones/' + val._id + '"  class="btnD"><i class="fa fa-trash"></i></button></td>'
            let montoFactura = '$' + parseFloat(val.montoFactura, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString()
            if (val.estadoFactura === "Por Pagar") {
                FPag = "Sin Pagar"
            } else if (val.estadoFactura === "Pagada") {
                btnPago = '<td colspan=2><button type="button" onclick="deleteOP(this)" data-url="/operaciones/' + val._id + '"  class="btnD"><i class="fa fa-trash"></i></button></td>'
            }

            $("#operaciones > tbody:last-child").append('<tr><td>' + val.folio + '</td><td>' + montoFactura + '</td><td>' + val.estadoFactura + '</td><td>' + FFact + '</td><td>' + FLim + '</td><td>' + FPag + '</td>' + btnPago + '</tr>');
        });
    })
}
function vendChart() {
    if ($('#ventasChart').length) {
        const ctx = $('#ventasChart');
        ctx.height = 150;
        let meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
        let groupedObjects = new Array();
        $.getJSON("/vendedorChartJson", function (ventas) {
            var vend = new Array();
            var estado = new Array();
            var mes = new Array();
            var year = new Array();
            var j = 0;
            var a = 0;
            var b = 0;
            var c = 0;
            _.each(ventas, function (obj) {
                var existingObj;
                if ($.inArray(obj.nombreVendedor, vend) >= 0) {
                    if ($.inArray(obj.estadoFactura, estado) >= 0) {
                        if ($.inArray(obj.mesFactura, mes) >= 0) {
                            if ($.inArray(obj.yearFactura, year) >= 0) {
                                existingObj = _.find(ventas, { 'nombreVendedor': obj.nombreVendedor, 'estadoFactura': obj.estadoFactura, 'mesFactura': obj.mesFactura, 'yearFactura': obj.yearFactura });
                                existingObj.montoFactura += obj.montoFactura;
                            } else {
                                groupedObjects = groupedObjects.concat(obj)
                                year[c] = obj.yearFactura;
                                c++;
                            }
                        } else {
                            groupedObjects = groupedObjects.concat(obj)
                            mes[j] = obj.mesFactura;
                            year[c] = obj.yearFactura;
                            c++;
                            j++;
                        }
                    } else {
                        groupedObjects = groupedObjects.concat(obj)
                        estado[a] = obj.estadoFactura;
                        mes[j] = obj.mesFactura;
                        year[c] = obj.yearFactura;
                        a++;
                        c++;
                        j++;
                    }
                } else {
                    groupedObjects = groupedObjects.concat(obj)
                    vend[b] = obj.nombreVendedor;
                    estado[a] = obj.estadoFactura;
                    mes[j] = obj.mesFactura;
                    year[c] = obj.yearFactura;
                    b++;
                    a++;
                    c++;
                    j++;
                }
            });
        }).done(function () {
            let dtset = new Array();
            let dtv = new Array();
            let pagadas = new Array();
            let porpagar = new Array();
            let k = 0
            var mesMt = new Array();
            for (var i = 0; i < 12; i++) {
                mesMt[i] = 0
                pagadas[i] = 0
                porpagar[i] = 0
            }
            console.log(groupedObjects)
            _.each(groupedObjects, function (obj) {
                if ($.inArray(obj.nombreVendedor, dtv) >= 0) {
                } else {
                    dtv[k] = obj.nombreVendedor;
                    k++;
                }
            })
            for (var a in dtv) {
                if (dtv.hasOwnProperty(a)) {
                    var obj = $.grep(groupedObjects, function (e) { return e.nombreVendedor == dtv[a]; });
                    for (var itm in obj) {
                        if (obj[itm].estadoFactura === "Pagada") {
                            pagadas[parseInt(obj[itm].mesFactura) - 1] = obj[itm].montoFactura
                        } else {
                            porpagar[parseInt(obj[itm].mesFactura) - 1] = obj[itm].montoFactura
                        }
                    }
                    for (var i = 0; i < 12; i++) {
                        mesMt[i] = obj[0].meta
                    }
                    var rndBar = ["#a862ea", "#4e55a4", "#6f7aea", "#de62ea", "#6545a4", "#9062ea", "#6b45a4", "#bf62ea", "#6383ea", "#465ca4", "#9862ea"]
                    var rndLin = ["#0000ff", "#002db3", "#5500ff", "#00ffff", "#00b3b3", "#0040ff", "#002db3", "#bfcfff", "#809fff", "#809fff", "#0080fe"]
                    let random = Math.floor(Math.random() * rndBar.length);
                    dtset.push({ label: "Pagadas " + dtv[a], stack: dtv[a], data: pagadas, backgroundColor: rndBar[random] })
                    random = Math.floor(Math.random() * rndBar.length);
                    dtset.push({ label: "Por Pagar " + dtv[a], stack: dtv[a], data: porpagar, backgroundColor: rndBar[random] })
                    random = Math.floor(Math.random() * rndLin.length);
                    dtset.push({ label: "Meta " + dtv[a], data: mesMt, borderWidth: "0", type: "line", backgroundColor: rndLin[random], fill: false })
                    mesMt = []
                    pagadas = []
                    porpagar = []
                    for (var i = 0; i < 12; i++) {
                        mesMt[i] = 0
                        pagadas[i] = 0
                        porpagar[i] = 0
                    }
                }
            }
            var myChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: meses,
                    datasets: dtset
                },
                options: {
                    responsive: true,
                    legend: {
                        position: 'left'
                    },
                    interaction: {
                        intersect: false,
                    },
                    scales: {
                        x: {
                            stacked: true,
                        },
                        y: {
                            stacked: true
                        }
                    }
                }
            });
        })
    }

}
async function getComments(idCliente) {
    let url = "/comentarios/" + idCliente
    var classli = ""
    return $.getJSON(url, function (datacom) {
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
        $("#addComent").prop('disabled', false);
    })

}
async function getmovimientos(idCliente) {
    let url = "/movimientos/" + idCliente
    var classli = ""
    return $.getJSON(url, function (datacom) {
        $('#movimientoli').empty()
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
                    dif = "Realizado hace " + difm + " minutos"
                } else {
                    dif = "Realizado hace " + difh + " horas"
                }
            } else {
                dif = "Realizado hace " + difd + " dias"
            }

            $("#movimientoli").append('<li ' + classli + '><div class="timeline-badge"><i class="glyphicon glyphicon-check"></i></div><div class="timeline-panel"><div class="timeline-heading"><p><small class="text-muted"><i class="glyphicon glyphicon-time"></i>' + dif + '</small></p></div><div class="timeline-body"><p>' + val.comentario + '</p></div></div></li>');
        });
    })
}
function paymentMark(e) {
    $('#modalloader').show();
    let idCliente = $('#idCliente').val()
    let urlUPDATE = e.getAttribute("data-url");
    $.post(urlUPDATE).then(function () {
        getOPeraciones(idCliente).then(function (returndata) {
            $('#modalloader').fadeOut(500);
            $("#OperacionForm").addClass("visually-hidden");
            $("#addRowOP").prop('disabled', false);
        })
    });
}
function deleteOP(e) {
    $('#modalloader').show();
    let idCliente = $('#idCliente').val()
    let urlDelete = e.getAttribute("data-url");
    $.ajax({
        url: urlDelete,
        type: 'DELETE'
    }).then(function () {
        getOPeraciones(idCliente).then(function (returndata) {
            $('#modalloader').fadeOut(500);
            $("#OperacionForm").addClass("visually-hidden");
            $("#addRowOP").prop('disabled', false);
        })
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
        getmovimientos(idCliente)
    })
}
function fillOrgChart() {
    let urlUPDATE = "/organigramaJson";
    if ($('#chart-container').length) {
        $.getJSON(urlUPDATE, function (data) {
            let DirArr = []
            let Gtearr = []
            let Jfarr = []
            let vendArr = []
            const Gtes = data.filter(user => user.puestoJefe === 'Director');
            Gtearr = []
            $.each(Gtes, function (key, val) {
                const Jefe = data.filter(user => user.idJefe === val.idUser);
                Jfarr = []
                $.each(Jefe, function (key, val) {
                    const Vend = data.filter(user => user.idJefe === val.idUser);
                    vendArr = []
                    $.each(Vend, function (key, val) {
                        vendArr.push({ 'name': val.nombreUsuario, 'title': val.puesto, 'foto': val.fotoUsuario, 'className': 'title' })
                    })
                    Jfarr.push({ 'name': val.nombreUsuario, 'title': val.puesto, 'foto': val.fotoUsuario, 'className': 'title', 'children': vendArr })
                })
                Gtearr.push({ 'name': val.nombreUsuario, 'title': val.puesto, 'foto': val.fotoUsuario, 'className': 'title', 'children': Jfarr })
            })
            DirArr.push({ 'name': Gtes[0].nombreJefe, 'foto': Gtes[0].fotoJefe, 'title': Gtes[0].puestoJefe, 'className': 'title', 'children': Gtearr })
            console.log(DirArr[0])
            $('#chart-container').orgchart({
                'data': DirArr[0],
                'nodeContent': 'title',
                'nodeID': 'id',
                'createNode': function ($node, data) {
                    var secondMenuIcon = $('<i>', {
                        'class': 'oci oci-info-circle second-menu-icon',
                        click: function () {
                            $(this).siblings('.second-menu').toggle();
                        }
                    });
                    var secondMenu = '<div class="second-menu"><img class="avatar" src="' + data.fotoUsuario + '"></div>';
                    $node.append(secondMenuIcon).append(secondMenu);
                }
            });
        })
    }
}
function fillVentas() {
    $("#metaVentas > tbody").empty()
    let urlUPDATE = "/organigramaJson";
    if ($('#metaVentas').length) {
        $.getJSON(urlUPDATE, function (data) {
            let DirArr = ""
            let Gtearr = ""
            let Jfarr = ""
            let vendArr = ""
            let monto = ""
            let montoJ = 0
            let montoG = 0
            let montoD = 0
            const Gtes = data.filter(user => user.puestoJefe === 'Director');
            Gtearr = ""
            $.each(Gtes, function (key, val) {
                const Jefe = data.filter(user => user.idJefe === val.idUser);
                Jfarr = ""
                $.each(Jefe, function (key, val) {
                    const Vend = data.filter(user => user.idJefe === val.idUser);
                    vendArr = ""
                    $.each(Vend, function (key, val) {
                        if (val.meta != "0") {
                            monto = '$' + parseFloat(val.meta, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString()
                            montoJ = parseFloat(montoJ) + parseFloat(val.meta)
                            vendArr = vendArr + '<tr><td></td><td>' + val.nombreUsuario + '</td><td>' + val.puesto + '</td><td>' + monto + '</td><td><button  type="submit" onclick="editMeta(this)" class="badge bg-info" data-url="/saveMeta/' + val.idUser + '" data-target=".paymentMark"><i class="fa fa-pencil m-r-5"></i></button></td></tr>'
                        } else {
                            vendArr = vendArr + '<tr><td></td><td>' + val.nombreUsuario + '</td><td>' + val.puesto + '</td><td><input type="number" id="in' + val.idUser + '"></td><td><button  type="submit" onclick="saveMeta(this)" class="badge bg-success" data-url="/saveMeta/' + val.idUser + '" data-target=".paymentMark"><i class="fa fa-save m-r-5"></i></button></td></tr>'
                        }
                    })
                    monto = '$' + parseFloat(montoJ, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString()
                    montoG = montoG + montoJ
                    Jfarr = Jfarr + '<tr data-id="r' + val.idUser + '" onclick="toggle(this)"><td><button type="submit"  class="btn mb-1 btn-rounded btn-outline-success btn-xs"><i class="fa fa-plus m-r-5"></i></button></td><td>' + val.nombreUsuario + '</td><td>' + val.puesto + '</td><td>' + monto + '</td><td></td></tr><tr><td colspan=5><div class="table-responsive rowV" id="r' + val.idUser + '"><table class="table-light">' + vendArr + '</table></div></td></tr>'
                    montoJ = 0
                })
                monto = '$' + parseFloat(montoG, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString()
                montoD = montoD + montoG
                Gtearr = Gtearr + '<tr data-id="r' + val.idUser + '" onclick="toggle(this)"><td><button type="submit"  class="btn mb-1 btn-rounded btn-outline-success btn-xs"><i class="fa fa-plus m-r-5"></i></button></td><td>' + val.nombreUsuario + '</td><td>' + val.puesto + '</td><td>' + monto + '</td><td></td></tr><tr><td colspan=5><div class="table-responsive rowJ" id="r' + val.idUser + '"><table class="table-light">' + Jfarr + '</table></div></td></tr>'
                montoG = 0
            })
            monto = '$' + parseFloat(montoD, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString()
            DirArr = DirArr + '<tr data-id="r' + Gtes[0].idJefe + '" onclick="toggle(this)" ><td><button type="submit" class="btn mb-1 btn-rounded btn-outline-success btn-xs"><i class="fa fa-plus m-r-5"></i></button></td><td>' + Gtes[0].nombreJefe + '</td><td>' + Gtes[0].puestoJefe + '</td><td>' + monto + '</td><td></td></tr><tr><td colspan=5><div class="table-responsive rowG" id="r' + Gtes[0].idJefe + '"><table class="table-light">' + Gtearr + '</table></div></td></tr>'
            $("#metaVentas > tbody").append(DirArr)
            $(".rowV").slideToggle()
            $(".rowJ").slideToggle()
            $(".rowG").slideToggle()

        })
    }


}
function toggle(e) {
    let id = $(e).attr("data-id");
    //getting the next element
    //open up the content needed - toggle the slide- if visible, slide up, if not slidedown.
    console.log(id)
    $("#" + id).slideToggle()
    $(e).closest('tr').find('i').toggleClass('fa-plus fa-minus')
    $(e).closest('tr').find('button').toggleClass('btn-outline-success btn-outline-danger')
}
function saveMeta(e) {
    let urlUPDATE = e.getAttribute("data-url");
    let id = e.getAttribute("data-url").replace('/saveMeta/', '')
    $.post(urlUPDATE, { meta: $("#in" + id).val() }).then(function () {
        fillVentas()
    });
}
function editMeta(e) {
    let urlUPDATE = e.getAttribute("data-url");
    $.post(urlUPDATE, { meta: "0" }).then(function () {
        fillVentas()
    });
}

function init() {
    var pagify = {
		items: {},
		container: null,
		totalPages: 1,
		perPage: 3,
		currentPage: 0,
		createNavigation: function() {
			this.totalPages = Math.ceil(this.items.length / this.perPage);

			$('.pagination', this.container.parent()).remove();
			var pagination = $('<div class="pagination"></div>').append('<span class="nav prev disabled" data-next="false"><</span>');

			for (var i = 0; i < this.totalPages; i++) {
				var pageElClass = "page";
				if (!i)
					pageElClass = "page current";
				var pageEl = '<span class="' + pageElClass + '" data-page="' + (
				i + 1) + '">' + (
				i + 1) + "</span>";
				pagination.append(pageEl);
			}
			pagination.append('<span class="nav next" data-next="true">></span>');

			this.container.after(pagination);

			var that = this;
			$("body").off("click", ".nav");
			this.navigator = $("body").on("click", ".nav", function() {
				var el = $(this);
				that.navigate(el.data("next"));
			});

			$("body").off("click", ".page");
			this.pageNavigator = $("body").on("click", ".page", function() {
				var el = $(this);
				that.goToPage(el.data("page"));
			});
		},
		navigate: function(next) {
			// default perPage to 5
			if (isNaN(next) || next === undefined) {
				next = true;
			}
			$(".pagination .nav").removeClass("disabled");
			if (next) {
				this.currentPage++;
				if (this.currentPage > (this.totalPages - 1))
					this.currentPage = (this.totalPages - 1);
				if (this.currentPage == (this.totalPages - 1))
					$(".pagination .nav.next").addClass("disabled");
				}
			else {
				this.currentPage--;
				if (this.currentPage < 0)
					this.currentPage = 0;
				if (this.currentPage == 0)
					$(".pagination .nav.prev").addClass("disabled");
				}

			this.showItems();
		},
		updateNavigation: function() {
			var pages = $(".pagination .page");
			pages.removeClass("current");
			$('.pagination .page[data-page="' + (
			this.currentPage + 1) + '"]').addClass("current");
		},
		goToPage: function(page) {

			this.currentPage = page - 1;

			$(".pagination .nav").removeClass("disabled");
			if (this.currentPage == (this.totalPages - 1))
				$(".pagination .nav.next").addClass("disabled");

			if (this.currentPage == 0)
				$(".pagination .nav.prev").addClass("disabled");
			this.showItems();
		},
		showItems: function() {
			this.items.hide();
			var base = this.perPage * this.currentPage;
			this.items.slice(base, base + this.perPage).show();
            console.log(base)
            console.log(this.currentPage)
			this.updateNavigation();
		},
		init: function(container, items, perPage) {
            console.log(this)
			this.container = container;
			this.currentPage = 0;
			this.totalPages = 1;
			this.perPage = perPage;
			this.items = items;
			this.createNavigation();
			this.showItems();
		}
	};

    // stuff it all into a jQuery method!
    $.fn.pagify = function (perPage, itemSelector) {
        var el = $(this);
        console.log(el)
        var items = $(itemSelector, el);
        console.log(items)
        // default perPage to 5
        if (isNaN(perPage) || perPage === undefined) {
            perPage = 3;
        }


        pagify.init(el, items, perPage);
    };
    $(".inbxcontainer").pagify(10, ".single-item:visible");
    $(".tblcont").pagify(10, ".single-item:visible");
    var $btns = $('.inboxbtn').click(function () {
        if (this.id == 'all') {
            $('#parent > div').fadeIn(450);
        } else {
            var $el = $('.' + this.id).fadeIn(450);
            $('#parent > div').not($el).hide();

        }
        $(".inbxcontainer").pagify(10, ".single-item:visible");
    })
    var $btns2 = $('.clibtn').click(function () {
        if (this.id == 'all') {
            $('#tblparent > tbody > tr').fadeIn(450);
        } else {
            var $el = $('.' + this.id).fadeIn(450);
            $('#tblparent  > tbody >  tr').not($el).hide();

        }
        $(".tblcont").pagify(10, ".single-item:visible");
    })
    var quantitiy = 0;
    let u = document.URL;
    fillOrgChart()
    fillVentas()
    vendChart()
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
        $("#addOP").prop('disabled', true);
        $('#modalloader').show();
        grabaOP()
    });
    async function grabaOP() {
        let idCliente = $('#idCliente').val()
        let folioFiscal = $('#folioFiscal').val()
        let serie = $('#serie').val()
        let folio = $('#folio').val()
        let montoFactura = $('#montoFactura').val()
        let fechaFactura = $('#fechaFactura').val()
        let fechaLimite = $('#fechaLimite').val()
        $.post("/operaciones", { idCliente, folioFiscal, serie, folio, montoFactura, fechaFactura, fechaLimite }).then(function () {
            getOPeraciones(idCliente).then(function (returndata) {
                $('#modalloader').fadeOut(500);
                $("#OperacionForm").addClass("visually-hidden");
                $("#addRowOP").prop('disabled', false);
                $("#addOP").prop('disabled', false);
            });
        })
    }
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
    var usr = $('#usuario').magicSuggest({
        allowFreeEntries: false,
        data: '/userJson',
        name: 'nombre',
        maxSelection: 1,
        resultsField: 'nombre',
        valueField: '_id',
        displayField: 'nombre',
        renderer: function (data) {
            return data.nombre
        }
    });
    var vend = $('#vendedor').magicSuggest({
        allowFreeEntries: false,
        data: '/vendedorJson',
        name: 'nombre',
        maxSelection: 1,
        resultsField: 'nombre',
        valueField: '_id',
        displayField: 'nombre',
        renderer: function (data) {
            return data.nombre
        }
    });
    var jfe = $('#Jefe').magicSuggest({
        allowFreeEntries: false,
        data: '/userJson',
        name: 'nombre',
        maxSelection: 1,
        resultsField: 'nombre',
        valueField: '_id',
        displayField: 'nombre',
        renderer: function (data) {
            return data.nombre
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
            $.post("/PermisoJson", function (perm) {
                $.post("/modOrgJson", { idOrg: $('#idOrg').val() }, function (mod) {
                    console.log(mod)
                    $.each(mod, function (imod, vmod) {
                        console.log(vmod)
                        row = ""
                        row = row + '<tr><th class="row-header">' + vmod.NombreMenu + '</th>'
                        $.each(perm, function (iperm, vperm) {
                            row = row + '<td><input name="Permisos[]" value="' + vperm.Nombre + '|' + vmod.NombreMenu + '" type="checkbox"></td>'
                        });
                        row = row + '</tr>'
                        $("#tblPermisos > tbody").append(row);
                        console.log(row)

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


}
$(document).ready(function () {
    init()
    async function abreModal(e) {
        if (e) {
            return $.getJSON(e, function (data) {
                for (var key in data) {
                    if (data.hasOwnProperty(key)) {
                        $('#' + key).val(data[key]);
                    }
                }
                getComments(data._id)
                getmovimientos(data._id)
                $('#modalloader').show();
                getOPeraciones(data._id).then(function (returndata) {
                    $('#modalloader').fadeOut(500);
                    $("#OperacionForm").addClass("visually-hidden");
                    $("#addRowOP").prop('disabled', false);
                })
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
                var usr = $('#usuario').magicSuggest({
                    allowFreeEntries: false,
                    data: '/userJson',
                    name: 'nombre',
                    maxSelection: 1,
                    resultsField: 'nombre',
                    valueField: '_id',
                    displayField: 'nombre',
                    renderer: function (data) {
                        return data.nombre
                    }
                });
                var vend = $('#vendedor').magicSuggest({
                    allowFreeEntries: false,
                    data: '/vendedorJson',
                    name: 'nombre',
                    maxSelection: 1,
                    resultsField: 'nombre',
                    valueField: '_id',
                    displayField: 'nombre',
                    renderer: function (data) {
                        return data.nombre
                    }
                });
                var jfe = $('#Jefe').magicSuggest({
                    allowFreeEntries: false,
                    data: '/userJson',
                    name: 'nombre',
                    maxSelection: 1,
                    resultsField: 'nombre',
                    valueField: '_id',
                    displayField: 'nombre',
                    renderer: function (data) {
                        return data.nombre
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
                if ($(tag).length) {
                    $.post("/tagJson", { idOrg: $('#idOrg').val() }, function (tags) {
                        tag.setData(tags)
                    }).then(function () {

                        tag.setValue([data.tag]);
                    });
                }
                if ($(vend).length) {
                    $.post("/vendedorJson", function (ven) {
                        vend.setData(ven)
                    }).then(function () {

                        vend.setValue([data.idVendedor]);
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
                $("#datos-tab").removeClass("visually-hidden ");
                $("#comentario-tab").removeClass("visually-hidden ");
                $("#ventas-tab").removeClass("visually-hidden ");
                $("#movimientos-tab").removeClass("visually-hidden ");
                $("#myFile").rules('remove', 'required');
                $("label[for='confirm_password']").addClass("visually-hidden ");
                //set form action
                $('#submit').attr('action', e);
            })
        }

    }
    $('*[data-target=".add-user"]').on('click', function (e, m) {
        var url = this.getAttribute("data-url");
        var type = this.getAttribute("data-type");
        abreModal(url).finally(function (returndata) {
            $('#modalloader').fadeOut(500);
            $('#modal-wrapper').addClass('show')
            if (type === "readOnly") {
                $('#submit input').attr('readonly', 'readonly');
                $("#crear").addClass("visually-hidden ");
                $("#guardar").addClass("visually-hidden ");
                $("#addRowOP").addClass("visually-hidden ");
                $("#addComent").addClass("visually-hidden ");
            }
        });

    });
    $('.modal').on('hidden.bs.modal', function () {
        location.reload()
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
