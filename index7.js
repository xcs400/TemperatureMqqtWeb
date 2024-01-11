// Import MQTT service
import { MQTTService } from "./mqttService.js";

// Target specific HTML items
const sideMenu = document.querySelector("aside");
const menuBtn = document.querySelector("#menu-btn");
const closeBtn = document.querySelector("#close-btn");
const themeToggler = document.querySelector(".theme-toggler");


const TittlePage = document.getElementById("TittlePage");

const OKmyPopupvalue = document.getElementById("OKmyPopupvalue");

const popuptext = document.getElementsByClassName("popuptext");

var SelectedDevice = "?"

// Déclaration d'un tableau vide pour stocker les capteurs
let ListedeSensor = [];


let filtre = ""
// Holds the background color of all chart
var chartBGColor = getComputedStyle(document.body).getPropertyValue(
  "--hart-background"
);
var chartFontColor = getComputedStyle(document.body).getPropertyValue(
  "--chart-font-color"
);
var chartAxisColor = getComputedStyle(document.body).getPropertyValue(
  "--chart-axis-color"
);

/*
  Event listeners for any HTML click
*/

function getCookie(cName) {
  const name = cName + "=";
  const cDecoded = decodeURIComponent(document.cookie); //to be careful
  const cArr = cDecoded.split('; ');
  let res;
  cArr.forEach(val => {
    if (val.indexOf(name) === 0) res = val.substring(name.length);
  })
  return res;
}


function addClicker(idfromcreat) {
  const pot = document.getElementById("pot"+idfromcreat);
   const clickedElement = ListedeSensor.find(element => element.pot === idfromcreat);


  pot.addEventListener("click", (event) => {
    var clickedId = event.currentTarget.id;
	
    console.log(clickedId);
    clickedId=parseInt(clickedId.replace("pot",""))
	
    // Vérifier si clickedId est égal à -1, utiliser idfromcreat à la place
    const actualClickedId = clickedId === '-1' ? idfromcreat : clickedId;

    // Trouver l'élément dans ListedeSensor qui correspond à actualClickedId
    const clickedElement = ListedeSensor.find(element => element.pot === actualClickedId);

    // Vérifier si l'élément a été trouvé
    if (clickedElement) {
      // Utiliser les propriétés de l'élément trouvé
      document.cookie = `SelectedDevice=${clickedElement.SelectedDevice}`;
      document.cookie = `TitleText=${clickedElement.TitleText}`;
      document.cookie = `Name_OMG=${clickedElement.Name_OMG}`;
      document.cookie = `Has_Battery=${clickedElement.Has_Battery}`;
      document.cookie = `Has_Humidity=${clickedElement.Has_Humidity}`;
      document.cookie = `Short_name=${clickedElement.Short_name}`;
      
      // Recharger la page après avoir défini les cookies

	  document.getElementById(`${'pot'+idfromcreat}-text`).innerText = clickedElement.Short_name;
      location.reload();
    }
  });

  // Assurez-vous d'accéder à l'élément avec le bon ID
  document.getElementById(`${'pot'+idfromcreat}-text`).innerText = clickedElement.Short_name;
}




/*
    MQTT Settings Update Function

    This function handles the update of MQTT settings based on user input.
*/

