"use strict"
// change the height in the d3.nomogram.js
var App = App || {};

let NomogramView = function (targetID) {

    let self = {
        targetID: null,
        targetElement: null,
        legendSVG: null,
        nomogram: null,
        axes: {},
        filteredAxes: [],
        strokewidth: {
            "knn": null,
            "filter": null
        },
        data: {
            "knn": [],
            "filter": []
        },
        selectedPatientID: -1,
        mode: null,
        legendSvgHeight : 40,
        polylineSvg: null
        // navigationBarHeight : document.getElementById("title").clientHeight,
        
    };

    init();

    function init() {
        self.targetID = targetID;
        self.targetElement = d3.select(targetID);

        // let navigationBarWidth = self.targetElement.node().clientWidth;        

        // console.log(document.getElementById("title").clientHeight)
        //  console.log(self.targetElement.node().clientWidth)
        //  console.log(self.targetElement.node().clientHeight)
        // console.log(nomogramWidth)

        self.polylineSvg = d3.select(self.targetID + "Header").append("svg")
            .attr("id", "polyLineSVG")
            .attr("width", self.targetElement.node().clientWidth)
            .attr("height", self.legendSvgHeight)
            .attr("preserveAspectRatio", "none");
        
        self.legendSVG = d3.select(self.targetID + "Header").append("svg")
            .attr("width", self.targetElement.node().clientWidth)
            .attr("height", self.legendSvgHeight)
            .style("position", "relative")
            .style("bottom", "25px")
            // .attr("width", self.navigationBarWidth)
            // .attr("height", self.navigationBarHeight)
            // .attr("viewBox", "0 0 140 100")
            // .attr("preserveAspectRatio", "none");

        const axes = App.models.axesModel.getAxesData();
        self.axes = axes;
        // console.log(self.axes)

        self.filteredAxes = Object.keys(axes);
        // console.log("first time filtered axes", self.filteredAxes);

        let menuDiv = d3.select(self.targetID + "Header")
            .select(".viewTitleDiv").append("div")
            .attr("class", "pull-right")
            .append("button")
            .attr("class", 'btn btn-default navbar-btn btn-sm')
            .attr("id", "nomogram-menu-button")
            .on("click", function () {
                $('.nomogramControlsBox').toggle();
                $('#unbelievable-fix').toggle();
            });

        d3.select("#nomogram-menu-button").append("span")
            .attr("class", 'glyphicon glyphicon-wrench')
            .attr("font-size", "10px");

        $(document).ready(function () {
            $('[data-toggle="tooltip"]').tooltip();
        });

        createNomogram();
    }

    function setMode(mode) {
        self.mode = mode;
        updateView();
    }

    function updateNomogram(nomogramtype) {
        App.models.axesModel.setCurrentAxes(nomogramtype);
        self.axes = App.models.axesModel.getAxesData();
        // console.log(self.axes);
        self.filteredAxes = Object.keys(self.axes);
        // console.log(self.filteredAxes)

        updateAxes();
        updateView();

    }

    /* initialize the nomoggram */
    function createNomogram() {
        // self.targetElement.selectAll("*").remove();
        // console.log(window.innerHeight)
        let minSize = Math.min(self.targetElement.node().clientWidth, self.targetElement.node().clientHeight);

        // let nomogramHeigth =  (window.innerHeight / 2) - (2 * self.navigationBarHeight);
        // let nomogramWidth = self.targetElement.node().clientWidth;
        
        // let minSize = Math.min(nomogramWidth, nomogramHeigth);
        let titlefontSize = 0.1 * minSize;
        let tickfontSize = titlefontSize * 0.9;
        self.strokewidth.filter = 0.008 * minSize;
        self.strokewidth.knn = 0.008 * minSize;

        self.nomogram = new Nomogram()
            .target(self.targetID)
            .setAxes(self.filteredAxes.map(el => self.axes[el]), "reduce", "shrinkAxis")
            .margins({
                top: 5,
                left: 40,
                bottom: 60,
                right: 60
            })
            .titlePosition("bottom")
            .titleRotation(-15)
            .titleFontSize(titlefontSize)
            .tickFontSize(tickfontSize)
            .color("black")
            .opacity(0.7)
            .filteredOpacity(0)
            .strokeWidth(self.strokewidth)
            .brushable(true)
            .onMouseOver("hide-other")
            .onMouseOut("reset-paths");

        // <span class="glyphicon glyphicon-question-sign" data-toggle="modal" data-target="#nomogramModal" id="HelpInfo-nomogram"></span>
        // <button type="button" id="attributeModal" class="btn btn-default btn-sm" data-toggle="modal" data-target="#featureModels">
        //                                   Prediction Attributes
        //  </button>
        d3.select("#nomogram")/*.append("div").style("padding-left", "95%")*/
            .append("span")
            .attr("class", "glyphicon glyphicon-question-sign")
            .attr("id", "attributeModal")
            .attr("data-toggle", "modal")
            .attr("data-target" , "#featureModels")
            .style("padding-left", "93%")
            .attr("title", "Prediction Attributes")
    }

    /* update the nomogram based on the mode: knn or filter */
    function updateView() {
        if (self.data[self.mode].length > 0) {
            // only draw if there already exists data
            self.nomogram
                .data(self.data[self.mode])
                .strokeWidth(function (d) {
                    // console.log(d);
                    if (d.ID === self.selectedPatientID) {
                        return self.strokewidth[self.mode] * 2;
                    } else {
                        return self.strokewidth[self.mode];
                    }
                })
                .draw();
        }
    }

    /* update the filer date and update the nomogram if the mode is filter */
    function updateFilterData(newData) {
        self.data.filter = newData;

        if (self.mode === "filter") {
            updateView();
        }
    }

    /* update the knn data and update the nomogram if the mode is knn */
    function updateKnnData(newData) {
        self.selectedPatientID = newData.subject.ID;

        self.data.knn = _.cloneDeep(newData.neighbors);
        self.data.knn.push(newData.subject);

        if (self.mode === "knn") {
            updateView();
        }
    }

    /* update the attribute for coloring the polylines */
    function updateAttributeColor(attr) {
        let colorFun = function (d) {
            if (d.ID === self.selectedPatientID) {
                return "black";
            } else {
                return App.attributeColors(d[attr]);
            }
        }

        self.nomogram
            .color(colorFun);

        updateView();
        updateLegend(attr);
    }

    /* update the legend based on the selected attribute for coloring */
    function updateLegend(attr) {
        // console.log("called")
        d3.selectAll(".nomogramLegend").remove();
        d3.selectAll("#polyLine").remove();

        let attrVals = App.models.patients.getPatientKnnAttributeDomains()[attr];
        let polyline = ["Current", "Most Similar"]
        // console.log(attr, attrVals);

        for (let valInd in attrVals) {
            self.legendSVG.append("rect")
                .attr("class", "nomogramLegend")
                .attr("x", 100 + 110 * valInd)
                .attr("y", self.legendSvgHeight / 2)
                .attr("width", 8)
                .attr("height", 8)
                .style("fill", App.attributeColors(attrVals[valInd]))
                .style("opacity", "0.5");

            self.legendSVG.append("text")
                .attr("class", "nomogramLegend")
                .attr("x", 110 + 110 * valInd)
                .attr("y", 8 + (self.legendSvgHeight / 2))
                .style("font-size", "0.8em")
                .text(attrVals[valInd]);
        }

        // current patient black
        self.polylineSvg.append("rect")
            .attr("id", "polyLine")
            .attr("x", 100)
            .attr("y", 5)
            .attr("width", 8)
            .attr("height", 8)
            .style("fill", "black")
            // .style("opacity", "0.5");

        //text for current 
        self.polylineSvg.append("text")
            .attr("class", "nomogramLegend")
            .attr("x", 115)
            .attr("y", 5 + 8)
            .style("font-size", "0.8em")
            .text("Current Patient");

        // similar patients
        for (let valInd in attrVals) {
            self.polylineSvg.append("rect")
                .attr("id", "polyLine")
                .attr("x", 100 + 10 * valInd)
                .attr("y", 15)
                .attr("width", 8)
                .attr("height", 8)
                .style("fill", App.attributeColors(attrVals[valInd]))
                .style("opacity", "0.5");
        }

        //text
        self.polylineSvg.append("text")
                .attr("class", "nomogramLegend")
                .attr("x", 100 + 11 * attrVals.length)
                .attr("y", 23)
                .style("font-size", "0.8em")
                .text("Most Similar Patients");
    }

    /* update the nomogram with filtered axes */
    function updateAxes() {
        // console.log(self.filteredAxes);
        self.nomogram
            .setAxes(self.filteredAxes.map(el => self.axes[el]), "reduce", "shrinkAxis");
    }

    /* get the updated attribute domians */
    function updateAttributeDomains(newDomains) {
        for (let attribute of Object.keys(self.axes)) {
            self.axes[attribute]["domain"] = newDomains[attribute];
        }

        updateAxes();
    }

    function updateAxisVisibility(axisStates) {
        // update self.filteredAxes
        self.filteredAxes = [];
        self.filteredAxes.push(Object.keys(self.axes)[0]);
        // console.log(self.filteredAxes)
        Object.keys(self.axes).forEach((el) => {
            if (axisStates[el]) {
                self.filteredAxes.push(el);
            }
        });
        // console.log(self.filteredAxes)
        self.filteredAxes.push(Object.keys(self.axes)[App.nomogramAttributes.length + 1]);
        // console.log(self.filteredAxes)
        // then updateAxes
        updateAxes();
        updateView();
    }

    /* update axes range */
    function updateAxesRange(newRange) {
        // console.log(newRange);
        _.forEach(newRange, (value, key) => {
            self.axes[key]["rangeShrink"] = value;
        });

        updateAxes();
        updateView();
    }

    /* update axes domain */
    function updateAxesDomain(newDomain) {
        _.forEach(newDomain, (value, key) => {
            self.axes[key]["domain"] = value;
        });

        updateAxes();
        updateView();
    }

    function setNomogramSelector(element, default_selected = "default") {
        let nomogramsTypes = App.models.axesModel.getAxesNames();

        let nomogramSelector = d3.select(element)
            .on("change", function () {
                updateNomogram(d3.select(this).property("value"));
                // let updatedPatients = {};
                //update the color of the kiviat diagrams 
                let patientID = $('.idSelect').val();
                let kiviatPatients = App.controllers.patientSelector.getUpdatedData(patientID);
                // console.log(kiviatPatients)
                //change the color
                //subject
                App.views.kiviatDiagram.updateColor(kiviatPatients)

            })
            .selectAll("option")
            .data(nomogramsTypes)
            .enter().append('option')
            // .property("selected", (d) => d === default_selected)
            .attr("value", (d) => d)
            .attr("id", (d) => d + "-nomogram-selector")
            .text((d) => {
                if (d === "default") {
                    return "feeding tube (FDT)"
                } else if(d === "aspiration") {
                    return "aspiration (ASP)";
                }else if(d === "overall") {
                    return "overall survival (OS) 5 years";
                }else if(d === "progression") {
                    return "progression (RMS) 5 years";
                }
            });

    }

    return {
        setMode,
        updateFilterData,
        updateKnnData,
        updateAttributeColor,
        updateAttributeDomains,
        updateAxisVisibility,
        updateAxesRange,
        updateAxesDomain,
        setNomogramSelector
    };
}
