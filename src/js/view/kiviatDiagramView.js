"use strict"

var App = App || {};

let KiviatDiagramView = function() {

    drawLegend();

    function drawLegend() {

    }

    function update(patients) {
        console.log(patients.subject);
        console.log(patients.neighbors);
    }

    function drawKiviatDiagram(patient) {

    }


    return {
        update
    };
}