// Event listener for the button click
OKmyPopupvalue.addEventListener("click", () => {
    // MQTT topic based on user settings
    var topic = `home/${getCookie("Name_OMG")}/MERGEtoMQTT/Sensor/${getCookie("SelectedDevice")}/Settings`;

    // Initial JSON string
    var textit = '{';

    // Get the popup element and its input elements
    var myPopupElement = document.getElementById('myPopup');
    var inputElements = myPopupElement.querySelectorAll('input');

    // Default action is to "Add"
    var action = "Ajoute";

    // Check if the action is "Efface" or "Nouveau"
    for (var i = 0; i < inputElements.length; i++) {
        var trimmedValue = inputElements[i].value.trim();
        if (trimmedValue === "Efface" || trimmedValue === "Nouveau") {
            action = trimmedValue;
            break;  // Exit the loop if "Efface" or "Nouveau" is detected
        }
    }

    // Use an object to store unique elements
    var uniqueElements = {};

    // Loop through input elements
    for (var i = 0; i < inputElements.length; i++) {
        // Check if the value or ID is empty
        if (inputElements[i].value.trim() === "" || inputElements[i].id === "") {
            continue;  // Ignore empty elements
        }

        // Handle "Efface" and "Nouveau" cases
        if (action === "Efface" && inputElements[i].id === "Efface") {
            continue;  // Ignore "Efface" element
        }

        if (action === "Nouveau" && inputElements[i].id === "Nouveau") {
            continue;  // Ignore "Nouveau" element
        }

        // Check if the element already exists
        if (uniqueElements[inputElements[i].id]) {
            continue;  // Ignore duplicate elements
        }

        // Add a comma for non-first elements
        if (i !== 0) {
            textit += ',';
        }

        // Construct the JSON string based on the element type
        if (inputElements[i].id === "Nouveau" && inputElements[i].value.trim() !== "") {
            textit += `"${inputElements[i].value}":"${inputElements[i].value}"`;
        } else {
            textit += `"${inputElements[i].id}":"${inputElements[i].value}"`;
            
            // Update the page title with the first non-empty element's value
            if (i === 0) {
                TittlePage.innerHTML = inputElements[i].value;
            }
        }

        // Add the element to the unique elements object
        uniqueElements[inputElements[i].id] = true;
    }

    // Complete the JSON string
    textit += '}';

    // Publish the updated settings to the MQTT topic
    mqttService.publish(topic, textit, { retain: true });
});
/*
OKmyPopupvalue.addEventListener("click", () => {
    var topic = `home/${getCookie("Name_OMG")}/MERGEtoMQTT/Sensor/${getCookie("SelectedDevice")}/Settings`;
    var textit = '{';
    var myPopupElement = document.getElementById('myPopup');
    var inputElements = myPopupElement.querySelectorAll('input');

    // Utiliser un objet pour stocker les éléments uniques
    var uniqueElements = {};

    for (var i = 0; i < inputElements.length; i++) {
        // Vérifier si la valeur ou l'ID est vide
        if (inputElements[i].value.trim() === "" || inputElements[i].id === "") {
            continue;  // Ignorer les éléments vides
        }

        // Vérifier si l'élément existe déjà
        if (uniqueElements[inputElements[i].id]) {
            continue;  // Ignorer les éléments en double
        }

        if (i !== 0) {
            textit += ',';
        }

        if (inputElements[i].id === "Nouveau" && inputElements[i].value.trim() !== "") {
            textit += `"${inputElements[i].value}":"${inputElements[i].value}"`;
        } else {
            textit += `"${inputElements[i].id}":"${inputElements[i].value}"`;
            if (i === 0) {
                TittlePage.innerHTML = inputElements[i].value;
            }
        }

        // Ajouter l'élément à l'objet des éléments uniques
        uniqueElements[inputElements[i].id] = true;
    }

    textit += '}';
    mqttService.publish(topic, textit, { retain: true });
});
*/
/*
oldOKmyPopupvalue.addEventListener("click", () => {

  var topic = "home/" + getCookie("Name_OMG") + "/MERGEtoMQTT/Sensor/" + getCookie("SelectedDevice") + "/Settings"
  var textit = '{'
  var myPopupElement = document.getElementById('myPopup');
  var inputElements = myPopupElement.querySelectorAll('input');
  

  for (var i = 0; i < inputElements.length; i++) {
    // Ajoutez une clause if pour la première itération
    if (i === 0) {

      TittlePage.innerHTML = inputElements[i].value;
	  textit = textit + '"' + inputElements[i].id + '":"' + inputElements[i].value+'"' ;

    } 
	else
		{textit = textit + ','
		textit = textit + '"' + inputElements[i].id + '":"' + inputElements[i].value+'"'  ;
		}
  }

  textit = textit + '}'
  mqttService.publish(topic, textit , { retain: true })

});
*/


menuBtn.addEventListener("click", () => {
  sideMenu.style.display = "block";
});

closeBtn.addEventListener("click", () => {
  sideMenu.style.display = "none";
});


themeToggler.addEventListener("click", () => {

  var popup = document.getElementById('myPopup');
  popup.classList.toggle('show');

  /* document.body.classList.toggle("dark-theme-variables");
   themeToggler.querySelector("span:nth-child(1)").classList.toggle("active");
   themeToggler.querySelector("span:nth-child(2)").classList.toggle("active");
 
   // Update Chart background
   chartBGColor = getComputedStyle(document.body).getPropertyValue(
     "--chart-background"
   );
   chartFontColor = getComputedStyle(document.body).getPropertyValue(
     "--chart-font-color"
   );
   chartAxisColor = getComputedStyle(document.body).getPropertyValue(
     "--chart-axis-color"
   );
   updateChartsBackground();
   */
});

/*
  Plotly.js graph and chart setup code
*/
var temperatureHistoryDiv = document.getElementById("temperature-history");
var voltageHistoryDiv = document.getElementById("voltage-history");
var humidityHistoryDiv = document.getElementById("humidity-history");


//var temperatureGaugeDiv = document.getElementById("temperature-gauge");
//var voltageGaugeDiv = document.getElementById("voltage-gauge");
//var batteryGaugeDiv = document.getElementById("battery-gauge");


const historyCharts = [
  temperatureHistoryDiv,
  voltageHistoryDiv,
  humidityHistoryDiv,

];

const gaugeCharts = [
  // temperatureGaugeDiv,
  // voltageGaugeDiv,
  // batteryGaugeDiv,

];

// History Data
var temperatureTrace = {
  x: [1],
  y: [10],

  error_y: { color: 'f44', symmetric: false, array: [10], arrayminus: [5], type: 'data', visible: true },


  name: "Temperature",
  mode: "lines",   //+markers",
  type: "scatter",
};
var voltageTrace = {
  x: [],
  y: [],
  name: "voltage",
  mode: "lines",


  //     line: {shape: 'spline'},
  type: 'line'
  ,

};
var humidityTrace = {
  x: [],
  y: [],
  name: "humidity",
  mode: "lines",   //+markers",
  type: "line",
};

