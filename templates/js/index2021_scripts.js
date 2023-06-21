var searchReady = false;
function isSearchReady() {
	if(searchReady){
		searchReady = false;
		return true;
	}else{
		var imageDisplay = document.getElementById("imagePreview");
		imageDisplay.innerHTML = "<span class='previewErrorText'>Please Select an Image First!</span>";
		return false;
	}
}
function quickCheckURL(string){
	var pattern = /^((http|https|data):)/;
	if(!pattern.test(string)){
		//console.log("bad url: "+string);
		return false;
	}else{
		return true;
	}
}
function getURLInput(urlInput) {
	if(urlInput.value == ""){
		urlInput.value = urlInput.defaultValue; //reset to the default url input text value
	}else{
		document.getElementById("fileInput").value= '';//clear the file input
		showImageURL(urlInput.value);//show image
		if(document.getElementById("auto-cb").checked){
			searchReady = false;
			document.getElementById("searchForm").submit();
		}
	}
}
function checkImageFile(fileInput){
	var imageDisplay = document.getElementById("imagePreview");
	var searchButton = document.getElementById("searchButton");
	var fileMB = fileInput.files[0].size/1024/1024;
	var fileName = fileInput.value.trim().toLowerCase();
	var typeRegex = new RegExp("\.(png|jpe?g|gif|bmp|webp)$");
	var fsizeMax = parseInt((localStorage.getItem('fsizeMax')));
	if (typeof fsizeMax == 'undefined' || fsizeMax == null){
		fsizeMax=15;//most common value
	}
	if(fileMB > fsizeMax){
		//too big
		imageDisplay.innerHTML = "<span class='previewErrorText'>Image Too Large!</span>";
		fileInput.value= ''; //clear file input
		searchButton.classList.remove("searchButtonActive");//darken search button
		searchReady = false;
	}else if(!(typeRegex.test(fileName))){
		//bad filetype - should pull type list from db
		imageDisplay.innerHTML = "<span class='previewErrorText'>Image Type Not Supported!</span>";
		fileInput.value= ''; //clear file input
		searchButton.classList.remove("searchButtonActive");//darken search button
		searchReady = false;
	}else{
		//good - clear the url input and submit if auto
		var urlInput = document.getElementById("urlInput");
		urlInput.value = urlInput.defaultValue; //reset to the default text value
		showImageFile(fileInput); //display new image and activate search button
		if(document.getElementById("auto-cb").checked){
			searchReady = false;
			document.getElementById("searchForm").submit();
		}
	}
}
function showImageURL(url){
	var imageDisplay = document.getElementById("imagePreview");
	var searchButton = document.getElementById("searchButton");
	if(!quickCheckURL(url)){
		imageDisplay.innerHTML = "<span class='previewErrorText'>Invalid Image URL!</span>";
		searchButton.classList.remove("searchButtonActive");//darken search button
		searchReady = false;
	}else{
		imageDisplay.innerHTML = "<div style='width: 100%; height: 100%;'><img src='" + url +"' onerror='imageURLError();'></div>";
		searchButton.classList.add("searchButtonActive")//activate search button
		searchReady = true;
	}
}
function imageURLError(){
	var imageDisplay = document.getElementById("imagePreview");
	imageDisplay.innerHTML = "<span class='previewInfoText'>Image Preview Unavailable</span>";
}
function showImageFile(fileInput){
	var fr = new FileReader();
	fr.onload = function(){
		var dataURL = fr.result;
		showImageURL(dataURL);
	}
	fr.readAsDataURL(fileInput.files[0]);
}

function clearValue(elem){
	if(elem.value == elem.defaultValue){
		elem.value = "";
	}
}

