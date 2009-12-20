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
	
	this.init();
}

mbrio.SnapshotPopup.prototype.init = function() {
	this.retrieveChangeLog();
}

mbrio.SnapshotPopup.prototype.retrieveChangeLog = function() {
	var bgpage = chrome.extension.getBackgroundPage();
	
	this.changeLog_ = bgpage.snapshot.changeLogMessage;
	this.revision_ = bgpage.snapshot.changeLogRevision;
	this.href_ = bgpage.snapshot.downloadLink;
	this.display();
}

mbrio.SnapshotPopup.prototype.display = function() {
	var panel = goog.dom.$dom('div');
	panel.innerHTML = mbrio.t.Popup.changeLog({href:this.href_, revision:this.revision_, msg:this.changeLog_});
	goog.dom.appendChild(document.body, panel);
}