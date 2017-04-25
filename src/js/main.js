var App = App || {};

(function() {
  App.models = {};
  App.controllers = {};
  App.views = {};

  App.models.patients = new PatientModel();

  let filters = {'Ethnicity': 'white', 'Site': 'supraglottic'};
  let filters2 = {'Gender': 'female', 'Tcategory': 'T3'};

  App.models.patients.loadPatients()
    .then(function(data){
      console.log("Promise Finished", data);

      // test
      let patientList = App.models.patients.getPatients();
      console.log(patientList);

      let filteredPatients = App.models.patients.filterPatients(patientList, filters);
      console.log(filteredPatients);

      let filteredPatients2 = App.models.patients.filterPatients(filteredPatients, filters2);
      console.log(filteredPatients2);

      let knnPatients = App.models.patients.calculateKNN(1, filters, 5);
      console.log(knnPatients);
    })
    .catch(function(err) {
      console.log("Promise Error", err);
    });

})();
