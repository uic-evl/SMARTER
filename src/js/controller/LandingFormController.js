"use strict"

var App = App || {};

let LandingFormController = function() {

    let self = {
        patientDropDown: null,
        currentPatient: null
    };

    function attachToSelect(element) {
        let patients = App.models.patients.filterPatients();

        self.patientDropDown = d3.select(element)
            .selectAll("option")
            .data(Object.keys(patients)).enter()
            .append("option")
            .attr("value", (d) => d)
            .text((d) => d);

        d3.select(element)
            .on("change", function () {
                let selectedID = d3.select(this).node().value;
                self.currentPatient = selectedID;
                console.log(selectedID);
                updateLandingForms(patients[selectedID]);
            })

    }

    function updateLandingForms(data) {
        App.views.demographForm.updateForm(data);
        App.views.treatmentForm.updateForm(data);
        App.views.cancerDescriptorsForm.updateForm(data);
    }

    function consolidateData() {
        return {
            ...App.views.demographForm.consolidateData(),
            ...App.views.treatmentForm.consolidateData(),
            ...App.views.cancerDescriptorsForm.consolidateData()
        }
    }

    return {
        attachToSelect,
        consolidateData,

    }
}