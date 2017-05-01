"use strict"

var App = App || {};

(function() {
  App.models = {};
  App.controllers = {};
  App.views = {};

  // hard code eight attributes for calculating knn and also eight axes in the kiviat diagram
  App.patientKnnAttributes = ["Gender", "Ethnicity", "Tcategory", "Site", "Nodal_Disease", "ecog", "Chemotherapy", "Local_Therapy"];

  App.init = function() {
    // creat models
    App.models.patients = new PatientModel();
    App.models.applicationState = new ApplicationStateModel();

    // create controllers
    App.controllers.dataUpdate = new DataUpdateController();
    App.controllers.patientSelector = new PatientSelectorController();
    
    App.controllers.exploreForm = new ExploreFormController("#exploreForm");
    App.controllers.exploreForm.setFormApplyButton("#exploreFormApply");
    App.controllers.exploreForm.setFormCancelButton("#exploreFormCancel");

    // creat views
    App.views.kiviatDiagram = new KiviatDiagramView();
    App.views.kiviatDiagram.init("kiviatDiagram");

    // load patients
    App.models.patients.loadPatients()
      .then(function(/*data*/){
        console.log("Promise Finished"/*, data*/);

        // test
        let filters = {'Ethnicity': 'white', 'Site': 'supraglottic'};
        let filters2 = {'Ethnicity': 'white', 'Site': 'supraglottic', 'Gender': 'male', 'Tcategory': 'T4'};
        App.models.applicationState.setAttributeFilters({});

        App.controllers.patientSelector.attachToSelect(".patient-dropdown");
        // App.controllers.patientSelector.updatePateintDropDown();

        App.controllers.dataUpdate.updateApplication();

      })
      .catch(function(err) {
        console.log("Promise Error", err);
      });
  };

})();
