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

            // Change 'ALL' for a record type UUID to filter layer
            var recordsLayer = new L.tileLayer(Config.windshaft.hostname +
                                               '/tiles/table/ashlar_record/id/ALL/{z}/{x}/{y}.png',
                                               {attribution: 'PRS'});
            map.addLayer(recordsLayer, {detectRetina: true});

            // interactivity for record layer
            var utfGridRecordsLayer = new L.UtfGrid(Config.windshaft.hostname +
                                                    '/tiles/table/ashlar_record/id/ALL/{z}/{x}/{y}.grid.json',
                                                    {useJsonP: false});
            map.addLayer(utfGridRecordsLayer, {detectRetina: true});

            utfGridRecordsLayer.on('mouseover', function(e) {

                // arbitrary fields
                var data = JSON.parse(e.data.data);

                map.closePopup();
                var popup = new L.popup()
                    .setLatLng(e.latlng)
                    .setContent(e.data.label + ' ' + e.data.occurred_from)
                    .openOn(map);
            });

            utfGridRecordsLayer.on('mouseout', function() {
                map.closePopup();
            });

            // user-uploaded boundary layer(s)
            var boundaryLayer = new L.tileLayer(Config.windshaft.hostname +
                                                '/tiles/table/ashlar_boundary/id/ALL/{z}/{x}/{y}.png',
                                                {attribution: 'PRS'});
            map.addLayer(boundaryLayer, {detectRetina: true});
        }
    }

    angular.module('driver.views.map')
        .directive('driverBaseLayers', driverBaseLayers);

})();
