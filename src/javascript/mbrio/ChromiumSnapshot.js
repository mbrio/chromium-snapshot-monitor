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

goog.require('goog.dom');

var CHROMIUM_SNAPSHOT_BASE_URL_ = "http://build.chromium.org/buildbot/snapshots/chromium-rel-mac";
var CHROMIUM_SNAPSHOT_URL_ = CHROMIUM_SNAPSHOT_BASE_URL_ + "/LATEST";
var CHROMIUM_SNAPSHOT_FILE_NAME_ = "chrome-mac.zip";
var CHROMIUM_SNAPSHOT_CHANGELOG_ = "changelog.xml";

var BADGE_COLOR_ = {color: [255, 202, 28, 255]};

mbrio.ChromiumSnapshot = function() {
	this.version_ = null;
	this.changeLog_ = null;
	
	this.init();
}

mbrio.ChromiumSnapshot.prototype.__defineGetter__("version", function() {
	return this.version_;
});

mbrio.ChromiumSnapshot.prototype.__defineGetter__("changeLog", function() {
	return this.changeLog_;
});

mbrio.ChromiumSnapshot.prototype.init = function() {
	var cs = this;
	chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
		if (request.need == "changeLog") {
			sendResponse({msg: cs.changeLog_.getElementsByTagName("msg").item(0).childNodes.item(0).nodeValue,
						  revision: cs.changeLog_.getElementsByTagName("logentry").item(0).attributes.getNamedItem("revision").nodeValue,
						  href: cs.resolveVersionUrl(CHROMIUM_SNAPSHOT_FILE_NAME_)});
		} else {
			sendResponse({});
		}
	});

	this.retrieveLatestVersion();
}

mbrio.ChromiumSnapshot.prototype.checkVersion = function(version) {
	if (!isNaN(version)) {
		this.version_ = version;
		
		chrome.browserAction.setBadgeBackgroundColor(BADGE_COLOR_);
		chrome.browserAction.setBadgeText({text:this.version_.toString()});
	}
}

mbrio.ChromiumSnapshot.prototype.resolveVersionUrl = function(fileName) {
	return CHROMIUM_SNAPSHOT_BASE_URL_ + "/" + this.version_.toString() + "/" + fileName;
}

mbrio.ChromiumSnapshot.prototype.download = function() {
	window.open(this.resolveVersionUrl(CHROMIUM_SNAPSHOT_FILE_NAME_));
}

mbrio.ChromiumSnapshot.prototype.retrieveLatestVersion = function() {
	var xhr = new XMLHttpRequest();
	var cs = this;
	
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			cs.checkVersion(parseInt(xhr.responseText));
			cs.retrieveChangeLog();
		}
	}
	
	xhr.open("GET", CHROMIUM_SNAPSHOT_URL_, true);
	xhr.send();
}

mbrio.ChromiumSnapshot.prototype.retrieveChangeLog = function() {
	var xhr = new XMLHttpRequest();
	var cs = this;
	
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			cs.changeLog_ = xhr.responseXML;
		}
	}
	
	xhr.open("GET", this.resolveVersionUrl(CHROMIUM_SNAPSHOT_CHANGELOG_), true);
	xhr.send();
}