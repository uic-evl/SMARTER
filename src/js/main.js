"use strict"

var App = App || {};

(function() {
    App.models = {};
    App.controllers = {};
    App.views = {};

    // hard code eight attributes for calculating knn and also eight axes in the kiviat diagram
    App.patientKnnAttributes = ["Gender", "Ethnicity", "Tcategory", "Site",
        "Nodal_Disease", "ecog", "Chemotherapy", "Local_Therapy"
    ];
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

    // need to find better colors
    App.category10colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
        "#393b79", "#637939", "#7f7f7f", "#bcbd22", "#843c39"
    ];
    App.attributeColors = d3.scaleOrdinal(App.category10colors);


    App.init = function() {
        // creat models
        App.models.patients = new PatientModel();
        App.models.applicationState = new ApplicationStateModel();
        App.models.kaplanMeierPatient = new KaplanMeierPatientModel();

        // create controllers
        App.controllers.dataUpdate = new DataUpdateController();
        App.controllers.patientSelector = new PatientSelectorController();
        App.controllers.attributeSelector = new AttributeSelectorController();
        App.controllers.nomogramKnn = new NomogramKnnController("#knnCheckBox");
        App.controllers.filters = new FilterController();

        App.controllers.exploreForm = new ExploreFormController("#exploreForm");
        App.controllers.exploreForm.setFormApplyButton("#exploreFormApply");
        App.controllers.exploreForm.setFormCancelButton("#exploreFormCancel");

        App.controllers.addPatientForm = new AddPatientController("#addPatientForm");
        App.controllers.addPatientForm.setFormAddButton("#addPatientFormAdd");
        App.controllers.addPatientForm.setFormCancelButton("#addPatientFormCancel");

        // creat views
        App.views.kiviatDiagram = new KiviatDiagramView("#kiviatDiagram");
        App.views.nomogram = new NomogramView("#nomogram");
        App.views.nomogram.setMode("knn");
        App.views.kaplanMeier = new KaplanMeierView("#kaplanMeier");



        // load patients
        App.models.patients.loadPatients()
            .then(function( /*data*/ ) {
                console.log("Promise Finished" /*, data*/ );

                App.controllers.patientSelector.attachToSelect(".patient-dropdown");
                App.controllers.attributeSelector.attachToSelect(".attribute-dropdown");

                App.controllers.dataUpdate.updateApplication();


                App.models.applicationState.loadStateFromCookie(); // dont currently load the cookie
            })
            .catch(function(err) {
                console.log("Promise Error", err);
            });
    };

})();
