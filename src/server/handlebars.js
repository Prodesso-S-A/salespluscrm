
//Handlebars
module.exports = function (hbs) {
    hbs.handlebars.registerHelper('ifCond', function (v1, v2, options) {
        if (v1 == v2) {
            return options.fn(this);
        }
        return options.inverse(this);
    });
    hbs.handlebars.registerHelper('ifHBS', function (v1, v2, options) {
        if (v1.indexOf(v2) !== -1) {
            return options.fn(this)
        } else {
            return options.inverse(this);
        }
    });
    hbs.handlebars.registerHelper('switch', function (value, options) {
        this.switch_value = value;
        return options.fn(this);
    });
    hbs.handlebars.registerHelper("debug", function(optionalValue) {
        console.log("Current Context");
        console.log("====================");
        console.log(this);
        if (optionalValue) {
            console.log("Value");
            console.log("====================");
            console.log(optionalValue);
        }
    });
    hbs.handlebars.registerHelper('json', function(context) {
        return JSON.stringify(context);
    });
    hbs.handlebars.registerHelper('contrastColor', function (value, options) {
        const hex = value.replace(/#/, '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        const hexToLuma = [
            0.299 * r,
            0.587 * g,
            0.114 * b
        ].reduce((a, b) => a + b) / 255;
        let color = ""
        if (hexToLuma > 0.5) {
            color = "#000000"
        } else {
            color = "#ffffff"
        }
        return color
    })
    hbs.handlebars.registerHelper('reduceColorTone', function (value, options) {
        const hex = value.replace(/#/, '');
        var R = parseInt(hex.substr(0, 2), 16);
        var G = parseInt(hex.substr(2, 2), 16);
        var B = parseInt(hex.substr(4, 2), 16);
        R = parseInt(R * (100 + 30) / 100);
        G = parseInt(G * (100 + 30) / 100);
        B = parseInt(B * (100 + 30) / 100);
    
        R = (R<255)?R:255;  
        G = (G<255)?G:255;  
        B = (B<255)?B:255;  
    
        var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
        var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
        var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));
    
        return "#"+RR+GG+BB;
    })
    hbs.handlebars.registerHelper('case', function (value, options) {
        if (value == this.switch_value) {
            return options.fn(this);
        }
    });
    hbs.handlebars.registerHelper('dateFormat', require('handlebars-dateformat'));
    hbs.handlebars.registerHelper('json', function (obj) {
        return new Handlebars.SafeString(JSON.stringify(obj))
    })
    hbs.handlebars.registerHelper('valFromObjkey', function (obj, key) {
        return obj[key]
    })
    hbs.handlebars.registerHelper('splitValFromK', function (obj, txt, indx) {
        var spl = txt.split('-')
        var key = spl[indx]
        return obj[key]
    })
    hbs.handlebars.registerHelper("porcentajeAvance", function (fi, ff, options) {
        var moment = require('moment');
        var FI = moment(moment(fi).toISOString());
        var FF = moment(moment(ff).toISOString());
        var FH = moment(moment(Date.now()).toISOString());
        var meta = FF.diff(FI, 'days')
        var real = FH.diff(FI, 'days')
        var porc = (real / meta) * 100
        if (!options.data.root) {
            options.data.root = {};
        }
        if (porc < 0) {
            porc = 0
        }
        options.data.root["Porcentaje"] = porc;
        return Math.floor(porc)
    });
    hbs.handlebars.registerHelper("setVar", function (varName, varValue, options) {
        options.data.root[varName] = varValue;
    });
    hbs.handlebars.registerHelper("when", function (operand_1, operator, operand_2, options) {

        var operators = {
            'eq': function (l, r) { return l == r; },
            'noteq': function (l, r) { return l != r; },
            'gt': function (l, r) { return Number(l) > Number(r); },
            'gteq': function (l, r) { return Number(l) >= Number(r); },
            'or': function (l, r) { return l || r; },
            'and': function (l, r) { return l && r; },
            '%': function (l, r) { return (l % r) === 0; }
        }
            , result = operators[operator](operand_1, operand_2);

        if (result) return options.fn(this);
        else return options.inverse(this);
    });

}