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

goog.provide('mbrio.Settings');
goog.provide('mbrio.SettingsManager');
goog.provide('mbrio.Repositories');

var FILE_NAMES_ = [];
FILE_NAMES_["arm"] = "chrome-linux.zip";
FILE_NAMES_["linux-64"] = "chrome-linux.zip";
FILE_NAMES_["linux-chromeos"] = "chrome-linux.zip";
FILE_NAMES_["linux-chromiumos"] = "chrome-linux.zip";
FILE_NAMES_["linux"] = "chrome-linux.zip";
FILE_NAMES_["mac"] = "chrome-mac.zip";
FILE_NAMES_["xp"] = "chrome-win32.zip";
FILE_NAMES_["xp-installer"] = "mini_installer.exe";

mbrio.Repositories.continuous = {
	name:"continuous", 
	latestBaseUrl:"http://build.chromium.org/buildbot/continuous/",
	downloadBaseUrl:"http://build.chromium.org/buildbot/snapshots/chromium-rel-",
	getLatestUrl: function(platform) {
		if (platform == "arm") platform = "linux";
		else if (platform == "linux-64") platform = "linux";
		else if (platform == "linux-chromeos") platform = "linux";
		else if (platform == "linux-chromiumos") platform = "linux";
		else if (platform == "xp") platform = "win";
		
		return this.latestBaseUrl + platform + "/LATEST/REVISION";
	},
	
	getDownloadUrl: function(platform, version) {
		if (platform == "arm") platform = "linux";
		else if (platform == "linux-64") platform = "linux";
		else if (platform == "linux-chromeos") platform = "linux";
		else if (platform == "linux-chromiumos") platform = "linux";
		
		var fileName = FILE_NAMES_[platform];
		
		if (platform == "xp" && mbrio.Settings.useInstaller == "true") {
			fileName = FILE_NAMES_["xp-installer"];
		}
		
		return this.downloadBaseUrl + platform + "/" + version.toString() + "/" + fileName;
	},

	getChangeLogUrl: function(platform, version) {
		if (platform == "arm") platform = "linux";
		else if (platform == "linux-64") platform = "linux";
		else if (platform == "linux-chromeos") platform = "linux";
		else if (platform == "linux-chromiumos") platform = "linux";
		return this.downloadBaseUrl + platform + "/" + version.toString() + "/" + "changelog.xml";
	}
};

mbrio.Repositories.snapshot = {
	name:"snapshot", 
	latestBaseUrl:"http://build.chromium.org/buildbot/snapshots/chromium-rel-",
	downloadBaseUrl:"http://build.chromium.org/buildbot/snapshots/chromium-rel-",
	getLatestUrl: function(platform) {		
		return this.latestBaseUrl + platform + "/LATEST";
	},

	getDownloadUrl: function(platform, version) {
		return this.downloadBaseUrl + platform + "/" + version.toString() + "/" + FILE_NAMES_[platform];
	},
	
	getChangeLogUrl: function(platform, version) {
		return this.downloadBaseUrl + platform + "/" + version.toString() + "/" + "changelog.xml";
	}
};

mbrio.SettingsManager = function() {}

mbrio.SettingsManager.prototype.__defineGetter__("useInstaller", function() {
	var useInstaller = true;
	if (localStorage.useInstaller != null) useInstaller = localStorage.useInstaller;

	return useInstaller;
});

mbrio.SettingsManager.prototype.__defineSetter__("useInstaller", function(val) {
	localStorage.useInstaller = val;
});

mbrio.SettingsManager.prototype.__defineGetter__("platform", function() {
	return localStorage.platform || 'mac';
});

mbrio.SettingsManager.prototype.__defineSetter__("platform", function(val) {
	localStorage.platform = val;
	this.latestDownloadedRevision = -1;
});

mbrio.SettingsManager.prototype.__defineGetter__("latestDownloadedRevision", function() {
	return localStorage.latestDownloadedRevision || -1;
});

mbrio.SettingsManager.prototype.__defineSetter__("latestDownloadedRevision", function(val) {
	localStorage.latestDownloadedRevision = val;
});

mbrio.SettingsManager.prototype.__defineGetter__("currentRepository", function() {
	return mbrio.Repositories[this.snapshotRepository];
});

mbrio.SettingsManager.prototype.__defineGetter__("snapshotRepository", function() {
	return localStorage.snapshotRepository || "continuous";
});

mbrio.SettingsManager.prototype.__defineSetter__("snapshotRepository", function(val) {
	localStorage.snapshotRepository = val;
});

mbrio.Settings = new mbrio.SettingsManager();