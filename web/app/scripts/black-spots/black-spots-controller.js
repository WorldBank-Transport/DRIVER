(function() {
    'use strict';

    /* ngInject */
    function BlackSpotsController(
        InitialState, TileUrlService, FilterState, RecordState, BlackspotSets
    ) {
        var cartoDBAttribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>';
        var ctl = this;
        ctl.map = null;
        ctl.initMap = initMap;

        function initMap(leafletController) {
            leafletController.getMap()
                .then(addBaseLayers)
                .then(addBlackSpotLayer);
        }

        function addBaseLayers(map) {
            //add base layer
            var streetOptions = {
                attribution: cartoDBAttribution,
                detectRetina: false,
                zIndex: 1
            };

            TileUrlService.baseLayerUrl().then(function(url) {
                var streets = new L.tileLayer(url, streetOptions);
                map.addLayer(streets);
            });

            return map;
        }

        function addBlackSpotLayer(map) {
            RecordState.getSelected().then(
                getBlackspotSets
            ).then(
                getBlackspotUrl
            ).then(function(blackspotsUrl) {
                var blackspotsLayer = new L.tileLayer(
                    blackspotsUrl, {
                        attribution: 'PRS',
                        detectRetina: true,
                        zIndex: 6
                    }
                );
                blackspotsLayer.addTo(map);
            });

            return map;
        }

        function getBlackspotSets(selected) {
            return BlackspotSets.query({
                'effective_at': FilterState.getDateFilter().maxDate,
                'record_type': (selected ? selected.uuid : '')
            }).$promise;
        }

        function getBlackspotUrl(blackspotSet) {
            return TileUrlService.blackspotsUrl(
                blackspotSet[blackspotSet.length - 1].uuid);
        }
    }

    angular.module('driver.blackSpots')
        .controller('BlackSpotsController', BlackSpotsController);

})();