document.onpaste = function(event){
	urlInput = document.getElementById("urlInput");
	if(event.target == urlInput){
		//don't interfere with paste to url box - allows ios to paste image links properly
		//give some time for paste to finish normally before checking
		setTimeout(function(){ getURLInput(urlInput); }, 4);
		return;
	}else{
		event.preventDefault();
		clipboardData = (event.clipboardData || event.originalEvent.clipboardData);
		if(typeof clipboardData.files[0] == 'undefined'){
			urlInput.value = clipboardData.getData('Text');
			getURLInput(urlInput);
		}else{
			fileInput = document.getElementById("fileInput");
			fileInput.files = clipboardData.files;
			checkImageFile(fileInput);
		}
	}
}
document.ondragover = document.ondragenter = function(event) {
	event.preventDefault();
};
document.ondrop = function(event){
	fileInput = document.getElementById("fileInput");
	if(event.target == fileInput){
		//don't interfere with drop on file select - allows old browsers to drop properly
		//console.log("skipped drop!");
		return;
	}else{
		event.preventDefault();
		if(typeof event.dataTransfer.files[0] == 'undefined'){
			urlInput = document.getElementById("urlInput");
			urlInput.value = event.dataTransfer.getData("text/uri-list");
			getURLInput(urlInput);
		}else{
			fileInput = document.getElementById("fileInput");
			fileInput.files = event.dataTransfer.files;
			checkImageFile(fileInput);
		}
	}
}
function toggleClassActive(targetClass){
	var elem = document.getElementsByClassName(targetClass);
	for(var i = 0; i < elem.length; i++){
		elem.item(i).classList.toggle("active");
	}
}
function toggleCheckboxes(targetClass){
	var checkboxes = document.getElementsByClassName(targetClass);
	for(var i = 0; i < checkboxes.length; i++)	{
		checkboxes.item(i).checked = !checkboxes.item(i).checked;
	}
}
function getNumChecked(targetClass){
	var numChecked=0;
	var checkboxes = document.getElementsByClassName(targetClass);
	for(var i = 0; i < checkboxes.length; i++)	{
		if(checkboxes.item(i).checked){
			numChecked++;
		}
	}
	return numChecked;
}
function updateMultiSelectButtonText(numDBsEnabled,buttonID){
	var dbDropdownButton = document.getElementById(buttonID);
	if (numDBsEnabled == 1){
		dbDropdownButton.innerHTML = "<span class='multiLabel'>"+numDBsEnabled+" DB</span>";
	}else if(numDBsEnabled > 1){
		dbDropdownButton.innerHTML = "<span class='multiLabel'>"+numDBsEnabled+" DBs</span>";
	}else{
		dbDropdownButton.innerHTML = "<span class='multiLabel'>All DBs</span>";
	}
}
function updateMultiSelectRows(targetClass){
	var multiSelectCheckboxes = document.getElementsByClassName(targetClass);
	for(var i = 0; i < multiSelectCheckboxes.length; i++){
		if(multiSelectCheckboxes.item(i).checked){
			document.getElementById(multiSelectCheckboxes.item(i).getAttribute('id')+"-row").classList.add("multi-select-dropdown-highlight");
		}else{
			document.getElementById(multiSelectCheckboxes.item(i).getAttribute('id')+"-row").classList.remove("multi-select-dropdown-highlight");
		}
	}
}
function updateMultiSelect(targetClass,buttonID){
	updateMultiSelectRows(targetClass);
	updateMultiSelectButtonText(getNumChecked(targetClass),buttonID);
}
document.addEventListener('DOMContentLoaded', function(){
	multiSelectInit("db-cb","database-dropdown-button");
	var safeChecked = JSON.parse(localStorage.getItem('safe-cb'));
	var autoChecked = JSON.parse(localStorage.getItem('auto-cb'));
	document.getElementById("safe-cb").checked = safeChecked;
	document.getElementById("auto-cb").checked = autoChecked;
}, false);
function saveCheckbox(checkbox, cbName){
	localStorage.setItem(cbName, checkbox.checked);
}
function multiSelectInit(targetClass,buttonID){
	//update count and highlights
	updateMultiSelect(targetClass,buttonID);
	//add event handlers to checkboxes for future updates
	var multiSelectCheckboxes = document.getElementsByClassName(targetClass);
	for(var i = 0; i < multiSelectCheckboxes.length; i++){
		multiSelectCheckboxes.item(i).addEventListener('change',function(){updateMultiSelect(targetClass,buttonID);},false);
	}
}
function createEvent(eventName){
	if(typeof(Event) === 'function') {
		var event = new Event(eventName);
	}else{
		var event = document.createEvent('Event');
		event.initEvent(eventName, true, true);
	}
	return event;
}
function multiSelectToggle(targetClass){
	//invert the checkboxes
	toggleCheckboxes(targetClass);
	//trigger onchange event handler on first
	var multiSelectCheckboxes = document.getElementsByClassName(targetClass);
	var changeEvent = createEvent('change');
	multiSelectCheckboxes.item(0).dispatchEvent(changeEvent);
}