var temperatureLayout = {
  // autosize: true,

  title: {
    text: "Temperature",
  },
  font: {
    size: 14,
    color: chartFontColor,
    family: "poppins, san-serif",
  },
  colorway: ["#05AD86"],
  margin: { t: 40, b: 120, l: 50, r: 10, pad: 10 },
  plot_bgcolor: chartBGColor,
  paper_bgcolor: chartBGColor,
  xaxis: {
    color: chartAxisColor,
    linecolor: chartAxisColor,
    gridwidth: "2",
    autorange: true,

  },
  yaxis: {
    color: chartAxisColor,
    linecolor: chartAxisColor,
    gridwidth: "2",
    autorange: true,
  },


};
var voltageLayout = {
  autosize: true,
  title: {
    text: "voltage",
  },
  font: {
    size: 14,
    color: chartFontColor,
    family: "poppins, san-serif",
  },
  colorway: ["#05AD86"],
  margin: { t: 40, b: 120, l: 50, r: 10, pad: 0 },
  plot_bgcolor: chartBGColor,
  paper_bgcolor: chartBGColor,
  xaxis: {
    color: chartAxisColor,
    linecolor: chartAxisColor,
    gridwidth: "2",
  },
  yaxis: {
    color: chartAxisColor,
    linecolor: chartAxisColor,
  },
};
var humidityLayout = {
  autosize: true,
  title: {
    text: "humidity",
  },
  font: {
    size: 14,
    color: chartFontColor,
    family: "poppins, san-serif",
  },
  colorway: ["#05AD86"],
  margin: { t: 40, b: 120, l: 40, r: 10, pad: 0 },
  plot_bgcolor: chartBGColor,
  paper_bgcolor: chartBGColor,
  xaxis: {

    color: chartAxisColor,
    linecolor: chartAxisColor,
    gridwidth: "2",
  },
  yaxis: {
    color: chartAxisColor,
    linecolor: chartAxisColor,
  },
};


function createPotLink(id, text) {
  const potLink = document.createElement("a");
  potLink.href = "#";
  potLink.classList.add("active");
  potLink.id = id;

  const spanIcon = document.createElement("span");
  spanIcon.classList.add("material-symbols-sharp");
  spanIcon.textContent = " dashboard ";

  const h2Text = document.createElement("h2");
  h2Text.id = `${id}-text`;
  h2Text.textContent = text;

  potLink.appendChild(spanIcon);
  potLink.appendChild(h2Text);

  return potLink;
}




var config = { responsive: true, displayModeBar: false, type: "scatter", };

// Event listener when page is loaded
window.addEventListener("load", (event) => {
  Plotly.newPlot(temperatureHistoryDiv, [temperatureTrace], temperatureLayout, config);
  Plotly.newPlot(voltageHistoryDiv, [voltageTrace], voltageLayout, config);
  Plotly.newPlot(humidityHistoryDiv, [humidityTrace], humidityLayout, config);
//testjs()

StartDiscoSensor()


const sidebar = document.querySelector(".sidebar");

/*
const pot1Link = createPotLink("pot1", "Pot de Yaourt 1");
const pot2Link = createPotLink("pot2", "Pot de Yaourt 2");
const pot3Link = createPotLink("pot3", "Pot de Yaourt 3");
const pot4Link = createPotLink("pot4", "Pot de Yaourt 4");
const potRienLink = createPotLink("potrien", "");

sidebar.appendChild(pot1Link);
sidebar.appendChild(pot2Link);
sidebar.appendChild(pot3Link);
sidebar.appendChild(pot4Link);
sidebar.appendChild(potRienLink);


//addClicker(id, text, selectedDevice, titleText, nameOMG, hasBattery, hasHumidity) 
addClicker("pot1", "Temperature balcon", "Yaourt1", "Temperature balcon sur batterie", "OMG_ESP32_LORA", 1, 0);
addClicker("pot2", "Temp+Humidité cuisine", "Yaourt2", "cuisine: Temperature et humidité", "OMG_ESP32_LORA2", 0, 1);
addClicker("pot3", "Terre Jardin", "288AD011000", "Dans la terre du jardin", "OMG_ESP32_LORA", 0, 0);
addClicker("pot4", "Temperature Hall", "0x28cfda81e3d53c89", "Temperature du Hall d'entrée", "OMG_ESP32_LORA", 0, 0);
*/

 var SelectedDevice = getCookie("SelectedDevice")

  if (SelectedDevice == undefined) {
    document.cookie = "SelectedDevice = Yaourt1"         // object
    document.cookie = "Name_OMG= OMG_ESP32_LORA"
    document.cookie = "TitleText = Temperature exterieure sur batterie"
    document.cookie = "Has_Battery= 1"
    document.cookie = "Has_Humidity= 1"

    document.getElementById("Libelle").value = getCookie("TitleText")
	SelectedDevice="Yaourt1";
  }

  else {
    var Name_OMG = getCookie("Name_OMG")

    var Has_Battery = getCookie("Has_Battery")
    if (Has_Battery == 1)
      var val = "block";
    else
      var val = "none";

    document.getElementById("Libelle").value = getCookie("TitleText")

    const voltage = document.getElementsByClassName("voltage");
    for (var i = 0; i < voltage.length; i++) {
      voltage[i].style.display = val
    }

    const voltagehistory = document.getElementById("voltage-history");
    voltagehistory.style.display = val

    var Has_Humidity = getCookie("Has_Humidity")
    if (Has_Humidity == 1)
      var val = "block";
    else
      var val = "none";

    const humidity = document.getElementsByClassName("humidity");
    for (var i = 0; i < humidity.length; i++) {
      humidity[i].style.display = val
    }

    const humidityhistory = document.getElementById("humidity-history");
    humidityhistory.style.display = val

  }




  // Get MQTT Connection
  fetchMQTTConnection();

  // Run it initially

  var oDiv = document.getElementsByClassName('shiftdateelement');

  oDiv[0].addEventListener('click', function (e) {
    changefiltre(-1)
    // alert('left');
    e.stopPropagation();
  }, true);
  oDiv[1].addEventListener('click', function (e) {
    changefiltre(1)
    // alert('right');
    e.stopPropagation();
  }, true);


  document.body.onclick = function (e) {
    e = window.event ? event.srcElement : e.target;
    if (e.className && e.className.indexOf('shiftdateelement') != -1) alert('hohoho');
  }

  handleDeviceChange(mediaQuery);
});



