"use strict"

var App = App || {};

let AddPatientController = function(formID) {

  /* priviate variables */
  let self = {
    addPatientForm: null,
    attributeSelectDropdowns: {},
    ageInput: null,
    addButton: null,
    cancelButton: null
  };

  // init on creation
  init();

  function init() {
    self.addPatientForm = d3.select(formID);

    createAddPatientOptions();
  }


  /**
    * Readies the form by adding the form-groups including the select elements
    * as well as the default option of All
    */
  function createAddPatientOptions() {
    let form = self.addPatientForm;

    let attributes = App.patientKnnAttributes;
    // console.log(attributes)

    // add the patient age input
    form.append("div")
      .attr("class", "form-group")
      .each(function(d, i) {
        let group = d3.select(this);

        // add a label for the age
        group.append("label")
          .attr("class", "control-label col-sm-4")
          .attr("for", "addPatAge")
          .text("Age:");

        // append a div to wrap the select element
        let inputWrapper = group.append("div")
            .attr("class", "col-sm-6");

        // create the select element within the div
        self.ageInput =
          inputWrapper.append("input")
            .attr("class", "form-control")
            .attr("id", "addPatAge")
            .attr("type", "number")
            .attr("step", "0.01")
            .attr("placeholder", "Enter the patient's age")
            .on("input", onFormChange);

      });

    // perform a data bind to create form groups based on the attributes
    form.selectAll(".attrSelectFormGroup")
      .data(attributes)
    .enter().append("div")
      .attr("class", "form-group attrSelectFormGroup")
      .each(function(d, i) {
        let group = d3.select(this);

        // for each group append a label for the attribute name
        group.append("label")
          .attr("class", "control-label col-sm-4")
          .attr("for", "addPatAttr" + i)
          .text(d + ":");

        // append a div to wrap the select element
        let selectWrapper = group.append("div")
            .attr("class", "col-sm-6");

        // create the select element within the div
        self.attributeSelectDropdowns[d] =
          selectWrapper.append("select")
            .attr("class", "form-control")
            .attr("id", "addPatAttr" + i)
            .on("change", onFormChange);

        self.attributeSelectDropdowns[d]
          .append("option")
          .attr("class", "attrPlaceholder")
          .attr("disabled", true)
          .attr("value", "noSelection")
          .text("Choose one of the following...");
      });
  }

  /****************************************************************************/

  /**
    * Attaches the event handler to the Add button for when the patient will be
    * created
    */
  function setFormAddButton(buttonID) {
    self.addButton = d3.select(buttonID)
      .on("click", addClickHandler);
  }

  /**
    * Add handler attached to the Add button
    * This constructs a new patient based on the values of the dropdowns
    *
    * To be sent into the patientModel (once the concept of saving patients exists)
    */
  function addClickHandler() {
    console.log("Add Clicked");

    // get values for each attribute
    let patient = {};

    for (let attribute of Object.keys(self.attributeSelectDropdowns)) {
      let dropdownValue = self.attributeSelectDropdowns[attribute].node().value;

      patient[attribute] = dropdownValue;
    }

    patient.AgeAtTx = +self.ageInput.node().value;

    resetForm();

    // simply constructs a patient
    // TODO: tie into a patient creation system/database
    console.log("New Patient from Form", patient);
  }

  /****************************************************************************/

  /**
    * Attaches the event handler to the Cancel button to cancel patient creation
    */
  function setFormCancelButton(buttonID) {
    self.cancelButton = d3.select(buttonID)
      .on("click", cancelClickHandler);
  }

  /**
    * Cancel handler attached to the cancel button to reset the dropdowns
    */
  function cancelClickHandler() {
    console.log("Cancel Clicked");

    resetForm();

    console.log("Reset Form");
  }

  /****************************************************************************/

  /**
    * Resets the value of all of the form elements to the default
    */
  function resetForm() {
    self.ageInput.node().value = "";

    for (let attribute of Object.keys(self.attributeSelectDropdowns)) {
      self.attributeSelectDropdowns[attribute].node().value = "noSelection";
    }
  }

  /**
    * If any of the form elements are changed, check to see if the patient is
    * ready to be added (all elements have a value), and if so, enable the
    * Add Patient button, otherwise keep it disabled
    */
  function onFormChange() {
    // update add patient button to be enabled if all fields are selected
    if (isPatientReady()) {
      self.addButton
        .attr("disabled", null)
        .classed("disabled", false);
    } else {
      self.addButton
        .attr("disabled", true)
        .classed("disabled", true);
    }
  }

  /**
    * Check the values of each input and return a true or false whether or not
    * all inputs have a selection
    */
  function isPatientReady() {
    if (self.ageInput.node().value === "") {
      return false;
    }

    for (let attribute of Object.keys(self.attributeSelectDropdowns)) {
      if (self.attributeSelectDropdowns[attribute].node().value === "noSelection") {
        return false;
      }
    }

    return true;
  }

  /**
    * Updates the possible values of the dropdowns if the domain of the
    * attributes has changed
    */
  function updateDropdownsWithNewDomains(attributeDomains) {
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

      self.addButton
        .attr("disabled", true)
        .classed("disabled", true);
    }
  }

  return {
    setFormAddButton,
    setFormCancelButton,
    updateDropdownsWithNewDomains
  };
}
