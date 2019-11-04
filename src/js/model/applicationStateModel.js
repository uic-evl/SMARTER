"use strict"

var App = App || {};

let ApplicationStateModel = function() {

    /* Private variables */
    let self = {
        numberOfNeighbors: 5, // 5 as default
        selectedPatientID: null, // null as defualt
        knnExcludedAttributes: [], // empty as default
        attributeFilters: {}, // empty as default
        selectedAttribute: null
    };

    function setNumberOfNeighbors(number) {
        self.numberOfNeighbors = numbers;
    }

    function getNumberOfNeighbors() {
        return self.numberOfNeighbors;
    }

    function setSelectedPatientID(subjectID) {
        self.selectedPatientID = subjectID;
    }

    function getSelectedPatientID() {
        return self.selectedPatientID;
    }

    function setKnnExcludedAttributes(attributes) {
        self.knnExcludedAttributes = attributes;
    }

    function getKnnExcludedAttributes() {
        return self.knnExcludedAttributes;
    }

    function setAttributeFilters(filters) {
        self.attributeFilters = filters;
    }

    function getAttributeFilters() {
        return self.attributeFilters;
    }

    function setSelectedAttribute(attribute) {
        self.selectedAttribute = attribute;
    }

    function getSelectedAttribute() {
        return self.selectedAttribute;
    }

    /**************************************************************************
                    Saving/Loading State with Browser Cookies
    **************************************************************************/

    window.onunload = saveStateIntoCookie;

    function saveStateIntoCookie() {
        document.cookie = ("SMARTUI_state=" + JSON.stringify(self) + "; path=/");
        console.log("Saving state into cookie:", self);
    }

    function loadStateFromCookie() {
        // get state variable from Cookies
        let cookies = document.cookie.split("; ").map(c => c.split("="));

        let stateCookie = _.find(cookies, function(o) {
            return o[0] === "SMARTUI_state";
        });

        let useState = _.find(cookies, function(o) {
          return o[0] === "SMARTUI_useSavedState";
        });

        if (useState && useState[1] === 'true') {
          if (stateCookie) {
              let stateToLoad = JSON.parse(stateCookie[1]);

              // load attributes into the state
              for (let stateAttribute of Object.keys(self)) {
                  if (stateToLoad[stateAttribute]) {
                      self[stateAttribute] = stateToLoad[stateAttribute];
                  }
              }

              console.log("Loaded State", self);

              // update controllers/views from the current saved state
              App.controllers.dataUpdate.updateApplicationFromState(self);
          } else {
              console.log("No state cookie found!");
          }
        } else {
          // dont use state, update that checkbox accordingly
          App.controllers.settings.setCookiesCheckboxStatus(false);
        }


    }

    function setIsUsingCookies(willUse) {
      document.cookie = ("SMARTUI_useSavedState=" + willUse + "; path=/");
    }


    /* Return the publicly accessible functions */
    return {
        setNumberOfNeighbors,
        getNumberOfNeighbors,
        setSelectedPatientID,
        getSelectedPatientID,
        setKnnExcludedAttributes,
        getKnnExcludedAttributes,
        setAttributeFilters,
        getAttributeFilters,
        setSelectedAttribute,
        getSelectedAttribute,

        loadStateFromCookie,
        setIsUsingCookies
    };
}
