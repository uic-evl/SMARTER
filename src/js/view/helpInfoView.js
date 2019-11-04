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
      "infoDiv-help": false,
      "infoDiv-kiviat": false,
      "infoDiv-nomogram": false,
      "infoDiv-nomogramControls": false,
      "infoDiv-kaplanMeier": false,
      "infoDiv-mosaic": false
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

  function updateBgColor() {
    less.modifyVars({
      "@bgColor": "rgba(0, 0, 0, 0.75)"
    });
  }

  function resetBgColor() {
    less.modifyVars({
      "@bgColor": "rgba(255, 255, 255, 1)"
    });
  }

  function hideHelpPanels(excludedId, excludedId2) {
    _.forEach(self.display, function(value, key) {
      if (key != excludedId && key != excludedId2) {
        d3.select("#" + key).style("display", "inline-block");
      }
    });
    d3.select(".overlay").style("display", "inline-block");
  }

  function resetHelpPanels(excludedId, excludedId2) {
    _.forEach(self.display, function(value, key) {
      if (key != excludedId && key != excludedId2) {
        d3.select("#" + key).style("display", "none");
      }
    });
    d3.select(".overlay").style("display", "none");
  }


  function clickHelp() {
    console.log("help");
    self.display["infoDiv-help"] = !self.display["infoDiv-help"];
    resetHelps("infoDiv-help");

    resetHelpPanels();

    if (self.display["infoDiv-help"]) {
      // change ".container-fluid" background-color to rgba(0, 0, 0, 0.75)
      updateBgColor();
      d3.select(".overlay").style("display", "inline-block");
      d3.select("#helpImg").attr("src", "imgs/help.png");
    } else {
      // reset ".container-fluid" background-color to white
      resetBgColor();
      d3.select(".overlay").style("display", "none");
    }
  }

  function clickHelpKiviat() {
    console.log("help-kiviat");
    self.display["infoDiv-kiviat"] = !self.display["infoDiv-kiviat"];
    resetHelps("infoDiv-kiviat");

    d3.select("#infoDiv-kiviat").style("display", "none");
    if (self.display["infoDiv-kiviat"]) {
      updateBgColor();
      hideHelpPanels("infoDiv-kiviat");
      d3.select("#helpImg").attr("src", "imgs/help-kiviat.png");
    } else {
      resetBgColor();
      resetHelpPanels("infoDiv-kiviat");
    }
  }

  function clickHelpNomogram() {
    console.log("help-nomogram");
    self.display["infoDiv-nomogram"] = !self.display["infoDiv-nomogram"];
    resetHelps("infoDiv-nomogram");
    self.display["infoDiv-nomogramControls"] = self.display["infoDiv-nomogram"];

    d3.select("#infoDiv-nomogram").style("display", "none");
    d3.select("#infoDiv-nomogramControls").style("display", "none");
    if (self.display["infoDiv-nomogram"]) {
      updateBgColor();
      hideHelpPanels("infoDiv-nomogram", "infoDiv-nomogramControls");
      d3.select("#helpImg").attr("src", "imgs/help-nomogram.png");
    } else {
      resetBgColor();
      resetHelpPanels("infoDiv-nomogram", "infoDiv-nomogramControls");
    }
  }

  function clickHelpKaplanMeier() {
    console.log("help-kaplanMeier");
    self.display["infoDiv-kaplanMeier"] = !self.display["infoDiv-kaplanMeier"];
    resetHelps("infoDiv-kaplanMeier");

    d3.select("#infoDiv-kaplanMeier").style("display", "none");
    if (self.display["infoDiv-kaplanMeier"]) {
      updateBgColor();
      hideHelpPanels("infoDiv-kaplanMeier");
      d3.select("#helpImg").attr("src", "imgs/help-kaplanMeier.png");
    } else {
      resetBgColor();
      resetHelpPanels("infoDiv-kaplanMeier");
    }
  }

  function clickHelpMosaic() {
    console.log("help-mosaic");
    self.display["infoDiv-mosaic"] = !self.display["infoDiv-mosaic"];
    resetHelps("infoDiv-mosaic");

    d3.select("#infoDiv-mosaic").style("display", "none");
    if (self.display["infoDiv-mosaic"]) {
      updateBgColor();
      hideHelpPanels("infoDiv-mosaic");
      d3.select("#helpImg").attr("src", "imgs/help-mosaic.png");
    } else {
      resetBgColor();
      resetHelpPanels("infoDiv-mosaic");
    }
  }

  return {

  };

}
