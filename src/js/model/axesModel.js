"use strict"

var App = App || {};

let AxesModel = function() {

    let self  = {
        currentAxesType: "overall"
    };

    let axes = {
        overall: null,
        progression: null,
        default: null,
        aspiration: null       
    };

    let _constants = {
        aspirationNomogramFile: "data/aspirationNomogramAxes.json",
        defaultNomogramFile: "data/defaultNomogramAxes.json",
        overallNomogramFile: "data/overallNomogramAxes.json",
        progressionNomogramFile: "data/progressionNomogramAxes.json"
    };

    let _axes_names = null;

    function loadAxes () {
        return new Promise( (resolve, reject) => {
            let dataLoadQueue = d3.queue();

            dataLoadQueue
                .defer(d3.json, _constants.aspirationNomogramFile)
                .defer(d3.json, _constants.defaultNomogramFile)
                .defer(d3.json, _constants.overallNomogramFile)
                .defer(d3.json, _constants.progressionNomogramFile)
                .await(loadFiles);

            function loadFiles(error, aspirationAxes, defaultAxes, overallAxes, progressionAxes) {
                if (error) {
                    reject(error);
                }

                axes.aspiration = aspirationAxes;
                axes.default = defaultAxes;
                axes.overall = overallAxes;
                axes.progression = progressionAxes;

                _axes_names = Object.keys(axes);

                const axesAttributes = Object.keys(defaultAxes);

                // App.patientKnnAttributes = [];
                // App.kiviatAttributes = [];
                // console.log(axesAttributes)
                axesAttributes.forEach((d) => {
                    // console.log(d)
                    if (defaultAxes[d].forKiviat)
                        App.kiviatAttributes.push(d);
                    if (defaultAxes[d].forKnn)
                        App.patientKnnAttributes.push(d);
                    if(defaultAxes[d].forNomogram)
                        App.nomogramAttributes.push(d);
                        // console.log(App.patientKnnAttributes, 'knn')
                });

                App.models.patients.setAxes(defaultAxes);

                resolve();
            }
        })
    }

    let getAspirationAxes = () => axes.aspiration;
    let getDefaultAxes = () => axes.default;
    let getOverallAxes = () => axes.overall;
    let getProgressionAxes = () => axes.progression;

    //  console.log(getAspirationAxes())

    let axesfunctions = {
        "overall": getOverallAxes,
        "progression": getProgressionAxes,
        "default": getDefaultAxes,
        "aspiration": getAspirationAxes        
    };

    let getAxesData = function() {
        return JSON.parse(JSON.stringify(axesfunctions[self.currentAxesType]()));
    };

    let setCurrentAxes = (type="default") => {
        self.currentAxesType = type;
    };

    let getCurrentAxesType = () => self.currentAxesType;

    let getAxesNames = () => _axes_names;

    return {
        loadAxes,
        getAxesData,
        getAxesNames,
        setCurrentAxes,
        getCurrentAxesType
    }
};