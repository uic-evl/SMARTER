"use strict";

let KNNAttributeSelectionController = function(listID) {
    let self = {
        list: null,
        checkboxStates: {}
    };

    init();

    function init() {
        let attributes = App.patientKnnAttributes;

        for (let attribute of attributes) {
            self.checkboxStates[attribute] = true;
        }

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
                    .attr("id", "knnAttrCheck" + d)
                    .on("click", checkboxOnChange);

                div.append("label")
                    .attr("for", "knnAttrCheck" + d)
                    .on("click", function() {
                        d3.event.stopPropagation(); // prevent menu close on label click
                    })
                    .text(d);
            });
    }

    function checkboxOnChange() {
        let checkbox = d3.select(this).node();

        self.checkboxStates[checkbox.value] = checkbox.checked;

        sendUpdatedKnnExcludedAttributes();
    }

    function sendUpdatedKnnExcludedAttributes() {
        let excludedAttributes = _.filter(Object.keys(self.checkboxStates), o => !self.checkboxStates[o]);

        App.models.applicationState.setKnnExcludedAttributes(excludedAttributes);

        let subjectID = App.models.applicationState.getSelectedPatientID();
        let updatedPatients = getUpdatedData(subjectID);

        updateViews(updatedPatients);
    }

    /* get the updated selected patient and knn */
    function getUpdatedData(subjectID) {
        let updatedPatients = {};
        updatedPatients.subject = App.models.patients.getPatientByID(subjectID);
        updatedPatients.neighbors = App.models.patients.getKnn();

        return updatedPatients;
    }

    /* update relative views */
    function updateViews(updatedPatients) {
        App.views.kiviatDiagram.update(updatedPatients);
        App.views.nomogram.updateKnnData(updatedPatients);
    }


    function updateSelectedCheckboxes() {
        let excludedAttributes = App.models.applicationState.getKnnExcludedAttributes();

        self.list.selectAll("input").attr("checked", true);

        for (let attr of excludedAttributes) {
            console.log("Unchecking", attr);
            self.list.select("#knnAttrCheck" + attr).attr("checked", null);
        }
    }

    return {
        updateSelectedCheckboxes
    };
};
