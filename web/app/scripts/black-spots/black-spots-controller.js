(function() {
    'use strict';

    /* ngInject */
    function BlackSpotsController(InitialState, TileUrlService, BaseLayersService, FilterState,
                                  RecordState, BoundaryState, BlackspotSets) {
        var ctl = this;
        ctl.map = null;
        ctl.initMap = initMap;

        function initMap(leafletController) {
            leafletController.getMap()
                .then(addBaseLayers)
                .then(updateBoundary)
                .then(addBlackSpotLayer);
        }

        function addBaseLayers(map) {
            var baseMaps = BaseLayersService.baseLayers();
            map.addLayer(baseMaps[0].layer);

            if(!ctl.layerSwitcher){
                ctl.layerSwitcher = L.control.layers(
                    _.zipObject(_.map(baseMaps, 'label'), _.map(baseMaps, 'layer'))
                );
                ctl.layerSwitcher.addTo(map);
            }
            return map;
        }

        function addBlackSpotLayer(map) {
            RecordState.getSelected().then(
                getBlackspotSets
            ).then(function(blackspotSet) {
                var blackspotsUrl = getBlackspotUrl(blackspotSet);
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
            if (blackspotSet.length > 0) {
                return TileUrlService.blackspotsUrl(blackspotSet[blackspotSet.length - 1].uuid);
            } else {
                return '';
            }
        }

        function updateBoundary(map) {
            BoundaryState.getSelected().then(function(boundary) {
                if (boundary.bbox) {
                    map.fitBounds(boundary.bbox);
                }
            });

            return map;
        }
    }

    angular.module('driver.blackSpots')
        .controller('BlackSpotsController', BlackSpotsController);

})();
