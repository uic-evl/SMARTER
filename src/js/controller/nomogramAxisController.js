"use strict";

let NomogramAxisController = function(listID) {
    let self = {
        list: null,
        selector: null,
        toggleButtons: null,

        checkboxStates: {},
        editMode: "domain",
        selectedAxis: null,

        sliderSvg: null,
        sliderBrush: null,
        brushFunc: null,
        rangeScale: null
    };

    init();

    function init() {
        let attributes = App.patientKnnAttributes;

        for (let attribute of attributes) {
            self.checkboxStates[attribute] = true;
        }
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

        axisHeightSlider();
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

        console.log(self.selectedAxis);
        updateBrush();
    }

    function toggleButtonOnClick() {
        self.editMode = d3.select(this).attr("value");

        self.toggleButtons
            .classed("active", function() {
                return d3.select(this).attr("value") === self.editMode;
            });

        console.log(self.editMode);
    }

    function updateNomogramAxisVisibility() {
        App.views.nomogram.updateAxisVisibility(self.checkboxStates);
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

        // console.log(self.selectedAxis);
        // console.log(App.nomogramAxesRange[self.selectedAxis]);
        updateBrush();
    }

    function updateBrush() {
        let range = [App.nomogramAxesRange[self.selectedAxis][0],
            App.nomogramAxesRange[self.selectedAxis][1]
        ];

        self.sliderBrush
            .call(self.brushFunc.move, [
                self.rangeScale(d3.max(range)), self.rangeScale(d3.min(range))
            ]);
    }

    function brushended() {
        if (!d3.event.sourceEvent) return;

        if (!d3.event.selection) {
            console.log("reset");
            updateBrush();
        }

        let newRange = d3.event.selection.map(self.rangeScale.invert);
    }

    return {
        attachToList,
        attachToSelect,
        attachToDomainRangeToggle
    };
};
