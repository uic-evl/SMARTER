"use strict"

var App = App || {};

let HelpInfoView = function(targetID) {

  let self = {
    targetElement: null,
    targetElementKiviat: null,
    targetElementNomogram: null,
    targetElementKaplanMeier: null,
    targetElementMosaic: null
  };

  init();

  function init() {
    self.targetElement = d3.select(targetID);
    self.targetElement.on("click", clickHelp);

    self.targetElementKiviat = d3.select(targetID + "-kiviat");
    self.targetElementKiviat.on("click", clickHelpKiviat);

    self.targetElementNomogram = d3.select(targetID + "-nomogram");
    self.targetElementNomogram.on("click", clickHelpNomogram);

    self.targetElementKaplanMeier = d3.select(targetID + "-kaplanMeier");
    self.targetElementKaplanMeier.on("click", clickHelpKaplanMeier);

    self.targetElementMosaic = d3.select(targetID + "-mosaic");
    self.targetElementMosaic.on("click", clickHelpMosaic);
  }

  function clickHelp() {
    console.log("help");
  }

  function clickHelpKiviat() {
    console.log("help-kiviat");
  }

  function clickHelpNomogram() {
    console.log("help-nomogram");
  }

  function clickHelpKaplanMeier() {
    console.log("help-kaplanMeier");
  }

  function clickHelpMosaic() {
    console.log("help-mosaic");
  }

  return {

  };

}
