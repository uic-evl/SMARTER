"use strict"

var App = App || {};

let DemographicsFormView = function () {
    init();

    function init() {
        self.ageElement = d3.select("#age-element");
        self.genderMaleElement = d3.select("#male-radio");
        self.genderFemaleElement = d3.select("#female-radio");
        self.raceElement = d3.select("#race-element");
        self.aspirationYesRadio = d3.select('#aspiration-y-radio');
        self.aspirationNoRadio = d3.select('#aspiration-n-radio');
        self.hpvp16Element = d3.select("#hpvp16-element");
        self.ecog0Element = d3.select("#ecog-0-radio");
        self.ecog1Element = d3.select("#ecog-1-radio");
        self.ecog2Element = d3.select("#ecog-2-radio");
        self.ecog3Element = d3.select("#ecog-3-radio");
        self.smokingStatusNeverElement = d3.select("#smoking-never-radio");
        self.smokingStatusFormerElement = d3.select("#smoking-former-radio");
        self.smokingStatusCurrentElement = d3.select("#smoking-current-radio");
        self.packsPerYearElement = d3.select("#packs-per-year-element");
    }

    function updateForm(data) {
        let {AgeAtTx: age, Ethnicity: eth, Gender: gender, ID: id, ecog} = data;
        setAgeElement(age);
        setRaceElement(eth);
        setGenderElement(gender);
        setEcogValue(ecog);
    }

    function getAgeElement() {

    }

    function setAgeElement(age) {
        if (age !== undefined) {
            self.ageElement
                .attr("value", age)
                .text(age);
        }
    }

    function getGenderElement() {

    }

    function setGenderElement(gender) {
        if (gender !== undefined) {
            if (gender === "male") {
                console.log("Male");
                self.genderMaleElement
                    .property("checked", true);
                self.genderFemaleElement
                    .property("checked", false);
            }
            else if (gender === "female") {
                console.log("Female");
                self.genderMaleElement
                    .property("checked", false);
                self.genderFemaleElement
                    .property("checked", true);
            }

        }
    }

    function getRaceElement() {

    }

    function setRaceElement(race) {
        if (race !== undefined) {
            self.raceElement
                .attr("value", race)
                .text(race);
        }
    }

    function getHpvp16Element() {

    }

    function setHpvp16Element(data) {

    }

    function getEcogValue() {

    }

    function setEcogValue(ecog) {
        if (ecog !== undefined) {
            if (ecog === "0") {
                self.ecog0Element
                    .property("checked", true);
                self.ecog1Element
                    .property("checked", false);
                self.ecog2Element
                    .property("checked", false);
                self.ecog3Element
                    .property("checked", false);
            }else if (ecog === "1") {
                self.ecog0Element
                    .property("checked", false);
                self.ecog1Element
                    .property("checked", true);
                self.ecog2Element
                    .property("checked", false);
                self.ecog3Element
                    .property("checked", false);
            }else if (ecog === "2") {
                self.ecog0Element
                    .property("checked", false);
                self.ecog1Element
                    .property("checked", false);
                self.ecog2Element
                    .property("checked", true);
                self.ecog3Element
                    .property("checked", false);
            }else if (ecog === "3") {
                self.ecog0Element
                    .property("checked", false);
                self.ecog1Element
                    .property("checked", false);
                self.ecog2Element
                    .property("checked", false);
                self.ecog3Element
                    .property("checked", true);
            }
        }
    }

    function getSmokingStatus() {

    }

    function setSmokingStatus(data) {

    }

    function getPacksPerYearElement() {

    }

    function setPacksPerYearElement(data) {

    }

    return {
        updateForm
    }
}