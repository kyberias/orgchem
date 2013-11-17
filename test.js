function Bond(el1, el2, level) {
    this.atoms = [ el1, el2 ];
    this.level = level;
    var self = this;

    this.getOtherAtom = function(atom) {
        if(atom == self.atoms[0])
            return self.atoms[1];
        else
            return self.atoms[0];
    }
}

function Atom(element) {
    var self = this;
    this.element = element;
    this.bonds = [];

    this.addBond = function(atom, level) {
        var bond = new Bond(self, atom, level)
        self.bonds.push(bond);
        atom.bonds.push(bond);
        return self;
    }

    this.bondElectrons = function() {
        var n=0;
        for(var i=0;i<self.bonds.length;i++)
        {
            n+=self.bonds[i].level;
        }
        return n;
    }
}

function organicNameToMolecyle(parsedMolecule) {
    var carbonNum = parsedMolecule.rootword;

    var sideChains = {};

    primaryChain = [];
    var prevAtom;

    var doubleBondLocations = [];

    if(parsedMolecule.primarysuffix && parsedMolecule.primarysuffix.type == 'eeni')
    {
        if(parsedMolecule.primarysuffix.numberlist) {
            doubleBondLocations = parsedMolecule.primarysuffix.numberlist;
        } else {
            doubleBondLocations.push(1);
        }
    }

    for (i = 0; i < carbonNum; i++) {
        var atom = new Atom('C');
        atom.primaryChain = true;

        primaryChain.push(atom);
        if (prevAtom) {
            atom.addBond(prevAtom, doubleBondLocations.indexOf(i) != -1 ? 2 : 1);
        }

        prevAtom = atom;
    }

    if (parsedMolecule.infix == "cyclo") {
        // Complete the cycle.
        prevAtom.addBond(primaryChain[0],1);
    }

    if(parsedMolecule.secondarysuffix) {
        if(parsedMolecule.secondarysuffix.name == 'oli') {
            primaryChain[primaryChain.length-1].addBond(new Atom('O').addBond(new Atom('H'), 1), 1);
        }
    }

    if (parsedMolecule.prefix) {
        var p;
        for (p = 0; p < parsedMolecule.prefix.length; p++) {
            var prefix = parsedMolecule.prefix[p];
            var generator;
            if (prefix.name == "metyyli") {
                generator = function () {
                    groupToAdd = new Atom('C');
                    groupToAdd.addBond(new Atom('H'), 1);
                    groupToAdd.addBond(new Atom('H'), 1);
                    groupToAdd.addBond(new Atom('H'), 1);
                    return groupToAdd;
                }
            } else if (prefix.name == "etyyli") {
                generator = function () {
                    groupToAdd = new Atom('C');
                    groupToAdd.addBond(new Atom('H'), 1);
                    groupToAdd.addBond(new Atom('H'), 1);
                    groupToAdd.addBond(new Atom('C').addBond(new Atom('H'), 1).addBond(new Atom('H'), 1).addBond(new Atom('H'), 1), 1);

                    return groupToAdd;
                }
            } else if (prefix.name == "butyyli") {
                generator = function () {
                    groupToAdd = new Atom('C');
                    groupToAdd.addBond(new Atom('H'), 1);
                    groupToAdd.addBond(new Atom('H'), 1);
                    groupToAdd.addBond(new Atom('C').addBond(new Atom('H'), 1).addBond(new Atom('H'), 1).
                                addBond(new Atom('C').addBond(new Atom('H'), 1).addBond(new Atom('H'), 1).addBond(new Atom('H'), 1), 1), 1);
                    return groupToAdd;
                }
            }
            if (generator) {
                var numList = prefix.numberList;
                if (!numList) {
                    numList = [1];
                }
                for (var n = 0; n < numList.length; n++) {
                    var index = numList[n] - 1;
                    primaryChain[index].addBond(generator());
                }
            }
        }
    }

    // Add missing hydrogens from the primary carbon chain
    for (i = 0 ; i < primaryChain.length; i++) {
        var atom = primaryChain[i];
        var missingH = 4 - atom.bondElectrons(); //atom.bonds.length;
        for (var h = 0; h < missingH; h++) {
            atom.addBond(new Atom('H'), 1);
        }
    }

    return primaryChain[0];
}

function countConnectedAtoms(atom, notThis) {
    var c = 0;
    var b;
    for (b = 0; b < atom.bonds.length; b++) {
        var otherAtom = atom.bonds[b].getOtherAtom(atom);
        if (otherAtom != notThis) {
            c += countConnectedAtoms(otherAtom, atom);
        }
    }
    return c + 1;
}

function renderAtom(atom, paper, x, y, xdir, ydir) {
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
            paper.path("M " + (x+10) + " " + y + " l 20 0");
            renderAtom(nextAtom, paper, x + 40, y);
        }
    }

    // Sets the stroke attribute of the circle to white
    //            circle.attr("stroke", "#000");

}

var slots = [];
var bonds = [];

function findSlot(x, y) {
    var i;
    for (i = 0; i < slots.length; i++) {
        if (slots[i].x == x && slots[i].y == y) {
            return slots[i];
        }
    }
    return null;
}

function compareForCarbon(atom) {
    return atom.element == 'C';
}

function calculateBranchSize(list, atom, comp) {
    list.push(atom);

    var n = comp(atom) ? 1 : 0;
    for (b = 0; b < atom.bonds.length; b++) {
        var nextAtom = atom.bonds[b].getOtherAtom(atom);
        if (list.indexOf(nextAtom) == -1) {
            n += calculateBranchSize(list, nextAtom, comp);
        }
    }
    return n;
}

function calculateHexCoordinates(atom, x, y, xdir, ydir) {
    atom.visited = true;

    var mySlot = { atom: atom, x: x, y: y };
    slots.push(mySlot);

    var b;

    atom.bonds.sort(function (a, b) {
        var aAtom = a.getOtherAtom(atom);
        var bAtom = b.getOtherAtom(atom);
        return
        calculateBranchSize([], bAtom, compareForCarbon) -
        calculateBranchSize([], aAtom, compareForCarbon);
    });

    for (b = 0; b < atom.bonds.length; b++) {
        
        var nextAtom = atom.bonds[b].getOtherAtom(atom);
        if (!nextAtom.visited) {
            paper.path("M " + (x + 10) + " " + y + " l 20 0");
            renderAtom(nextAtom, paper, x + 40, y);
        }
    }
}
