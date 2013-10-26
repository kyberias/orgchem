var data;
var paper;
var graph;

function drawAtom(from, atom) {
    var b;

    var node = graph.newNode({ label: atom.element });

    for (b = 0; b < atom.bonds.length; b++) {
        var bond = atom.bonds[b];
        var otherAtom = atom.bonds[b].getOtherAtom(atom);
        if (otherAtom != from) {
            var n = drawAtom(atom, otherAtom);
            graph.newEdge(node, n, { directional: false });
        }
    }

    return node;
}

var gworld;
var verletConstraints;
var allBodies = [];
var constraints = [];

function clearAll() {
    var i;
    for (i = 0; i < allBodies.length; i++) {
        gworld.removeBody(allBodies[i]);
    }
    allBodies = [];
    for (i = 0; i < constraints.length; i++) {
        verletConstraints.remove(constraints[i]);
    }
    constraints = [];
}

function drawAtomPhysicsJs(from, atom) {
    var b;

//    var node = graph.newNode({ label: atom.element });

    var radius = atom.element == 'H' ? 4 : 8;
    var mass = atom.element == 'H' ? 3 : 1;

    var node = Physics.body('circle', {
        x: (Math.random()-0.5)* 200 + 1024/2, // x-coordinate
        y: (Math.random()-0.5)* 200 + 768/2, // y-coordinate
        vx: 0, // velocity in x-direction
        vy: 0, // velocity in y-direction
        radius: radius,
        mass: mass
    });
    gworld.add(node);
    allBodies.push(node);

    for (b = 0; b < atom.bonds.length; b++) {
        var bond = atom.bonds[b];
        var otherAtom = atom.bonds[b].getOtherAtom(atom);
        if (otherAtom != from) {
            var n = drawAtomPhysicsJs(atom, otherAtom);

            constraints.push(verletConstraints.distanceConstraint(node, n, 0.9, 30));
//            graph.newEdge(node, n, { directional: false });
        }
    }

    return node;
}

function parse(str) {
    graph.nodes = [];
    graph.edges = [];
    $("#errorMsg").text('');

    try {
        data = iupac.parse(str);
    } catch (ex) {
        $("#errorMsg").text(ex);
        return;
    }

    var atom = organicNameToMolecyle(data);

    clearAll();
    drawAtomPhysicsJs(null, atom);
    return atom;

    //paper.clear();
    //renderAtom(atom, paper, 20, 50);
}

var corners = [];
var center;

$(document).ready(function () {
    graph = new Springy.Graph();
    $("#parseButton").click(function () {
        parse($('#iupacName').val());
    });

    paper = Raphael(10, 50, 320, 200);

    iupac.lexer = {
        lex: function () { return tokens.shift(); },
        setInput: function (str) { tokens = scanner.Tokenize(str) }
    }

    //$('#springycanvas').springy({ graph: graph });

    Physics(function (world) {
        gworld = world;

        // code...
        var renderer = Physics.renderer('canvas', {
            el: 'springycanvas',
            width: 1024,
            height: 768,
            meta: false, // don't display meta data
            styles: {
                // set colors for the circle bodies
                'circle': {
                    strokeStyle: 'hsla(60, 37%, 17%, 1)',
                    lineWidth: 1,
                    fillStyle: 'hsla(60, 37%, 57%, 0.8)',
                    angleIndicator: 'hsla(60, 37%, 17%, 0.4)'
                }
            }
        });
        // add the renderer
        world.add(renderer);

        center = Physics.body('circle', {
            x: 1024/2, // x-coordinate
            y: 768/2, // y-coordinate
            vx: 0, // velocity in x-direction
            vy: 0, // velocity in y-direction
            radius: 10,
            mass: 10
        });
        //world.add(center);

/*        var corner;
        corner = Physics.body('circle', {
            x: 0, // x-coordinate
            y: 0, // y-coordinate
            vx: 0, // velocity in x-direction
            vy: 0, // velocity in y-direction
            radius: 10,
            mass: 100
        });
        corners.push(corner);
        world.add(corner);

        corner = Physics.body('circle', {
            x: 1024, // x-coordinate
            y: 0, // y-coordinate
            vx: 0, // velocity in x-direction
            vy: 0, // velocity in y-direction
            radius: 10,
            mass: 100
        });
        corners.push(corner);
        world.add(corner);
        corner = Physics.body('circle', {
            x: 1024, // x-coordinate
            y: 1024, // y-coordinate
            vx: 0, // velocity in x-direction
            vy: 0, // velocity in y-direction
            radius: 10,
            mass: 100
        });
        corners.push(corner);
        world.add(corner);
        corner = Physics.body('circle', {
            x: 0, // x-coordinate
            y: 1024, // y-coordinate
            vx: 0, // velocity in x-direction
            vy: 0, // velocity in y-direction
            radius: 10,
            mass: 100
        });
        corners.push(corner);
        world.add(corner);*/

        var edgeBounce = Physics.behavior('edge-collision-detection', {
            aabb: Physics.aabb(0, 0, 1024, 768),
            restitution: 0.99,
            cof: 0.99
        });

        world.subscribe('step', function () {
            // Note: equivalent to just calling world.render() after world.step()
            world.render();
        });

        verletConstraints = Physics.behavior('verlet-constraints', {
            iterations: 2
        });

        var rigidConstraints = Physics.behavior('rigid-constraint-manager', {
            targetLength: 100
        });

        world.add(verletConstraints);
        world.add(rigidConstraints);
        world.add(edgeBounce);

        // add some gravity
        var gravity = Physics.behavior('constant-acceleration', {
            acc: { x: 0, y: 0.004 } // this is the default
        });
        //gravity.setAcceleration({ x: 0, y: 0.0004 });
  //      world.add(gravity);
        world.add(Physics.behavior('newtonian', { strength: -5 }));
//        world.add(Physics.behavior('body-impulse-response'));

        // render the "branches"
        world.subscribe('beforeRender', function (data) {

            var renderer = data.renderer
                , constrs = verletConstraints.getConstraints().distanceConstraints
                , c
            ;

            for (var i = 0, l = constrs.length; i < l; ++i) {

                c = constrs[i];
                renderer.drawLine(c.bodyA.state.pos, c.bodyB.state.pos, {
                    strokeStyle: '#1133ff',
                    lineCap: 'round',
                    lineWidth: c.targetLength * c.targetLength * 0.0016
                });
            }
        });

        Physics.util.ticker.subscribe(function (time, dt) {
            center.state.pos = Physics.vector(1024 / 2, 768 / 2);
            /*corners[0].state.pos = Physics.vector(0, 0);
            corners[1].state.pos = Physics.vector(1024, 0);
            corners[2].state.pos = Physics.vector(1024, 1000);
            corners[3].state.pos = Physics.vector(0, 1000);*/
            world.step(time);
            // Note: FPS ~= 1/dt
        });
        // start the ticker
        Physics.util.ticker.start();

        parse($('#iupacName').val());
    });

    /*            var tokens = Tokenize('propanoli');
                console.log("Tokens:");
                var i;
                for (i = 0; i < tokens.length; i++) {
                    console.log(tokens[i]);
                }
    
                var on = parseOrganicName(tokens);
                console.log(on.prefix + ' ' + on.suffix);
                var atom = organicNameToMolecyle(on);
    
                renderAtom(atom, paper, 20, 50);*/
});
