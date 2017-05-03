"use strict"

var App = App || {};

let PatientSelectorController = function() {

    let self = {
        patientDropDown: null,
        currentPatient: null
    };

    /* display the patient drop down list */
    function populatePateintDropDown() {
        let patients = App.models.patients.filterPatients();

        let patientList = self.patientDropDown
            .selectAll("option")
            .data(Object.keys(patients));

        // exit old elements not present in new pateint list
        patientList.exit().remove();

        // update old elements present in new patient list
        self.patientDropDown
            .selectAll("option")
            .attr("value", (d) => d)
            .text((d) => d);

        // enter new elements in new pateint list
        patientList.enter()
            .append("option")
            .attr("value", (d) => d)
            .text((d) => d);

        /* if the selected patient exists in the new patient list, stays with the ID,
           if not, rest to the first patient in the list */
        let stateSelectedPatient = App.models.applicationState.getSelectedPatientID();

        if (patients[stateSelectedPatient]) {
          self.patientDropDown.node().value = stateSelectedPatient;
            if (self.currentPatient !== stateSelectedPatient) {
              self.currentPatient = stateSelectedPatient;
              updateSelectedPatients(self.currentPatient);
            }
        } else {
            self.patientDropDown.node().selectedIndex = "0";
            self.currentPatient = "0";
            updateSelectedPatients(Object.keys(patients)[0]);
        }
    }

    /* attach the event listener to the patient drop down list */
    function attachToSelect(element) {
        self.patientDropDown = d3.select(element)
            .on("change", function(d) {
                let selectedID = d3.select(this).node().value;
                self.currentPatient = selectedID;
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
        App.views.kiviatDiagram.update(updatedPatients);
        App.views.nomogram.updateKnnData(updatedPatients);
    }


    /* return the pubilicly accessible functions */
    return {
        attachToSelect,
        updatePateintDropDown: populatePateintDropDown
    };
}
