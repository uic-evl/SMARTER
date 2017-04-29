"use strict"

var App = App || {};

let KiviatDiagramView = function() {

    let self = {
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
        .attr("preserveAspectRatio", "xMidYMid");

      self.neighborsSvgs = self.neighborsElement.selectAll(".patientNeighborSVG");

      self.legendSvg = self.legendElement.append("svg")
    }


    function update(patients) {
        console.log(patients.subject);
        console.log(patients.neighbors);

        createKiviatDiagram(patients.subject);

        let neighborBind = self.neighborsSvgs.data(patients.neighbors);

        neighborBind.exit().remove();

        d3.selectAll(".patientNeighborSVG")
          .each(updateKiviatPatient);

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

    function createKiviatDiagram(d, i) {
      let SVG = null;

      if (this) {
        SVG = d3.select(this);
      } else {
        self.subjectSvg.selectAll("*").remove();
        SVG = self.subjectSvg;
      }

      // draw axes
      let axesNum = App.models.applicationState.getPatientKnnAttributes().length;
      let angle = Math.PI * 2 / axesNum;

      for (let j = 0; j < axesNum; j++) {
        let group = SVG.append("g")
          .attr("transform", "translate(50, 50) rotate(" + (angle * j * 180 / Math.PI) + ")");

        let axis = group.append("line")
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", 0)
          .attr("y2", -40)
          .style("stroke", "darkgray")
          .style("stroke-width", "1px");
      }

      SVG.append("text")
        .text(d.ID)
        .attr("y", 40);
    }

    function updateKiviatPatient(d, i) {
      let SVG = d3.select(this);

      SVG.select("text")
        .text(d.ID);

        // console.log(d);
    }

    function drawLegend() {

    }


    return {
        init,
        update
    };
}
