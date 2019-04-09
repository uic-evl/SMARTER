"use strict"

var App = App || {};

let NomogramView = function(targetID) {

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
        mode: null
    };

    init();

    function init() {
        self.targetID = targetID;
        self.targetElement = d3.select(targetID);

        self.legendSVG = d3.select(self.targetID + "Header").append("svg")
            .attr("width", self.targetElement.node().clientWidth)
            .attr("height", self.targetElement.node().clientHeight)
            .attr("viewBox", "0 0 200 100")
            .attr("preserveAspectRatio", "xMidYMid");
        
        const axes = App.models.axesModel.getAxesData();
        self.axes = axes;

        self.filteredAxes = Object.keys(axes);
        // console.log(self.filteredAxes);

        let menuDiv = d3.select(self.targetID+"Header")
            .select(".viewTitleDiv").append("div")
            .attr("class", "pull-left")
            .append("button")
            .attr("class", 'btn btn-secondary navbar-btn')
            .attr("id", "nomogram-menu-button")
            .on("click", function() {
                $('#nomogramControls').toggle();
            });

        d3.select("#nomogram-menu-button").append("span")
            .attr("class", 'glyphicon glyphicon-cog');

        createNomogram();
    }

    function setMode(mode) {
        self.mode = mode;
        updateView();
    }

    function updateNomogram(nomogramtype) {
        App.models.axesModel.setCurrentAxes(nomogramtype);
        self.axes = App.models.axesModel.getAxesData();
        console.log(self.axes);
        self.filteredAxes = Object.keys(self.axes);

        updateAxes();
        updateView();

    }

    /* initialize the nomoggram */
    function createNomogram() {
        // self.targetElement.selectAll("*").remove();
        let minSize = Math.min(self.targetElement.node().clientWidth, self.targetElement.node().clientHeight);
        let titlefontSize = 0.045 * minSize;
        let tickfontSize = titlefontSize * 0.9;
        self.strokewidth.filter = 0.006 * minSize;
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
            .titleRotation(-10)
            .titleFontSize(titlefontSize)
            .tickFontSize(tickfontSize)
            .color("black")
            .opacity(0.7)
            .filteredOpacity(0)
            .strokeWidth(self.strokewidth)
            .brushable(true)
            .onMouseOver("hide-other")
            .onMouseOut("reset-paths");
    }

    /* update the nomogram based on the mode: knn or filter */
    function updateView() {
        if (self.data[self.mode].length > 0) {
            // only draw if there already exists data
            self.nomogram
                .data(self.data[self.mode])
                .strokeWidth(function(d) {
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
        let colorFun = function(d) {
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
        d3.selectAll(".nomogramLegend").remove();

        let attrVals = App.models.patients.getPatientKnnAttributeDomains()[attr];
        console.log(attr, attrVals);

        for (let valInd in attrVals) {
            self.legendSVG.append("line")
                .attr("class", "nomogramLegend")
                .attr("x1", 150)
                .attr("y1", 9 + 5 * valInd)
                .attr("x2", 155)
                .attr("y2", 9 + 5 * valInd)
                .style("stroke", App.attributeColors(attrVals[valInd]))
                .style("stroke-width", "0.6px");

            self.legendSVG.append("text")
                .attr("class", "nomogramLegend")
                .attr("x", 160)
                .attr("y", 10 + 5 * valInd)
                .style("font-size", "4px")
                .text(attrVals[valInd]);
        }
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
        Object.keys(self.axes).forEach((el) => {
            if (axisStates[el]) {
                self.filteredAxes.push(el);
            }
        });
        self.filteredAxes.push(Object.keys(self.axes)[App.patientKnnAttributes.length + 1]);

        // then updateAxes
        updateAxes();
        updateView();
    }

    /* update axes range */
    function updateAxesRange(newRange) {
        console.log(newRange);
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

    function setNomogramSelector(element, default_selected="default") {
        let nomogramsTypes = App.models.axesModel.getAxesNames();

        let nomogramSelector = d3.select(element)
            .on("change", function() {
                updateNomogram(d3.select(this).property("value"));
            })
            .selectAll("option")
            .data(nomogramsTypes)
            .enter().append('option')
            .property("selected", (d) => d === default_selected)
            .attr("value", (d) => d)
            .attr("id", (d) => d + "-nomogram-selector")
            .text((d) => {
                if (d==="default") {
                    return "feeding tube"
                } else {
                    return d;
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
