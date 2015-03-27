var fs = require('fs');
var vm = require('vm');
var $ = require('jquery');
var path = "./script.js";

var code = fs.readFileSync(path);
vm.runInThisContext(code);
