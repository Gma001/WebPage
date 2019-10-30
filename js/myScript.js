//Globale variabler som skal holde på datasett.
var mymyDataList  = {"entries":[]};
var theOtherList = {"entries":[]};
/*Http request som tar en url som parameter, funksjonen bruker en promise som tar to parameter, resolve og en reject,
hvis kondisjonene i if-en er tilfredsstilt skal resolve kjøres hvis ikke skal reject kjøres
*/
function getURL(url){
	return new Promise(function(resolve, reject){
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url);
		xhr.onreadystatechange = function(){
			if(xhr.readyState === 4){
				if(xhr.status === 200){
					resolve(xhr.response);
				}
				else{
					reject(xhr.statusText);
				}
			}
		};
		xhr.send();
	});
}
// Funksjon som parser dataen og legger det inn i mymyDataList og theOtherList.
function loadData(url, callback){
	var area = document.getElementById("loadingArea");
	promise = getURL(url);
	promise.then(
	function(response){
		mymyDataList = JSON.parse(response);
		theOtherList = JSON.parse(response);
		callback(theOtherList);
	}
	)
	.catch(
	function(reason){
		alert("FEIL: " + reason);
	}
	);
}
var marking = {"entries":[]};
var searchList = [];

//Funkjson som laster dataen inn på siden/sidene

function loadList(liste1){
	var liste = document.getElementById("liste");
	liste.innerHTML = "";
	marking = {"entries":[]};
	for(i = 0; i < liste1.entries.length; i++){
		var newListItem = (document.title != "Favorittlekeplass" ? document.createElement("li") : document.createElement("option"));
		var newListValue = document.createTextNode(
			document.title === "Kartet" ? liste1.entries[i].plassering :
			document.title === "Lekeplasser" || document.title === "Favorittlekeplass" ? liste1.entries[i].navn :
			document.title === "Datasett" ? liste1.entries[i].name :
			"Error"
			);

		marking.entries[i] = {lat: Number(liste1.entries[i].latitude), lng: Number(liste1.entries[i].longitude)};

		newListItem.appendChild(newListValue);
		liste.appendChild(newListItem);
	}
	if(document.title === "Kartet" || document.title === "Lekeplasser"){
		getPins();
	}
}

//Funksjon som lager kartet og legger til markers.
function getPins(){
	var bergen = {lat: 60.3913, lng: 5.3221};
	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 14,
		center: bergen
	});
	var markers = [];
	for(i = 0; i < marking.entries.length; i++){
		markers[i] = [i, new google.maps.Marker({
			position: marking.entries[i],
			label: (i + 1).toString(),
			map: map
		})];
	}
}

// Funksjon for å vise/skjule avansert søk.
function visAvansertSok(){
	document.getElementById("visAvansertSok").checked ? document.getElementById("advancedForm").style.display = "block" : document.getElementById("advancedForm").style.display = "none";
}
// søkekriterier
var searchTerm = {kjonn:"",rullestol:"0",stellerom:"0",free:"0",maks_pris:"",open_no:"",opningstid:""};

function checkGratis(){
	document.getElementById("pris").value = null;
}
function checkMaks_pris(){
	document.getElementById("gratis").checked = false;
}
function checkOpen_no(){
	document.getElementById("opningstid").value = null;
}
function checkOpningstid(){
	document.getElementById("open_no").checked = false;
}
function resetSearch(){
	searchList = [];
	searchTerm = {kjonn:"",rullestol:"0",stellerom:"0",free:"0",maks_pris:"",open_no:"",opningstid:""};
	searchInput = null;
}

/*Avansert søk, resetSearch kjøres først for at det skal ikke være noen ckeckboxes markert.
Videre sjekkes verdien på checkboxene, resultatene returneres basert på det */

function advancedSearch(){
	resetSearch();
	var kjonn = document.getElementsByClassName("kjonn");
	var rullestol = document.getElementById("rullestol").checked;
	var stellerom = document.getElementById("stellerom").checked;
	var free = document.getElementById("gratis").checked;
	var maks_pris = document.getElementById("pris").value;
	var open_no = document.getElementById("open_no").checked;
	var opningstid = document.getElementById("opningstid").value;

	if(kjonn[0].checked){
		searchTerm.kjonn = "1";
	}
	else if(kjonn[1].checked){
		searchTerm.kjonn = "0";
	}
	if(rullestol){
		searchTerm.rullestol = "1";
	}
	else{
		searchTerm.rullestol = "0";
	}
	if(stellerom){
		searchTerm.stellerom = "1";
	}
	else{
		searchTerm.stellerom = "0";
	}
	if(free){
		searchTerm.free = "1";
	}
	else{
		searchTerm.free = "0";
	}
	if(maks_pris != null && maks_pris != ""){
		searchTerm.maks_pris = maks_pris;
	}
	if(open_no){
		searchTerm.open_no = "1";
	}
	else{
		searchTerm.open_no = "0";
	}
	if(opningstid != null && opningstid != ""){
		searchTerm.opningstid = opningstid;
		if(searchTerm.opningstid.length === 1){
			searchTerm.opningstid = "0" + searchTerm.opningstid;
		}
	}
	search();
}

