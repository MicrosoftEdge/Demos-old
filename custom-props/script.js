var nButton = document.getElementById('night');
var dButton = document.getElementById('day');
var code = document.getElementById('code');
var buttons = [nButton, dButton];
var rootStyle = document.documentElement.style;
vars = [];

document.addEventListener("DOMContentLoaded", function() {
  for(var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function() {
      window[this.id]();
    });
  };
});

var night = function() {
  vars = [
    {name: "--sky-start", value: "rgb(100, 75, 128)"},
    {name: "--sky-end", value: "rgb(45, 45, 81)"},
    {name: "--light-r-mod", value: "-17.5"},
    {name: "--light-g-mod", value: "25"},
    {name: "--light-b-mod", value: "110"},
    {name: "--show-stars", value: "block"},
    {name: "--building-r-mod", value: "-.25"},
    {name: "--building-g-mod", value: 0},
    {name: "--building-b-mod", value: ".15"},
    {name: "--park-r-mod", value: "-.30"},
    {name: "--park-g-mod", value: "-.20"},
    {name: "--park-b-mod", value: "-.08"},
    {name: "--light-source", value: "url(#moon)"}
  ];
  setVars(vars);
  getVars(vars);
}

var day = function() {
  vars = [
    {name: "--dog-coat-r-mod", value: 0},
    {name: "--dog-coat-g-mod", value: 0},
    {name: "--dog-coat-b-mod", value: 0},
    {name: "--park-r-mod", value: 0},
    {name: "--park-g-mod", value: 0},
    {name: "--park-b-mod", value: 0},
    {name: "--building-r-mod", value: 0},
    {name: "--building-g-mod", value: 0},
    {name: "--building-b-mod", value: 0},
    {name: "--sky-start", value: "rgb(95, 171, 217)"},
    {name: "--sky-end", value: "rgb(216, 150, 115)"},
    {name: "--light-r-mod", value: 0},
    {name: "--light-g-mod", value: 0},
    {name: "--light-b-mod", value: 0},
    {name: "--show-stars", value: "none"},
    {name: "--light-source", value: "rgb(245, 169, 95)"},
  ];
  setVars(vars);
  getVars(vars);
}

function setVars(variables) {
  variables.forEach(function(prop) {
    rootStyle.setProperty(prop.name, prop.value);
  }, this);
}

function getVars(variables) {
  var text = "";
  variables.forEach(function (prop) {
    text += prop.name + ": " + rootStyle.getPropertyValue(prop.name);
    text += "\n";
  }, this);

  code.textContent = text;
}
