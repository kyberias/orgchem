var parser = require("./iupac").parser;
var scanner = require("./scanner.js");
var colors = require('colors');

parser.lexer = {
    lex: function () { return tokens.shift(); },
    setInput: function (str) { tokens = scanner.Tokenize(str) }
}

var PassTests = [
"pentadekaani",
"undekaani",
"dekaani",
"metyylicycloetaani",
"metyylietanoli",
"metyylietan-2,2-oli",
"3-metyylietan-2,2-oli",
"oktaani",

"1,4-dietyyli-5-metyylioktaani",
"5-metyylihepteeni",
"6-metyylihept-3-eeni",

"cyclopentaani",
"cycloheksaani",

"5-etyyli-2-metyyliheptaani",

"4-etyyli-1,6-dibutyyli-5-(1,2-dimetyylipropyyli)eikosaani",
"3,5-dimetyyli-4-propyyliheptaani",
"2,3,3-trimetyyliheksaani",
"2,7,8-trimetyylidekaani",
"3-etyyli-6-isopropyyli-2,8-dimetyylinonaani",

"5,5-bis(1,2-dimetyylipropyyli)nonaani"

//"5,5-Bis(1,2-dimetyylipropyyli)nonaani"
//,
//
];

var FailTests = [
"ööö",
"5-etyyli-2-metyyli",
"5,5-tri(1,2-dimetyylipropyyli)nonaani"
];

function printFail(testname, ex) {
    console.log(('FAIL: ' + testname + ' (' + ex + ')').red);
}

function printPass(testname) {
    console.log(('PASS: ' + testname).green);
}

function runTests(list, passPrinter, failPrinter) {
    var i;
    for (i = 0; i < list.length; i++) {
        try {
            var testit = parser.parse(list[i]);
        } catch (ex) {
            failPrinter(list[i], ex);
            continue;
        }

        passPrinter(list[i]);
    }
}

console.log("Should parse".yellow.bold);
runTests(PassTests, printPass, printFail);
console.log("Should not parse".yellow.bold);
runTests(FailTests, function (testname) { printFail(testname, "Should not parse."); }, printPass);

var data = parser.parse("cycloheksaani");
console.log("infix: " + data.infix);