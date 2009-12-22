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

goog.provide('mbrio.Icon');

goog.require('goog.dom');

mbrio.Icon = function() {
	this.iconNormalImage_ = goog.dom.$("icon");
	this.iconErrorImage_ = goog.dom.$("icon-error");
	this.iconImage_ = this.iconNormalImage_;
	this.canvas_ = goog.dom.$("canvas");
	this.canvasContext_ = this.canvas_.getContext('2d');
	this.displayError_ = false;
	
	this.rotation = 0;
}

mbrio.Icon.prototype.__defineGetter__("rotation", function() {
	return this.rotation_;
});

mbrio.Icon.prototype.__defineSetter__("rotation", function(val) {
	this.rotation_ = val;
	this.draw();
});

mbrio.Icon.prototype.__defineGetter__("displayError", function() {
	return this.displayError_;
});

mbrio.Icon.prototype.__defineSetter__("displayError", function(val) {
	this.displayError_ = val;
	
	if (this.displayError_) {
		this.iconImage_ = this.iconErrorImage_;
	} else {
		this.iconImage_ = this.iconNormalImage_;
	}
	
	this.draw();
});

mbrio.Icon.prototype.draw = function() {
	var ic = this;
	
	this.canvasContext_.save();
	
	this.canvasContext_.clearRect(0, 0, 19, 19);
	this.canvasContext_.translate(Math.ceil(18 / 2), Math.ceil(18 / 2));
	this.canvasContext_.rotate(this.rotation_ * Math.PI / 180);
	this.canvasContext_.drawImage(this.iconImage_, -Math.ceil(18 / 2), -Math.ceil(18 / 2));
	
	this.canvasContext_.restore();
	
	chrome.browserAction.setIcon({imageData:this.canvasContext_.getImageData(0, 0, 19, 19)});
}