//Basic

function basicSearch(){
	resetSearch();
	var searchInput = document.getElementById("basicSearchInput").value.toLowerCase();
	searchInput = searchInput.split(" ");
	var tal = /^[0-9]*$/;
	for(i = 0; i < mymyDataList.entries.length; i++){
		for(j = 0; j < searchInput.length; j++){
			searchInput[i] === "mann" ? searchTerm.kjonn = "1" :
			searchInput[i] === "dame" ? searchTerm.kjonn = "0" :
			searchInput[i] === "rullestol" ? searchTerm.rullestol = "1" :
			searchInput[i] === "stellerom" ? searchTerm.stellerom = "1" :
			searchInput[i] === "gratis" ? searchTerm.free = "1" :
			tal.test(searchInput[i]) ? searchTerm.maks_pris = searchInput[i] :
			"Error"
		}
	}
	search();
}

//Søk

function search(){
	//Hovudsøk
	for(i = 0; i < mymyDataList.entries.length; i++){
		//Rullestol
		if(searchTerm.rullestol === "0" || mymyDataList.entries[i].rullestol === searchTerm.rullestol){
			//Stellerom
			if(searchTerm.stellerom === "0" || mymyDataList.entries[i].stellerom === searchTerm.stellerom){
				//Maks pris
				if(searchTerm.maks_pris != ""){
					if(mymyDataList.entries[i].pris <= searchTerm.maks_pris || mymyDataList.entries[i].pris === "NULL"){
						searchList.push(mymyDataList.entries[i]);
					}
				}
				else{
					if(searchTerm.free === "1" && mymyDataList.entries[i].pris === "0" || searchTerm.free === "1" && mymyDataList.entries[i].pris === "NULL"){
						searchList.push(mymyDataList.entries[i]);
					}
					else if(searchTerm.free === "0"){
						searchList.push(mymyDataList.entries[i]);
					}
				}
			}
		}
	}
	//Kjønn
	for(i = 0; i < searchList.length; i++){
		if(searchTerm.kjonn === "1" && searchList[i].herre != "1"){
			delete searchList[i];
			searchList.splice(i,1);
			i--;
		}
		else if(searchTerm.kjonn === "0" && searchList[i].dame != "1"){
			delete searchList[i];
			searchList.splice(i,1);
			i--;
		}
	}
	//Open nå
	var day = new Date().getDay();
	var time = new Date().getHours();
	if(searchTerm.open_no === "1"){
		if(day <= 0){
			for(i = 0; i < searchList.length; i++){
				var opneLukke = searchList[i].tid_sondag.split(" - ");
				if(time < opneLukke[0] || time > opneLukke[1]){
					delete searchList[i];
					searchList.splice(i,1);
					i--;
				}
			}
		}
		else if(day <= 5){
			for(i = 0; i < searchList.length; i++){
				var opneLukke = searchList[i].tid_hverdag.split(" - ");
				if(time < opneLukke[0] || time > opneLukke[1]){
					delete searchList[i];
					searchList.splice(i,1);
					i--;
				}
			}
		}
		else if(day > 5){
			for(i = 0; i < searchList.length; i++){
				var opneLukke = searchList[i].tid_lordag.split(" - ");
				if(time < opneLukke[0] || time > opneLukke[1]){
					delete searchList[i];
					searchList.splice(i,1);
					i--;
				}
			}
		}
	}
	//Open klokkeslett
	if(searchTerm.opningstid != ""){
		if(searchTerm.opningstid > time){
			if(day === 0){
				for(i = 0; i < searchList.length; i++){
					var opneLukke = searchList[i].tid_sondag.split(" - ");
					if(searchList[i].tid_sondag != "ALL"){
						if(searchTerm.opningstid < opneLukke[0] || searchTerm.opningstid > opneLukke[1] || searchList[i].tid_sondag === "NULL"){
							delete searchList[i];
							searchList.splice(i,1);
							i--;
						}
					}
				}
			}
			else if(day <= 5){
				for(i = 0; i < searchList.length; i++){
					var opneLukke = searchList[i].tid_hverdag.split(" - ");
					if(searchList[i].tid_hverdag != "ALL"){
						if(searchTerm.opningstid < opneLukke[0] || searchTerm.opningstid > opneLukke[1] || searchList[i].tid_hverdag === "NULL"){
							delete searchList[i];
							searchList.splice(i,1);
							i--;
						}
					}
				}
			}
			else if(day === 6){
				for(i = 0; i < searchList.length; i++){
					var opneLukke = searchList[i].tid_lordag.split(" - ");
					if(searchList[i].tid_lordag != "ALL"){
						if(searchTerm.opningstid < opneLukke[0] || searchTerm.opningstid > opneLukke[1] || searchList[i].tid_lordag === "NULL"){
							delete searchList[i];
							searchList.splice(i,1);
							i--;
						}
					}
				}
			}
		}
		else{
			day += 1;
			if(day <= 5){
				for(i = 0; i < searchList.length; i++){
					var opneLukke = searchList[i].tid_hverdag.split(" - ");
					if(searchList[i].tid_hverdag != "ALL"){
						if(searchTerm.opningstid < opneLukke[0] || searchTerm.opningstid > opneLukke[1] || searchList[i].tid_hverdag === "NULL"){
							delete searchList[i];
							searchList.splice(i,1);
							i--;
						}
					}
				}
			}
			else if(day === 6){
				for(i = 0; i < searchList.length; i++){
					var opneLukke = searchList[i].tid_lordag.split(" - ");
					if(searchList[i].tid_lordag != "ALL"){
						if(searchTerm.opningstid < opneLukke[0] || searchTerm.opningstid > opneLukke[1] || searchList[i].tid_lordag === "NULL"){
							delete searchList[i];
							searchList.splice(i,1);
							i--;
						}
					}
				}
			}
			else if(day === 7){
				for(i = 0; i < searchList.length; i++){
					var opneLukke = searchList[i].tid_sondag.split(" - ");
					if(searchList[i].tid_sondag != "ALL"){
						if(searchTerm.opningstid < opneLukke[0] || searchTerm.opningstid > opneLukke[1] || searchList[i].tid_sondag === "NULL"){
							delete searchList[i];
							searchList.splice(i,1);
							i--;
						}
					}
				}
			}
		}
	}
	theOtherList.entries = searchList;
	loadList(theOtherList);
}

