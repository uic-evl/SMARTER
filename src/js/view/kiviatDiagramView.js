"use strict"

var App = App || {};

let KiviatDiagramView = function() {

    let self = {
        attributeScales: {},
        subjectElement: null,
        subjectSvg: null,
        neighborsElement: null,
        neighborsSvgs: null,
        legendElement: null,
        legendSvg: null
    }

    function init(targetID) {
        self.subjectElement = d3.select("#" + targetID + "-subject");
        self.neighborsElement = d3.select("#" + targetID + "-neighbors");
        self.legendElement = d3.select("#" + targetID + "-legend");

        self.subjectSvg = self.subjectElement.append("svg")
            .attr("width", self.subjectElement.node().clientWidth)
            .attr("height", self.subjectElement.node().clientHeight)
            .attr("viewBox", "0 0 100 100")
            .attr("preserveAspectRatio", "xMidYMid")
            .each(createKiviatDiagram);

        self.neighborsSvgs = self.neighborsElement.selectAll(".patientNeighborSVG");

        self.legendSvg = self.legendElement.append("svg");


        for (let attribute of App.patientKnnAttributes) {
          self.attributeScales[attribute] = d3.scaleOrdinal()
            .range([0, 40]);
        }
    }


    function update(patients) {
        console.log(patients.subject);
        console.log(patients.neighbors);

        // update the kiviat diagram of the subject
        self.subjectSvg
            .datum(patients.subject)
            .each(updateKiviatPatient);

        let neighborBind = self.neighborsSvgs.data(patients.neighbors);

        // exit old patients not present in new pateint list
        neighborBind.exit().remove();

        // update kiviat diagrams of old patients present in new patient list
        d3.selectAll(".patientNeighborSVG")
            .each(updateKiviatPatient);

        // enter new patients in new pateint list, and create kiviat diagrams along with axes
        neighborBind.enter().append("svg")
            .attr("width", self.neighborsElement.node().clientWidth)
            .attr("height", self.neighborsElement.node().clientHeight / patients.neighbors.length)
            .attr("viewBox", "0 0 100 100")
            .attr("preserveAspectRatio", "xMidYMid")
            .attr("class", "patientNeighborSVG")
            .each(createKiviatDiagram)
            .each(updateKiviatPatient);

        self.neighborsSvgs = d3.selectAll(".patientNeighborSVG");
    }

    /* create the axes of kiviat diagram */
    function createKiviatDiagram(d, i) {
        let SVG = d3.select(this);

        let translateGroup = SVG.append("g")
            .attr("transform", "translate(50, 50)")
            .attr("class", "translateGroup");

        let axesGroup = translateGroup.append("g")
            .attr("class", "axesGroup");

        // draw axes
        for (let j = 0; j < App.patientKnnAttributes.length; j++) {
            let axisEndpoint = rotatePointOntoAxis(40, j);
            let axis = axesGroup.append("line")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", axisEndpoint.x)
                .attr("y2", axisEndpoint.y)
                .style("stroke", "darkgray")
                .style("stroke-width", "1px");
        }

        SVG.append("text")
            // .text(d.ID)
            .attr("y", 40);
    }

    // function getPlotAttributes() {
    //     return App.models.applicationState.getPatientKnnAttributes();
    // }

    function rotatePointOntoAxis(pointX, axisIndex) {
        let angle = Math.PI * 2 * axisIndex / App.patientKnnAttributes.length;
        return rotatePoint(pointX, angle);
    }

    function rotatePoint(pointX, angle) {
        return {
            x: Math.cos(angle) * (pointX),
            y: Math.sin(angle) * (pointX)
        };
    }


    function updateKiviatPatient(d, i) {
        let SVG = d3.select(this);

        // let plotAttributes = getPlotAttributes();

        // calculate the path
        for (let j = 0; j < App.patientKnnAttributes.length; j++) {
          let xPoint = d[App.patientKnnAttributes[j]];
          let endpoint = rotatePointOntoAxis(xPoint, j);

        }

        SVG.select("text")
            .text(d.ID);
    }

    function drawLegend() {

    }

    function updateAttributeDomains(newDomains) {
      // { name: domain, ... }
      console.log(newDomains);
    }


    return {
        init,
        update,
        updateAttributeDomains
    };
}
