// Import MQTT service
import { MQTTService } from "./mqttService.js";

// Target specific HTML items
const sideMenu = document.querySelector("aside");
const menuBtn = document.querySelector("#menu-btn");
const closeBtn = document.querySelector("#close-btn");
const themeToggler = document.querySelector(".theme-toggler");


const TittlePage = document.getElementById("TittlePage");

const OKmyPopupvalue = document.getElementById("OKmyPopupvalue");
const ResetMQTT = document.getElementById("ResetMQTT");


const popuptext = document.getElementsByClassName("popuptext");
let termid=0
let chcroc=""
// Exemple d'utilisation
let historyData = {};
let lasttime="00:00:00"
let countappuis=0 

let OState=-1
let NState=-1

var SelectedDevice = "?"



// Déclaration d'un tableau vide pour stocker les capteurs
let ListedeSensor = [];

  const options_hive = {
  username: 'hivemq.webclient.1705178009968',
  password: '013A2BSDqGCpa&sm,.:r'
 };  

let SERVER_HIVE = "wss://811bda171b64435d9323de3dac2d9bbf.s1.eu.hivemq.cloud:8884/mqtt"




/*
let ListedeSensor = [];

const options_hive = {
  username: 'hivemq.webclient.1705178009968',
  password: '013A2BSDqGCpa&sm,.:r'
};

let SERVER_HIVE = "wss://f9aa77ab.emqx.cloud:8084/mqtt"
*/




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
  const pot = document.getElementById("pot_" + idfromcreat);
  const clickedElement = ListedeSensor.find(element => element.SelectedDevice === idfromcreat);

if  ( idfromcreat==undefined)
	return;

  pot.addEventListener("click", (event) => {
    var clickedId = event.currentTarget.id;

    console.log(clickedId);
    clickedId = clickedId.replace("pot_", "")

    // Vérifier si clickedId est égal à -1, utiliser idfromcreat à la place
 //   const actualClickedId = clickedId === '-1' ? idfromcreat : clickedId;

    // Trouver l'élément dans ListedeSensor qui correspond à actualClickedId
    const clickedElement = ListedeSensor.find(element => element.SelectedDevice == clickedId);
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

      //  document.getElementById(`${'pot'+idfromcreat}-text`).innerText = clickedElement.Short_name;
      location.reload();
    }
  });

  // Assurez-vous d'accéder à l'élément avec le bon ID
  if (clickedElement != undefined)
    document.getElementById(`${'pot_' + idfromcreat}-text`).innerText = clickedElement.Short_name;
}


ResetMQTT.addEventListener("click", () => {
	
	var topic = "home/OMG_ESP32_LORA/commands/MQTTtoSYS/config"
	var textit='{"cmd":"restart"}'
	 
mqttService.publish(topic, textit, { retain: false, expiryInterval: 0 });

	var topic = "home/OMG_ESP32_LORA2/commands/MQTTtoSYS/config"
	var textit='{"cmd":"restart"}'
	 
mqttService.publish(topic, textit, { retain: false, expiryInterval: 0 });


})
/*
    MQTT Settings Update Function

    This function handles the update of MQTT settings based on user input.
*/

// Event listener for the button click
OKmyPopupvalue.addEventListener("click", () => {
  // MQTT topic based on user settings
  var topic = `home/Sensor/${getCookie("SelectedDevice")}/Settings`;

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

  // Flag to check if the first element has been added
  var isFirstElementAdded = false;

  // Loop through input elements
  for (var i = 0; i < inputElements.length; i++) {
    // Check if the value or ID is empty
    if (inputElements[i].value.trim() === "" || inputElements[i].id === "") {
      continue;  // Ignore empty elements
    }

    // Handle "Efface" and "Nouveau" cases
    if ((action === "Efface" && inputElements[i].id === "Efface") || (action === "Nouveau" && inputElements[i].id === "Nouveau")) {
      continue;  // Ignore "Efface" or "Nouveau" element
    }

    // Add a comma for non-first elements
    if (isFirstElementAdded) {
      textit += ',';
    } else {
      isFirstElementAdded = true;
    }

    // Construct the JSON string based on the element type
    if (inputElements[i].id === "Nouveau" && inputElements[i].value.trim() !== "") {
      textit += `"${inputElements[i].value}":"${inputElements[i].value}"`;
    } else {
      textit += `"${inputElements[i].id}":"${inputElements[i].value}"`;

      // Update the page title with the first non-empty element's value
      if (!isFirstElementAdded) {
        TittlePage.innerHTML = inputElements[i].value;
      }
    }

    // Add the element to the unique elements object
    uniqueElements[inputElements[i].id] = true;
  }

  // Complete the JSON string
  textit += '}';

  // Publish the updated settings to the MQTT topic
  mqttService_Hive.publish(topic, textit, { retain: true, expiryInterval: 0 });
});


menuBtn.addEventListener("click", () => {
  sideMenu.style.display = "block";
});

closeBtn.addEventListener("click", () => {
  sideMenu.style.display = "none";
});


themeToggler.addEventListener("click", () => {

  var popup = document.getElementById('myPopup');
  popup.classList.toggle('show');

});

/*
  Plotly.js graph and chart setup code
*/


var chauffeauHistoryDiv = document.getElementById("chauffeau-history");
var temperatureHistoryDiv = document.getElementById("temperature-history");
var voltageHistoryDiv = document.getElementById("voltage-history");
var humidityHistoryDiv = document.getElementById("humidity-history");


const historyCharts = [
  chauffeauHistoryDiv,
  temperatureHistoryDiv,
  voltageHistoryDiv,
  humidityHistoryDiv,

];


  // Création des traces
    var chauffeauTrace = {
      x: [],
      y: [],
      name: "TR",
      mode: "lines",
      type: "scatter",  // Le type doit être "scatter" pour les lignes
	      marker: {
        color: []
      }
    };

  // Création des traces
    var chauffeauTraceIn = {
      x: [],
      y: [],
      name: "TIn",
      mode: "lines",
      type: "scatter",  // Le type doit être "scatter" pour les lignes
	      marker: {
        color: []
      }
    };
    var chauffeauTraceOut = {
      x: [],
      y: [],
      name: "TOut",
      mode: "lines",
      type: "scatter",  // Le type doit être "scatter" pour les lignes
	      marker: {
        color: []
      }
    };

    var chauffeauState = {
      x: [],
      y: [],
      name: "ST",
      type: 'bar',
      marker: {
        color: []
      }
    };


