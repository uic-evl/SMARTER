"use strict";

let KNNAttributeSelectionController = function(listID) {
    let self = {
        list: null,
        checkboxStates: {},
        attributes : ["AgeAtTx", "Gender", "Race","Smoking Status","HPV/P16",
         "T-category", "N-category","Tumor Subsite","Therapeutic combination"],
        // patientWithGroups: {}
    };

    function init() {
        d3.selectAll("#kiviatKnnController").remove();
        // console.log(App.controllers.patientSelector.getCurrentPatient())
        let patientID = App.controllers.patientSelector.getCurrentPatient()
        // console.log(patientID)
        if(patientID == null || patientID == 0){
            patientID = 1
        }
        // console.log(patientID)
        let patientIndex = App.models.patients.getPatientIDFromDummyID(patientID);
        let subject = App.models.patients.getPatientByID(patientIndex);
        // console.log(subject)
        let axesData = App.models.axesModel.getAxesData()
        // console.log(axesData)

        let attributesList = self.attributes;
        // console.log(attributesList)
        let attributes = []

        for(let attr of attributesList){
            if(subject[axesData[attr].name] != "N/A"){
                attributes.push(attr)
            }
            // console.log(subject[axesData[attr].name])
        }

        // console.log(attributes)
        let excluded = App.models.applicationState.getKnnExcludedAttributes();

        for (let attribute of attributes) {
            if(!excluded.includes(attribute)){
                self.checkboxStates[attribute] = true;
            }
        }

        // console.log(self.checkboxStates)

        self.list = d3.select(listID);

        // console.log(self.list)
        self.list.append("li")
            .attr("id", "kiviatKnnController")
            .append("div")
            .text("Knn Checkboxes")
            .style("text-align", "center")
            .append("button")
            .attr("class", "close")
            .attr("type", "button")
            .attr("data-toggle", "collapse")
            .attr("data-target", "#knnAttributesControl")
            .append("span")
            .attr("aria-hidden", "true")
            .style("border", "none")
            .html("&times;");

        self.list.selectAll(".checkbox-li")
            .data(attributes)
            .enter().append("li")
            .attr("id", "kiviatKnnController")
            .attr("class", "checkbox-li")
            .each(function(d, i) {
                let div = d3.select(this).append("div").attr("class", "checkbox");

                div.append("input")
                    .attr("class", "separated-checkbox")
                    .attr("checked", function(d){
                        if(!excluded.includes(d)){
                            return true;
                        }
                    })
                    .attr("type", "checkbox")
                    .attr("value", d)
                    .attr("id", d)
                    // .attr("disabled", false)
                    .on("click", checkboxOnChange);

                div.append("label")
                    .attr("for", d)
                    .on("click", function() {
                        d3.event.stopPropagation(); // prevent menu close on label click
                    })
                    .text(d);
            });

            let buttonDiv = d3.select(listID).append("div").attr("class", "modal-footer").attr("id", "kiviatKnnController");
            buttonDiv.append("button")
                    .attr("class", "btn btn-default dropdown-toggle")
                    .attr("type", "button")
                    .attr("data-toggle", "collapse")
                    .attr("data-target", "#knnAttributesControl")
                    .text("Close");
    }

    function checkboxOnChange() {
        let checkbox = d3.select(this).node();

        self.checkboxStates[checkbox.value] = checkbox.checked;

        sendUpdatedKnnExcludedAttributes();
    }

    function sendUpdatedKnnExcludedAttributes() {
        let excludedAttributes = _.filter(Object.keys(self.checkboxStates), o => !self.checkboxStates[o]);

        App.models.applicationState.setKnnExcludedAttributes(excludedAttributes);

        let subjectID = App.models.applicationState.getSelectedPatientID();
        let updatedPatients = getUpdatedData(subjectID);

        // App.controllers.patientSelector.patientWithGroup = updatedPatients;

        App.controllers.patientSelector.setPatientWithGroup(updatedPatients)
        // console.log(App.controllers.patientSelector.patientWithGroup)

        updateViews(updatedPatients);
    }

    /* get the updated selected patient and knn */
    function getUpdatedData(subjectID) {
        let subjectIndex = App.models.patients.getPatientIDFromDummyID(subjectID);
        let updatedPatients = {};
        updatedPatients.subject = App.models.patients.getPatientByID(subjectIndex);
        updatedPatients.neighbors = App.models.patients.getKnn();

        return updatedPatients;
    }

    /* update relative views */
    function updateViews(updatedPatients) {
        // console.log("updated patients" + updatedPatients)
        App.views.kiviatDiagram.update(updatedPatients);
        App.views.nomogram.updateKnnData(updatedPatients);
    }


    function updateSelectedCheckboxes() {
        let excludedAttributes = App.models.applicationState.getKnnExcludedAttributes();

        self.list.selectAll("input").attr("checked", true);

        for (let attr of excludedAttributes) {
            console.log("Unchecking", attr);
            self.list.select("#knnAttrCheck" + attr).attr("checked", null);
        }
    }

    // function getPatientsForKiviat(){
    //     return self.patientWithGroups;
    // }

    return {
        init,
        updateSelectedCheckboxes,
        // getPatientsForKiviat
    };
};
