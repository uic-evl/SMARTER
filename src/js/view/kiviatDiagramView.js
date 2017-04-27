"use strict"

var App = App || {};

let KiviatDiagramView = function() {

    function update(patients) {
        console.log(patients.subject);
        console.log(patients.neighbors);
    }

    function drawLegend() {

    }

    drawLegend();

    return {
        update
    };
}