var layout = { width: 200, height: 10, margin: { t: 0, b: 0, l: 0, r: 0 } };

// Will hold the arrays we receive from our sensor
// Temperature
let newTempXArray = [];
let newTempYArray = [];
// voltage
let newvoltageXArray = [];
let newvoltageYArray = [];
// battery
let newbatteryXArray = [];
let newbatteryYArray = [];


// The maximum number of data points displayed on our scatter/line graph
let MAX_GRAPH_POINTS = 220;
let ctr = 0;


// Callback function that will retrieve our latest sensor readings and redraw our Gauge with the latest readings
function since() {

  var today = new Date();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

  var date1 = new Date("2013/04/09 " + time)
  var date2 = new Date("2013/04/09 " + mqttupdated.textContent);

  var tmp = (date1 - date2) / 1000
  if (tmp > 3600)
    tmp = tmp - 3600
  console.log(mqttupdated.textContent, time, tmp)
  mqttupdatedsec.textContent = tmp
  setTimeout(since, 1000);

}

function updateSensorReadings(jsonResponse) {
  console.log(typeof jsonResponse);
  console.log(jsonResponse);

  if (jsonResponse.TempCelsius !== undefined)     // cas dernier message update gauge
  {
    var TitleText = getCookie("TitleText")
    TittlePage.innerHTML = TitleText + " (" + jsonResponse.name + ")";
    mqttupdated.textContent = jsonResponse.Time.split('/')[1].replaceAll('-', ':')

    setTimeout(since, 1000);


    let temperature = Number(jsonResponse.TempCelsius).toFixed(2);
    let voltage = Number(jsonResponse.Vbatt).toFixed(2);
    //var val = Object.values(jsonResponse);
    //let battery = Number(val[5] ).toFixed(2);
    let battery = Number(jsonResponse.Charge).toFixed(2);

    updateBoxes(temperature, voltage, battery, voltage); //use volatge comm humidi
 
  }

  if (jsonResponse.Date !== undefined)     // cas dernier message update chart
  {
    var u = jsonResponse.Temp
    var TZ = u.split(',')

    var T2 = TZ[TZ.length - 1];
    var T1 = TZ[TZ.length - 2];

    if (T2 > T1) {
      var divsToShow = document.getElementsByClassName('tendenceup');
      var divsToHide = document.getElementsByClassName('tendencedown');
    }
    else {
      var divsToHide = document.getElementsByClassName('tendenceup');
      var divsToShow = document.getElementsByClassName('tendencedown');
    }
    if (T2 == T1) { // var divsToShow = document.getElementsByClassName('tendenceup');
      //  var divsToShow= document.getElementsByClassName('tendencedown') ;
    }


    for (var i = 0; i < divsToHide.length; i++) {
      divsToHide[i].style.visibility = "hidden";
      //    divsToHide[i].style.display = "none"; 
    }
    for (var i = 0; i < divsToShow.length; i++) {
      divsToHide[i].style.visibility = "show";
      //   divsToHide[i].style.display = "block"; 
    }


    updateMiniMaxi(jsonResponse.Jour_tmin, jsonResponse.Jour_tmax)

    burstupdateCharts(jsonResponse.Date, jsonResponse.Temp, jsonResponse.tmin, jsonResponse.tmax, temperatureHistoryDiv);
    burstupdateCharts(jsonResponse.Date, jsonResponse.Vbatt, undefined, undefined, voltageHistoryDiv);
    burstupdateCharts(jsonResponse.Date, jsonResponse.Vbatt, undefined, undefined, humidityHistoryDiv);

    // xArray.push(ctr++);

    // var t1= time.split("/")   //12-11-2023/21-34-06
    // var t2=t1[1].split("-")

    // xArray.push(t2[0]+":"+t2[1] ); 

  }

}


