(function () {
    'use strict';

    /* ngInject */
    function DriverLayersController($log, $scope, $rootScope, Config) {
        var ctl = this;

        var cartoDBAttribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>';
        var streetsUrl = 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';
        var heatmapUrl = '/tiles/table/ashlar_record/id/ALL/{z}/{x}/{y}.png?heatmap=true';
        var recordsUrl = '/tiles/table/ashlar_record/id/ALL/{z}/{x}/{y}.png';
        var recordsUtfgridUrl = '/tiles/table/ashlar_record/id/ALL/{z}/{x}/{y}.grid.json';

        // prepend hostname to URLs
        heatmapUrl = Config.windshaft.hostname + heatmapUrl;
        recordsUrl = Config.windshaft.hostname + recordsUrl;
        recordsUtfgridUrl = Config.windshaft.hostname + recordsUtfgridUrl;

        /**
         * Adds the map layers and sets up the layer switcher control.
         *
         * @param {Object} map Leaflet map returned by leaflet directive initialization.
         */
        ctl.setRecordLayers = function(map) {
            var streets = new L.tileLayer(streetsUrl,
                                          {attribution: cartoDBAttribution});
            map.addLayer(streets, {detectRetina: true});

            // layer with heatmap of events
            var heatmapLayer = new L.tileLayer(heatmapUrl, {attribution: 'PRS'});

            // Event record points. Change 'ALL' for a record type UUID to filter layer
            var recordsLayer = new L.tileLayer(recordsUrl, {attribution: 'PRS'});
            map.addLayer(recordsLayer, {detectRetina: true});

            // interactivity for record layer
            var utfGridRecordsLayer = new L.UtfGrid(recordsUtfgridUrl, {useJsonP: false});
            map.addLayer(utfGridRecordsLayer, {detectRetina: true});

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
                    .openOn(map);
            });

            // user-uploaded boundary layer(s)
            var boundaryLayer = new L.tileLayer(Config.windshaft.hostname +
                                                '/tiles/table/ashlar_boundary/id/ALL/{z}/{x}/{y}.png',
                                                {attribution: 'PRS'});

            var baseMaps = {
                'CartoDB Positron': streets
            };

            var overlays = {
                'Heatmap': heatmapLayer,
                'Events': recordsLayer,
                'Boundaries': boundaryLayer
            };

            // layer switcher control
            L.control.layers(baseMaps, overlays).addTo(map);
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

            // add header with the label and event date constant fields
            /* jshint camelcase: false */
            var str = '<div class="record-popup">';
            str += '<h3>' + record.label + '</h3><div>';
            str += '<p>Occurred on: ' + record.occurred_from + '</p>';
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

        return ctl;
    }

    angular.module('driver.views.map')
    .controller('driverLayersController', DriverLayersController);

})();
