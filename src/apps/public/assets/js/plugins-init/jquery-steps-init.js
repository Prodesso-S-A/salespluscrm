(function($) {
    "use strict"

    var form = $("#clientes");
    form.children('div').steps({
        headerTag: "h4",
        bodyTag: "section",
        transitionEffect: "slideLeft",
        autoFocus: true, 
        transitionEffect: "slideLeft",
        labels: {
            cancel: "Cancelar",
            current: "Paso Actual:",
            pagination: "Paginación",
            finish: "Guardar",
            next: "Siguiente",
            previous: "Anterior",
            loading: "Cargando ..."
        },
        onStepChanging: function (event, currentIndex, newIndex)
        {
            form.validate().settings.ignore = ":disabled,:hidden";
            return form.valid();
        },
        onFinishing: function (event, currentIndex) { 
            $("#clientes").submit()
            return true; },
    });

    var form2 = $("#step-form-tab");
    form2.children('div').steps({
        headerTag: "h4",
        bodyTag: "section",
        // Disables the finish button (required if pagination is enabled)
        enableFinishButton: false, 
        // Disables the next and previous buttons (optional)
        enablePagination: false, 
        // Enables all steps from the begining
        enableAllSteps: true, 
        // Removes the number from the title
        titleTemplate: "#title#" 
    });

    var form3 = $('#step-form-vertical');
    form3.children('div').steps({
        headerTag: "h4",
        bodyTag: "section",
        transitionEffect: "slideLeft",
        stepsOrientation: "vertical" ,
        // onStepChanging: function (event, currentIndex, newIndex)
        // {
        //     form3.validate().settings.ignore = ":disabled,:hidden";
        //     return form.valid();
        // }
    });


})(jQuery);