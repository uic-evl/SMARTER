"use strict"

var App = App || {};

let PatientSelectorController = function() {

  /* get the selected patients and the knn info from the PatientModel
     and update views */
  function updateSelectedPatients(subjectID) {
    let updatedPatients = getUpdatedData(subjectID);

    updateViews(updatedPatients);
  }

  function getUpdatedData(subjectID) {
    App.models.patients.setSelectedPatientID(subjectID);

    let fullPatientList = App.models.patients.getPatients();
    let neighbors = App.models.patients.getKnn();
    let updatedPatients = {};

    for (let i = 0; i < App.numberOfNeighbors; i++) {
      updatedPatients["neighbors" + i] = fullPatientList[neighbors[i].id];
      updatedPatients["neighbors" + i].score = neighbors[i].score;
    }
    updatedPatients["subject"] = fullPatientList[subjectID];

    return updatedPatients;
  }

  function updateViews(updatedPatients) {
    console.log(updatedPatients);
  }

  /* return the pubilicly accessible functions */
  return {
    updateSelectedPatients
  }
}
