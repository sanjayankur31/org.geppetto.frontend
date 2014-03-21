/*******************************************************************************
 * The MIT License (MIT)
 *
 * Copyright (c) 2011, 2013 OpenWorm.
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

/**
 *
 * Global objects. Handles global operations; clearing js console history commands,
 * turning on/off debug statements, copying history commands, help info, etc.
 *
 * @constructor

 * @author  Jesus R. Martinez (jesus@metacell.us)
 */
define(function(require) {
	return function(GEPPETTO) {

		var debugMode = false;
		var $ = require('jquery');

		/**
		 * Adds widget to Geppetto
		 *
		 * @name GEPPETTO.G.addWidget(widgetType)
		 * @param widgetType - Type of widget to add
		 */
		GEPPETTO.G = {
			addWidget: function(type) {
				var newWidget = GEPPETTO.WidgetFactory.addWidget(type);
				return newWidget.getName() + GEPPETTO.Resources.WIDGET_CREATED;
			},

			/**
			 * Gets list of available widgets
			 *
			 * @name G.availableWidgets()
			 * @returns {List} - List of available widget types
			 */
			availableWidgets: function() {
				return GEPPETTO.Widgets;
			},

			/**
			 * Clears the console history
			 *
			 * @name G.clear()
			 */
			clear: function() {
				GEPPETTO.Console.getConsole().clear();
				return GEPPETTO.Resources.CLEAR_HISTORY;
			},

			/**
			 * Copies console history to OS clipboard
			 *
			 * @name G.copyHistoryToClipboard()
			 */
			copyHistoryToClipboard: function() {

				var commandsString = "";
				var commands = GEPPETTO.Console.consoleHistory();

				if(!commands || !commands.length) {
					return GEPPETTO.Resources.EMPTY_CONSOLE_HISTORY;
				}

				for(var i = 0; i < commands.length; i++) {
					var n = commands[i];
					if(n.command) {

						var command = n.command.trim();
						if(command.indexOf(";") == -1) {
							command = command + ";";
						}

						commandsString += command;
						if(i != commands.length - 1) {
							commandsString += '\n';
						}
					}
				}

				if(commandsString) {
					var message = GEPPETTO.Resources.COPY_TO_CLIPBOARD_WINDOWS;

					//different command for copying in macs means different message
					if(navigator.userAgent.match(/(Mac|iPhone|iPod|iPad)/i)) {
						message = GEPPETTO.Resources.COPY_TO_CLIPBOARD_MAC;
					}

					GEPPETTO.JSEditor.loadEditor();

					$('#jsEditor-title').html(message);
					$('#javascriptEditor').modal();

					$('#javascriptEditor').on('shown', function() {
						GEPPETTO.JSEditor.loadCode(commandsString);
					});

					return GEPPETTO.Resources.COPY_CONSOLE_HISTORY;
				}
				else {
					return '';
				}

			},

			/**
			 * Toggles debug statement on/off
			 *
			 * @name G.debug(toggle)
			 * @param toggle - toggles debug statements
			 *
			 */
			debug: function(mode) {
				debugMode = mode;

				if(mode) {
					GEPPETTO.showStats();
					return GEPPETTO.Resources.DEBUG_ON;
				}
				else {
					GEPPETTO.hideStats();
					return GEPPETTO.Resources.DEBUG_OFF;
				}
			},

			/**
			 * Gets the object for the current Simulation, if any.
			 *
			 * @name G.getCurrentSimulation()
			 * @returns Returns current Simulation object if it exists
			 */
			getCurrentSimulation: function() {
				//return simulation object if one has been loaded
				if(GEPPETTO.Simulation.isLoaded()) {
					return JSON.stringify(GEPPETTO.Simulation);
				}
				else {
					return GEPPETTO.Resources.NO_SIMULATION_TO_GET;
				}
			},

			/**
			 * Get all commands and descriptions available for object G.
			 *
			 * @name G.help()
			 * @returns {String} - All commands and descriptions for G.
			 */
			help: function() {
				return GEPPETTO.Utility.extractCommandsFromFile("js/geppetto-objects/G.js", GEPPETTO.G, "G");
			},

			/**
			 * Removes widget from Geppetto
			 *
			 * @name G.removeWidget(widgetType)
			 * @param widgetType - Type of widget to remove
			 */
			removeWidget: function(type) {
				return GEPPETTO.WidgetFactory.removeWidget(type);
			},

			/**
			 * Takes the URL corresponding to a script, executes
			 * commands inside the script.
			 *
			 * @name G.runScript(scriptURL)
			 * @param scriptURL - URL of script to execute
			 */
			runScript: function(scriptURL) {

				GEPPETTO.MessageSocket.send("run_script", scriptURL);

				return GEPPETTO.Resources.RUNNING_SCRIPT;
			},

			/**
			 * Show or hide console using command
			 *
			 * @name G.showConsole(mode)
			 * @param mode - "true" to show, "false" to hide.
			 */
			showConsole: function(mode) {
				var returnMessage;

				if(mode) {
					returnMessage = GEPPETTO.Resources.SHOW_CONSOLE;
				}
				else {
					returnMessage = GEPPETTO.Resources.HIDE_CONSOLE;
				}

				GEPPETTO.Console.showConsole(mode);

				return returnMessage;
			},

			/**
			 *
			 * Waits certain amount of time before running next command. Must be
			 * used inside a script.
			 *
			 * @name G.wait(ms)
			 */
			wait: function() {
				return GEPPETTO.Resources.INVALID_WAIT_USE;
			},

			/**
			 * Waits some amount of time before executing a set of commands
			 *
			 * @name G.wait(commands,ms)
			 * @param commands - commands to execute
			 * @param ms - milliseconds to wait before executing commands
			 */
			wait: function(commands, ms) {
				setTimeout(function() {
					//execute commands after ms milliseconds
					GEPPETTO.ScriptRunner.executeScriptCommands(commands);
				}, ms);

				return GEPPETTO.Resources.WAITING;
			},

			/**
			 * State of debug statements, whether they are turned on or off.
			 *
			 * @returns {boolean} Returns true or false depending if debug statements are turned on or off.
			 */
			isDebugOn: function() {
				return debugMode;
			}

		};
	};
});