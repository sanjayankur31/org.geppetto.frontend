
/**
 * Connectivity Widget
 *
 * @author Adrian Quintana (adrian.perez@ucl.ac.uk)
 * @author borismarin
 */

define(function (require) {

    var Widget = require('../Widget');
    var $ = require('jquery');
    var _ = require('underscore');
    var Instance = require('../../../geppettoModel/model/Instance');
    require('../../controls/mixins/bootstrap/modal.js')
    
    var d3 = require("d3");

	var chords = require('./chords');
	var hives = require('./hives');
	var matrices = require('./matrices');
	var forces = require('./forces');
    
    var widgetUtility = require("../WidgetUtility");
    widgetUtility.loadCss("geppetto/js/components/widgets/connectivity/Connectivity.css");

    return Widget.View.extend({

        dataset: {},
        nodeColormap: {},
        connectivityOptions: {},
        defaultConnectivityOptions: {
            width: 660,
            height: 500,
            layout: "matrix", //[matrix, force, hive, chord]
            nodeType: function (node) {
                if (node instanceof Instance) {
                    return node.getType().getId();
                } else {
                    return node.getPath().split('_')[0];
                }
            },
            linkWeight: function (conn) {
                return 1;
            },
            linkType: function (conn) {
                return 1;
            }
        },
 
        initialize: function (options) {
            this.options = options;

            Widget.View.prototype.initialize.call(this, options);
            this.setOptions(this.defaultConnectivityOptions);

            this.render();
            this.setSize(options.height, options.width);

            this.connectivityContainer = $("#" + this.id);

            var that=this;
            this.addButtonToTitleBar($("<div class='fa fa-gear'></div>").on('click', function(event) {
                that.configViaGUI();
            }));

            //resizes connectivity widget when maximizing/restoring using buttons on top
            $(".ui-dialog-titlebar-maximize, .ui-dialog-titlebar-restore").on("click",function(){
            	var height = $("#"+that.id).parent().height();
                var width = $("#"+that.id).parent().width();

                GEPPETTO.Console.executeCommand(that.id + ".setSize(" + height + "," + width + ")");

                var left = $("#"+that.id).parent().offset().left;
                var top = $("#"+that.id).parent().offset().top;

                window[that.id].setPosition(left, top);
            });
        },

        setSize: function (h, w) {
            Widget.View.prototype.setSize.call(this, h, w);
            if (this.svg != null) {
                //TODO: To subtract 20px is horrible and has to be replaced but I have no idea about how to calculate it
                var width = this.size.width - 20;
                var height = this.size.height - 20;
                if (this.options.layout == 'matrix') {
                    $('#' + this.id + '-ordering').remove();
                }
                this.createLayout();
            }
        },

        setNodeColormap: function(nodeColormap) {
            if (typeof nodeColormap != 'undefined') {
                if (typeof nodeColormap.range == 'undefined')
                    this.nodeColormap = d3.scaleOrdinal(d3.schemeCategory20)
                    .domain(nodeColormap.domain);
                else
                    this.nodeColormap = d3.scaleOrdinal(nodeColormap.range)
                    .domain(nodeColormap.domain);
            }
            return this.nodeColormap;
        },

        setData: function (root, options, nodeColormap) {
            this.setOptions(options);
            this.setNodeColormap(nodeColormap);
            this.dataset = {};
            this.mapping = {};
            this.mappingSize = 0;
            this.dataset["root"] = root;
            this.widgetMargin = 20;

            if(this.createDataFromConnections()){
            	this.createLayout();	
            }

            // track change in state of the widget
            this.dirtyView = true;

            return this;
        },

        createDataFromConnections: function () {
            if(this.options.library.connection){
            	
                var connectionVariables = this.options.library.connection.getVariableReferences();
            	if(connectionVariables.length>0) {

		            if (this.dataset["root"].getMetaType() == GEPPETTO.Resources.INSTANCE_NODE) {
		                var subInstances = this.dataset["root"].getChildren();
		                this.dataset["nodes"] = [];
		                this.dataset["links"] = [];
		
		                for (var k = 0; k < subInstances.length; k++) {
		                    var subInstance = subInstances[k];
		                    if (subInstance.getMetaType() == GEPPETTO.Resources.ARRAY_INSTANCE_NODE) {
		                        var populationChildren = subInstance.getChildren();
		                        for (var l = 0; l < populationChildren.length; l++) {
		                            var populationChild = populationChildren[l];
		                            this.createNode(populationChild.getId(), this.options.nodeType(populationChild));
		                        }
		
		                    }
		                }

		                for(var x=0; x<connectionVariables.length; x++){
	                        var connectionVariable = connectionVariables[x];
	
	                        var source = connectionVariable.getA();
	                        var target = connectionVariable.getB();
	                        var sourceId = source.getElements()[source.getElements().length - 1].getPath();
	                        var targetId = target.getElements()[source.getElements().length - 1].getPath();
	
	                        this.createLink(sourceId, targetId, this.options.linkType(connectionVariable), this.options.linkWeight(connectionVariable));
		                }
		            }
                	
		            this.dataset.nodeTypes = _.uniq(_.pluck(this.dataset.nodes, 'type'));
		            this.dataset.linkTypes = _.uniq(_.pluck(this.dataset.links, 'type'));
		            return true;
                }
            
            }
            
            return false;

        },


        //TODO: move graph utils to module, maybe consider jsnetworkx?
        // this is very rough, we should think about directionality and weights...
        calculateNodeDegrees: function (normalize) {
            var indegrees = _.countBy(this.dataset.links, function (link) {
                return link.source;
            });
            var outdegrees = _.countBy(this.dataset.links, function (link) {
                return link.target;
            });
            var maxDeg = 1;
            this.dataset.nodes.forEach(function (node, idx) {
                var idg = (typeof indegrees[idx] === 'undefined') ? 0 : indegrees[idx];
                var odg = (typeof outdegrees[idx] === 'undefined') ? 0 : outdegrees[idx];
                node.degree = idg + odg;
                if (node.degree > maxDeg) {
                    maxDeg = node.degree;
                }
            });
            if (normalize) {
                this.dataset.nodes.forEach(function (node) {
                    node.degree /= maxDeg;
                });
            }
        },

        createLayout: function () {
            $('#' + this.id + " svg").remove();
            $('#' + this.id + " #matrix-sorter").remove();

            this.options.innerWidth = this.connectivityContainer.innerWidth() - this.widgetMargin;
            this.options.innerHeight = this.connectivityContainer.innerHeight() - this.widgetMargin;

            this.svg = d3.select("#" + this.id)
                .append("svg")
                .attr("width", this.options.innerWidth)
                .attr("height", this.options.innerHeight);

            switch (this.options.layout) {
                case 'matrix':
                    matrices.createMatrixLayout(this);
                    break;
                case 'force':
                    forces.createForceLayout(this);
                    break;
                case 'hive':
                    //TODO: ugly preprocessing here...
                    this.calculateNodeDegrees(true);
                    hives.createHiveLayout(this);
                    break;
                case 'chord':
                    //TODO: ugly preprocessing here...
                    this.calculateNodeDegrees(false);
                    chords.createChordLayout(this);
                    break;
            }
        },


        createLegend: function (id, colorScale, position, title) {

            var ret;
            //TODO: boxes should scale based on number of items
            var colorBox = {size: 20, labelSpace: 4};
            var padding = {x: colorBox.size, y: 2 * colorBox.size};

            //TODO: is it sane not to draw the legend if there is only one category?
            if (colorScale.domain().length > 1) {
                var horz, vert;
                var legendItem = this.svg.selectAll(id)
                    .data(colorScale.domain())
                    .enter().append('g')
                    .attr('class', 'legend-item')
                    .attr('transform', function (d, i) {
                        var height = colorBox.size + colorBox.labelSpace;
                        horz = colorBox.size + position.x + padding.x;
                        vert = i * height + position.y + padding.y;
                        return 'translate(' + horz + ',' + vert + ')';
                    });

                // coloured squares
                legendItem.append('rect')
                    .attr('width', colorBox.size)
                    .attr('height', colorBox.size)
                    .style('fill', function (d) {
                        return colorScale(d);
                    })
                    .style('stroke', function (d) {
                        return colorScale(d);
                    });

                // labels
                legendItem.append('text')
                    .attr('x', colorBox.size + colorBox.labelSpace)
                    .attr('y', colorBox.size - colorBox.labelSpace)
                    .attr('class', 'legend-text')
                    .text(function (d) {
                        return d;
                    });

                // title
                if (typeof title != 'undefined') {
                    this.svg.append('text')
                        .text(title)
                        .attr('class', 'legend-title')
                        .attr('x', position.x + 2 * padding.x)
                        .attr('y', position.y + 0.75 * padding.y);
                }
                ret = {x: horz, y: vert};
            }

            this.legendPosition = position;
            this.legendTitle = title;
            return ret;

        },

        createNode: function (id, type) {
           if (!(id in this.mapping)) {
                var nodeItem = {
                    id: id,
                    type: type,
                };
                this.dataset["nodes"].push(nodeItem);

                this.mapping[nodeItem["id"]] = this.mappingSize;
                this.mappingSize++;
            }
        },

        createLink: function (sourceId, targetId, type, weight) {
            var linkItem = {
                source: this.mapping[sourceId],
                target: this.mapping[targetId],
                type: type,
                weight: weight
            };
            this.dataset["links"].push(linkItem);
        },

        /**
         *
         * Set the options for the connectivity widget
         *
         * @command setOptions(options)
         * @param {Object} options - options to modify the plot widget
         */
        setOptions: function (options) {

            this.connectivityOptions = options;

            function strToFunc(body){
                return new Function('x', 'return ' + body + ';');
            }
            if (options != null) {
                if(typeof options.linkType === 'string')
                    options.linkType = strToFunc(options.linkType);
                if(typeof options.nodeType === 'string')
                    options.nodeType = strToFunc(options.nodeType);
                if(typeof options.linkWeight === 'string')
                    options.linkWeight = strToFunc(options.linkWeight);
                $.extend(this.options, options);
            }

            var that = this;
            if (typeof this.options.colorMapFunction !== 'undefined')
                GEPPETTO.on(GEPPETTO.Events.Color_set, function() {
                    var nodeColormap = that.setNodeColormap(that.options.colorMapFunction());
                    // FIXME: would be more efficient to update only what has
                    // changed, though this depends on the layout
                    that.svg.selectAll("*").remove();
                    that.createLayout();
                });
        },
        
        createLayoutSelector: function() {

            function imgPath(path){
                return 'geppetto/js/components/widgets/connectivity/images/' + path;
            }

            var layoutOptions = [
                 {id: "matrix", label: 'Adjacency matrix', description:
                     "A coloured square at row 𝒊, column 𝒋 represents a " +
                     "directed connection from node 𝒋 to node 𝒊.",
                     img: imgPath('matrix.svg')},
                 {id: "force", label: 'Force-directed layout', description:
                     "Draw circles for nodes, lines for connections, disregarding " +
                     "spatial information.",
                     img: imgPath('force.svg')},
                 {id: "hive",  label: 'Hive plot', description:
                     "Axes correspond to node categories, arcs to connections." +
                     "The position of each node along an axis is determined by " +
                     "the total number of connections it makes.",
                     img: imgPath('hive.svg')},
                 {id: "chord", label:'Chord diagram', description:
                     "Circular slices correspond to node categories, chords to " +
                     "connections. A gap between slice and chord indicate an " +
                     "incoming connection. Use ctrl(shift) + mouse hover to " +
                     "hide incoming(outgoing) connections from a population.",
                     img: imgPath('chord.svg')}
             ];
            var container = $('<div>').addClass('card-deck-wrapper');
            $('<p class="card-wrapper-title">How would you like to represent your network?</p>').appendTo(container);
            var deck = $('<div>').addClass('card-deck').appendTo(container);

            function createCard(cardData){
                return $('<div>', {class: 'card', id: cardData.id})
                        .append($('<img>', {
                            class: 'card-img-top center-block',
                            src: cardData.img,
                        }))
                        .append($('<h4>', {
                            class: 'card-title',
                            text: cardData.label
                        }))
                        .append($('<p>', {
                            class: 'card-text',
                            text: cardData.description
                        }));
            }

            for(layout in layoutOptions){
                deck.append(createCard(layoutOptions[layout]));
            }

            return container;
        },

        configViaGUI : function() {
            var that = this;
            var firstClick=false;
            var modalContent=$('<div class="modal fade" id="connectivity-config-modal"></div>')
                                .append(this.createLayoutSelector()[0].outerHTML).modal();
            function handleFirstClick(event) {
                var netTypes = GEPPETTO.ModelFactory.getAllTypesOfType(that.options.library.network);
                var netInstances = _.flatten(_.map(netTypes, function(x){return GEPPETTO.ModelFactory.getAllInstancesOf(x)}))
                function synapseFromConnection(conn) {
                	
                    var synapses=GEPPETTO.ModelFactory.getAllVariablesOfType(conn.getParent(), that.options.library.synapse);
                	if(synapses.length>0){
                		return synapses[0].getId();
                	}
                	else{
                		return "Gap junction";
                	}
                }
                that.setData(netInstances[0], {layout: event.currentTarget.id, linkType: synapseFromConnection, library: that.connectivityOptions.library}); //TODO: add option to select what to plot if #netInstance>1?
                firstClick=true;
            }
            
            function clickHandler(event) {
            	if(!firstClick){
            		handleFirstClick(event);
            		setTimeout(function() { firstClick=false;}, 200); //closes the window to click again (dbclick)
            	}
            	else{
            		modalContent.modal('hide');
            		firstClick=false;
            	}
            }

            modalContent.find('.card').on('click', clickHandler);
        },

        getView: function(){
            var baseView = Widget.View.prototype.getView.call(this);

            // add connectivity specific options - contains logic, iterate and serialize
            var serializedOptions = {};
            for(var item in this.connectivityOptions){
                var serializedItem = {};
                if (typeof this.connectivityOptions[item] === "function") {
                    serializedItem.value = this.connectivityOptions[item].toString();
                    serializedItem.type = 'function';
                } else if (item === "library") {
                    serializedItem.value = this.connectivityOptions[item].getPath();
                    serializedItem.type = 'library';
                } else {
                    serializedItem.value = this.connectivityOptions[item];
                    serializedItem.type = 'primitive';
                }
                serializedOptions[item] = serializedItem;
            }
            baseView.options = serializedOptions;

            // add data
            baseView.dataType = 'object';
            baseView.data = this.dataset["root"].getPath();
            baseView.nodeColormap = {domain: this.nodeColormap.domain(),
                                     range: this.nodeColormap.range()};

            return baseView;
        },

        setView: function(view){
            // set base properties
            Widget.View.prototype.setView.call(this, view);

            if(view.dataType == 'object' && view.data != undefined && view.data != ''){
                var obj = eval(view.data);
                var deserializedOptions = {};
                for(var item in view.options){
                    if(view.options[item].type == "function" || view.options[item].type == "library"){
                        deserializedOptions[item] = eval('(' + view.options[item].value + ')');
                    } else {
                        deserializedOptions[item] = view.options[item].value;
                    }
                }

                var that = this;
                // resolve connections and pass the line below as a callback
                Model.neuroml.resolveAllImportTypes(function(){
                    that.setData(obj, deserializedOptions, view.nodeColormap);
                });
            }

            // after setting view through setView, reset dirty flag
            this.dirtyView = false;
        }
    });
});
