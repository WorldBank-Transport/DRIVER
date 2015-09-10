(function () {
    'use strict';

    /* ngInject */
    function DriverLayersController($log, $scope, $rootScope, Config, RecordState) {
        var ctl = this;

        ctl.recordType = 'ALL';
        ctl.layerSwitcher = null;
        ctl.map = null;
        ctl.overlays = null;
        ctl.baseMaps = null;

        var cartoDBAttribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>';
        var streetsUrl = 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';
        var heatmapUrl = '/tiles/table/ashlar_record/id/ALL/{z}/{x}/{y}.png?heatmap=true';
        var recordsUrl = '/tiles/table/ashlar_record/id/ALL/{z}/{x}/{y}.png';
        var recordsUtfgridUrl = '/tiles/table/ashlar_record/id/ALL/{z}/{x}/{y}.grid.json';
        var boundaryUrl = '/tiles/table/ashlar_boundary/id/ALL/{z}/{x}/{y}.png';

        // prepend hostname to URLs
        heatmapUrl = Config.windshaft.hostname + heatmapUrl;
        recordsUrl = Config.windshaft.hostname + recordsUrl;
        recordsUtfgridUrl = Config.windshaft.hostname + recordsUtfgridUrl;
        boundaryUrl = Config.windshaft.hostname + boundaryUrl;

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

                // add overlays
                ctl.setRecordLayers();
            });
        };

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
            var recordsLayer = new L.tileLayer(ctl.getFilteredUrl(recordsUrl), recordsLayerOptions);

            // layer with heatmap of events
            var heatmapOptions = angular.extend(defaultLayerOptions, {zIndex: 4});
            var heatmapLayer = new L.tileLayer(ctl.getFilteredUrl(heatmapUrl), heatmapOptions);

            // interactivity for record layer
            var utfGridRecordsLayer = new L.UtfGrid(ctl.getFilteredUrl(recordsUtfgridUrl),
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
            var boundaryLayerOptions = angular.extend(defaultLayerOptions, {zIndex: 2});
            var boundaryLayer = new L.tileLayer(boundaryUrl, boundaryLayerOptions);

            // TODO: find a reasonable way to get the current layers selected, to add those back
            // when switching record type, so selected layers does not change with filter change.

            // Add layers to show by default.
            // Layers added to map will automatically be selected in the layer switcher.
            ctl.map.addLayer(recordsLayer);
            ctl.map.addLayer(utfGridRecordsLayer);

            ctl.overlays = {
                'Boundaries': boundaryLayer,
                'Events': recordsLayer,
                'Events Interactivity': utfGridRecordsLayer,
                'Heatmap': heatmapLayer
            };

            // add layer switcher control; expects to have layer zIndex already set

            // If layer switcher already initialized, must re-initialize it.
            if (ctl.layerSwitcher) {
                ctl.layerSwitcher.removeFrom(ctl.map);
            }
            ctl.layerSwitcher = L.control.layers(ctl.baseMaps, ctl.overlays, {autoZIndex: false});
            ctl.layerSwitcher.addTo(ctl.map);
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

            // add header with event date constant field
            /* jshint camelcase: false */
            var str = '<div class="record-popup">';
            str += '<div><h3>Occurred on: ' + record.occurred_from + '</h3>';
            /* jshint camelcase: true */

            // build HTML for popup from the record object
            function strFromObj(obj) {
                angular.forEach(obj, function(value, key) {
                    if (typeof value === 'object') {
                        str += '<h4>' + key + '</h4><div style="margin:15px;">';
                        // recursively add child things, indented
                        strFromObj(value);
                        str += '</div>';
                    } else {
                        // have a simple value; display it
                        str += '<p>' + key + ': ' + value + '</p>';
                    }
                });
            }

            strFromObj(data);

            str += '</div></div>';
            return str;
        };

        /**
         * Helper function to get map layers URL with record type set.
         *
         * @param {String} baseUrl Map layer url with record type parameter set to 'ALL'
         * @returns {String} The baseUrl with the record type parameter set to the selected type.
         */
        ctl.getFilteredUrl = function(baseUrl) {
            if (ctl.recordType && ctl.recordType !== 'ALL') {
                return baseUrl.replace(/ALL/, ctl.recordType);
            } else {
                return baseUrl;
            }
        };

        $scope.$on('driver.state.recordstate:selected', function(event, selected) {
            if (ctl.recordType !== selected && selected && selected.uuid) {
                ctl.recordType = selected.uuid;
                // re-add the layers to refresh with filtered content
                ctl.setRecordLayers();
            }
        });

        return ctl;
    }

    angular.module('driver.views.map')
    .controller('driverLayersController', DriverLayersController);

})();