function burstupdateCharts(jdate, jvalue, jtmin, jtmax, grapf) {

  if (jvalue == undefined)
    return

  var arDate = jdate.replace("[", "")
  //  arDate = arDate.replace("]","") 
  //   arDate = arDate.replaceAll("-23","")
  //  arDate = arDate.replaceAll("'","") 
  var arDate = arDate.split(',')
  var artemp = jvalue.replace("[", "")
  artemp = artemp.replace("]", "")
  var artemperature = artemp.split(',')


  var xArray = []
  xArray.push(arDate)
  var yArray = []
  yArray.push(artemperature);


  var error_y = []
  var error_y_minus = []

  if (jtmin !== undefined) {
    error_y = jtmax.split(',')
    error_y_minus = jtmin.split(',')

    for (let u in error_y) {
      error_y[u] = error_y[u] - artemperature[u]
      error_y_minus[u] = artemperature[u] - error_y_minus[u]

    }
  }


  var data_update = {
    x: xArray,
    y: yArray,
    error_y: { color: "F55", symmetric: false, array: error_y, arrayminus: error_y_minus, type: 'data', visible: true },



  };

  Plotly.update(grapf, data_update);

}




function updateMiniMaxi(mini, maxi) {
  let min = document.getElementById("minTempjour");
  let max = document.getElementById("maxTempjour");

  min.innerHTML = mini + " °C";
  max.innerHTML = maxi + " °C";


}


function updateBoxes(temperature, voltage, battery, humidity) {
  let temperatureDiv = document.getElementById("temperature");
  let voltageDiv = document.getElementById("voltage");
  let batteryDiv = document.getElementById("battery");
  let humidityDiv = document.getElementById("humidity");

  temperatureDiv.innerHTML = temperature + " °C";
  voltageDiv.innerHTML = voltage + " mV";
  batteryDiv.innerHTML = battery + " %";
  humidityDiv.innerHTML = humidity + " %";
}



function updateCharts(lineChartDiv, xArray, yArray, sensorRead, time) {
  if (xArray.length >= MAX_GRAPH_POINTS) {
    xArray.shift();
  }
  if (yArray.length >= MAX_GRAPH_POINTS) {
    yArray.shift();
  }
  // xArray.push(ctr++);
  var t1 = time.split("/")   //12-11-2023/21-34-06
  var t2 = t1[1].split("-")

  xArray.push(t2[0] + ":" + t2[1]);
  yArray.push(sensorRead);

  var data_update = {

    x: [xArray],
    y: [yArray],
  };

  Plotly.update(lineChartDiv, data_update);
}

function updateChartsBackground() {
  // updates the background color of historical charts
  var updateHistory = {
    plot_bgcolor: chartBGColor,
    paper_bgcolor: chartBGColor,
    font: {
      color: chartFontColor,
    },
    xaxis: {
      color: chartAxisColor,
      linecolor: chartAxisColor,
    },
    yaxis: {
      color: chartAxisColor,
      linecolor: chartAxisColor,
    },
  };
  historyCharts.forEach((chart) => Plotly.relayout(chart, updateHistory));

  // updates the background color of gauge charts
  var gaugeHistory = {
    plot_bgcolor: chartBGColor,
    paper_bgcolor: chartBGColor,
    font: {
      color: chartFontColor,
    },
    xaxis: {
      color: chartAxisColor,
      linecolor: chartAxisColor,
    },
    yaxis: {
      color: chartAxisColor,
      linecolor: chartAxisColor,
    },
  };
  gaugeCharts.forEach((chart) => Plotly.relayout(chart, gaugeHistory));
}

const mediaQuery = window.matchMedia("(max-width: 400px)");

mediaQuery.addEventListener("change", function (e) {
  handleDeviceChange(e);
});

function handleDeviceChange(e) {
  if (e.matches) {
    console.log("Inside Mobile");
    var updateHistory = {
      width: 400,
      height: 250,
      "xaxis.autorange": true,
      "yaxis.autorange": true,
    };
    historyCharts.forEach((chart) => Plotly.relayout(chart, updateHistory));
  } else {
    var updateHistory = {
      width: 4,
      height: 260,
      "xaxis.autorange": true,
      "yaxis.autorange": true,
    };
    historyCharts.forEach((chart) => Plotly.relayout(chart, updateHistory));
  }
}

/*
  MQTT Message Handling Code
*/
const mqttStatus = document.querySelector(".status");
const mqttupdated = document.querySelector(".updated");
const mqttupdatedsec = document.querySelector(".updatedsec");

var mqttService

function onConnect(message) {
  mqttStatus.textContent = "Connected to broker";
}
function onMessage(topic, message) {
  var stringResponse = message.toString();

  
  stringResponse=stringResponse.replace('id:', '"id":');
  console.log(stringResponse)  
  
  var messageResponse = JSON.parse(stringResponse);

 if (topic.search("Sensor") !=  -1  )
	{updateDiscovery(topic,messageResponse);
	return
	}
  if (messageResponse.hex == undefined && messageResponse.name !== undefined)
    updateSensorReadings(messageResponse);
  else {
    console.log("skip:" + topic)

  }
  
      var SelectedDevice = getCookie("SelectedDevice")
      let indexElement = ListedeSensor.findIndex(element => element.SelectedDevice === SelectedDevice);
	
	if (indexElement != -1)
		ajouterOuRemplacerElements(ListedeSensor[indexElement])

  //b=0
  // mqttService.publish(topic,b)
}

function onError(error) {
  console.log(`Error encountered :: ${error}`);
  mqttStatus.textContent = "Error";
}

function onClose() {
  console.log(`MQTT connection closed!`);
  mqttStatus.textContent = "Closed";
}