var temperatureTrace = {
  x: [],
  y: [],
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


// History Data
/*
var temperatureTrace = {
  x: [1],
  y: [10],

  error_y: { color: 'f44', symmetric: false, array: [10], arrayminus: [5], type: 'data', visible: true },


  name: "Temperature",
  mode: "lines",   //+markers",
  type: "scatter",
};


*/
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
  margin: { t: 40, b: 120, l: 40, r: 50, pad: 10 },
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






var chauffeauLayout = {
  // autosize: true,

  title: {
    text: "Chauffe-eau",
  },

  font: {
    size: 14,
    color: chartFontColor,
    family: "poppins, san-serif",
  },
  colorway: ["#05AD86"],
  margin: { t: 40, b: 120, l: 40, r: 50, pad: 10 },
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
  margin: { t: 40, b: 120, l: 40, r: 50, pad: 0 },
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
  margin: { t: 40, b: 120, l: 40, r: 50, pad: 0 },
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


function createPotLink(id, text, color = "red", additionalIcon = "device_thermostat") {
  const potLink = document.createElement("a");
  potLink.href = "#";
  potLink.classList.add("active");
  potLink.id = id;

  const spanIcon = document.createElement("span");
  spanIcon.classList.add("material-symbols-sharp");
  spanIcon.textContent = " dashboard ";

  const spanIconTemp = document.createElement("span");
  spanIconTemp.classList.add("material-symbols-sharp", "custom-color");

  spanIconTemp.classList.add("material-symbols-sharp");
  spanIconTemp.textContent = additionalIcon



  spanIconTemp.style.color = color; // Définir la couleur dynamique
  spanIconTemp.style.fontSize = "3rem"; // Définir la taille de police dynamique



  const h2Text = document.createElement("h2");
  h2Text.id = `${id}-text`;
  h2Text.textContent = text;

  potLink.appendChild(spanIconTemp);


  potLink.appendChild(h2Text);

  return potLink;
}




var config = { responsive: true, displayModeBar: false, type: "scatter", };

// Event listener when page is loaded
window.addEventListener("load", (event) => {
  // testjs()
  
  Plotly.newPlot(chauffeauHistoryDiv, [chauffeauTrace,chauffeauTraceIn,chauffeauTraceOut,chauffeauState], chauffeauLayout, config);
  Plotly.newPlot(temperatureHistoryDiv, [temperatureTrace], temperatureLayout, config);
  Plotly.newPlot(voltageHistoryDiv, [voltageTrace], voltageLayout, config);
  Plotly.newPlot(humidityHistoryDiv, [humidityTrace], humidityLayout, config);

  historyData = JSON.parse(getCookiehisto('historyData')) || {};

attachButtonHandlers()

  StartDiscoSensor()


  const checkboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');
  
  
  // Ajoutez un écouteur d'événement click à chaque checkbox
    checkboxes.forEach(function(checkbox) {
        checkbox.addEventListener("click", function() {
            saveCheckboxState(this); // Appel de la fonction saveCheckboxState avec le checkbox cliqué comme argument
        });
    });


// lire les checkbox
 const cookies = document.cookie.split('; ');
    cookies.forEach(cookie => {
        const [name, value] = cookie.split('=');
        const checkbox = document.getElementById(name);
        if (checkbox) {
            checkbox.checked = (value === 'true'); // Convertir la chaîne en booléen
        }
    });
	

    const elements = document.querySelectorAll('.checkbox-group');
    // Définit le style display de chaque élément à 'none'
    elements.forEach(element => {
        element.style.display = 'none';
    });
	

  const sidebar = document.querySelector(".sidebar");

  var SelectedDevice = getCookie("SelectedDevice")

  if (SelectedDevice == undefined) {
    document.cookie = "SelectedDevice = Yaourt1"         // object
    document.cookie = "Name_OMG= OMG_ESP32_LORA"
    document.cookie = "TitleText = Selectionner par le menu"
    document.cookie = "Has_Battery= 1"
    document.cookie = "Has_Humidity= 1"

 //   document.getElementById("Libelle").value = getCookie("SelectedDevice")  // Libelle=element du menu de gauche
    SelectedDevice = "Yaourt1";
  }

  else {
    var Name_OMG = getCookie("Name_OMG")

    var Has_Battery = getCookie("Has_Battery")
    if (Has_Battery == 1)
      var val = "block";
    else
      var val = "none";


    TittlePage.innerHTML = getCookie("TitleText")  //Libelle=element du menu de gauche

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


	const chauffeau = document.getElementById("chauffeau-history");
		chauffeau.style.display = "none"
 

  }

 // var sensorin = getCookie("sensor");
 // sensorin = JSON.parse(sensorin);

 // for (var i = 0; i < sensorin.length; i++) {
 //   var r = sensorin[i];
 //   updateDiscovery(r.topic, r.info);
 // }



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
let  cumulpression=0;

// Callback function that will retrieve our latest sensor readings and redraw our Gauge with the latest readings
function since() {

  var today = new Date();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

  var date1 = new Date("2013/04/09 " + time)
  var date2 = new Date("2013/04/09 " + mqttupdated.textContent);

  var tmp = (date1 - date2) / 1000
  if (tmp > 3600)
    tmp = tmp - 3600
 // console.log(mqttupdated.textContent, time, tmp)
  mqttupdatedsec.textContent = tmp
  setTimeout(since, 1000);

}
var inc=20
function updateSensorReadings(topic, jsonResponse, copyhive) {
 // console.log(typeof jsonResponse);
 // console.log(jsonResponse);

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
    let rssi = Number(jsonResponse.rssi).toFixed(2);


    updateBoxes(temperature, voltage, battery, voltage, rssi); //use volatge comm humidi

  }

  if (jsonResponse.Date !== undefined)     // cas reception des MERGES
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


    if (copyhive == true) {
      const messageResponse = JSON.stringify(jsonResponse);
      initializeMQTTConnection_Hive(SERVER_HIVE,);

      mqttService_Hive.publish(topic, messageResponse, { retain: true, expiryInterval: 0 })
    }



    processMqttMessage(topic, jsonResponse);
    console.log("historyData:", historyData);

    // xArray.push(ctr++);
    // xArray.push(ctr++);

    // var t1= time.split("/")   //12-11-2023/21-34-06
    // var t2=t1[1].split("-")

    // xArray.push(t2[0]+":"+t2[1] ); 

  }


 if (jsonResponse.donotmerge !== undefined)     // croquette
 {
	console.log("reception donotmerge / chat :",jsonResponse)
 
	 let idategraph = document.getElementById('dategraph');
	 if (  jsonResponse.timestamp.includes(idategraph.innerHTML)   )
	 {
		if (jsonResponse.gpio="LOW")
			 {

			const timestampParts = jsonResponse.timestamp.split(' ');

			// Vérifier qu'il y a au moins trois champs
		
				const secondField = timestampParts[1];
	  //          secondField = secondField.replace(document.getElementById('idategraph').innerHTML, "");

			//  addToTerminal(secondField+" "+jsonResponse.risingEdgeCount )
				hideElementsByClass("insights")
				hideElementsByClass("history-charts")
				hideElementsByClass("update-section")
				
			
			const time1 = lasttime
			const time2 = secondField;
			const result = subtractTimes(time2, time1);
			lasttime=secondField

			countappuis++
			
			if (result>15*60)  //15mn
			{termid++;
					 cumulpression=0;	
			}
							 
							 
				if (termid&1)
					var color="#eccccc"
				else
					var color="#cccca0"	
				
		//		ajoutTerm("terminal"+termid, color,secondField+" "+jsonResponse.risingEdgeCount ) 
				let pr=toTimeStringsimple(result)
		
						// Vérifier si elapsedTime existe, sinon l'initialiser à 0
				jsonResponse.elapsedTime = jsonResponse.elapsedTime || 0;

cumulpression=cumulpression+jsonResponse.elapsedTime
 
ajoutTerm(
  "terminal" + termid, 
  color, 
  "<table style='width: 100%;'><tr>" +
  "<td style='width: 10%;'>" + secondField + "</td>" +
  "<td style='width: 32%;'>" + "+"+pr + "</td>" +
  "<td style='width: 40%;'>p:" + jsonResponse.elapsedTime + "ms/" + cumulpression + "ms</td>" +
  "</tr></table>"
);
				 
			 }
			 
		 document.getElementById(`Lasttriger`).innerText = "Dernier appui a :" +jsonResponse.timestamp + " cycles: "+termid+ " totaljour:"  +countappuis ;

	 }
 
	}
	
	
	 if (/*jsonResponse.model == "Chauffeau"  &&*/  jsonResponse.getparametre!== undefined  ) 
	 
		{
        console.log("getparam " + jsonResponse.getparametre);
        console.log("getparam " + jsonResponse.val);

  //     console.log("clear " + topic);

 //     mqttService.publish(topic, "", { retain: true, expiryInterval: 0 })  //vide le message


        const tableBody = document.querySelector('#parametrechauffeau tbody');
        let rowExists = false;

        // Vérifiez si une ligne avec le même getparametre existe déjà
        for (const row of tableBody.rows) {
            if (row.cells[0].textContent === jsonResponse.getparametre) {
                rowExists = true;

                // Remplacez le contenu de la ligne existante
                row.cells[1].textContent = jsonResponse.value;
                row.cells[2].querySelector('input').value = jsonResponse.value;
				if (jsonResponse.nextparametre)
					GetChauffeauParam(jsonResponse.nextparametre)   //demande le parametre suivant


                break;
            }
        }

        // Si la ligne n'existe pas, créez-en une nouvelle
        if (!rowExists) {
            const row = document.createElement('tr');

            const paramCell = document.createElement('td');
            paramCell.textContent = jsonResponse.getparametre;
            row.appendChild(paramCell);

            const valueCell = document.createElement('td');
            valueCell.textContent = jsonResponse.value;
            row.appendChild(valueCell);

            const newValueCell = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'text';
            input.value = jsonResponse.value;
            newValueCell.appendChild(input);
            row.appendChild(newValueCell);

			console.log(`get nextparam  ${jsonResponse.nextparametre} `);
			if (jsonResponse.nextparametre)
				GetChauffeauParam(jsonResponse.nextparametre)
				
				
            const actionCell = document.createElement('td');
            const button = document.createElement('button');
            button.textContent = 'Envoyer';
            button.addEventListener('click', () => {
                const newValue = input.value;
               console.log(`Nouvelle valeur  ${jsonResponse.getparametre}: ${newValue}`);
              Sendparam(jsonResponse.getparametre,newValue)
                // Ajoutez le code pour envoyer la nouvelle valeur au serveur ici
            });
            actionCell.appendChild(button);
            row.appendChild(actionCell);

            tableBody.appendChild(row);
        }
    }
	 
	// chauffeau
	 if (jsonResponse.NState !== undefined  )     // terminal chauffeau
	{
	   const elements = document.querySelectorAll('.checkbox-group');
    // Définit le style display de chaque élément à 'block' (ou tout autre valeur appropriée)
    elements.forEach(element => {
        element.style.display = 'block';
    });
	console.log("reception NState / chauffeau :")
	
     if (jsonResponse.OState == OState && jsonResponse.NState == NState) {
        const container = document.getElementById('terminalcontainer');
        
        // Vérifie si le conteneur a plus de deux enfants
        if (container && container.children.length > 3) {
            try {
                const lastDiv = container.lastElementChild;
                const secondLastDiv = lastDiv.previousElementSibling;

                if (lastDiv && secondLastDiv && lastDiv.tagName === 'DIV' && secondLastDiv.tagName === 'DIV') {
                    const lastRow = lastDiv.querySelector('tr');
                    const firstTd = lastRow.cells[0].textContent;
                    const secondTd = lastRow.cells[2].textContent;
                    console.log('Premier champ:', firstTd);
                    console.log('Second champ:', secondTd);
					OState=firstTd
					NState=secondTd
                    // Supprime les deux derniers <div>
                    container.removeChild(lastDiv);
                    container.removeChild(secondLastDiv);
                }
            } catch (error) {
                console.error('Erreur lors de la suppression des derniers éléments:', error);
            }
        }
    }
	else
	{
	OState=jsonResponse.OState 
	NState=jsonResponse.NState 
	}
	
	
	
	
    var TitleText = getCookie("TitleText")
    TittlePage.innerHTML = TitleText + " (" + jsonResponse.name + ")";
    mqttupdated.textContent = jsonResponse.Time.split('/')[1].replaceAll('-', ':')

   setTimeout(since, 1000);
  
	let t=jsonResponse.Time.split('/')

	 let idategraph = document.getElementById('dategraph');
	 if (  jsonResponse.id.includes( transformDate (idategraph.innerHTML) )  )
	 {
		// console.log(jsonResponse);
		//	console.log(t[1])
			// if (isTimeLessThan(t[1],"14-00-00"))
		//		 return
				 
			if ( !	 isTimeInRange(t[1]))
				return
				 
				 
			ajoutTerm(
			  "terminal" + termid, 
			  "#eccccc", 
			"<td style=''>" + jsonResponse.Time  + "</td><td>--------uptime: </td><td>"+  Math.floor((jsonResponse.Elapsed / 60) * 10) / 10   +"mn</td>  </tr>  </tr>" 
			);
			
	
			ajoutTerm(
			  "terminal" + termid, 
			  "#cccca0"	, 
			  "<table style='width: 100%;'><tr>" +
			

			  "<td style=''>" + jsonResponse.OState  + "</td>" +
			"<td style=''>durée:" + jsonResponse.D  + "</td>" +
	
			  "<td style=''>" + jsonResponse.NState  + "</td>" +
			  "<td style=''>" + jsonResponse.T1  + "</td>" +
			  "<td style=''>" + jsonResponse.T2  + "</td>" +
			  "<td style=''>" + jsonResponse.TR  + "</td>" +
			  "</tr></table>"
			);
			
			 //   burstupdateCharts(jsonResponse.Time, String(jsonResponse.TR), String(jsonResponse.TR), String(jsonResponse.TR), temperatureHistoryDiv);
		  var arDate = transformDateString(jsonResponse.Time)
		 
		  var arstate = String(jsonResponse.NState)
		
 

		  var data_update = {
	  x: [[arDate], [arDate] ,  [arDate], [arDate]],
      y: [[String(jsonResponse.TR)], 
	      [String(jsonResponse.T1)],
		  [String(jsonResponse.T2)],
		  [ stateIndices[arstate]*5 +5 ]   ],
		  
	  'marker.color': [
    [null],
    ['rgb(255, 0, 0)'],
    ['rgb(0, 0, 255)'],
    [getColor( stateIndices[arstate] )]
  ]

  
			}
		 

		 Plotly.extendTraces(chauffeauHistoryDiv, data_update,[0,1,2,3]);
 
  

		const temperature = document.getElementById("temperature-history");
		temperature.style.display = "none"
 
inc++			
		
	const chauffeau = document.getElementById("chauffeau-history");
		chauffeau.style.display = "block"
 		
		

		
		 }
			 
	//	 document.getElementById(`Lasttriger`).innerText = "Dernier appui a :" +jsonResponse.timestamp + " cycles: //"+termid+ " totaljour:"  +countappuis ;

	 
 
	}
	
	
}







   function toggleAll(source) {
            let checkboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');
            for (let checkbox of checkboxes) {
                checkbox.checked = source.checked;
            }
        }

        function isTimeInRange(timeStr) {
            const currentDate = new Date();
            const targetDate = new Date();
            const [hours, minutes, seconds] = timeStr.split('-').map(Number);

            targetDate.setHours(hours, minutes, seconds);

             let minus12h = document.getElementById('minus12h').checked;
             let minus6h = document.getElementById('minus6h').checked;
            let minus1h = document.getElementById('minus1h').checked;
            let minus30mn = document.getElementById('minus30mn').checked;
            let minus10mn = document.getElementById('minus10mn').checked;

            if (document.getElementById('all').checked) {
                return true;
            }

            let rangeStart = new Date(currentDate);
            let rangeEnd = new Date(currentDate);

           if (minus12h) {
                rangeStart.setHours(currentDate.getHours() - 12);
            }
  
            if (minus6h) {
                rangeStart.setHours(currentDate.getHours() - 6);
            }
            if (minus1h) {
                rangeStart.setHours(currentDate.getHours() - 1);
            }
            if (minus30mn) {
                rangeStart.setMinutes(currentDate.getMinutes() - 30);
            }
            if (minus10mn) {
                rangeStart.setMinutes(currentDate.getMinutes() -10);
            }

            return targetDate >= rangeStart && targetDate <= rangeEnd;
        }


   // Définir la liste des chaînes
  /*  var states = [
     "OFF",
    "DUTY",
    "?R?",
    "ON",
	"OFF_D"
     ];
	 */
    // Fonction pour obtenir une couleur basée sur une valeur
    function getColor(value) {
      if (value == 0) return 'rgb(0, 0, 255)';  // 
      if (value == 1 ) return 'rgb(50, 255, 50)';  // 
       if (value == 2 ) return 'rgb(0, 0, 255)';  // 
       if (value == 3 ) return 'rgb(255, 0, 0)';  // 
       if (value == 4 ) return 'rgb(0, 0, 255)';  // 
    
    }
	
	
   // Définir la liste des chaînes
    var states = [
     "OFF",
    "DUTY",
    "?R?",
    "ON",
	"OFF_D"
     ];
	
   			
    // Créer un objet d'association des chaînes avec des indices
    var stateIndices = {};
    for (var i = 0; i < states.length; i++) {
      stateIndices[states[i]] = i;
    }


   // Fonction pour convertir une heure au format HH:MM:SS en secondes
    function timeToSeconds(timeStr) {
      const [hours, minutes, seconds] = timeStr.split('-').map(Number);
      return hours * 3600 + minutes * 60 + seconds;
    }

    // Fonction pour comparer deux heures au format HH:MM:SS
    function isTimeLessThan(time1, time2) {
      return timeToSeconds(time1) < timeToSeconds(time2);
    }

		
//js: transform chaine date   24-06-2024/00-01-10   en 2024-06-24 00:19
function transformDateString(dateStr) {
  // Séparer la date et l'heure
  let [datePart, timePart] = dateStr.split('/');

  // Séparer les parties de la date
  let [day, month, year] = datePart.split('-');

  // Séparer les parties de l'heure
  let [hours, minutes, seconds] = timePart.split('-');

  // Reformatage de la date
  let formattedDate = `${year}-${month}-${day}`;

  // Calculez les minutes
  let totalMinutes = parseInt(minutes) + Math.floor(parseInt(seconds) / 60);

  // Reformatage de l'heure
  let formattedTime = `${hours.padStart(2, '0')}:${totalMinutes.toString().padStart(2, '0')}:00`;

  // Combine date and time
  let result = `${formattedDate} ${formattedTime}`;

  return result;
}


function transformDate(isoDate) {
    // Split the input date into year, month, and day
    let parts = isoDate.split('-');
    let year = parts[0];
    let month = parts[1];
    let day = parts[2];

    // Return the transformed date in DD-MM-YYYY format
    return `${day}-${month}-${year}`;
}

   function toTimeStringsimple(totalSeconds) {
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            let result = '';

            // Ajouter les heures si elles ne sont pas égales à 0
            if (hours > 0) {
                result += `${hours}H `;
            }

            // Ajouter les minutes si elles ne sont pas égales à 0
            if (minutes > 0) {
                result += `${minutes}min `;
            }

            // Toujours ajouter les secondes
            result += `${seconds}s`;

            return result.trim();
        }



       function parseTime(timeStr) {
            const parts = timeStr.split(':');
            const hours = parseInt(parts[0], 10);
            const minutes = parseInt(parts[1], 10);
            const seconds = parseInt(parts[2], 10);
            return { hours, minutes, seconds };
        }

        function toSeconds(time) {
            return time.hours * 3600 + time.minutes * 60 + time.seconds;
        }

        function toTimeString(totalSeconds) {
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }

        function subtractTimes(time1, time2) {
            const t1 = parseTime(time1);
            const t2 = parseTime(time2);

            const seconds1 = toSeconds(t1);
            const seconds2 = toSeconds(t2);

            let diffSeconds = seconds1 - seconds2;

            // Handle negative difference by taking the absolute value
            const isNegative = diffSeconds < 0;
            if (isNegative) {
                diffSeconds = Math.abs(diffSeconds);
            }

      //      const result = toTimeString(diffSeconds);
        //    return isNegative ? '-' + result : result;
			return diffSeconds;
			
        }
		
		

        function hideElementsByClass(className) {
            // Sélectionner tous les éléments ayant la classe spécifiée
            var elements = document.querySelectorAll('.' + className);
            
            // Parcourir chaque élément et masquer son affichage
            elements.forEach(function(element) {
                element.style.display = 'none';
            });
        }


 function ajoutTerm(id, color,textmes) {
            // Sélectionnez le conteneur
            const container = document.getElementById('terminalcontainer');

            // Créez un nouvel élément div
            const newDiv = document.createElement('div');

            // Définir l'id et le style du nouvel élément
            newDiv.id = id;
            newDiv.style.backgroundColor = color;
            newDiv.style.fontSize = '16px';

            // Optionnel: Ajoutez du contenu au nouvel élément
            newDiv.innerHTML = textmes;

            // Ajoutez le nouvel élément au conteneur
            container.appendChild(newDiv);
        }
		
		
 function addToTerminal(text) {
    var terminal = document.getElementById('terminal');
    var isNewContentAdded = false;

    // Add your new content to the terminal here
    // For demonstration purposes, I'm just appending a timestamp
    var timestamp = new Date().toLocaleTimeString();
    terminal.innerHTML += '<p>' +  text + '</p>';
    isNewContentAdded = true;

    // Scroll to the bottom if new content is added
    if (isNewContentAdded) {
      terminal.scrollTop = terminal.scrollHeight;
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


function updateBoxes(temperature, voltage, battery, humidity, rssi) {
  let temperatureDiv = document.getElementById("temperature");
  let voltageDiv = document.getElementById("voltage");
  let batteryDiv = document.getElementById("battery");
  let humidityDiv = document.getElementById("humidity");
  let rssiDiv = document.getElementById("rssi");

  temperatureDiv.innerHTML = temperature + " °C";
  voltageDiv.innerHTML = voltage + " mV";
  batteryDiv.innerHTML = battery + " %";
  humidityDiv.innerHTML = humidity + " %";
  if (rssi == "NaN")
    rssiDiv.innerHTML = "";
  else
    rssiDiv.innerHTML = "Rssi Lora: " + rssi + "db";
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
const mqttStatus_Hive = document.querySelector(".status_Hive");
const mqttStatus = document.querySelector(".status");
const mqttupdated = document.querySelector(".updated");
const mqttupdatedsec = document.querySelector(".updatedsec");

var mqttService
var mqttService_Hive


function onConnect_Hive(message) {
  mqttStatus_Hive.textContent = "Connected to hive broker";
}
function onConnect(message) {
  mqttStatus.textContent = "Connected to emqx broker";
}


function onMessage_Hive(topic, message) {
  var stringResponse = message.toString();
 console.log(stringResponse)

if  ( stringResponse=="{}")
		return;

  stringResponse = stringResponse.replace('id:', '"id":');
  stringResponse = stringResponse.replace('visiblename:', '"visiblename":');
  console.log(stringResponse)

  var messageResponse = JSON.parse(stringResponse);
  if (topic.search("Sensor") != -1) {
    updateDiscovery(topic, messageResponse);

  }

  var SelectedDevice = getCookie("SelectedDevice")
  let indexElement = ListedeSensor.findIndex(element => element.SelectedDevice === SelectedDevice);
  if (indexElement != -1)
    ajouterOuRemplacerElements(ListedeSensor[indexElement])


  if (messageResponse.hex == undefined && messageResponse.name !== undefined)
    updateSensorReadings(topic, messageResponse, 0)   // 0 ne pas reposter sur hive


}


function onMessage(topic, message) {
  var stringResponse = message.toString();


  stringResponse = stringResponse.replace('id:', '"id":');
  stringResponse = stringResponse.replace('visiblename:', '"visiblename":');
 // console.log("recept:",stringResponse)
try {
  var messageResponse = JSON.parse(stringResponse);
}
catch (error) {
    console.error("Error parsing JSON:", error+stringResponse);
    // Handle the error (e.g., set messageResponse to a default value, notify the user, etc.)
    var messageResponse = {}; // or any other default/fallback value

}

  if (topic.search("Sensor") != -1) {
	  console.log("reception Sensor :",messageResponse)

    updateDiscovery(topic, messageResponse);
    return
  }


  if (messageResponse.hex == undefined && messageResponse.name !== undefined)
    updateSensorReadings(topic, messageResponse, 1);
  else {
    console.log("skip:" + topic)

  }


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

function onError_Hive(error) {
  console.log(`Error encountered Hive :: ${error}`);
  mqttStatus_Hive.textContent = "Error";
}

function onClose_Hive() {
  console.log(`MQTT connection closed onClose_Hive !`);
  mqttStatus_Hive.textContent = "Closed";
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
* Fonction de mise à jour de la découverte.
*
* Cette fonction est utilisée pour gérer la mise à jour des découvertes en fonction des messages reçus via MQTT.
*
* @param {string} topic - Le sujet du message MQTT.
* @param {any} messageResponse - La réponse du message MQTT.
*
* @returns {void} Aucun retour, la fonction effectue des opérations de mise à jour sur ListedeSensor et le document HTML.
*/

// Fonction de mise à jour de la découverte



function updateDiscovery(topic, messageResponse) {
  console.log("updateDiscovery;", topic, messageResponse);

  const tableauElements = topic.split('/');
  const dernierElement = tableauElements[tableauElements.length - 1];
  const avantdernierElement = tableauElements[tableauElements.length - 2];

  if (dernierElement !== "Settings" )
  {
    let nouvelElement = {
      pot: ListedeSensor.length + 1,
      SelectedDevice: dernierElement,
      Name_OMG: tableauElements[1],
      Short_name: messageResponse.visiblename,
      TitleText: messageResponse.visiblename,
	  Has_Battery:"0",
	  Has_Humidity:"0"
	 };

    let indexElementExistant = ListedeSensor.findIndex(element => element.SelectedDevice === nouvelElement.SelectedDevice);

    if (indexElementExistant !== -1) {
      console.log("existe deja !");
    } else {
      ListedeSensor.push(nouvelElement);
      console.log("Élément ajouté avec succès !");

      const sidebar = document.querySelector(".sidebar");
      const potLink = createPotLink(`pot_${nouvelElement.SelectedDevice}`, nouvelElement.SelectedDevice);
      sidebar.appendChild(potLink);

      addClicker(nouvelElement.SelectedDevice);
console.log("subscrito to  !", SERVER_HIVE,"home/Sensor/#");
      initializeMQTTConnection_Hive(SERVER_HIVE, "home/Sensor/#");
    }
  } 
  
  
  else {
	  
var cookieValue = getCookie("sensor");
var sensorin;

if (cookieValue) {
  sensorin = JSON.parse(cookieValue);
} else {
  console.error("Le cookie 'sensor' n'existe pas.");
  // Ou effectuer une autre action en conséquence, par exemple initialiser sensorin à une valeur par défaut.
  sensorin = [];
}


	
    let sensor = { 'topic': topic, 'info': messageResponse };
    let indexElementCook = sensorin.findIndex(existingSensor => existingSensor.topic === sensor.topic);

    if (indexElementCook !== -1) {
      sensorin[indexElementCook] = sensor;
      console.log("existe cookies sensor:", sensorin);
    } else {
      sensorin.push(sensor);
      console.log("set cookies sensor:", sensorin);
    }

    setCookie("sensor", JSON.stringify(sensorin));

    const indexElementExistant = ListedeSensor.findIndex(element => element.SelectedDevice === avantdernierElement);
    const updateElement = messageResponse;

    if (indexElementExistant !== -1) {
      ListedeSensor[indexElementExistant] = updateElement;
      addClicker(updateElement.SelectedDevice);

      const potTextElement = document.getElementById(`pot$_{ListedeSensor[indexElementExistant].SelectedDevice + 1}-text`);
      if (potTextElement) {
        potTextElement.innerText = updateElement.Short_name;
      }
    } else {
      ListedeSensor.push(updateElement);
      console.log("Élément ajouté avec succès !");

      const sidebar = document.querySelector(".sidebar");
      const potLink = createPotLink(`pot_${updateElement.SelectedDevice}`, updateElement.Short_name);
      sidebar.appendChild(potLink);

      addClicker(updateElement.SelectedDevice);

      initializeMQTTConnection_Hive(SERVER_HIVE, "home/Sensor/#");
    }
  }
}








function StartDiscoSensor() {

  initializeMQTTConnection("ws://broker.emqx.io:8083/mqtt", "home/" + "OMG_ESP32_LORA" + "/MERGEtoMQTT/Sensor/#")
   
  initializeMQTTConnection("ws://broker.emqx.io:8083/mqtt", "home/" + "OMG_ESP32_LORA2" + "/MERGEtoMQTT/Sensor/#")

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

      //copyall()

console.log("fetchMQTTConnection")

      //   initializeMQTTConnection("wss://811bda171b64435d9323de3dac2d9bbf.s1.eu.hivemq.cloud:8884/mqtt", "home/" + "/MERGEtoMQTT/" + "/Sensor/#");
console.log("myinitializeMQTTConnection", "home/" , Name_OMG , "GPIOInputChat", SelectedDevice , "/History/#")
     initializeMQTTConnection("wss://broker.emqx.io:8084/mqtt", "home/" + Name_OMG + "/GPIOInputChat/"+ SelectedDevice + "/History/#");

     initializeMQTTConnection("wss://broker.emqx.io:8084/mqtt", "home/" + Name_OMG + "/LORAtoMQTT/"+ SelectedDevice + "/History/#");

      initializeMQTTConnection("wss://broker.emqx.io:8084/mqtt", "home/" + Name_OMG + "/MERGEtoMQTT/" + SelectedDevice + "/LastMessage/#");

      var ladate = new Date()
      var chd = ladate.getFullYear() + "-" + padWithLeadingZeros((ladate.getMonth() + 1), 2) + "-" + padWithLeadingZeros((ladate.getDate()), 2)

      initializeMQTTConnection("wss://broker.emqx.io:8084/mqtt", "home/" + Name_OMG + "/MERGEtoMQTT/" + SelectedDevice + "/Histo/" + chd + "/#");

      let idategraph = document.getElementById('dategraph');
      var ifiltre = idategraph.innerHTML = chd

      return response.json();
    })
}





function copyall() {


  // Options de connexion pour le destinataire
  const destinationOptions = {

    username: 'hivemq.webclient.1705178009968',
    password: '013A2BSDqGCpa&sm,.:r'

  };


  const sourceMQTT = new MQTTService("wss://broker.emqx.io:8084/mqtt", {});
  const destinationMQTT = new MQTTService("wss://811bda171b64435d9323de3dac2d9bbf.s1.eu.hivemq.cloud:8884/mqtt", {});

  async function copyMessagesAndDisconnect() {
    try {
      // Connexion à la source
      await sourceMQTT.connect();

      // Connexion à la destination
      await destinationMQTT.connect(destinationOptions);

      // Copie des messages
      sourceMQTT.copyAllMessages("home/OMG_ESP32_LORA/MERGEtoMQTT/#", "home/OMG_ESP32_LORA");

      // Attendre un certain temps ou utiliser d'autres mécanismes pour déterminer que la copie est terminée

      // Déconnexion une fois que tout est terminé
      // sourceMQTT.disconnect();
      // destinationMQTT.disconnect();
    } catch (error) {
      console.error("Une erreur s'est produite lors de la copie des messages :", error);
    }
  }

  // Lancer la copie
  copyMessagesAndDisconnect();
}










var onser = 0
function initializeMQTTConnection(mqttServer, mqttTopic) {
  console.log(
    `Initializing connection to :: ${mqttServer}, topic :: ${mqttTopic}`
  );
  var fnCallbacks = { onConnect, onMessage, onError, onClose };
  if (onser == 0) {
    mqttService = new MQTTService(mqttServer, fnCallbacks);
    mqttService.connect();

    onser = 1
  }

  mqttService.subscribe(mqttTopic);
}
function initializeMQTTConnection_Hive(mqttServer, mqttTopic) {
  console.log(`Initializing connection to initializeMQTTConnection_Hive:: ${mqttServer}, topic :: ${mqttTopic}`);

  // Check if mqttService_Hive is not already created
  if (!mqttService_Hive) {
    var fnCallbacks = { onConnect_Hive, onMessage_Hive, onError_Hive, onClose_Hive };
    mqttService_Hive = new MQTTService(mqttServer, fnCallbacks);
    mqttService_Hive.connect(options_hive) // Pass options to the connect method
      .then(() => {
        if (mqttTopic) {
          mqttService_Hive.subscribe(mqttTopic);
        }
      })
      .catch((error) => {
        console.error('Error connecting to MQTT for Hive:', error);
        // Handle the error accordingly
      });
  } else {
    // If mqttService_Hive is already created, subscribe to the new topic if provided
    if (mqttTopic) {
      mqttService_Hive.subscribe(mqttTopic);
    }
  }
}


// On ajoute au prototype de l'objet Date une méthode personnalisée
Date.prototype.addDays = function (days) {
  // On récupère le jour du mois auquel on ajoute le nombre de jour passé en paramètre
  var day = this.getDate() + days;
  // On définit le jour du mois (This représente la date sur laquelle on effectue l'opération)
  this.setDate(day);
}



async function changefiltre(dir) {
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

  await mqttService_Hive.disconnect()
  initializeMQTTConnection("wss://broker.emqx.io:8084/mqtt", "home/" + Name_OMG + "/MERGEtoMQTT/" + SelectedDevice + "/Histo/" + filtre + "/#");

//
  initializeMQTTConnection_Hive(SERVER_HIVE, "home/" + Name_OMG + "/MERGEtoMQTT/" + SelectedDevice + "/Histo/" + filtre + "/#");



 var filtreinf = + padWithLeadingZeros((myDate.getDate()), 1)  +"-" +   padWithLeadingZeros((myDate.getMonth() + 1), 2) + "-" + myDate.getFullYear() 



console.log("myinitializeMQTTConnectionchangefiltre", "home/" , Name_OMG , "/GPIOInputChat/", SelectedDevice , "/History/"+filtreinf+ "/#")




 await mqttService.mqttClient.unsubscribe(chcroc)
  chcroc= "home/" + Name_OMG + "/GPIOInputChat/"+ SelectedDevice + "/History/"+ filtreinf + "/#"
  initializeMQTTConnection("wss://broker.emqx.io:8084/mqtt",chcroc);

 lasttime="00:00:00"
 countappuis=0 
 termid=0
   const container = document.getElementById('terminalcontainer');
container.innerHTML="";

  idategraph.innerHTML = filtre



  // Récupérer l'élément avec l'ID "dategraph"
  idategraph = document.getElementById('dategraph');
  // Récupérer la date actuelle
  let currentDate = new Date();
  // Récupérer la date dans l'élément "dategraph"
  let graphDate = new Date(idategraph.innerHTML);
  // Récupérer l'élément avec l'ID "graphContainer"
  let graphContainer = document.getElementById('graphContainer');
  // Comparer les dates
  if (graphDate > currentDate) {
    // Si la date dans "dategraph" est après la date actuelle, rendre visible
    graphContainer.style.display = 'block';
  } else {
    // Sinon, rendre invisible
    graphContainer.style.display = 'none';
  }


}


// Fonction utilitaire pour définir un cookie
function setCookie(name, value) {
  document.cookie = `${name}=${value}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
}

// Fonction principale pour traiter le message MQTT
function processMqttMessage(topic, messageResponse) {
  // Extraire la date du topic
  const dateMatch = topic.match(/(\d{4}-\d{2}-\d{2})/);
  const date = dateMatch ? dateMatch[0] : null;



  if (date && messageResponse) {
    // Extraire le nom, les températures min et max
    const { name, Jour_tmin, Jour_tmax } = messageResponse;
    if (Jour_tmin !== undefined && Jour_tmax !== undefined) {
      // Si la liste pour le nom n'existe pas, la créer
      if (!historyData[name]) {
        historyData[name] = [];
      }
      // Ajouter les données à la liste
      historyData[name] = addToHistory(historyData[name], date, Jour_tmin, Jour_tmax);
    }
  }


  // Stocker historyData dans les cookies
  setCookie('historyData', JSON.stringify(historyData));

  updatehistojour(historyData, "Yaourt1")


  return historyData;
}

// Fonction utilitaire pour ajouter des données à l'historique
function addToHistory(historyList, date, tmin, tmax) {
  // Vérifier si une entrée pour cette date existe déjà
  const existingEntry = historyList.find(entry => entry.date === date);

  // Si l'entrée existe, mettre à jour les valeurs min et max
  if (existingEntry) {
    existingEntry.tmin = tmin;
    existingEntry.tmax = tmax;
  } else {
    // Sinon, ajouter une nouvelle entrée
    historyList.push({ date, tmin, tmax });
    // Trier la liste par ordre chronologique
    historyList.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  return historyList;
}



// Fonction pour récupérer les données des cookies au lancement de la page
function getCookiehisto(name) {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split('=').map(c => c.trim());
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return null;
}



function generateValues() {
  const values = [];
  for (let i = -50; i <= 50; i += 0.1) {
    values.push(i);
  }
  return values;
}

function createFixedGradientColors(values) {
  values = generateValues()

  return values.map(value => {
    const normalizedValue = (value + 50) / 100; // Normaliser la valeur entre 0 et 1
    const red = Math.round(255 * normalizedValue);
    const blue = Math.round(255 * (1 - normalizedValue));
    return `rgba(${red}, 0, ${blue}, 1)`;
  });
}

function updatehistojour(data, item) {
  var item = getCookie("SelectedDevice");

  // Extraire les dates, tmin et tmax
  const dates = data[item].map(entry => entry.date);
  const tminValues = data[item].map(entry => entry.tmin);
  const tmaxValues = data[item].map(entry => entry.tmax);

  // Calculer la différence entre tmax et tmin
  const diffValues = tmaxValues.map((max, index) => max - tminValues[index]);


  // Créer le graphique
  const trace = {
    x: dates,
    y: diffValues,
    base: tminValues,
    type: 'bar',
    text: dates.map((date, index) => `Date: ${date}<br>Min: ${tminValues[index]}<br>Max: ${tmaxValues[index]}<br>Diff: ${diffValues[index]}`),
    hoverinfo: 'text+y'


  };

  const layout = {
    title: 'Min/Max',
    width: 350,
    autosize: true,

    margin: { t: 40, b: 120, l: 40, r: 10, pad: 0 },
    plot_bgcolor: chartBGColor,
    paper_bgcolor: chartBGColor,
  };

  const graphData = [trace];

  Plotly.newPlot('graphContainer', graphData, layout);
}


  // Fonction pour attacher les événements de clic aux boutons
    function attachButtonHandlers() {
      var buttonClasses = [
        'reset', 'incseuil', 'decseuil',
        'incintervalpompe', 'decintervalpompe',
        'incdutyoff', 'decdutyoff', 'off' , 'on' ,'getparametre'
      ];

      buttonClasses.forEach(function(buttonClass) {
        var buttons = document.getElementsByClassName(buttonClass);
        for (var i = 0; i < buttons.length; i++) {
          buttons[i].addEventListener('click', function() {
            SendMqtt(buttonClass);
          });
        }
      });
    }


  function SendMqtt(action) {
      console.log("Button clicked: " + action);
      // Implémentez ici la logique pour envoyer un message MQTT en fonction de l'action
	  	var topic = "home/OMG_ESP32_LORA/commands/MQTTtoLORA"
	var textit= '{  message: \'{id:"Chauffeau",command:"'+action+'"}\' }'
	      console.log("Button clicked: " + textit);
mqttService.publish(topic, textit, { retain: false, expiryInterval: 0 });


    }


  function Sendparam(name,value) {
     
      // Implémentez ici la logique pour envoyer un message MQTT en fonction de l'action
	  	var topic = "home/OMG_ESP32_LORA/commands/MQTTtoLORA"
	var textit= '{  message: \'{id:"Chauffeau",command:"setparametre",name:"' +name + '",value:"'+value+'" }\' }'
	      console.log("send param clicked: " + textit);
mqttService.publish(topic, textit, { retain: false, expiryInterval: 0 });


    }


  function GetChauffeauParam(paramname) {
      console.log("GetChauffeauParam: " + paramname);
      // Implémentez ici la logique pour envoyer un message MQTT en fonction de l'action
	  	var topic = "home/OMG_ESP32_LORA/commands/MQTTtoLORA"
	var textit= '{  message: \'{id:"Chauffeau",command:"getparametre",name:"'+paramname+'"}\' }'
	      console.log("GetChauffeauParam mqtt: " + textit);
mqttService.publish(topic, textit, { retain: false, expiryInterval: 0 });


    }
		
	
function saveCheckboxState(checkbox) {

      document.cookie = `${checkbox.id}=${checkbox.checked}; expires=Fri, 31 Dec 9999 23:59:59 GMT`;
	      location.reload();
}
