"use strict";

let NomogramAxisController = function(listID) {
    let self = {
        list: null,
        selector: null,
        toggleButtons: null,

        checkboxStates: {},
        editMode: "range",
        selectedAxis: null,

        sliderSvg: null,
        sliderBrush: null,
        brushFunc: null,

        rangeScale: null,
        attributeRange: {},

        domainScale: {},
        attributeDomain: {},

        axis: {
            "domain": {},
            "range": {}
        },

        resetElement: null
    };

    init();

    function init() {
        let attributes = App.patientKnnAttributes;

        for (let attribute of attributes) {
            self.checkboxStates[attribute] = true;
        }

        self.resetElement = d3.select("#nomogramResetButton");
        self.resetElement.on("click", resetAxes);
    }

    function attachToList(listID) {
        let attributes = App.patientKnnAttributes;

        self.list = d3.select(listID);

        self.list.selectAll(".checkbox-li")
            .data(attributes)
            .enter().append("li")
            .attr("class", "checkbox-li")
            .each(function(d, i) {
                let div = d3.select(this).append("div").attr("class", "checkbox");

                div.append("input")
                    .attr("class", "separated-checkbox")
                    .attr("checked", true)
                    .attr("type", "checkbox")
                    .attr("value", d)
                    .attr("id", "nomoVisCheck" + d)
                    .on("click", checkboxOnChange);

                div.append("label")
                    .attr("for", "nomoVisCheck" + d)
                    .on("click", function() {
                        d3.event.stopPropagation(); // prevent menu close on label click
                    })
                    .text(d);
            });
    }

    function attachToSelect(selectID) {
        // let attributes = App.patientKnnAttributes;
        // include age and surv prob axes
        let attributes = Object.keys(App.nomogramAxesRange);

        self.select = d3.select(selectID)
            .on("change", selectorOnChange);

        self.select.selectAll("option")
            .data(attributes)
            .enter().append("option")
            .attr("value", d => d)
            .text(d => d);

        this.selectedAxis = self.select.node().value;

        self.selectedAxis = this.selectedAxis;

        // axisHeightSlider();
    }

    function attachToDomainRangeToggle(domainID, rangeID) {
        self.toggleButtons = d3.selectAll("#nomogramAxisButton")
            .on("click", toggleButtonOnClick);
    }


    function checkboxOnChange() {
        let checkbox = d3.select(this).node();

        self.checkboxStates[checkbox.value] = checkbox.checked;

        updateNomogramAxisVisibility();
    }

    function selectorOnChange() {
        self.selectedAxis = d3.select(this).node().value;

        updateBrush();
    }

    function toggleButtonOnClick() {
        self.editMode = d3.select(this).attr("value");

        self.toggleButtons
            .classed("active", function() {
                return d3.select(this).attr("value") === self.editMode;
            });

        if (self.editMode === "domain") {
            self.select.selectAll("option")
                .attr("disabled", function(d) {
                    if (_.find(App.patientKnnAttributes, el => el === d)) {
                        return true;
                    }

                    return null;
                })
        } else if (self.editMode === "range") {
            self.select.selectAll("option")
                .attr("enabled", function(d) {
                  return true;
                });
        }
        updateBrush();
    }

    function updateNomogramAxisVisibility() {
        App.views.nomogram.updateAxisVisibility(self.checkboxStates);
    }


    function updateAxesWithNewDomains(newDomains) {
        self.attributeDomain = newDomains;
    }

    function axisHeightSlider() {
        let sliderElement = d3.select("#axisHeightSlider");
        let sliderWidth = sliderElement.node().clientWidth;
        let sliderHeight = sliderElement.node().clientHeight;

        self.sliderSvg = sliderElement.append("svg")
            .attr("width", sliderWidth)
            .attr("height", sliderHeight)
        // .style("background-color", "lightblue");

        let sliderBar = self.sliderSvg.append("rect")
            .attr("x", sliderWidth / 4)
            .attr("y", 0)
            .attr("width", sliderWidth / 2)
            .attr("height", sliderHeight)
            .style("fill", "#cccccc")
            .style("stroke", "none");

        self.brushFunc = d3.brushY()
            .extent([
                [0, 3],
                [sliderWidth, sliderHeight - 3]
            ])
            .on("end", brushended);

        self.sliderBrush = self.sliderSvg.append("g")
            .attr("class", "brush")
            .call(self.brushFunc);

        self.rangeScale = d3.scaleLinear()
            .domain([0, 1])
            .range([sliderHeight - 3, 3]);

        _.forEach(App.nomogramAxesRange, function(value, key) {
            self.attributeRange[key] = value;
        });

        // set the domain scale for each axis
        _.forEach(self.attributeDomain, function(value, key) {
            if (key == "AgeAtTx") {
                self.domainScale[key] = d3.scaleLinear()
                    .domain(self.attributeDomain[key])
                    .range([3, sliderHeight - 3]);
            } else if (key == "Probability of Survival") {
                self.domainScale[key] = d3.scaleLinear()
                    .domain([0, 1])
                    .range([sliderHeight - 3, 3]);
            } else {
                self.domainScale[key] = d3.scaleOrdinal()
                    .domain(self.attributeDomain[key])
                    .range([3, sliderHeight - 3]);
            }
        });

        console.log(self.attributeDomain);
        console.log(self.domainScale);

        updateBrush();
    }

    function updateBrush() {
        let domain = self.attributeDomain[self.selectedAxis];
        let range = self.attributeRange[self.selectedAxis];

        let domainScaleExtent = d3.extent(self.attributeDomain[self.selectedAxis], d => self.domainScale[self.selectedAxis](d));
        console.log(domainScaleExtent);

        if (self.editMode === "range") {
            self.sliderBrush
                .call(self.brushFunc.move, [
                    self.rangeScale(d3.max(range)), self.rangeScale(d3.min(range))
                ]);
        } else if (self.editMode === "domain") {
            self.sliderBrush
                .call(self.brushFunc.move, domainScaleExtent);
        }
    }

    function brushended() {
        if (!d3.event.sourceEvent) return;

        // singel click outside of the brush on the slider
        if (!d3.event.selection) {
            // reset to initial state
            if (self.editMode === "range") {
                self.attributeRange[self.selectedAxis] = App.nomogramAxesRange[self.selectedAxis];

                updateBrush();
            }

            return;
        }

        if (self.editMode === "range") {
            // update the axis range
            self.attributeRange[self.selectedAxis] = d3.event.selection.map(self.rangeScale.invert);

            // update the nomogram
            App.views.nomogram.updateAxesRange(self.attributeRange);
        } else if (self.editMode === "domain") {
            // update the axis domain
            // self.attributeDomain[self.selectedAxis] =
            console.log(d3.event.selection.map(self.domainScale[self.selectedAxis].invert));
        }

    }

    /* reset the axes settings to defaul */
    function resetAxes() {
        console.log("reset");
    }


    return {
        attachToList,
        attachToSelect,
        attachToDomainRangeToggle,
        axisHeightSlider,
        updateAxesWithNewDomains
    };
};
