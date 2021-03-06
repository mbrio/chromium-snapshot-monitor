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
goog.provide('mbrio.ChromiumSnapshotStatus');

goog.require('goog.events');
goog.require('goog.events.EventTarget');

var BADGE_COLOR_ = {color: [255, 202, 28, 255]};

mbrio.ChromiumSnapshotStatus.none = "none";
mbrio.ChromiumSnapshotStatus.loading = "loading";
mbrio.ChromiumSnapshotStatus.loaded = "loaded";
mbrio.ChromiumSnapshotStatus.error = "error";

mbrio.ChromiumSnapshot = function() {
	goog.events.EventTarget.call(this);
	
	this.revisionModel_ = new mbrio.RevisionModel();
	this.loadingAnimation_ = null;
	this.icon_ = null;
	
	this.updateInterval_ = null;

	var cs = this;
	goog.events.listen(window, "unload", function() {
		cs.stopUpdateInterval();
	});
	
	this.currentRequest_ = null;
	
	this.status = mbrio.ChromiumSnapshotStatus.none;
	
	this.initIcon();
	
	this.init();
}
goog.inherits(mbrio.ChromiumSnapshot, goog.events.EventTarget);

mbrio.ChromiumSnapshot.STATUS_UPDATED = 'statusupdated';

mbrio.ChromiumSnapshot.prototype.__defineGetter__("status", function() {
	return this.status_;
});

mbrio.ChromiumSnapshot.prototype.__defineSetter__("status", function(val) {
	this.status_ = val;
    this.dispatchEvent(mbrio.ChromiumSnapshot.STATUS_UPDATED);
});

mbrio.ChromiumSnapshot.prototype.__defineGetter__("icon", function() {
	return this.icon_;
});

mbrio.ChromiumSnapshot.prototype.__defineGetter__("platform", function() {
	return mbrio.Settings.platform;
});

mbrio.ChromiumSnapshot.prototype.__defineGetter__("downloadLink", function() {
	return mbrio.Settings.currentRepository.getDownloadUrl(this.platform, this.revisionModel_.version);
});

mbrio.ChromiumSnapshot.prototype.__defineGetter__("changeLogMessage", function() {
	return this.queryChangeLog("/log/child::logentry[position()=last()]/child::msg/text()", "");
});

mbrio.ChromiumSnapshot.prototype.__defineGetter__("changeLogRevision", function() {
	return this.queryChangeLog("/log/child::logentry[position()=last()]/attribute::revision", "-1");
});

mbrio.ChromiumSnapshot.prototype.__defineGetter__("version", function() {
	return this.revisionModel_.version;
});

mbrio.ChromiumSnapshot.prototype.__defineGetter__("changeLog", function() {
	return this.revisionModel_.changeLog;
});

mbrio.ChromiumSnapshot.prototype.queryChangeLog = function(query, defaultVal) {
	var xpath = new XPathEvaluator();
	var result = xpath.evaluate(query, this.revisionModel_.changeLog, null, XPathResult.STRING_TYPE, null);
	var val = defaultVal;

	if(result.stringValue != null && result.stringValue.length > 0)
		val = result.stringValue;
	
	return val;
}

mbrio.ChromiumSnapshot.prototype.initIcon = function() {	
	this.icon_ = new mbrio.Icon();
	this.loadingAnimation_ = new mbrio.LoadingAnimation(this);
}

mbrio.ChromiumSnapshot.prototype.reset = function() {
	chrome.browserAction.setBadgeText({text:''});
	this.icon_.displayUpToDate = true;
}

mbrio.ChromiumSnapshot.prototype.init = function() {
	this.reset();

	this.update();
}

mbrio.ChromiumSnapshot.prototype.checkVersion = function(version) {
	if (!isNaN(version)) {
		this.revisionModel_.version = version;
		
		if (this.revisionModel_.version > mbrio.Settings.latestDownloadedRevision) {
			chrome.browserAction.setBadgeBackgroundColor(BADGE_COLOR_);
			chrome.browserAction.setBadgeText({text:'new'});
			this.icon_.displayUpToDate = false;
		} else {
			chrome.browserAction.setBadgeText({text:''});
			this.icon_.displayUpToDate = true;
		}
	}
}

mbrio.ChromiumSnapshot.prototype.startUpdateInterval = function() {
	var cs = this;
	
	this.stopUpdateInterval();
	if (mbrio.Settings.canCheckContinuously) this.updateInterval_ = setTimeout(function(){cs.update();}, parseInt(mbrio.Settings.checkInterval) * 60000);
}

mbrio.ChromiumSnapshot.prototype.stopUpdateInterval = function() {
	if (this.updateInterval_ != null) {
		clearTimeout(this.updateInterval_);
		this.updateInterval_ = null;
	}
}

mbrio.ChromiumSnapshot.prototype.update = function() {
	var cs = this;
	this.startUpdateInterval();
	
	this.status = mbrio.ChromiumSnapshotStatus.loading;
	this.icon_.displayError = false;
	this.loadingAnimation_.start();
	
	this.request(mbrio.Settings.currentRepository.getLatestUrl(this.platform), function(xhr) {
		if (xhr.readyState == 4) {
			if (xhr.status != 200)  {
				cs.icon_.displayError = true;
				cs.loadingAnimation_.registerStop();
				cs.status = mbrio.ChromiumSnapshotStatus.error;
			} else {
				cs.checkVersion(parseInt(xhr.responseText));
				cs.retrieveChangeLog();
			}
		}
	});
}

mbrio.ChromiumSnapshot.prototype.retrieveChangeLog = function() {
	var cs = this;
	this.request(mbrio.Settings.currentRepository.getChangeLogUrl(this.platform, this.revisionModel_.version), function(xhr) {
		if (xhr.readyState == 4) {
			if (xhr.status != 200)  {
				cs.icon_.displayError = true;
				cs.status = mbrio.ChromiumSnapshotStatus.error;
			} else {
				cs.revisionModel_.changeLog = xhr.responseXML;
				
				cs.status = mbrio.ChromiumSnapshotStatus.loaded;
			}	

			cs.loadingAnimation_.registerStop();
		}
	});
}

mbrio.ChromiumSnapshot.prototype.abort = function() {
	if (this.currentRequest_ != null) {
		this.currentRequest_.abort();
		this.currentRequest_ = null;
	}
}

mbrio.ChromiumSnapshot.prototype.request = function(url, onreadystatechange) {
	this.abort();
	
	this.currentRequest_ = new XMLHttpRequest();
	var cs = this;
	
	this.currentRequest_.onreadystatechange = function() {
		if (onreadystatechange != null) onreadystatechange(cs.currentRequest_);
	}
	
	this.currentRequest_.open("GET", url, true);
	this.currentRequest_.send();
}