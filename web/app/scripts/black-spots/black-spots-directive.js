(function() {
    'use strict';

    /* ngInject */
    function BlackSpots($q, BoundaryState, LeafletDefaults, InitialState, FilterState,
        RecordState, TileUrlService, QueryBuilder, BlackspotSets) {
        var cartoDBAttribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>';
        var defaultLayerOptions = {
            attribution: 'PRS',
            detectRetina: true
        };

        var module = {
            restrict: 'A',
            scope: false,
            replace: true,
            controller: '',
            require: ['leafletMap'],
            link: link
        };
        return module;

        function link(scope, element, attrs, controllers) {
            InitialState.ready().then(function() {
                var leafletController = controllers[0];

                leafletController.getMap().then(addBaseLayers);
                var maxDateString;
                if (FilterState.filters.hasOwnProperty('__dateRange')) {
                    var dtString = FilterState.filters.__dateRange.max;
                    // If empty, return current time
                    if (!dtString) {
                        maxDateString = new Date().toJSON();
                    }
                    // If it's already in the right format, don't do the conversion
                    else if (dtString.indexOf('/') <= 0) {
                        maxDateString = dtString + 'T23:59:59Z';
                    } else {
                        var components = dtString.split('/');
                        var month = components[0];
                        var day = components[1];
                        var year = components[2];
                        maxDateString = year + '-' + month + '-' + day + 'T23:59:59Z';
                    }
                } else {
                    maxDateString = new Date().toJSON();
                }

                $q.all([leafletController.getMap(),
                        BlackspotSets.query({
                            'effective_at': maxDateString
                        }).$promise
                        .then(function(blackspotSet) {
                            return TileUrlService.blackspotsUrl(
                                blackspotSet[blackspotSet.length - 1].uuid);
                        })
                    ])
                    .then(function(results) {
                        var map = results[0];
                        var blackspotsUrl = results[1];

                        var blackspotOptions = angular.extend(
                            defaultLayerOptions, {
                                zIndex: 6
                            });
                        var blackspotsLayer = new L.tileLayer(
                            blackspotsUrl, blackspotOptions);
                        blackspotsLayer.addTo(map);
                    });

            });
        }

        function addBaseLayers(newMap) {
            //add base layer
            var streetOptions = {
                attribution: cartoDBAttribution,
                detectRetina: false,
                zIndex: 1
            };
            TileUrlService.baseLayerUrl().then(function(url) {
                var streets = new L.tileLayer(url, streetOptions);
                newMap.addLayer(streets);
            });
        }
    }

    angular.module('driver.blackSpots')
        .directive('driverBlackSpots', BlackSpots);

})();
