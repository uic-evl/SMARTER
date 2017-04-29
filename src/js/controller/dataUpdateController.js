"use strict"

var App = App || {};

let DataUpdateController = function() {

  /* priviate variables */
  let self = {
    data: {},
    dataSize: null,
    attributeDomains: {}
  };

  function getData() {
    return App.models.patients.getPatients();
  }

  function getDataSize() {
    return App.models.patients.getPatientNumber();
  }

  function getAttirbuteDomains() {
    return App.models.patients.getPatientAttirbuteDomains();
  }

  function updateApplication() {
    // get data
    let updatedData = getData();
    let updatedNumberOfPatients = getDataSize();
    let updatedAttributeDomains = getAttirbuteDomains();

    if (!_.isEqual(self.attributeDomains, updatedAttributeDomains)) {
      // update views with new domains
      App.views.kiviatDiagram.updateAttributeDomains(updatedAttributeDomains);
    }

    // update controllers
    App.controllers.patientSelector.updatePateintDropDown();

    // assign the new values to the priviate variables
    self.data = updatedData;
    self.dataSize = updatedNumberOfPatients;
    self.attributeDomains = updatedAttributeDomains;
  }

  return {
    updateApplication
  };
}
