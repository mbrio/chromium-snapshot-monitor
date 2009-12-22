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

goog.provide('mbrio.LoadingAnimation');

mbrio.LoadingAnimation = function(parent) {
	this.interval_ = null;
	this.fullRotation_ = 360;
	
	this.parent_ = parent;
	this.fps_ = 60;
	
	this.prev_ = 0;
	this.currentRotation_ = 1;
	this.stoppingRotation_ = null;
}

mbrio.LoadingAnimation.prototype.start = function() {
	this.stop();
	
	var la = this;

	this.prev_ = new Date().getTime();

	this.interval_ = setInterval(function() {
		var rotationsPerSecond = 2;
		var current = new Date().getTime();
		var elapsed = (current - la.prev_) / 1000;
		
		var nextRotation = la.parent_.icon_.rotation + ((rotationsPerSecond * 360) * elapsed);
		var currentRotation = Math.ceil(nextRotation / 360);
		
		if (la.stoppingRotation_ != null && currentRotation > la.stoppingRotation_) {
			la.parent_.icon_.rotation = 0;
			la.stop();
		} else {		
			la.parent_.icon_.rotation = nextRotation;
			
			la.currentRotation_ = currentRotation;
			la.prev_ = current;
		}
	}, 1000 / this.fps_);
}

mbrio.LoadingAnimation.prototype.registerStop = function() {
	this.stoppingRotation_ = this.currentRotation_;
}

mbrio.LoadingAnimation.prototype.stop = function() {
	if (this.interval_ != null) {
		clearInterval(this.interval_);
		this.interval_ = null;
		this.prev_ = 0;
		this.currentRotation_ = 1;
		this.stoppingRotation_ = null;
	}
}