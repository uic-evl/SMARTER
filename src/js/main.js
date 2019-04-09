"use strict"

var App = App || {};

less.pageLoadFinished.then(function() {
    App.init();
  });

(function() {
    App.models = {};
    App.controllers = {};
    App.views = {};

    // Initialize attribute variables
    App.patientKnnAttributes = [];
    App.kiviatAttributes = [];

    // hard code the order of attributes for drawing the mosaic viewBox
    App.mosaicAttributeOrder = ["Race", "T-category", "Gender",
        "N-category"
    ];

    // need to find better colors
    App.category10colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
        "#393b79", "#637939", "#7f7f7f", "#bcbd22", "#843c39"
    ];
    App.attributeColors = d3.scaleOrdinal(App.category10colors);

    App.createModels = function() {

        App.models.axesModel = new AxesModel();
        App.models.axesModel.loadAxes()
            .then(() => {
                console.log("Axes loaded");
            });
        App.models.patients = new PatientModel();
        App.models.applicationState = new ApplicationStateModel();
        App.models.kaplanMeierPatient = new KaplanMeierPatientModel();

    }

    App.createViews = function() {
        App.views.kiviatDiagram = new KiviatDiagramView("#kiviatDiagram");
        App.views.nomogram = new NomogramView("#nomogram");
        App.views.nomogram.setMode("knn");
        App.views.kaplanMeier = new KaplanMeierView("#kaplanMeier");
        // App.views.mosaic = new MosaicView("#mosaic");
        App.views.stats = new StatsView();
        App.views.helpInfo = new HelpInfoView("#HelpInfo");

        App.views.demographForm = new DemographicsFormView();
        App.views.treatmentForm = new TreatmentFormView();
        App.views.cancerDescriptorsForm = new CancerDescriptorsFormView();
    }

    App.createControllers = function() {
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
        App.controllers.nomogramAxis.attachToDomainRangeToggle(".nomogramAxisButton");

    };

    App.init = function() {


        // create controllers

        // create views
        App.createModels();

        // load patients
        App.models.patients.loadPatients()
            .then(function( /*data*/ ) {
                console.log("Promise Finished" /*, data*/ );

                // console.log(App.controllers.demographicsFormController);
                App.createViews();
                App.createControllers();

                App.controllers.patientSelector.attachToSelect(".patient-dropdown");
                App.controllers.landingFormController.setPatientDropdown(".idSelect");
                App.controllers.landingFormController.setSubmitButton(".submitButton");
                App.controllers.landingFormController.setShowFormButton("#add-patient-button");
                App.controllers.attributeSelector.attachToSelect(".attribute-dropdown");
                App.views.stats.updatePatientsCount();
                App.views.nomogram.setNomogramSelector("#nomogram-selector");

                App.controllers.dataUpdate.updateApplication();

                App.models.applicationState.loadStateFromCookie(); // dont currently load the cookie
            })
            .catch(function(err) {
                console.log("Promise Error", err);
            });
    };

})();
