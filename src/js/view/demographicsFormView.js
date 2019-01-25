"use strict"

var App = App || {};

let DemographicsFormView = function () {
    self = {};

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
        // Update attributes
        let {AgeAtTx: age, Ethnicity: eth, Gender: gender, ID: id, ecog} = data;
        setAgeElement(age);
        setRaceElement(eth);
        setGenderElement(gender);
        setEcogValue(ecog);


    }

    function consolidateData() {
        let demographicData = {
            age: getAgeElement(),
            race: getRaceElement(),
            gender: getGenderElement(),
            ecog: getEcogValue(),
            hpvp16: getHpvp16Element(),
            smokingStatus: getSmokingStatus(),
            packsPerYear: getPacksPerYearElement()
        }

        return demographicData;
    }

    function getAgeElement() {
        return self.ageElement.attr("value");
    }

    function setAgeElement(age) {
        if (age !== undefined) {
            self.ageElement
                .attr("value", age)
                .text(age);
        }
    }

    function getGenderElement() {
        let male = self.genderMaleElement.property("checked");
        let female = self.genderFemaleElement.property("checked");

        if (male)
            return "male";

        if (female)
            return "female";

        return null;

    }

    function setGenderElement(gender) {
        if (gender !== undefined) {
            if (gender === "male") {
                self.genderMaleElement
                    .property("checked", true);
                self.genderFemaleElement
                    .property("checked", false);
            }
            else if (gender === "female") {
                self.genderMaleElement
                    .property("checked", false);
                self.genderFemaleElement
                    .property("checked", true);
            }

        }
    }

    function getRaceElement() {
        return self.raceElement.attr("value");
    }

    function setRaceElement(race) {
        if (race !== undefined) {
            self.raceElement
                .attr("value", race)
                .text(race);
        }
    }

    function getHpvp16Element() {
        return self.hpvp16Element.attr("value");
    }

    function setHpvp16Element(data) {
        if (val !== undefined) {
            self.hpvp16Element
                .attr("value", data)
                .text(data);
        }
    }

    function getEcogValue() {
        let ecog0 = self.ecog0Element.property("checked");
        let ecog1 = self.ecog1Element.property("checked");
        let ecog2 = self.ecog2Element.property("checked");
        let ecog3 = self.ecog3Element.property("checked");

        if (ecog0)
            return "0";
        if (ecog1)
            return "1";
        if (ecog2)
            return "2";
        if (ecog3)
            return "3";

        return null;
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
        let never = self.smokingStatusNeverElement.property("checked");
        let former = self.smokingStatusFormerElement.property("checked");
        let current = self.smokingStatusCurrentElement.property("checked");

        if (never)
            return "never";
        if (former)
            return "former";
        if (current)
            return "current";

        return null;
    }

    function setSmokingStatus(data) {
        if (data !== undefined) {
            if (data === 'never') {
                self.smokingStatusNeverElement
                    .property("checked", true);
                self.smokingStatusFormerElement
                    .property("checked", false);
                self.smokingStatusCurrentElement
                    .property("checked", false);
            }else if (data === 'former') {
                self.smokingStatusNeverElement
                    .property("checked", false);
                self.smokingStatusFormerElement
                    .property("checked", true);
                self.smokingStatusCurrentElement
                    .property("checked", false);
            }else if (data === 'current') {
                self.smokingStatusNeverElement
                    .property("checked", false);
                self.smokingStatusFormerElement
                    .property("checked", false);
                self.smokingStatusCurrentElement
                    .property("checked", true);
            }
        }
    }

    function getPacksPerYearElement() {
        return self.packsPerYearElement.attr("value");
    }

    function setPacksPerYearElement(data) {
        if (data !== undefined) {
            self.packsPerYearElement
                .attr("value", data)
                .text(data);
        }
    }

    return {
        updateForm,
        consolidateData
    }
}