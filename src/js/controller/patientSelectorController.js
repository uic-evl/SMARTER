"use strict"

var App = App || {};

let PatientSelectorController = function() {

    let self = {
        patientDropDown: null
    };

    /* display the patient drop down list */
    function populatePateintDropDown() {
        let patients = App.models.patients.filterPatients();

        self.patientDropDown
            .selectAll("option")
            .data(Object.keys(patients))
            .enter()
            .append("option")
            .attr("value", (d) => {
                return d;
            })
            .text((d) => {
                return d;
            });
    }

    /* attach the event listener to the patient drop down list */
    function attachToSelect(element) {
        self.patientDropDown = d3.select(element)
            .on("change", function(d) {
                let selectedID = d3.select(this).node().value;
                console.log(selectedID);
                updateSelectedPatients(selectedID);
            })
    }

    /* get the selected patients and the knn info from the PatientModel, and update views */
    function updateSelectedPatients(subjectID) {
        // update the application state
        App.models.applicationState.setSelectedPatientID(subjectID);

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
        // console.log(updatedPatients);
        App.views.kiviatDiagramView.update(updatedPatients);
    }


    /* return the pubilicly accessible functions */
    return {
        attachToSelect,
        populatePateintDropDown,
        updateSelectedPatients
    };
}
