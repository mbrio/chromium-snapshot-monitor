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
	this.changeLog_ = null;
	this.revision_ = null;
	this.href_ = null;
	this.platform_ = null;
	
	this.init();
}

mbrio.SnapshotPopup.prototype.init = function() {
	this.retrieveChangeLog();
}

mbrio.SnapshotPopup.prototype.retrieveChangeLog = function() {
	var bgpage = chrome.extension.getBackgroundPage();
	
	this.changeLog_ = bgpage.snapshot.changeLogMessage;
	if (this.changeLog_ != null && this.changeLog_.length > 0) this.changeLog_ = this.changeLog_.replace(/\n\n/g, "<br /><br />");
	
	this.revision_ = bgpage.snapshot.changeLogRevision;
	this.href_ = bgpage.snapshot.downloadLink;
	this.platform_ = bgpage.snapshot.platform;
	this.display();
}

mbrio.SnapshotPopup.prototype.display = function() {
	var panel = goog.dom.$dom('div');
	panel.innerHTML = mbrio.t.Popup.changeLog({href:this.href_, revision:this.revision_, msg:this.changeLog_, platform:this.platform_, prevRevision:mbrio.Settings.latestDownloadedRevision});
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