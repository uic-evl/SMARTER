"use strict"

var App = App || {};

let ExploreFormController = function(formID) {

  /* priviate variables */
  let self = {
    explorePatientForm: null,
    attributeSelectDropdowns: {}
  };

  init();

  function init() {
    self.explorePatientForm = d3.select(formID);

    createFilterOptions();
  }

  function createFilterOptions() {
    let form = self.explorePatientForm;

    let attributes = App.patientKnnAttributes;

    // perform a data bind to create form groups based on the attributes
    form.selectAll(".form-group")
      .data(attributes)
    .enter().append("div")
      .attr("class", "form-group")
      .each(function(d, i) {
        let group = d3.select(this);

        // for each group append a label for the attribute name
        group.append("label")
          .attr("class", "control-label col-sm-4")
          .attr("for", "exploreAttr" + i)
          .text(d + ":");

        // append a div to wrap the select element
        let selectWrapper = group.append("div")
            .attr("class", "col-sm-6");

        // create the select element within the div
        self.attributeSelectDropdowns[d] =
          selectWrapper.append("select")
            .attr("class", "form-control")
            .attr("id", "exploreAttr" + i);

        // add a default option of "All" -- no filter on that attribute
        self.attributeSelectDropdowns[d]
        .append("option")
          .attr("class", "defaultOption")
          .attr("value", "All")
          .text("All");
      });
  }

  /****************************************************************************/

  /**
    * Attaches the event handler to the Apply button for when the filters will
    * be applied to the data
    */
  function setFormApplyButton(buttonID) {
    d3.select(buttonID)
      .on("click", applyClickHandler);
  }

  /**
    * Apply handler attached to the apply button
    * This constructs a new list of filters based on the values of the dropdowns
    * To be sent into the filterController
    */
  function applyClickHandler() {
    console.log("Apply Clicked");

    // get values for each attribute
    let filters = {};

    for (let attribute of Object.keys(self.attributeSelectDropdowns)) {
      let dropdownValue = self.attributeSelectDropdowns[attribute].node().value;

      // an attribute not existing in the filters is equivalent to All
      if (dropdownValue !== "All") {
        filters[attribute] = dropdownValue;
      }
    }

    console.log("New Filters from Form", filters);

    // set filters to be the selected items
    App.models.applicationState.setAttributeFilters(filters);
  }

  /****************************************************************************/

  /**
    * Attaches the event handler to the Cancel button for when the filters will
    * be applied to the data
    */
  function setFormCancelButton(buttonID) {
    d3.select(buttonID)
      .on("click", cancelClickHandler);
  }

  /**
    * Cancel handler attached to the cancel button
    * This resets the state of the select elements to be the same as the filters
    * currently within the applicationState
    */
  function cancelClickHandler() {
    console.log("Cancel Clicked");

    updateDropdownsWithCurrentFilters();

    console.log("Reset Form to current filters");
  }

  /**
    * Updates the possible values of the dropdowns if the domain of the
    * attributes has changed. This does not need a parameter as the controller
    * can access the filters from the applicationStateModel
    */
  function updateDropdownsWithNewDomains() {
    let attributeDomains = App.models.patients.getPatientAttirbuteDomains();

    // set the options of each attribute selector to be equal to that domain
    for (let attribute of Object.keys(attributeDomains)) {
      // data bind options within the dropdown

      let currentDomain = attributeDomains[attribute];

      // remove the old attributeOptions
      self.attributeSelectDropdowns[attribute].selectAll(".attributeOption").remove();

      // data bind the domain to new attributeOptions
      self.attributeSelectDropdowns[attribute].selectAll(".attributeOption")
        .data(currentDomain)
      .enter().append("option")
        .attr("class", "attributeOption")
        .attr("value", (d) => d)
        .text((d) => d);
    }
  }

  /**
    * Method to update the current values of the dropdowns if the filters have
    * been changed elsewhere. This does not need a parameter as the controller
    * can access the filters from the applicationStateModel
    */
  function updateDropdownsWithCurrentFilters() {
    // get the attribute filters from the state
    let filters = App.models.applicationState.getAttributeFilters();

    // set dropdowns to be the same as the filters in the applicationState
    for (let attribute of Object.keys(self.attributeSelectDropdowns)) {

      if (!filters[attribute]) {
        // an attribute not existing in the filters is equivalent to All
        self.attributeSelectDropdowns[attribute].node().value = "All";
      } else {
        self.attributeSelectDropdowns[attribute].node().value = filters[attribute];
      }
    }
  }

  return {
    createFilterOptions,
    setFormApplyButton,
    setFormCancelButton,
    updateDropdownsWithNewDomains,
    updateDropdownsWithCurrentFilters
  };
}
