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

goog.provide('mbrio.SnapshotPopup');

goog.require('goog.dom');

mbrio.SnapshotPopup = function() {
	this.skipLoading = false;
	
	this.init();
}

mbrio.SnapshotPopup.prototype.init = function() {
	var sp = this;
	var snapshot = chrome.extension.getBackgroundPage().snapshot;
	var statusUpdatedHandler = function() {
		if (sp.skipLoading && snapshot.status == mbrio.ChromiumSnapshotStatus.loading) {
			sp.skipLoading = false;	
		} else {
			sp.display();
		}
	}
	snapshot.addEventListener(mbrio.ChromiumSnapshot.STATUS_UPDATED, statusUpdatedHandler);
	
	goog.events.listen(window, 'unload', function() {
		snapshot.removeEventListener(mbrio.ChromiumSnapshot.STATUS_UPDATED, statusUpdatedHandler)
	});
	
	this.retrieveChangeLog();
}

mbrio.SnapshotPopup.prototype.retrieveChangeLog = function() {
	this.display();
}

mbrio.SnapshotPopup.prototype.display = function() {
	goog.dom.removeChildren(document.body);
	
	var panel = goog.dom.$dom('div');
	
	var status = chrome.extension.getBackgroundPage().snapshot.status;
	
	if (status == mbrio.ChromiumSnapshotStatus.loaded) {
		var bgpage = chrome.extension.getBackgroundPage();

		var changeLog = bgpage.snapshot.changeLogMessage;
		if (changeLog != null && changeLog.length > 0) changeLog = changeLog.replace(/\n\n/g, "<br /><br />");

		var revision = bgpage.snapshot.changeLogRevision;
		var href = bgpage.snapshot.downloadLink;
		var platform = bgpage.snapshot.platform;
		
		panel.innerHTML = mbrio.t.Popup.loaded({href:href, revision:revision, msg:changeLog, platform:platform, prevRevision:mbrio.Settings.latestDownloadedRevision});
	}
	else if (status == mbrio.ChromiumSnapshotStatus.loading)
		panel.innerHTML = mbrio.t.Popup.loading();
	else if (status == mbrio.ChromiumSnapshotStatus.error)
		panel.innerHTML = mbrio.t.Popup.error();
	else if (status == mbrio.ChromiumSnapshotStatus.none)
		panel.innerHTML = mbrio.t.Popup.none();

	goog.dom.appendChild(document.body, panel);
}

mbrio.SnapshotPopup.prototype.recordDownload = function(revision) {
	if (revision != null) {
		revision = revision.trim();

		if (revision.length > 0) {
			mbrio.Settings.latestDownloadedRevision = revision;
			chrome.extension.getBackgroundPage().snapshot.update();
		}
	}
}

mbrio.SnapshotPopup.prototype.refresh = function() {
	this.skipLoading = true;
	chrome.extension.getBackgroundPage().snapshot.update();
}