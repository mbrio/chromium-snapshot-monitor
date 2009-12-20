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

var FILE_NAMES_ = [];
FILE_NAMES_["arm"] = "chrome-linux.zip";
FILE_NAMES_["linux-64"] = "chrome-linux.zip";
FILE_NAMES_["linux-chromeos"] = "chrome-linux.zip";
FILE_NAMES_["linux-chromiumos"] = "chrome-linux.zip";
FILE_NAMES_["linux"] = "chrome-linux.zip";
FILE_NAMES_["mac"] = "chrome-mac.zip";
FILE_NAMES_["xp"] = "chrome-win32.zip";

var BADGE_COLOR_ = {color: [255, 202, 28, 255]};

mbrio.ChromiumSnapshot = function() {
	this.version_ = null;
	this.changeLog_ = null;
	
	this.baseUrl_ = null;
	this.latestUrl_ = null;
	this.fileName_ = null;
	this.changeLogFile_ = "changelog.xml";
	
	this.platform = 'mac'
	this.init();
}

mbrio.ChromiumSnapshot.prototype.__defineGetter__("platform", function() {
	var platform = 'mac';
	var lsp = localStorage["platform"];
	if (lsp) platform = lsp;
	
	return platform;
});

mbrio.ChromiumSnapshot.prototype.__defineSetter__("platform", function(val) {
	localStorage["platform"] = val;
	
	this.baseUrl_ = "http://build.chromium.org/buildbot/snapshots/chromium-rel-" + val;
	this.latestUrl_ = this.baseUrl_ + "/LATEST";
	this.fileName_ = FILE_NAMES_[val];
});

mbrio.ChromiumSnapshot.prototype.__defineGetter__("downloadLink", function() {
	return this.resolveVersionUrl(this.fileName_);
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

mbrio.ChromiumSnapshot.prototype.resolveVersionUrl = function(fileName) {
	return this.baseUrl_ + "/" + this.version_.toString() + "/" + fileName;
}

mbrio.ChromiumSnapshot.prototype.update = function() {
	var xhr = new XMLHttpRequest();
	var cs = this;
	
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			cs.checkVersion(parseInt(xhr.responseText));
			cs.retrieveChangeLog();
		}
	}
	
	xhr.open("GET", this.latestUrl_, true);
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
	
	xhr.open("GET", this.resolveVersionUrl(this.changeLogFile_), true);
	xhr.send();
}