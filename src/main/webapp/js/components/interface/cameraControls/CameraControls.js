/*******************************************************************************
 *
 * Copyright (c) 2011, 2016 OpenWorm.
 * http://openworm.org
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the MIT License
 * which accompanies this distribution, and is available at
 * http://opensource.org/licenses/MIT
 *
 * Contributors:
 *      OpenWorm - http://openworm.org/people.html
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 *******************************************************************************/

define(function(require) {

    var React = require('react');
    var GEPPETTO = require('geppetto');

    var CameraControls = React.createClass({

        panLeft: function() {
            GEPPETTO.Console.executeImplicitCommand('G.incrementCameraPan(-0.01, 0)');
        },

        panRight: function() {
            GEPPETTO.Console.executeImplicitCommand('G.incrementCameraPan(0.01, 0)');
        },

        panUp: function() {
            GEPPETTO.Console.executeImplicitCommand('G.incrementCameraPan(0, -0.01)');
        },

        panDown: function() {
            GEPPETTO.Console.executeImplicitCommand('G.incrementCameraPan(0, 0.01)');
        },

        rotateUp: function() {
            GEPPETTO.Console.executeImplicitCommand('G.incrementCameraRotate(0, 0.01)');
        },

        rotateDown: function() {
            GEPPETTO.Console.executeImplicitCommand('G.incrementCameraRotate(0, -0.01)');
        },

        rotateLeft: function() {
            GEPPETTO.Console.executeImplicitCommand('G.incrementCameraRotate(-0.01, 0)');
        },

        rotateRight: function() {
            GEPPETTO.Console.executeImplicitCommand('G.incrementCameraRotate(0.01, 0)');
        },

        rotate: function() {
            GEPPETTO.Console.executeImplicitCommand('G.autoRotate()');
        },
        
        cameraHome: function() {
            GEPPETTO.Console.executeImplicitCommand('G.resetCamera()');
        },

        zoomIn: function() {
            GEPPETTO.Console.executeImplicitCommand('G.incrementCameraZoom(-0.01)');
        },

        zoomOut: function() {
            GEPPETTO.Console.executeImplicitCommand('G.incrementCameraZoom(+0.01)');
        },

        componentDidMount: function() {

        },

        render: function () {
            return (
            	<div className="position-toolbar">
                    <button id="panLeftBtn" className="btn squareB fa fa-chevron-left pan-left" onClick={this.panLeft} title="Pan Left"></button>
                    <button id="panUpBtn" className="btn squareB fa fa-chevron-up pan-top" onClick={this.panUp} title="Pan Up"></button>
                    <button id="panRightBtn" className="btn squareB fa fa-chevron-right pan-right" onClick={this.panRight} title="Pan Right"></button>
                    <button id="panDownBtn" className="btn squareB fa fa-chevron-down pan-bottom" onClick={this.panDown} title="Pan Down"></button>
                    <button id="panHomeBtn" className="btn squareB fa fa-home pan-home" onClick={this.cameraHome} title="Reset to Home Position"></button>

                    <button id="rotateLeftBtn" className="btn squareB fa fa-undo rotate-left" onClick={this.rotateLeft} title="Rotate Left"></button>
                    <button id="rotateUpBtn" className="btn squareB fa fa-repeat rotate90 rotate-top" onClick={this.rotateUp} title="Rotate Up"></button>
                    <button id="rotateRightBtn" className="btn squareB fa fa-repeat rotate-right" onClick={this.rotateRight} title="Rotate Right"></button>
                    <button id="rotateDownBtn" className="btn squareB fa fa-undo rotate90 rotate-bottom" onClick={this.rotateDown} title="Rotate Down"></button>
                    <button id="rotateBtn" className="btn squareB fa fa-video-camera rotate-home" onClick={this.rotate} title="Rotate the scene"></button>

                    <button id="zoomInBtn" className="btn squareB fa fa-search-plus zoom-in" onClick={this.zoomIn} title="Zoom In"></button>
                    <button id="zoomOutBtn" className="btn squareB fa fa-search-minus zoom-out" onClick={this.zoomOut} title="Zoom Out"></button>
                </div>

            );
        }

    });

    return CameraControls;
});