function padWithLeadingZeros(num, totalLength) {
  return String(num).padStart(totalLength, '0');
}



// Fonction pour ajouter ou remplacer des éléments à partir d'un objet JSON
function ajouterOuRemplacerElements(objetJson) {
    // Récupérer la classe mypopup
    let myPopup = document.getElementById('myPopup');

    // Parcourir chaque propriété de l'objet JSON
    for (let prop in objetJson) {
        if (objetJson.hasOwnProperty(prop)) {
            // Vérifier si l'élément avec cet ID existe déjà
            let existingElement = myPopup.querySelector(`#${prop}`);
            
            if (existingElement) {
                // Si l'élément existe, mettre à jour sa valeur
                existingElement.value = objetJson[prop];
            } else {
                // Sinon, créer un nouvel élément
                let newRow = document.createElement('tr');

                // Créer une cellule pour le nom de la propriété
                let propertyNameCell = document.createElement('td');
                propertyNameCell.textContent = prop;
                newRow.appendChild(propertyNameCell);

                // Créer une cellule pour la valeur de la propriété
                let propertyValueCell = document.createElement('td');
                let inputElement = document.createElement('input');
                inputElement.id = prop;  // Utilisez le nom de la propriété comme identifiant
                inputElement.size = 30;
                inputElement.type = 'text';
                inputElement.value = objetJson[prop];
                propertyValueCell.appendChild(inputElement);
                newRow.appendChild(propertyValueCell);

                // Ajouter la nouvelle ligne à la table
                myPopup.querySelector('table').appendChild(newRow);
            }
        }
    }
}



/**
 * Fonction de mise à jour de la découverte des capteurs.
 * Cette fonction est appelée en réponse à la réception de données de découverte via MQTT.
 * Elle gère la mise à jour de la liste des capteurs et de l'interface utilisateur.
 *
 * @param {string} topic - Le sujet MQTT associé à la découverte du capteur.
 * @param {Object} messageResponse - Objet contenant des informations sur la découverte (par exemple, Libelle pour les réponses "Settings").
 * @returns {void} - Aucune valeur de retour explicite.
 *
 * Détails du fonctionnement :
 * - Analyse du sujet MQTT pour extraire des informations telles que le SelectedDevice, le Name_OMG, etc.
 * - Création d'un nouvel élément de capteur avec ces informations.
 * - Vérification si l'élément de capteur existe déjà dans la liste.
 *   - Si oui, mise à jour de l'élément existant.
 *   - Sinon, ajout du nouvel élément à la liste.
 * - Mise à jour de l'interface utilisateur, notamment en ajoutant des liens et des gestionnaires de clics.
 *
 * Remarque :
 * La fonction peut être appelée avec des données de découverte correspondant à différents événements MQTT.
 * Si le dernier élément dans le sujet MQTT est "Settings", la fonction met à jour certains attributs de l'élément.
 */
 
 

// Fonction de mise à jour de la découverte
function updateDiscovery(topic, messageResponse) {
  // Affichage dans la console du sujet (topic) et de la réponse (messageResponse)
 
  console.log("updateDiscovery;",topic, messageResponse);

  // Séparation du sujet en éléments à l'aide du délimiteur '/'
  const tableauElements = topic.split('/');
  // Récupération du dernier élément du tableau
  const dernierElement = tableauElements[tableauElements.length - 1];
 const avantdernierElement = tableauElements[tableauElements.length - 2];

  // Vérification si le dernier élément n'est pas "Settings"
  if (dernierElement !== "Settings") {
    // Construction du sujet pour le dernier message
 //   var topicLastMessage = tableauElements[0] + "/" + tableauElements[1] + "/MERGEtoMQTT/" + dernierElement + "/LastMessage/#";

    // Création d'un nouvel élément avec des propriétés spécifiques
    let nouvelElement = {
	  pot: ListedeSensor.length+1,
      SelectedDevice: dernierElement,
      Name_OMG: tableauElements[1],
      Short_name: dernierElement,
      TitleText: dernierElement

    };

    // Recherche de l'index de l'élément existant dans le tableau
    let indexElementExistant = ListedeSensor.findIndex(element => element.SelectedDevice === nouvelElement.SelectedDevice);
    // Vérification si l'élément existe déjà
    if (indexElementExistant !== -1) {
		 console.log("existe deja !");
     } else {
      // Ajout du nouvel élément au tableau si l'élément n'existe pas
  
      ListedeSensor.push(nouvelElement);
      console.log("Élément ajouté avec succès !");

      // Sélection de la barre latérale dans le document HTML
      const sidebar = document.querySelector(".sidebar");
      // Création d'un lien pour le nouvel élément
      const potLink = createPotLink("pot" + ListedeSensor.length, dernierElement);
      
      // Ajout du lien à la barre latérale
      sidebar.appendChild(potLink);

      // Ajout d'un "clicker" avec des paramètres spécifiques
      addClicker(ListedeSensor.length);
	  
    }
  } else {
    // Récupération du libellé depuis la réponse
    var Libelle = messageResponse.Libelle;

   // Recherche de l'index de l'élément existant dans le tableau
    let indexElementExistant = ListedeSensor.findIndex(element => element.SelectedDevice === avantdernierElement);

// Décoder la chaîne JSON en un objet JavaScript
let UpdateElement = messageResponse;


    // Création d'un élément de mise à jour avec des propriétés spécifiques
    let UpdateElementplus = {
		pot: indexElementExistant+1,
      SelectedDevice: avantdernierElement,
      Name_OMG: tableauElements[1],
      Short_name: Libelle,
      TitleText: Libelle
    };

 // Ajout des propriétés de UpdateElementplus à UpdateElement
UpdateElement.pot = UpdateElementplus.pot;
UpdateElement.SelectedDevice = UpdateElementplus.SelectedDevice;
UpdateElement.Name_OMG = UpdateElementplus.Name_OMG;
UpdateElement.Short_name = UpdateElementplus.Short_name;
UpdateElement.TitleText = UpdateElementplus.TitleText;



    // Vérification si l'élément existe déjà
    if (indexElementExistant !== -1) {
		
      // Mise à jour de l'élément existant avec l'élément mis à jour
      ListedeSensor[indexElementExistant] = UpdateElement;
//	   addClicker(id,                           text,          selectedDevice, titleText,        nameOMG, hasBattery, hasHumidity) {  
		var pos=parseInt(indexElementExistant)+1
	   addClicker( pos );


    }
  }
}
function StartDiscoSensor() {

      initializeMQTTConnection("wss://broker.emqx.io:8084/mqtt", "home/" + "OMG_ESP32_LORA" + "/MERGEtoMQTT/Sensor/#" )
      initializeMQTTConnection("wss://broker.emqx.io:8084/mqtt", "home/" + "OMG_ESP32_LORA2" + "/MERGEtoMQTT/Sensor/#" )

}



