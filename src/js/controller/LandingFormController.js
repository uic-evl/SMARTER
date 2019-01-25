"use strict"

var App = App || {};

let LandingFormController = function() {

    let self = {
        patientDropDown: null,
        currentPatient: null,
        submitButton: null
    };

    function setPatientDropdown(element) {
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
                if (selectedID !== "N/A") {
                    self.currentPatient = selectedID;
                    console.log(selectedID);
                    updateLandingForms(patients[selectedID]);
                }
            })

    }

    function setSubmitButton(element) {
        self.submitButton = d3.select(element)
            .on("click", function() {
                let data = consolidateData();
                console.log(data);
                if (data.age === null)
                    return;
                else {
                    $(".landing-form").hide();
                    // $(".dashboard-help").css("display", "block");
                    // $(".dashboard").css("display", "block");
                    if(self.currentPatient !== null) {
                        App.controllers.patientSelector.updatePateintDropDown();
                        App.controllers.patientSelector.setPatient(self.currentPatient);

                    }else {
                        // Check if there is newly entered data.
                        // Figure out what all has to be done to.
                    }
                }
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
        setPatientDropdown,
        consolidateData,
        setSubmitButton
    }
}