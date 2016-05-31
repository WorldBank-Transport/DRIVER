(function () {
    'use strict';

    /* ngInject */
    function recentEventsMapLayers($q, BoundaryState, InitialState, RecordState, QueryBuilder,
                                   TileUrlService, BaseLayersService) {
        var defaultLayerOptions = {attribution: 'PRS', detectRetina: true};
        var recencyCutoffDays = 14;

        var recordLayers = null;
        var layerSwitcher = null;
        var module = {
            restrict: 'A',
            scope: false,
            replace: false,
            controller: '',
            require: ['leafletMap'],
            link: link
        };
        return module;

        function link(scope, element, attrs, controllers) {
            InitialState.ready().then(function() {
                var leafletController = controllers[0];

                leafletController.getMap().then(addBaseLayers).then(updateLayers);
                // Zoom to selected boundary on initialization
                // This will happen asynchronously with the updateLayers call above
                $q.all([leafletController.getMap(), BoundaryState.getSelected()])
                    .then(function(results) {
                        var map = results[0];
                        var bounds = results[1];
                        if (bounds.bbox) {
                            map.fitBounds(bounds.bbox);
                        }
                    });

                // Update when boundary is changed (currently a no-op, but that will change once we add
                // boundary filtering). Function parameters commented out to show what's available.
                scope.$on('driver.state.boundarystate:selected', function(/*event, selected*/) {
                    leafletController.getMap().then(updateLayers);
                });

                scope.$on('driver.state.recordstate:selected', function() {
                    leafletController.getMap().then(updateLayers);
                });
            });
        }
        /**
         * Initialize base layers and switcher
         *
         * @param {Object} map Leaflet map returned by leaflet directive initialization.
         */
        function addBaseLayers(newMap) {
            var baseMaps = BaseLayersService.baseLayers();
            newMap.addLayer(baseMaps[0].layer);

            if(!layerSwitcher){
                layerSwitcher = L.control.layers(
                    _.zipObject(_.map(baseMaps, 'label'), _.map(baseMaps, 'layer'))
                );
                layerSwitcher.addTo(newMap);
            }

            return newMap;
        }

        /**
         * Update the layers displaying on the map in response to changes
         *
         * @param {Object} map Leaflet map to update layers on
         */
        function updateLayers(map) {
            var recordsLayerOptions = angular.extend(defaultLayerOptions, {zIndex: 3});
            var occurredMin = new Date();
            occurredMin.setDate(occurredMin.getDate() - recencyCutoffDays);
            RecordState.getSelected().then(function(selected) {
                // Construct Windshaft URL
                var baseUrl = TileUrlService.recTilesUrl(selected.uuid);
                /* jshint camelcase: false */
                var params = {
                    tilekey: true,
                    occurred_min: occurredMin.toISOString()
                };
                /* jshint camelcase: true */
                var filterConfig = { doAttrFilters: false,
                                     doBoundaryFilter: true,
                                     doJsonFilters: false, };

                return QueryBuilder.djangoQuery(0, params, filterConfig).then(function(result) {
                    var tilekeyParam = (baseUrl.match(/\?/) ? '&' : '?') + 'tilekey=';
                    return baseUrl + tilekeyParam + result.tilekey;
                });
            // Swap layers
            }).then(function(fullUrl) {
                // Remove existing layers
                if (recordLayers) {
                    angular.forEach(recordLayers, function(layer) {
                        map.removeLayer(layer);
                    });
                }
                // Add new layers
                var recordsLayer = new L.tileLayer(fullUrl, recordsLayerOptions);
                recordLayers = {
                    'Recent records': recordsLayer
                };
                map.addLayer(recordsLayer);
            });
        }
    }

    angular.module('driver.map-layers.recent-events')
        .directive('recentEvents', recentEventsMapLayers);

})();
