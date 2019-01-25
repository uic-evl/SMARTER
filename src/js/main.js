"use strict"

var App = App || {};

less.pageLoadFinished.then(function() {
    App.init();
  });

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

    // hard code the order of attributes for drawing the mosaic viewBox
    App.mosaicAttributeOrder = ["Ethnicity", "Site", "Tcategory", "Gender",
        "Nodal_Disease", "ecog", "Chemotherapy", "Local_Therapy"
    ];

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
        App.models.mosaicPatient = new MosaicPatientModel();

        // create controllers
        App.controllers.settings = new SettingsController();
        App.controllers.settings.attachCookiesCheckbox("#cookieCheckbox");

        App.controllers.dataUpdate = new DataUpdateController();
        App.controllers.patientSelector = new PatientSelectorController();
        App.controllers.attributeSelector = new AttributeSelectorController();
        App.controllers.nomogramKnn = new NomogramKnnController("#knnCheckBox");
        App.controllers.filters = new FilterController();

        App.controllers.landingFormController = new LandingFormController();

        App.controllers.exploreForm = new ExploreFormController("#exploreForm");
        App.controllers.exploreForm.setFilterResetButton("#exploreFormReset")
        App.controllers.exploreForm.setFormApplyButton("#exploreFormApply");
        App.controllers.exploreForm.setFormCancelButton("#exploreFormCancel");

        App.controllers.addPatientForm = new AddPatientController("#addPatientForm");
        App.controllers.addPatientForm.setFormAddButton("#addPatientFormAdd");
        App.controllers.addPatientForm.setFormCancelButton("#addPatientFormCancel");

        App.controllers.knnAttrSelector = new KNNAttributeSelectionController("#knnAttributesControl");

        App.controllers.nomogramAxis = new NomogramAxisController();
        App.controllers.nomogramAxis.attachToList("#nomogramVisibilityControl");
        App.controllers.nomogramAxis.attachToSelect("#nomogramAxisSelect");
        App.controllers.nomogramAxis.attachToDomainRangeToggle("#nomogramAxisButton");

        App.controllers.mosaicFilter = new MosaicFilterController();

        // create views
        App.views.kiviatDiagram = new KiviatDiagramView("#kiviatDiagram");
        App.views.nomogram = new NomogramView("#nomogram");
        App.views.nomogram.setMode("knn");
        App.views.kaplanMeier = new KaplanMeierView("#kaplanMeier");
        App.views.mosaic = new MosaicView("#mosaic");
        App.views.helpInfo = new HelpInfoView("#HelpInfo");

        App.views.demographForm = new DemographicsFormView();
        App.views.treatmentForm = new TreatmentFormView();
        App.views.cancerDescriptorsForm = new CancerDescriptorsFormView();

        // load patients
        App.models.patients.loadPatients()
            .then(function( /*data*/ ) {
                console.log("Promise Finished" /*, data*/ );

                // console.log(App.controllers.demographicsFormController);

                App.controllers.patientSelector.attachToSelect(".patient-dropdown");
                App.controllers.landingFormController.setPatientDropdown(".idSelect");
                App.controllers.landingFormController.setSubmitButton(".submitButton");
                App.controllers.attributeSelector.attachToSelect(".attribute-dropdown");

                App.controllers.dataUpdate.updateApplication();

                App.models.applicationState.loadStateFromCookie(); // dont currently load the cookie
            })
            .catch(function(err) {
                console.log("Promise Error", err);
            });
    };

})();
