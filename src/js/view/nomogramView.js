"use strict"

var App = App || {};

let NomogramView = function(targetID) {

    let self = {
        targetID: null,
        targetElement: null,
        nomogram: null,
        axesLabel: {},
        axesRange: {},
        axesDomain: {},
        filteredAxes: null,
        data: {
            "knn": [],
            "filter": []
        },
        mode: null
    };

    init();

    function init() {
        self.targetID = targetID;
        self.targetElement = d3.select(targetID);

        Object.keys(App.nomogramAxesRange).forEach((el) => {
            self.axesLabel[el] = el;
        });
        // self.axesLabel["Probability of Survival"] = "5-year Survival Pbty";

        self.axesRange = App.nomogramAxesRange;

        self.filteredAxes = Object.keys(App.nomogramAxesRange);

        createNomogram();
    }

    function setMode(mode) {
        self.mode = mode;
        updateView();
    }

    function createNomogram( /*patients*/ ) {
        self.targetElement.selectAll("*").remove();

        self.nomogram = new Nomogram()
            .target(self.targetID)
            .setAxes(self.filteredAxes.map(el => {
                return {
                    name: el,
                    label: self.axesLabel[el],
                    domain: self.axesDomain[el],
                    rangeShrink: self.axesRange[el]
                };
            }), "reduce")
            .margins({
                top: 10,
                left: 40,
                bottom: 50,
                right: 60
            })
            .titlePosition("bottom")
            .titleRotation(-10)
            .titleFontSize(12)
            .tickFontSize(10)
            .color("black")
            .opacity(0.7)
            .filteredOpacity(0)
            .strokeWidth(2)
            .brushable(true)
            .onMouseOver("hide-other")
            .onMouseOut("reset-paths");
    }

    function updateView() {
        if (self.data[self.mode].length > 0) {
            // only draw if there already exists data
            self.nomogram
                .data(self.data[self.mode])
                .draw();
        }

    }

    function updateFilterData(newData) {
        self.data.filter = newData;

        if (self.mode === "filter") {
            updateView();
        }
    }

    function updateKnnData(newData) {
        self.data.knn = newData;

        if (self.mode === "knn") {
            updateView();
        }

    }

    /* update the nomogram with filtered axes */
    function updateAxes() {
        // update self.filteredAxes, then
        self.nomogram
            .setAxes(self.filteredAxes.map(el => {
                return {
                    name: el,
                    label: self.axesLabel[el],
                    domain: self.axesDomain[el].map(d => d),
                    rangeShrink: self.axesRange[el]
                };
            }), "reduce")
        // .draw();
    }

    /* get the updated attribute domians */
    function updateAttributeDomains(newDomains) {
        for (let attribute of Object.keys(App.nomogramAxesRange)) {
            self.axesDomain[attribute] = newDomains[attribute];
        }

        updateAxes();
    }


    return {
        setMode,
        // updateView,
        updateFilterData,
        updateKnnData,
        updateAttributeDomains
    };
}
