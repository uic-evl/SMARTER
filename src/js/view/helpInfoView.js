"use strict"

var App = App || {};

let HelpInfoView = function(targetID) {

  let self = {
    targetElement: null,
    targetElementKiviat: null,
    targetElementNomogram: null,
    targetElementKaplanMeier: null,
    targetElementMosaic: null,

    display: {
      "help": false,
      "help-kiviat": false,
      "help-nomogram": false,
      "help-kaplanMeier": false,
      "help-mosaic": false
    }
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

  function resetHelps(currentKey) {
    _.forEach(self.display, function(value, key) {
      if (key != currentKey) {
        self.display[key] = false;
      }
    });
  }

  function clickHelp() {
    console.log("help");
    self.display["help"] = !self.display["help"];
    resetHelps("help");

    // d3.select(".overlay").style("display", "inline-block");
    // d3.select("#infoDiv-kiviat").style("display", "inline-block");
    // d3.select("#infoDiv-nomogram").style("display", "inline-block");
    // d3.select("#infoDiv-nomogramControls").style("display", "inline-block");
    // d3.select("#infoDiv-kaplanMeier").style("display", "inline-block");
    // d3.select("#infoDiv-mosaic").style("display", "inline-block");

    d3.select("#infoDiv-kiviat").style("display", "none");
    d3.select("#infoDiv-nomogram").style("display", "none");
    d3.select("#infoDiv-nomogramControls").style("display", "none");
    d3.select("#infoDiv-kaplanMeier").style("display", "none");
    d3.select("#infoDiv-mosaic").style("display", "none");
    // d3.select(".container-fluid").style("background", rgba(0, 0, 0, 0.75));
    if (self.display["help"]) {
      // change ".container-fluid" background-color to rgba(0, 0, 0, 0.75)
      less.modifyVars({
        "@bgColor": "rgba(0, 0, 0, 0.75)"
      });

    } else {
      // reset ".container-fluid" background-color to white
      less.modifyVars({
        "@bgColor": "rgba(255, 255, 255, 1)"
      });

    }
  }

  function clickHelpKiviat() {
    console.log("help-kiviat");
    self.display["help-kiviat"] = !self.display["help-kiviat"];
    resetHelps("help-kiviat");

    // d3.select(".overlay").style("display", "inline-block");
    // d3.select("#infoDiv-kiviat").style("display", "inline-block");

    d3.select("#infoDiv-kiviat").style("display", "none");
    if (self.display["help-kiviat"]) {
      less.modifyVars({
        "@bgColor": "rgba(0, 0, 0, 0.75)"
      });
      d3.select("#infoDiv-nomogram").style("display", "inline-block");
      d3.select("#infoDiv-nomogramControls").style("display", "inline-block");
      d3.select("#infoDiv-kaplanMeier").style("display", "inline-block");
      d3.select("#infoDiv-mosaic").style("display", "inline-block");
    } else {
      less.modifyVars({
        "@bgColor": "rgba(255, 255, 255, 1)"
      });
      d3.select("#infoDiv-nomogram").style("display", "none");
      d3.select("#infoDiv-nomogramControls").style("display", "none");
      d3.select("#infoDiv-kaplanMeier").style("display", "none");
      d3.select("#infoDiv-mosaic").style("display", "none");
    }
  }

  function clickHelpNomogram() {
    console.log("help-nomogram");
    self.display["help-nomogram"] = !self.display["help-nomogram"];
    resetHelps("help-nomogram");

    // d3.select(".overlay").style("display", "inline-block");
    // d3.select("#infoDiv-nomogram").style("display", "inline-block");
    // d3.select("#infoDiv-nomogramControls").style("display", "inline-block");

    d3.select("#infoDiv-nomogram").style("display", "none");
    d3.select("#infoDiv-nomogramControls").style("display", "none");
    if (self.display["help-nomogram"]) {
      less.modifyVars({
        "@bgColor": "rgba(0, 0, 0, 0.75)"
      });
      d3.select("#infoDiv-kiviat").style("display", "inline-block");
      d3.select("#infoDiv-kaplanMeier").style("display", "inline-block");
      d3.select("#infoDiv-mosaic").style("display", "inline-block");
    } else {
      less.modifyVars({
        "@bgColor": "rgba(255, 255, 255, 1)"
      });
      d3.select("#infoDiv-kiviat").style("display", "none");
      d3.select("#infoDiv-kaplanMeier").style("display", "none");
      d3.select("#infoDiv-mosaic").style("display", "none");
    }
  }

  function clickHelpKaplanMeier() {
    console.log("help-kaplanMeier");
    self.display["help-kaplanMeier"] = !self.display["help-kaplanMeier"];
    resetHelps("help-kaplanMeier");

    // d3.select(".overlay").style("display", "inline-block");
    // d3.select("#infoDiv-kaplanMeier").style("display", "inline-block");

    d3.select("#infoDiv-kaplanMeier").style("display", "none");
    if (self.display["help-kaplanMeier"]) {
      less.modifyVars({
        "@bgColor": "rgba(0, 0, 0, 0.75)"
      });
      d3.select("#infoDiv-kiviat").style("display", "inline-block");
      d3.select("#infoDiv-nomogram").style("display", "inline-block");
      d3.select("#infoDiv-nomogramControls").style("display", "inline-block");
      d3.select("#infoDiv-mosaic").style("display", "inline-block");
    } else {
      less.modifyVars({
        "@bgColor": "rgba(255, 255, 255, 1)"
      });
      d3.select("#infoDiv-kiviat").style("display", "none");
      d3.select("#infoDiv-nomogram").style("display", "none");
      d3.select("#infoDiv-nomogramControls").style("display", "none");
      d3.select("#infoDiv-mosaic").style("display", "none");
    }
  }

  function clickHelpMosaic() {
    console.log("help-mosaic");
    self.display["help-mosaic"] = !self.display["help-mosaic"];
    resetHelps("help-mosaic");

    // d3.select(".overlay").style("display", "inline-block");
    // d3.select("#infoDiv-mosaic").style("display", "inline-block");

    d3.select("#infoDiv-mosaic").style("display", "none");
    if (self.display["help-mosaic"]) {
      less.modifyVars({
        "@bgColor": "rgba(0, 0, 0, 0.75)"
      });
      d3.select("#infoDiv-kiviat").style("display", "inline-block");
      d3.select("#infoDiv-nomogram").style("display", "inline-block");
      d3.select("#infoDiv-nomogramControls").style("display", "inline-block");
      d3.select("#infoDiv-kaplanMeier").style("display", "inline-block");
    } else {
      less.modifyVars({
        "@bgColor": "rgba(255, 255, 255, 1)"
      });
      d3.select("#infoDiv-kiviat").style("display", "none");
      d3.select("#infoDiv-nomogram").style("display", "none");
      d3.select("#infoDiv-nomogramControls").style("display", "none");
      d3.select("#infoDiv-kaplanMeier").style("display", "none");
    }
  }

  return {

  };

}
