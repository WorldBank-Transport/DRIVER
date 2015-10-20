(function () {
    'use strict';

    /* ngInject */
    function recentEventsMapLayers($q, RecordTypeState, BoundaryState, TileUrlService, QueryBuilder) {
        var cartoDBAttribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>';
        var defaultLayerOptions = {attribution: 'PRS', detectRetina: true};
        var recencyCutoffDays = 14;

        var recordLayers = null;
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
            var leafletController = controllers[0];

            leafletController.getMap().then(addBaseLayers).then(updateLayers);
            // Zoom to selected boundary on initialization
            // This will happen asynchronously with the updateLayers call above
            $q.all([leafletController.getMap(), BoundaryState.getSelected()])
                .then(function(results) {
                    var map = results[0];
                    var bounds = results[1];
                    map.fitBounds(bounds.bbox);
                });

            // Update when boundary is changed (currently a no-op, but that will change once we add
            // boundary filtering). Function parameters commented out to show what's available.
            scope.$on('driver.state.boundarystate:selected', function(/*event, selected*/) {
                leafletController.getMap().then(updateLayers);
            });

            // TODO: Remove when the record type picker is removed.
            scope.$on('driver.state.recordtypestate:selected', function() {
                leafletController.getMap().then(updateLayers);
            });
        }
        /**
         * Initialize layers on map.
         *
         * @param {Object} map Leaflet map returned by leaflet directive initialization.
         */
        function addBaseLayers(newMap) {
            // add base layer
            var streetsOptions = {
                attribution: cartoDBAttribution,
                detectRetina: false,
                zIndex: 1
            };
            TileUrlService.baseLayerUrl().then(function(url) {
                var streets = new L.tileLayer(url, streetsOptions);
                newMap.addLayer(streets);
            });

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
            // TODO: Boundary filtering somewhere in here.
            // TODO: Since RecordType selection is going away, this may have to change
            RecordTypeState.getSelected().then(function(selected) {
                return TileUrlService.recTilesUrl(selected.uuid);
            // Construct Windshaft URL
            }).then(function(baseUrl) {
                // TODO: Change and uncomment boundary filtering whenever Windshaft filtering is fixed.
                return BoundaryState.getSelected().then(function(/*boundary*/) {
                    return QueryBuilder.unfilteredDjangoQuery(0,
                        {query: true,
                         /* jshint camelcase: false */
                         occurred_min: occurredMin.toISOString(),
                         //polygon_id: boundary.uuid
                         /* jshint camelcase: true */
                        }
                    ).then(function(result) {
                            var queryParam = baseUrl.match(/\?/) ? '&sql=' : '?sql=';
                            var sql = encodeURIComponent(result.query);
                            return baseUrl + queryParam + sql;
                    });
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
