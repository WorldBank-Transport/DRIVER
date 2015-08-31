(function () {
    'use strict';

    var cartoDBAttribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>';

    function driverBaseLayers(Config) {
        var module = {
            restrict: 'A',
            scope: false,
            replace: false,
            require: 'leafletMap',
            link: link
        };
        return module;

        function link(scope, element, attrs, controller) {
            controller.getMap().then(setRecordLayers);
        }

        function setRecordLayers(map) {
            var streets = new L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
                                          {attribution: cartoDBAttribution});
            map.addLayer(streets, {detectRetina: true});

            // layer with heatmap of events
            var heatmapLayer = new L.tileLayer(Config.windshaft.hostname +
                                               '/tiles/table/ashlar_record/id/ALL/{z}/{x}/{y}.png?heatmap=true',
                                               {attribution: 'PRS'});
            map.addLayer(heatmapLayer, {detectRetina: true});

            // Event record points. Change 'ALL' for a record type UUID to filter layer
            var recordsLayer = new L.tileLayer(Config.windshaft.hostname +
                                               '/tiles/table/ashlar_record/id/ALL/{z}/{x}/{y}.png',
                                               {attribution: 'PRS'});
            map.addLayer(recordsLayer, {detectRetina: true});

            // interactivity for record layer
            var utfGridRecordsLayer = new L.UtfGrid(Config.windshaft.hostname +
                                                    '/tiles/table/ashlar_record/id/ALL/{z}/{x}/{y}.grid.json',
                                                    {useJsonP: false});
            map.addLayer(utfGridRecordsLayer, {detectRetina: true});

            utfGridRecordsLayer.on('click', function(e) {
                var popupOptions = {
                    maxWidth: 400,
                    maxHeight: 300,
                    autoPan: true,
                    closeButton: true,
                    autoPanPadding: [5, 5]
                };

                new L.popup(popupOptions)
                    .setLatLng(e.latlng)
                    .setContent(buildRecordPopup(e.data))
                    .openOn(map);
            });

            // user-uploaded boundary layer(s)
            var boundaryLayer = new L.tileLayer(Config.windshaft.hostname +
                                                '/tiles/table/ashlar_boundary/id/ALL/{z}/{x}/{y}.png',
                                                {attribution: 'PRS'});
            map.addLayer(boundaryLayer, {detectRetina: true});

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
        }

        /**
         * Build popup content from arbitrary record data.
         *
         * @param {Object} UTFGrid interactivity data from interaction event object
         * @returns {String} HTML snippet for a Leaflet popup.
         */
        function buildRecordPopup(record) {
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
        }
    }

    angular.module('driver.views.map')
        .directive('driverBaseLayers', driverBaseLayers);

})();
