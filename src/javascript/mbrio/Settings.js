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

mbrio.SettingsManager = function() {}

mbrio.SettingsManager.prototype.__defineGetter__("platform", function() {
	return localStorage.platform || 'mac';
});

mbrio.SettingsManager.prototype.__defineSetter__("platform", function(val) {
	localStorage.platform = val;
});

mbrio.SettingsManager.prototype.__defineGetter__("latestDownloadedRevision", function() {
	return localStorage.latestDownloadedRevision || null;
});

mbrio.SettingsManager.prototype.__defineSetter__("latestDownloadedRevision", function(val) {
	localStorage.latestDownloadedRevision = val;
});

mbrio.Settings = new mbrio.SettingsManager();