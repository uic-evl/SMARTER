"use strict"

var App = App || {};

let kaplanCheckbox = function() {


    function controlCheckbox(){
        // console.log("control checkbox iniated")
        // either show probability using KM Estimator
        // if unchecked show the probabilities that we have
        // i.e. feeding tube , progression etc
        $('#kmcheckbox').change(function(){
            // console.log($('#kmcheckbox').is(":checked"))
            //update the kaplan meier
            App.models.kaplanMeierPatient.updateData()
            let KMData = App.models.kaplanMeierPatient.getKaplanMeierPatients();      
            // console.log(KMData)
            App.views.kaplanMeier.update(KMData);
        })
    }



    return {
        controlCheckbox
    };
}