// Min favorittlekeplass

var avstandsSamling = [];
function selectLekeplass(){
	loadData("https://hotell.difi.no/api/json/bergen/lekeplasser?", function(response) {
		var dropDownSelector = document.getElementById("liste");
		var selector = dropDownSelector.selectedIndex;
		document.getElementById("favorittlekeplass").innerHTML = dropDownSelector.options[selector].text;
		var her = [theOtherList.entries[selector].longitude, theOtherList.entries[selector].latitude, theOtherList.entries[selector].navn];
		loadData("https://hotell.difi.no/api/json/bergen/dokart?", function(response) {
			avstandsSamling = new Array(response.entries.length);
			for(i = 0; i < response.entries.length; i++){
				avstandsSamling[i] = new Array(2);
				avstandsSamling[i][0] = distance(her[0], her[1], response.entries[i].longitude, response.entries[i].latitude);
				avstandsSamling[i][1] = response.entries[i].plassering;
			}
			avstandsSamling.sort();
			document.getElementById("favorittlekeplass").innerHTML = "Nærmeste toalett er: " + avstandsSamling[0][1];
		});
	});
}

// Funksjone for å regne avstand mellom 2 punkt

function distance(xOne, yOne, xTwo, yTwo){
	var distance = Math.sqrt(Math.pow(xTwo - xOne, 2) + Math.pow(yTwo - yOne, 2));
	return distance;
}



function sort(){
	resetSearch();
	if(document.getElementById("firstLetterName") != null){
		sortByName(document.getElementById("firstLetterName").value);
	}
	if(document.getElementById("firstLetterAdresse") != null){
		sortByAddress(document.getElementById("firstLetterAdresse").value);
	}
	theOtherList.entries = searchList;
	loadList(theOtherList);
}
//Sortering funksjon etter første bokstav i navnet.
function sortByName(letter){
	for(i = 0; i < mymyDataList.entries.length; i++){
		if(mymyDataList.entries[i].name.charAt(0) === letter.toUpperCase() || letter === null || letter === ""){
			searchList.push(mymyDataList.entries[i]);

		}
	}
}
//Sortering funksjon etter første bokstav i addressen.
function sortByAddress(letter){
	for(i = 0; i < searchList.length; i++){
		if(searchList[i].adressenavn.charAt(0) != letter.toUpperCase() && letter != null && letter != ""){
			delete searchList[i];
			searchList.splice(i,1);
			i--;
		}
	}
}

//Funksjon for å vise/skjule datasett listene.
function hideShow(){
  if (document.title === "Kartet" || "Lekeplasser") {
    var x = document.getElementById("liste");
    if(x.style.display == "none"){
      x.style.display = "block";
    }
    else{
      x.style.display ="none";
      }
      var elem = document.getElementById("knapp1");
      if(elem.innerHTML =="Se liste")
      elem.innerHTML = "Skjul";
      else{
        elem.innerHTML ="Se liste";
      }

  }

}
