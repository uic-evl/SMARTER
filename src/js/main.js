"use strict"

var App = App || {};

(function() {
    App.models = {};
    App.controllers = {};
    App.views = {};

    // hard code eight attributes for calculating knn and also eight axes in the kiviat diagram
    App.patientKnnAttributes = ["Gender", "Ethnicity", "Tcategory", "Site", "Nodal_Disease", "ecog", "Chemotherapy", "Local_Therapy"];
    // hard code default nomogram axes ranges
    App.nomogramAxesRange = {
        "AgeAtTx": [1, 0],
        "Gender": [0.1, 0],
        "Ethnicity": [0.4, 0],
        "Tcategory": [0.077, 0],
        "Site": [0.4, 0],
        "Nodal_Disease": [0.15, 0],
        "ecog": [0.2, 0],
        "Chemotherapy": [0.3, 0],
        "Local_Therapy": [0.15, 0],
        "Probability of Survival": [0, 1]
    };


    App.init = function() {
        // creat models
        App.models.patients = new PatientModel();
        App.models.applicationState = new ApplicationStateModel();

        // create controllers
        App.controllers.dataUpdate = new DataUpdateController();
        App.controllers.patientSelector = new PatientSelectorController();
        App.controllers.nomogramKnn = new NomogramKnnController("#knnCheckBox");

        App.controllers.exploreForm = new ExploreFormController("#exploreForm");
        App.controllers.exploreForm.setFormApplyButton("#exploreFormApply");
        App.controllers.exploreForm.setFormCancelButton("#exploreFormCancel");

        App.controllers.addPatientForm = new AddPatientController("#addPatientForm");
        App.controllers.addPatientForm.setFormAddButton("#addPatientFormAdd");
        App.controllers.addPatientForm.setFormCancelButton("#addPatientFormCancel");

        // creat views
        App.views.kiviatDiagram = new KiviatDiagramView("#kiviatDiagram");
        App.views.nomogram = new NomogramView("#nomogram");


        // load patients
        App.models.patients.loadPatients()
            .then(function( /*data*/ ) {
                console.log("Promise Finished" /*, data*/ );

                App.controllers.patientSelector.attachToSelect(".patient-dropdown");
                
                App.controllers.dataUpdate.updateApplication();

            })
            .catch(function(err) {
                console.log("Promise Error", err);
            });
    };

})();
