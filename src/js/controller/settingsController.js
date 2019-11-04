"use strict";

let SettingsController = function() {
  let self = {
    cookiesCheckbox: null
  };

  function attachCookiesCheckbox(checkboxID) {
    self.cookiesCheckbox = d3.select(checkboxID)
      .on("click", function() {
      App.models.applicationState.setIsUsingCookies(d3.select(this).node().checked);
    });
  }

  function setCookiesCheckboxStatus(isChecked) {
    self.cookiesCheckbox.node().checked = isChecked;
  }

  return {
    attachCookiesCheckbox,
    setCookiesCheckboxStatus
  };
}
