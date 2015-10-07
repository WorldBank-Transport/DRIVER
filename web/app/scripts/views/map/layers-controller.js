(function () {
    'use strict';

    /* ngInject */
    function DriverLayersController($q, $log, $scope, $rootScope, $timeout,
                                    WebConfig, FilterState, RecordState, GeographyState,
                                    Records, QueryBuilder) {
        var ctl = this;

        ctl.recordType = 'ALL';
        ctl.layerSwitcher = null;
        ctl.drawControl = null;
        ctl.map = null;
        ctl.overlays = null;
        ctl.baseMaps = null;
        ctl.editLayers = null;
        ctl.filterSql = null;

        var cartoDBAttribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>';
        var streetsUrl = 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';
        var heatmapUrl = '/tiles/table/ashlar_record/id/ALL/{z}/{x}/{y}.png?heatmap=true';
        var recordsUrl = '/tiles/table/ashlar_record/id/ALL/{z}/{x}/{y}.png';
        var recordsUtfgridUrl = '/tiles/table/ashlar_record/id/ALL/{z}/{x}/{y}.grid.json';
        var boundaryUrl = '/tiles/table/ashlar_boundary/id/ALL/{z}/{x}/{y}.png';

        // prepend hostname to URLs
        heatmapUrl = WebConfig.windshaft.hostname + heatmapUrl;
        recordsUrl = WebConfig.windshaft.hostname + recordsUrl;
        recordsUtfgridUrl = WebConfig.windshaft.hostname + recordsUtfgridUrl;
        boundaryUrl = WebConfig.windshaft.hostname + boundaryUrl;

        /**
         * Initialize layers on map.
         * First calls to get the current selection in the record type drop-down.
         *
         * @param {Object} map Leaflet map returned by leaflet directive initialization.
         */
        ctl.initLayers = function(map) {

            ctl.map = map;

            // get the current record type selection for filtering
            RecordState.getSelected().then(function(selected) {
                if (selected && selected.uuid) {
                    ctl.recordType = selected.uuid;
                } else {
                    ctl.recordType = 'ALL';
                }

                // add base layer
                var streetsOptions = {
                    attribution: cartoDBAttribution,
                    detectRetina: true,
                    zIndex: 1
                };
                var streets = new L.tileLayer(streetsUrl, streetsOptions);
                ctl.map.addLayer(streets);

                ctl.baseMaps = {
                    'CartoDB Positron': streets
                };

                // add polygon draw control and layer to edit on
                ctl.editLayers = new L.FeatureGroup();
                ctl.map.addLayer(ctl.editLayers);

                ctl.drawControl = new L.Control.Draw({
                    draw: {
                        // TODO: figure out a good way to export circles.
                        // Calling toGeoJSON on the Leaflet feature layer
                        // returns a point with no radius set in the properties.
                        circle: false,
                        marker: false,
                        polyline: false,
                        polygon: {
                            allowIntersection: false,
                            showArea: true,
                            drawError: {
                                // TODO: pick a custom color to set, or remove option
                                //color: '#e1e100', // Color the shape will turn when intersects
                                message: '<strong>Filter area cannot intersect itself.</strong>'
                            },
                            shapeOptions: {
                                //color: '#bdda55'
                            }
                        },
                        edit: {
                            FeatureGroup: ctl.editLayers,
                            // TODO: why aren't the edit and remove toolbar buttons showing?
                            edit: true,
                            remove: true
                        }
                    }
                });

                ctl.map.addControl(ctl.drawControl);

                // handle map draw events
                ctl.map.on('draw:created', function(e) {
                    filterShapeCreated(e);
                });

                ctl.map.on('draw:editstop', function(e) {
                    filterShapeCreated(e);
                });

                // only allow one filter shape at a time
                // TODO: temporarily remove interactivity layer while editing
                ctl.map.on('draw:drawstart', function() {
                    ctl.editLayers.clearLayers();
                    $rootScope.$broadcast('driver.views.map:filterdrawn', null);
                });

                ctl.map.on('draw:deleted', function() {
                    ctl.editLayers.clearLayers();
                    $rootScope.$broadcast('driver.views.map:filterdrawn', null);
                });

                // TODO: Find a better way to ensure this doesn't happen until filterbar ready
                // (without timeout, filterbar components aren't ready to listen yet)
                // add filtered overlays
                // this will trigger `driver.filterbar:changed` when complete
                $timeout(FilterState.restoreFilters, 1000);
            });
        };

        function filterShapeCreated(event) {
            // TODO: is the shape type useful info?
            //var type = event.layerType;

            var layer = event.layer;

            ctl.editLayers.clearLayers();
            $rootScope.$broadcast('driver.views.map:filterdrawn', null);
            ctl.editLayers.addLayer(layer);

            // pan/zoom to selected area
            ctl.map.fitBounds(layer.getBounds());

            // Send exported shape to filterbar, which will send `changed` event with filters.
            var geojson = ctl.editLayers.toGeoJSON();
            $rootScope.$broadcast('driver.views.map:filterdrawn', geojson);

            // TODO: use an interaction event to remove the drawn filter area?
            /*
            layer.on('click', function(e) {
                $log.debug('draw layer clicked!');
                $log.debug(e);
            });
            */
        }

        /**
         * Adds the map layers. Removes them first if they already exist.
         *
         * @param {Object} map Leaflet map returned by leaflet directive initialization.
         */
        ctl.setRecordLayers = function() {

            if (!ctl.map) {
                $log.error('Map controller has no map! Cannot add layers.');
                return;
            }

            // remove overlays if already added
            if (ctl.overlays) {
                angular.forEach(ctl.overlays, function(overlay) {
                    ctl.map.removeLayer(overlay);
                });
            }

            var defaultLayerOptions = {attribution: 'PRS', detectRetina: true};

            // Event record points. Use 'ALL' or record type UUID to filter layer
            var recordsLayerOptions = angular.extend(defaultLayerOptions, {zIndex: 3});
            var recordsLayer = new L.tileLayer(ctl.getFilteredRecordUrl(recordsUrl), recordsLayerOptions);

            // layer with heatmap of events
            var heatmapOptions = angular.extend(defaultLayerOptions, {zIndex: 4});
            var heatmapLayer = new L.tileLayer(ctl.getFilteredRecordUrl(heatmapUrl), heatmapOptions);

            // interactivity for record layer
            var utfGridRecordsLayer = new L.UtfGrid(ctl.getFilteredRecordUrl(recordsUtfgridUrl),
                                                    {useJsonP: false, zIndex: 5});

            utfGridRecordsLayer.on('click', function(e) {
                // ignore clicks where there is no event record
                if (!e.data) {
                    return;
                }

                var popupOptions = {
                    maxWidth: 400,
                    maxHeight: 300,
                    autoPan: true,
                    closeButton: true,
                    autoPanPadding: [5, 5]
                };

                new L.popup(popupOptions)
                    .setLatLng(e.latlng)
                    .setContent(ctl.buildRecordPopup(e.data))
                    .openOn(ctl.map);
            });

            // user-uploaded boundary layer(s)
            var availableBoundaries = $q.defer();
            GeographyState.getOptions().then(function(boundaries) {
                var boundaryLayerOptions = angular.extend(defaultLayerOptions, {zIndex: 2});
                var boundaryLabelLayer = boundaries.map(function(boundary) {
                    var url = (ctl.getFilteredUrl(boundaryUrl, boundary.uuid) +
                        '?color=' +
                        encodeURIComponent(boundary.color));
                    var boundaryLayer = new L.tileLayer(url, boundaryLayerOptions);
                    return [boundary.label, boundaryLayer];
                });
                availableBoundaries.resolve(_.zipObject(boundaryLabelLayer));
            });

            // TODO: find a reasonable way to get the current layers selected, to add those back
            // when switching record type, so selected layers does not change with filter change.

            // Add layers to show by default.
            // Layers added to map will automatically be selected in the layer switcher.
            ctl.map.addLayer(recordsLayer);
            ctl.map.addLayer(utfGridRecordsLayer);

            var recordsOverlays = {
                'Events': recordsLayer,
                'Events Interactivity': utfGridRecordsLayer,
                'Heatmap': heatmapLayer
            };

            availableBoundaries.promise.then(function(boundaryOverlays) {
                ctl.overlays = angular.extend({}, boundaryOverlays, recordsOverlays);

                // add layer switcher control; expects to have layer zIndex already set

                // If layer switcher already initialized, must re-initialize it.
                if (ctl.layerSwitcher) {
                    ctl.layerSwitcher.removeFrom(ctl.map);
                }
                ctl.layerSwitcher = L.control.layers(ctl.baseMaps, ctl.overlays, {autoZIndex: false});
                ctl.layerSwitcher.addTo(ctl.map);
            });
        };

        /**
         * Build popup content from arbitrary record data.
         *
         * @param {Object} UTFGrid interactivity data from interaction event object
         * @returns {String} HTML snippet for a Leaflet popup.
         */
        ctl.buildRecordPopup = function(record) {
            // read arbitrary record fields object

            var data = JSON.parse(record.data);
            var startingUnderscoreRegex = /^_/;

            // add header with event date constant field
            /* jshint camelcase: false */
            var str = '<div class="record-popup">';
            str += '<div><h3>Occurred on: ' + record.occurred_from + '</h3>';
            /* jshint camelcase: true */

            // build HTML for popup from the record object
            function strFromObj(obj) {
                angular.forEach(obj, function(value, key) {
                    // Skip _localId hashes, any other presumably private values
                    // starting with an underscore, and their children.
                    // Checking type because some keys are numeric.
                    if (typeof key === 'string' && !key.match(startingUnderscoreRegex)) {
                        if (typeof value === 'object') {
                            str += '<h4>' + key + '</h4><div style="margin:15px;">';
                            // recursively add child things, indented
                            strFromObj(value);
                            str += '</div>';
                        } else {
                            // have a simple value; display it
                            str += '<p>' + key + ': ' + value + '</p>';
                        }
                    }
                });
            }

            strFromObj(data);

            str += '</div></div>';
            return str;
        };

        /**
         * Helper function to get map layers URL with resource ID set.
         *
         * @param {String} baseUrl Map layer url with resource parameter set to 'ALL'
         * @param {String} resourceId Resource ID to put into the URL.
         * @returns {String} The baseUrl with the record type parameter set to the selected type.
         */
        ctl.getFilteredUrl = function(baseUrl, resourceId) {
            var url = baseUrl;
            if (resourceId && resourceId !== 'ALL') {
                url = url.replace(/ALL/, resourceId);
            }
            return url;
        };

        /**
         * Helper function to add a SQL filter parameter to the windshaft URL
         *
         * @param {String} baseUrl Map layer URL
         * @param {String} sql SQL to append to the request URL
         * @returns {String} The baseUrl with the record type parameter set to the selected type.
         */
        ctl.addFilterSql = function(baseUrl, sql) {
            var url = baseUrl;
            if (sql) {
                // TODO: find a less hacky way to handle building URLs for Windshaft
                url += url.match(/\?/) ? '&sql=' : '?sql=';
                url += encodeURIComponent(sql);
            }
            return url;
        };

        /**
         * Helper function to completely construct a records URL (dots / heatmap / utfGrid)
         * @param {String} baseUrl Map layer URL
         * @returns {String} The baseUrl with the record type parameter set and sql parameter set.
         */
        ctl.getFilteredRecordUrl = function(baseUrl) {
            var url = baseUrl;
            url = ctl.getFilteredUrl(url, ctl.recordType);
            url = ctl.addFilterSql(url, ctl.filterSql);
            return url;
        };

        $scope.$on('driver.state.recordstate:selected', function(event, selected) {
            if (ctl.recordType !== selected && selected && selected.uuid) {
                ctl.recordType = selected.uuid;
                // re-add the layers to refresh with filtered content
                ctl.setRecordLayers();
            }
        });

        /**
         * Update map when filters change
         */
        var filterHandler = $rootScope.$on('driver.filterbar:changed', function() {
            // get the raw SQL for the filter to send along to Windshaft
            QueryBuilder.djangoQuery(true, 0, {query: true}).then(function(records) {
                ctl.filterSql = records.query;
                ctl.setRecordLayers();
            });
        });

        // $rootScope listeners must be manually unbound when the $scope is destroyed
        $scope.$on('$destroy', filterHandler);

        return ctl;
    }

    angular.module('driver.views.map')
    .controller('driverLayersController', DriverLayersController);

})();
