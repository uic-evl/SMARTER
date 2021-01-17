"use strict"

var App = App || {};

let DemographicsFormView = function () {

    init();

    function init() {
        self.ageElement = d3.select("#age-element");
        self.genderMaleElement = d3.select("#male-radio");
        self.genderFemaleElement = d3.select("#female-radio");
        self.raceElement = d3.select("#race-element");
        // self.raceSelect = d3.select("#race-element")
        self.aspirationYesRadio = d3.select('#aspiration-y-radio');
        self.aspirationNoRadio = d3.select('#aspiration-n-radio');
        self.aspirationNARadio = d3.select('#aspiration-na-radio');
        // self.hpvp16Element = d3.select("#hpvp16-element");
        // self.ecog0Element = d3.select("#ecog-0-radio");
        // self.ecog1Element = d3.select("#ecog-1-radio");
        // self.ecog2Element = d3.select("#ecog-2-radio");
        // self.ecog3Element = d3.select("#ecog-3-radio");
        self.smokingStatusNeverElement = d3.select("#smoking-never-radio");
        self.smokingStatusFormerElement = d3.select("#smoking-former-radio");
        self.smokingStatusCurrentElement = d3.select("#smoking-current-radio");
        self.packsPerYearElement = d3.select("#packs-per-year-element");
    }

    function updateForm(data) {
        // Update attributes
        let age, eth, /*race_select,*/ gender, id, smoking_stat, hpv_stat, aspiration, packsperyear = "";
        // console.log(data)
        if(data === undefined){ //then the values will be the previous value
            // console.log(getGenderElement())
            age = $('#age-element').val();
            eth = $('#race-element').val();
            // race_select = $('#race').val();
            gender = $("input:radio[name=Gender]:checked").val();
            // id = data["ID"];
            smoking_stat = $("input:radio[name='Smoking status at Diagnosis (Never/Former/Current)']:checked").val();
            // hpv_stat = $('#hpvp16-element').val();
            aspiration = $("input:radio[name='Aspiration rate Pre-therapy']:checked").val();
            packsperyear = $('#packs-per-year-element').val();
            
        }else{
            age = data["AgeAtTx"];
            eth = data["Race"];
            // race_select = data["Race"]
            gender = data["Gender"];
            id = data["ID"];
            smoking_stat = data["Smoking status at Diagnosis (Never/Former/Current)"];
            // hpv_stat = data["HPV/P16 status"];
            aspiration = data["Aspiration rate(Y/N)"];
            packsperyear = data["Smoking status (Packs/Year)"];
        //     let {AgeAtTx: age, Race: eth, Gender: gender, ID: id, "Smoking status at Diagnosis (Never/Former/Current)":smoking_stat,
        // "HPV/P16 status":hpv_stat, "Aspiration rate(Y/N)":aspiration, "Smoking status (Packs/Year)":packsperyear} = data;
                        
        }
        setAgeElement(age);
        setRaceElement(eth);
        // setRaceSelect(race_select);
        setGenderElement(gender);
        // setEcogValue(ecog);
        setSmokingStatus(smoking_stat);
        // setHpvp16Element(hpv_stat);
        setAspirationElement(aspiration);
        setPacksPerYearElement(packsperyear);
        // console.log(data);
    }

    function consolidateData() {
        return {
            age: getAgeElement(),
            race: getRaceElement(),
            // race_t : getRaceSelect(),
            gender: getGenderElement(),
            // ecog: getEcogValue(),
            aspiration: getAspirationElement(),
            // hpvp16: getHpvp16Element(),
            smokingStatus: getSmokingStatus(),
            packsPerYear: getPacksPerYearElement()
        }
    }

    function getAgeElement() {
        // console.log(self.ageElement.attr('text'))
        return self.ageElement.attr("value");
    }

    function setAgeElement(age) {
        // console.log(Math.round(age))
        if (age !== undefined) {
            // self.ageElement
            //     .attr("value", Math.round(age))
            //     .text(Math.round(age));
            document.getElementById("age-element").value = Math.round(age);
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
        gender = gender.toLowerCase();
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
            // console.log(race)
            // $('form :input').val('');
            // document.getElementById("race-element").value = race;
            $('#race-element').val(race)
            // self.raceElement
            //     .attr("value", race)
            //     .text(race);
        }
    }

    /*
    function getRaceSelect() {
        return self.raceSelect.attr("value");
    }

    function setRaceSelect(race_select) {
        if (race !== undefined) {
            // console.log(race)
            // $('form :input').val('');
            $('#race').val(race_select);;
            // self.raceElement
            //     .attr("value", race)
            //     .text(race);
        }
    }
    */

    // function getHpvp16Element() {
    //     return self.hpvp16Element.attr("value");
    // }

    // function setHpvp16Element(data) {
    //     if (data !== undefined) {
    //         // self.hpvp16Element
    //         //     .attr("value", data)
    //         //     .text(data);
    //         document.getElementById("hpvp16-element").value = data;
    //     }
    // }

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
        data = data.toLowerCase();
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
            document.getElementById("packs-per-year-element").value = data;
        }
    }

    function setAspirationElement(data) {
        if (data !== undefined) {
            data = data.toLowerCase();
            if (data === "y" || data === "yes") {
                self.aspirationYesRadio
                    .property("checked", true);
                self.aspirationNoRadio
                    .property("checked", false);
                self.aspirationNARadio
                    .property("checked", false);
            } else if (data === "n" || data === "no") {
                self.aspirationYesRadio
                    .property("checked", false);
                self.aspirationNoRadio
                    .property("checked", true);
                self.aspirationNARadio
                    .property("checked", false);
            } else if(data === "n/a"){
                self.aspirationYesRadio
                    .property("checked", false);
                self.aspirationNoRadio
                    .property("checked", false);
                self.aspirationNARadio
                    .property("checked", true);
            }
        }
    }

    function getAspirationElement() {
        let yes = self.aspirationYesRadio.property("checked");
        let no = self.aspirationNoRadio.property("checked");
        let na = self.aspirationNARadio.property("checked");

        if (yes) {
            return "Yes";
        }

        if (no) {
            return "No";
        }

        if(na){
            return "N/A";
        }

        return undefined;
    }

    return {
        updateForm,
        consolidateData
    }
}