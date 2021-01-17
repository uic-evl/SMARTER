"use strict"

var App = App || {};

let PatientSelectorController = function() {

    let self = {
        patientDropDown: null,
        currentPatient: null,
        patientWithGroup: {}
    };

    /* display the patient drop down list */
    function populatePateintDropDown() {
        let patients = App.models.patients.filterPatients();
        // console.log(patients)

        let patientList = self.patientDropDown
            .selectAll("option")
            .data(Object.keys(patients));

        // exit old elements not present in new pateint list
        patientList.exit().remove();

        // update old elements present in new patient list
        self.patientDropDown
            .selectAll("option")
            .attr("value", (d) => d)
            .text((d) => d);

        // enter new elements in new pateint list
        patientList.enter()
            .append("option")
            .attr("value", (d) => d)
            .text((d) => d);

        /* if the selected patient exists in the new patient list, stays with the ID,
           if not, rest to the first patient in the list */
        let stateSelectedPatient = App.models.applicationState.getSelectedPatientID();

        if (patients[stateSelectedPatient]) {
          self.patientDropDown.node().value = stateSelectedPatient;
            if (self.currentPatient !== stateSelectedPatient) {
              self.currentPatient = stateSelectedPatient;
              updateSelectedPatients(self.currentPatient);
            }
        } else {
            self.patientDropDown.node().selectedIndex = "0";
            self.currentPatient = "0";
            updateSelectedPatients(Object.keys(patients)[0]);
        }
    }

    /* attach the event listener to the patient drop down list */
    function attachToSelect(element) {
        self.patientDropDown = d3.select(element)
            .on("change", function(d) {
                let selectedID = d3.select(this).node().value;
                self.currentPatient = selectedID;
                // console.log(self.currentPatient);
                // updatePateintDropDown()
                //update the landing form as well
                //change the dropdown value to the changed patient id
                $(".idSelect").val(self.currentPatient);
                // update the patient's information
                let index = App.models.patients.getPatientIDFromDummyID(self.currentPatient)
                $('#index-text').html('Patient Index: ' + index);
                let patient = App.models.patients.getPatientByID(index)
                App.controllers.landingFormController.updateLandingForms(patient)
                updateSelectedPatients(selectedID);
            })
    }

    function setPatient(subjectID) {
        self.patientDropDown
            .property("value", subjectID);
        self.currentPatient = subjectID;
        updateSelectedPatients(subjectID);
    }

    function getCurrentPatient() {
        return self.currentPatient;
    }

    /* get the selected patients and the knn info from the PatientModel, and update views */
    function updateSelectedPatients(subjectID) {
        // update the application state

        App.models.applicationState.setSelectedPatientID(subjectID);

        let updatedPatients = getUpdatedData(subjectID);

        self.patientWithGroup = updatedPatients;
        // console.log(self.patientWithGroup)

        updateViews(updatedPatients);
    }

    /* get the updated selected patient and knn */
    function getUpdatedData(subjectID) {
        // console.log("called me")
        let subjectIndex = App.models.patients.getPatientIDFromDummyID(subjectID);
        let updatedPatients = {};
        updatedPatients.subject = App.models.patients.getPatientByID(subjectIndex);
        updatedPatients.neighbors = App.models.patients.getKnn();
        App.controllers.nomoPredictionInfo.subjectPredictions(updatedPatients.subject);
        App.controllers.kiviatAttrSelector.init();
        App.controllers.knnAttrSelector.init();

        // console.log(updatedPatients)
        return updatedPatients;
    }

    /* update relative views */
    function updateViews(updatedPatients) {
        // console.log(updatedPatients.subject["Dummy ID"])
        App.views.kiviatDiagram.update(updatedPatients);
        App.views.nomogram.updateKnnData(updatedPatients);
        //update the kaplan meier
        // App.models.kaplanMeierPatient.updateData()
        let KMData = App.models.kaplanMeierPatient.getKaplanMeierPatients();      
        App.views.kaplanMeier.update(KMData);
        // console.log("i am called")
    }

    function getPatientWithGroup(){
        return self.patientWithGroup;
    }

    function setPatientWithGroup(patients){
        self.patientWithGroup = patients;
    }


    /* return the pubilicly accessible functions */
    return {
        attachToSelect,
        updatePateintDropDown: populatePateintDropDown,
        setPatient,
        getCurrentPatient, // used in kiviatDiagramView for setting dendrogram links.
        getPatientWithGroup,
        setPatientWithGroup,
        getUpdatedData
    };
}
