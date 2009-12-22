// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2009 Michael Diolosa <michael.diolosa@gmail.com>. All Rights Reserved.

goog.provide('mbrio.ChromiumSnapshot');

var BADGE_COLOR_ = {color: [255, 202, 28, 255]};

mbrio.ChromiumSnapshot = function() {
	this.version_ = null;
	this.changeLog_ = null;
	
	this.loadingAnimation_ = null;

	this.icon_ = null;
	
	this.initIcon();
	
	this.init();
}

mbrio.ChromiumSnapshot.prototype.__defineGetter__("platform", function() {
	return mbrio.Settings.platform;
});

mbrio.ChromiumSnapshot.prototype.__defineGetter__("downloadLink", function() {
	return mbrio.Settings.currentRepository.getDownloadUrl(this.platform, this.version_);
});

mbrio.ChromiumSnapshot.prototype.__defineGetter__("changeLogMessage", function() {
	return this.changeLog_.getElementsByTagName("msg").item(0).childNodes.item(0).nodeValue;
});

mbrio.ChromiumSnapshot.prototype.__defineGetter__("changeLogRevision", function() {
	return this.changeLog_.getElementsByTagName("logentry").item(0).attributes.getNamedItem("revision").nodeValue;
});

mbrio.ChromiumSnapshot.prototype.__defineGetter__("version", function() {
	return this.version_;
});

mbrio.ChromiumSnapshot.prototype.__defineGetter__("changeLog", function() {
	return this.changeLog_;
});

mbrio.ChromiumSnapshot.prototype.initIcon = function() {	
	this.icon_ = new mbrio.Icon();
	this.loadingAnimation_ = new mbrio.LoadingAnimation(this);
}

mbrio.ChromiumSnapshot.prototype.reset = function() {
	chrome.browserAction.setBadgeText({text:''});
}

mbrio.ChromiumSnapshot.prototype.init = function() {
	this.reset();

	this.update();
}

mbrio.ChromiumSnapshot.prototype.checkVersion = function(version) {
	if (!isNaN(version)) {
		this.version_ = version;
		
		chrome.browserAction.setBadgeBackgroundColor(BADGE_COLOR_);
		chrome.browserAction.setBadgeText({text:this.version_.toString()});
	}
}

mbrio.ChromiumSnapshot.prototype.update = function() {
	this.loadingAnimation_.start();
	
	var cs = this;
	this.request(mbrio.Settings.currentRepository.getLatestUrl(this.platform), function(xhr) {
		if (xhr.readyState == 4) {
			cs.checkVersion(parseInt(xhr.responseText));
			cs.retrieveChangeLog();
		}
	});
}

mbrio.ChromiumSnapshot.prototype.retrieveChangeLog = function() {
	var cs = this;
	this.request(mbrio.Settings.currentRepository.getChangeLogUrl(this.platform, this.version_), function(xhr) {
		if (xhr.readyState == 4) {
			cs.changeLog_ = xhr.responseXML;
			cs.loadingAnimation_.registerStop();
		}
	});
}

mbrio.ChromiumSnapshot.prototype.request = function(url, onreadystatechange) {
	var xhr = new XMLHttpRequest();
	var cs = this;
	
	xhr.onreadystatechange = function() {
		if (onreadystatechange != null) onreadystatechange(xhr);
	}
	
	xhr.open("GET", url, true);
	xhr.send();
}