function fetchMQTTConnection() {
  fetch("env", {
    method: "GET",
    headers: {
      "Content-type": "application/text; charset=UTF-8",
    },
  })
    .then(function (response) {
      console.log("reponse  :", response)

      var SelectedDevice = getCookie("SelectedDevice")
      var Name_OMG = getCookie("Name_OMG")
      var Has_Battery = getCookie("Has_Battery")


      initializeMQTTConnection("wss://broker.emqx.io:8084/mqtt", "home/" + Name_OMG + "/MERGEtoMQTT/" + SelectedDevice + "/LastMessage/#");

      var ladate = new Date()
      var chd = ladate.getFullYear() + "-" + padWithLeadingZeros((ladate.getMonth() + 1), 2) + "-" + padWithLeadingZeros((ladate.getDate()), 2)

      initializeMQTTConnection("wss://broker.emqx.io:8084/mqtt", "home/" + Name_OMG + "/MERGEtoMQTT/" + SelectedDevice + "/Histo/" + chd + "/#");

      let idategraph = document.getElementById('dategraph');
      var ifiltre = idategraph.innerHTML = chd

      return response.json();
    })
}
function initializeMQTTConnection(mqttServer, mqttTopic) {
  console.log(
    `Initializing connection to :: ${mqttServer}, topic :: ${mqttTopic}`
  );
  var fnCallbacks = { onConnect, onMessage, onError, onClose };

  mqttService = new MQTTService(mqttServer, fnCallbacks);
  mqttService.connect({ retain: true });

  mqttService.subscribe(mqttTopic);
}


// On ajoute au prototype de l'objet Date une méthode personnalisée
Date.prototype.addDays = function (days) {
  // On récupère le jour du mois auquel on ajoute le nombre de jour passé en paramètre
  var day = this.getDate() + days;
  // On définit le jour du mois (This représente la date sur laquelle on effectue l'opération)
  this.setDate(day);
}



function changefiltre(dir) {
  let idategraph = document.getElementById('dategraph');
  var ifiltre = idategraph.innerHTML
  var myDate = new Date(ifiltre);
  // On additionne le nombre de jour voulu (ex: 2 jours)
  if (dir == -1) {
    myDate.addDays(-1);
  }

  if (dir == 1) {
    myDate.addDays(1);
  }

  var data_update = {
    x: [0],
    y: [0]
  };

  Plotly.update(temperatureHistoryDiv, data_update);

  var filtre = myDate.getFullYear() + "-" + padWithLeadingZeros((myDate.getMonth() + 1), 2) + "-" + padWithLeadingZeros((myDate.getDate()), 2)

  var SelectedDevice = getCookie("SelectedDevice")
  var Name_OMG = getCookie("Name_OMG")

  initializeMQTTConnection("wss://broker.emqx.io:8084/mqtt", "home/" + Name_OMG + "/MERGEtoMQTT/" + SelectedDevice + "/Histo/" + filtre + "/#");

  idategraph.innerHTML = filtre

}




