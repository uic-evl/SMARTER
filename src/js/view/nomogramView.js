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
        filterData: [],
        knnData: [],
        mode: "knn"
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
    }

    function update(patients) {
        self.targetElement.selectAll("*").remove();

        self.nomogram = new Nomogram()
            // .data(patients.neighbors)
            .data(patients)
            .target(self.targetID)
            .setAxes(self.filteredAxes.map(el => {
                // console.log(el, self.axesDomain[el]);
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
            .onMouseOut("reset-paths")
            .draw();

    }

    function setMode(mode) {
      self.mode = mode;
    }

    function updateView() {
        let newData = [];
        switch (self.mode) {
            case "filter":
                newData = self.filterData;
                break;
            case "knn":
                newData = self.knnData;
                break;
        }
        self.nomogram
            .data(newData)
            .draw();
    }

    function updateFilterData(newData) {
        self.filterData = newData;
        console.log(self.filterData);
        // self.nomogram
        //     .data(self.filterData)
        //     .draw();
    }

    function updateKnnData(newData) {
        self.knnData = newData;
        console.log(self.knnData);

        // self.nomogram
        //     .data(self.knnData.neighbors)
        //     .draw();
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
            .draw();
    }

    /* get the updated attribute domians */
    function updateAttributeDomains(newDomains) {
        for (let attribute of Object.keys(App.nomogramAxesRange)) {
            self.axesDomain[attribute] = newDomains[attribute];
        }
    }


    return {
        init,
        update,
        setMode,
        updateView,
        updateFilterData,
        updateKnnData,
        updateAttributeDomains
    };
}
