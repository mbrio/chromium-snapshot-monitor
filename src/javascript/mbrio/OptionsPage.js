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

goog.provide('mbrio.OptionsPage');

goog.require('goog.dom');

mbrio.OptionsPage = function() {
	this.init();
}

mbrio.OptionsPage.prototype.init = function() {
	this.display();
	this.restoreOptions();
}

mbrio.OptionsPage.prototype.display = function() {
	goog.dom.removeChildren(document.body);
	
	var panel = goog.dom.$dom('div');
	
	panel.innerHTML = mbrio.t.Options.page();

	goog.dom.appendChild(document.body, panel);
}

mbrio.OptionsPage.prototype.platformUpdated = function() {
	var select = goog.dom.$("platform");
	var platform = select.children[select.selectedIndex].value;
	
	if (platform != "xp") {
		goog.dom.$('installer-panel').style.display = 'none';
	} else {
		goog.dom.$('installer-panel').style.display = 'block';
	}
}

mbrio.OptionsPage.prototype.__defineGetter__("isValid", function() {
	var validateNumbers = goog.dom.$$('.validate-as-number');
	
	for (var i = 0; i < validateNumbers.length; i++) {
		var node = validateNumbers.item(i);
		if (typeof(node.value) == 'undefined' || node.value == null || node.value.length < 1) {
			node.value = '0';
		}
		
		var regexp = new RegExp(/[0-9]+/);
		var matches = regexp.exec(node.value);
		
		if (matches == null) {
			node.style.backgroundColor = "#ffa5a5";
			alert("The value specified is invalid (It must be a number).");
			return false;
		} else {
			node.style.backgroundColor = "#FFF";
		}
	}
	
	return true;
});

mbrio.OptionsPage.prototype.saveOptions = function() {
	if (this.isValid) {
		var select = goog.dom.$("platform");
		var platform = select.children[select.selectedIndex].value;
		mbrio.Settings.platform = platform;
	
		select = goog.dom.$("repository");
		var repository = select.children[select.selectedIndex].value;
		mbrio.Settings.snapshotRepository = repository;
	
		mbrio.Settings.useInstaller = goog.dom.$('installer-enabled').checked;
		
		mbrio.Settings.checkContinuously = goog.dom.$('check-continuously').checked;
		mbrio.Settings.checkInterval = parseInt(goog.dom.$('check-interval').value);
	
		chrome.extension.getBackgroundPage().snapshot.update();
	
		var status = goog.dom.$("status");
	
		status.innerHTML = "Options Saved.";

		status.style.webkitAnimationName = "";
		setTimeout(function(){
			status.style.webkitAnimationName = "op-status-display";
			status.style.webkitAnimationDuration = "2s";
		}, 0);
	}
}

mbrio.OptionsPage.prototype.restoreOptions = function() {
	this.selectOption("platform", mbrio.Settings.platform);
	this.selectOption("repository", mbrio.Settings.snapshotRepository);

	if (mbrio.Settings.useInstaller == "true") {
		goog.dom.$('installer-enabled').checked = true;
	} else {
		goog.dom.$('installer-disabled').checked = true;
	}
	
	goog.dom.$('check-continuously').checked = (mbrio.Settings.checkContinuously == 'true');
	goog.dom.$('check-interval').value = mbrio.Settings.checkInterval;
	
	this.platformUpdated();
}

mbrio.OptionsPage.prototype.selectOption = function(selectId, val) {
	if (!val) return;

	var select = goog.dom.$(selectId);
	for (var i = 0; i < select.children.length; i++) {
		var child = select.children[i];
		if (child.value == val) {
			child.selected = "true";
			break;
		}
	}
}