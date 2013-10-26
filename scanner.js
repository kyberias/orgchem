// This structure is to make sure this works both as node.js module and in browser.
(function (exports) {

    var tokenlist = [
        'metyyli', 'etyyli', 'butyyli', 'propyyli',
        'met', 'et', 'prop', 'but', 'pent', 'heks', 'hept', 'okt', 'non', 'dek',
            'undek', 'dodec', 'tridek', 'tetradek', 'pentadek', 
            'eikos', 'triakont', 'tetrakont', 'pentakont',
        'aani', 'eeni', 'yyni',
        'cyclo', 'spiro', 'bicyclo',
        'di', 'tri', 'iso',
        '(', ')', ',', '-', 'an',
        'bis','tris','tetrakis',
        'oli',
        'fosfono-oksi', 'hydroksi'
    ];

    function tokenIndex(token) {
        var i;
        for (i = 0; i < tokenlist.length; i++) {
            if (tokenlist[i] == token) return i;
        }
        return -1;
    }

    function isDigit(aChar) {
        var allowedChars = "0123456789";
        return allowedChars.indexOf(aChar) != -1;
    }

    exports.Tokenize = function (str) {
        var len = str.length;
        var tokens = [];
        var i;
        var currToken = '';
        for (i = 0; i < len; i++) {
            if (isDigit(str[i])) {
                if (currToken.length > 0) {
                    if (!isDigit(currToken[currToken.length - 1])) {
                        throw "Syntax error";
                    }
                }
                currToken += str[i];
                continue;
            } else {
                if (isDigit(currToken[currToken.length - 1])) {
                    //tokens.push(currToken);
                    tokens.push("NUMBER");
                    currToken = '';
                }
            }

            currToken += str[i];

            if (currToken == '-') {
                tokens.push(currToken);
                currToken = '';
            } else if (currToken == ',') {
                tokens.push(currToken);
                currToken = '';
            } else {
                var t;
                var foundT;
                var foundLen = 0;

                for (t = 0 ; t < tokenlist.length; t++) {
                    var tokenToTest = tokenlist[t];
                    var dataToTest = str.substring(i, i + tokenToTest.length);
                    if (tokenToTest.length > foundLen && tokenToTest == dataToTest) {
                        foundT = tokenToTest;
                        foundLen = tokenToTest.length;
                    }
                }

                if (foundLen > 0) {
                    tokens.push(foundT);
                    i += (foundT.length - currToken.length);
                    currToken = '';
                }
            }
        }

        if (currToken.length > 0) {
            throw "Syntax error. Unknown token: " + currToken;
        }
        return tokens;
    }

    function parseFunctionalGroup(tokens) {
        console.log('parseFunctionalGroup ' + tokens.length);
        var group = { positions: '', cCount: 0, ccountstr: '', type: '' };
        while (isDigit(tokens[0]) || tokens[0] == ',') {
            group.positions += tokens[0];
            tokens.shift();
        }
        if (tokens[0] != '-') {
            throw 'unexpected token';
        }

        // '-'
        tokens.shift();

        if (tokens[0] == 'di' || tokens[1] == 'tri') {
            tokens.shift();
        }
        var tokenIx = tokenIndex(tokens[0]);
        group.cCount = tokenIx + 1;
        group.ccountstr = tokens.shift();

        group.type = tokens.shift();
        console.log(group.ccountstr + group.type);
        return group;
    }

    function parseFunctionalGroups(tokens) {
        console.log('parseFunctionalGroups ' + tokens.length);
        var groups = [];

        while (true) {
            var group = parseFunctionalGroup(tokens);
            groups.push(group);
            if (tokens[0] == '-') {
                tokens.shift();
            } else {
                break;
            }
        }
        return groups;
    }

    function parseOrganicName(tokens) {
        console.log('parseOrganicName');
        orgName = {
            //        sideChains: [],
            secondaryFunctionalGroups: [],
            prefix: '',
            suffix: '',
            primaryFunctionalGroups: [],
        };

        var token = tokens[0];
        if (isDigit(token)) {
            orgName.secondaryFunctionalGroups = parseFunctionalGroups(tokens);
        }

        orgName.prefix = tokens.shift();
        if (tokens[0] == 'an') {
            orgName.suffix += tokens.shift();
        }
        orgName.suffix += tokens.shift();

        if (tokens.length > 0) {
            orgName.primaryFunctionalGroups = parseFunctionalGroups(tokens);
        }
        //    orgName.name = tokens.shift() + tokens.shift();
        return orgName;
        /*    token = tokens[0];
            if (token != '-') {
                throw "Unexpected token: " + token;
            }*/
    }

    function Bond(el1, el2, level) {
        this.atoms = [el1, el2];
        this.level = level;
        var self = this;

        this.getOtherAtom = function (atom) {
            if (atom == self.atoms[0])
                return self.atoms[1];
            else
                return self.atoms[0];
        }
    }

    function Atom(element) {
        var self = this;
        this.element = element;
        this.bonds = [];

        this.addBond = function (atom, level) {
            var bond = new Bond(self, atom, level)
            self.bonds.push(bond);
            atom.bonds.push(bond);
        }
    }

    function organicNameToMolecyle(organicName) {
        var i;
        var c;
        for (i = 0; i < tokenlist.length; i++) {
            if (organicName.prefix == tokenlist[i]) {
                c = i + 1;
            }
        }

        primaryChain = [];
        var prevAtom;
        for (i = 0; i < c; i++) {
            var atom = new Atom('C');
            primaryChain.push(atom);
            if (prevAtom) {
                atom.addBond(prevAtom, 1);
            }
            prevAtom = atom;
        }

        return primaryChain[0];
    }

    function renderAtom(atom, paper, x, y) {
        console.log('renderAtom ' + x + ' ' + y + ' ' + atom.bonds.length);
        atom.visited = true;
        // Creates circle at x = 50, y = 40, with radius 10
        var circle = paper.circle(x, y, 10);
        // Sets the fill attribute of the circle to red (#f00)
        //circle.attr("fill", "#f00");

        var b;
        for (b = 0; b < atom.bonds.length; b++) {
            var nextAtom = atom.bonds[b].getOtherAtom(atom);
            if (!nextAtom.visited) {
                paper.path("M " + (x + 10) + " " + y + " l 20 0");
                renderAtom(nextAtom, paper, x + 40, y);
            }
        }

        // Sets the stroke attribute of the circle to white
        //            circle.attr("stroke", "#000");

    }
})(typeof exports === 'undefined' ? this['scanner'] = {} : exports);
