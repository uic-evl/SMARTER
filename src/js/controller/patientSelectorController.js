"use strict"

var App = App || {};

let PatientSelectorController = function() {

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
        console.log(updatedPatients);
    }


    /* return the pubilicly accessible functions */
    return {
        updateSelectedPatients
    };
}
