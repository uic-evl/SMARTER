"use strict"

var App = App || {};

let NomogramModel = function() {

    let axes = {
        aspiration: null,
        default: null,
        overall: null,
        progression: null
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

                resolve();
            }
        })
    }

    let getAspirationAxes = () => axes.aspiration;
    let getDefaultAxes = () => axes.default;
    let getOverallAxes = () => axes.overall;
    let getProgressionAxes = () => axes.progression;

    let getAxesNames = () => _axes_names;

    return {
        loadAxes,
        getAspirationAxes,
        getDefaultAxes,
        getOverallAxes,
        getProgressionAxes,
        getAxesNames
    }
}