// Exemple d'utilisation
function testjs() {

var temperatureHistoryDiv1 = document.getElementById("canvasBeforeid");
 Plotly.newPlot(temperatureHistoryDiv1, [temperatureTrace1], temperatureLayout1, config);

var temperatureHistoryDiv2 = document.getElementById("canvasAfterid");
 Plotly.newPlot(temperatureHistoryDiv2, [temperatureTrace2], temperatureLayout2, config);


  const data = {
        "Date": "2024-01-10 02:47,2024-01-10 03:09,2024-01-10 03:32,2024-01-10 03:54,2024-01-10 04:18,2024-01-10 04:38,2024-01-10 04:58,2024-01-10 05:20,2024-01-10 05:54,2024-01-10 06:18,2024-01-10 06:38,2024-01-10 06:59,2024-01-10 07:19,2024-01-10 07:39,2024-01-10 08:03,2024-01-10 08:23,2024-01-10 08:43,2024-01-10 09:03,2024-01-10 09:33,2024-01-10 09:53,2024-01-10 10:18,2024-01-10 10:42,2024-01-10 11:06,2024-01-10 11:30,2024-01-10 11:54,2024-01-10 12:14,2024-01-10 12:40,2024-01-10 13:18,2024-01-10 13:41,2024-01-10 14:05,2024-01-10 14:25,2024-01-10 14:47,2024-01-10 15:07,2024-01-10 15:29,2024-01-10 15:49,2024-01-10 16:09,2024-01-10 16:41,2024-01-10 17:08,2024-01-10 17:30,2024-01-10 17:50,2024-01-10 18:10,2024-01-10 18:30,2024-01-10 18:50,2024-01-10 19:10,2024-01-10 19:34,2024-01-10 20:07,2024-01-10 20:29,2024-01-10 20:53",
        "Temp": "3.75,3.77,6.75,3.75,3.75,3.75,3.75,3.75,3.75,3.75,9.75,5.75,3.75,3.75,3.75,3.75,9.75,3.75,3.75,3.77,3.77,4.00,4.00,4.00,4.07,4.20,4.25,10.25,4.25,4.25,4.25,14.25,4.27,4.25,4.25,15.25,4.25,4.25,4.05,4.00,4.00,4.00,4.00,4.00,4.00,4.00,4.00,4.00"
    };

    // Convertir les dates en liste de secondes
    const dates = data.Date.split(',');
    const YY_point = data.Temp.split(',');

    const XX_seconds = dates.map(date => {
        const parsedDate = new Date(date);
        const secondsSince1900 = (parsedDate - new Date('2024-01-10')) / 1000;
        return secondsSince1900;
    });

    console.log("enseconde");
    console.log(XX_seconds);
    console.log(YY_point);

    // Vos données
    const x = XX_seconds;
    const y = YY_point;



    const degree = x.length-1

   // Dessiner les graphiques
    drawGraph(temperatureHistoryDiv1, x, y, 'Avant');


    // Appliquer les polynômes
    const result = computePolynomial(x, y, degree);
    console.log("coeff :",result);
 
    // Utiliser les coefficients obtenus pour générer la courbe
    const xValues = [...Array(degree+2).keys()];
    const yValuesComputed = xValues.map(x => evaluatePolynomial(result, x));

    // Dessiner le graphique après l'application des polynômes
    drawGraph(temperatureHistoryDiv2, xValues.slice(1), yValuesComputed.slice(1), 'Après');
	
	
	  console.log(xValues);
	    console.log(yValuesComputed);
		
}

// Fonction pour évaluer le polynôme en un point
function evaluatePolynomial(coefficientsin,x) {
var coefficients= coefficientsin.equation



coefficients= coefficientsin.equation

 if (!Array.isArray(coefficients) || coefficients.length === 0) {
        throw new Error("Les coefficients doivent être un tableau non vide.");
    }

    let result = 0;
    const n = coefficients.length - 1; // Degré du polynôme

    for (let i = n; i >= 0; i--) {
        result += coefficients[i] * Math.pow(x, n - i);
    }

    return result;
}


var temperatureLayout1 = {
   autosize: true,

  title: {
    text: "Temperature",
  },
  font: {
    size: 14,
 
    family: "poppins, san-serif",
  },
  colorway: ["#05AD86"],
  margin: { t: 40, b: 120, l: 50, r: 10, pad: 10 },

  xaxis: {
    color: "#ff0000",
    linecolor: "#ff0000",
    gridwidth: "2",
    autorange: true,

  },
  yaxis: {
    color: "#ff0000",
    linecolor: "#ff0000",
    gridwidth: "2",
    autorange: true,
  },


};



var temperatureLayout2 = {
   autosize: true,

  title: {
    text: "Temperature",
  },
  font: {
    size: 14,
 
    family: "poppins, san-serif",
  },
  colorway: ["#05AD86"],
  margin: { t: 40, b: 120, l: 50, r: 10, pad: 10 },

  xaxis: {
    color: "#ff0000",
    linecolor: "#ff0000",
    gridwidth: "2",
    autorange: true,

  },
  yaxis: {
    color: "#ff0000",
    linecolor: "#ff0000",
    gridwidth: "2",
    autorange: true,
  },


};
var config = { responsive: true, displayModeBar: false, type: "scatter", };


var temperatureTrace1 = {
  x: [0],
  y: [0],


  name: "Temperature",
  mode: "lines",   //+markers",
  type: "scatter",
};


var temperatureTrace2 = {
  x: [0],

  y: [0],


  name: "Temperature",
  mode: "lines",   //+markers",
  type: "scatter",
};
// Fonction pour dessiner un graphique sur un canvas
function drawGraph(canvasId, x, y, label) {

  var data_update = {
    x: [x],
    y: [y],
  
  };
  Plotly.update(canvasId, data_update);

  
}

