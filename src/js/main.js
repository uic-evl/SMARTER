"use strict"

var App = App || {};

(function() {
  App.models = {};
  App.controllers = {};
  App.views = {};

  App.numberOfPatients = null;

  App.models.patients = new PatientModel();
  App.models.applicationState = new ApplicationStateModel();

  App.controllers.patientSelector = new PatientSelectorController();

  App.views.kiviatDiagramView = new KiviatDiagramView();

  // let filters = {'Ethnicity': 'white', 'Site': 'supraglottic'};
  // let filters2 = {'Ethnicity': 'white', 'Site': 'supraglottic', 'Gender': 'female', 'Tcategory': 'T3'};

  App.models.patients.loadPatients()
    .then(function(/*data*/){
      console.log("Promise Finished"/*, data*/);

      App.numberOfPatients = App.models.patients.getPatientNumber();
      console.log(App.numberOfPatients);
      
      App.controllers.patientSelector.updateSelectedPatients(1);
    })
    .catch(function(err) {
      console.log("Promise Error", err);
    });

})();
