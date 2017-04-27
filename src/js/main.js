"use strict"

var App = App || {};

(function() {
  App.models = {};
  App.controllers = {};
  App.views = {};

  App.numberOfNeighbors = 5;

  App.models.patients = new PatientModel();
  App.controllers.patientSelector = new PatientSelectorController();

  let filters = {'Ethnicity': 'white', 'Site': 'supraglottic'};
  let filters2 = {'Ethnicity': 'white', 'Site': 'supraglottic', 'Gender': 'female', 'Tcategory': 'T3'};

  App.models.patients.loadPatients()
    .then(function(/*data*/){
      console.log("Promise Finished"/*, data*/);

      // test
      // let patientList = App.models.patients.getPatients();
      // console.log(patientList);
      //
      // let filteredPatients = App.models.patients.filterPatients(filters);
      // console.log(filteredPatients);
      //
      // let filteredPatients2 = App.models.patients.filterPatients(filters2);
      // console.log(filteredPatients2);
      //
      // let knnPatients = App.models.patients.getKnnTo(1, knnFilters, 5);
      // console.log(knnPatients);

      App.controllers.patientSelector.updateSelectedPatients(11);
    })
    .catch(function(err) {
      console.log("Promise Error", err);
    });

})();
