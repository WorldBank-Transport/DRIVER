(function () {
    'use strict';

    // Default level to zoom to when a location is selected or a marker is dropped
    var zoomInLevel = 17;

    /* ngInject */
    function EmbedMapController($log, $timeout, $scope, $rootScope, TileUrlService,
                                BaseLayersService, MapState) {
        var dblClickTimeout = null;
        var ctl = this;

        ctl.isEditable = false;
        ctl.map = null;
        ctl.locationMarker = null;
        /*
         * Initialize map and listen for click events, if editable.
         *
         * @param {Object} leafletMap Map object returned from intialized leaflet directive
         * @param {Boolean} isEditable If set to true, update and broadcast marker location on click
         * @param {Double} lat If set, initial latitude for marker
         * @param {Double} lng If set, initial longitude for marker
         */
        ctl.setUpMap = function(leafletMap, isEditable, lat, lng) {
            ctl.map = leafletMap;
            ctl.isEditable = !!isEditable;

            var baseMaps = BaseLayersService.baseLayers();

            if(!ctl.layerSwitcher){
                ctl.layerSwitcher = L.control.layers(
                    _.zipObject(_.map(baseMaps, 'label'), _.map(baseMaps, 'layer'))
                );
                ctl.layerSwitcher.addTo(ctl.map);
            }

            // set the base layer to the one selected in MapState
            var baseLayer = _.find(baseMaps, function (l) {
                return l.slugLabel === MapState.getBaseLayerSlugLabel();
            });

            // use the first layer if a match could not be made
            baseLayer = baseLayer || baseMaps[0];
            ctl.map.addLayer(baseLayer.layer);

            if (ctl.isEditable) {
                ctl.map.on('click', handleClick);
                ctl.map.on('moveend', function(e) {
                    broadcastBBox(e.target.getBounds());
                });
            }

            // If a location was passed in, center and zoom to that. Otherwise load from MapState
            // but zoom out one level to adjust for the smaller field of view.
            if (lat && lng) {
                setMarker(L.latLng(lat, lng));
            } else if (MapState.getLocation() && MapState.getZoom()) {
                ctl.map.setView(MapState.getLocation(), MapState.getZoom() - 1);
            }
        };

        /** Handle a click; need to do a bit of work here to prevent moving the marker on
         * double-click. This has the unfortunate side effect of causing the marker placement to
         * be slightly delayed.
         */
        function handleClick(e) {
            if (dblClickTimeout) {
                $timeout.cancel(dblClickTimeout);
                dblClickTimeout = null;
            } else {
                dblClickTimeout = $timeout(function() {
                  broadcastCoordinates(e.latlng);
                  setMarker(e.latlng);
                  dblClickTimeout = null;
                }, 300);
            }
        }

        /** Set marker location, or create marker at location if it does not exist yet.
         *
         * @param {Object} latlng Leaflet LatLng object with coordinates for marker
         */
        function setMarker(latlng) {
            if (ctl.locationMarker) {
                ctl.locationMarker.setLatLng(latlng);
            } else {
                ctl.locationMarker = new L.marker(latlng, {draggable: ctl.isEditable}).addTo(ctl.map);

                if (ctl.isEditable) {
                    ctl.locationMarker.on('dragend', function() {
                        broadcastCoordinates(ctl.locationMarker.getLatLng());
                    });
                }

                // pan/zoom to marker on add
                ctl.map.setView(latlng, zoomInLevel, {animate: true});
            }
        }

        /** Tell add-edit-controller.js about bbox
         *
         * @param {Object} bbox Leaflet LatLngBounds object with map's bounds
         */
        function broadcastBBox(bbox) {
            $rootScope.$broadcast('driver.views.record:map-moved', [bbox.getWest(), bbox.getNorth(),
                                                                    bbox.getEast(), bbox.getSouth()]);
        }

        /** Tell add-edit-controller.js when marker point set.
         *
         * @param {Object} latlng Leaflet LatLng object with marker's coordinates
         */
        function broadcastCoordinates(latlng) {
            if (!ctl.isEditable) {
                $log.error('Attempting to broadcast marker coordinates on non-editable map');
                return;
            }
            $rootScope.$broadcast('driver.views.record:marker-moved', [latlng.lng, latlng.lat]);
        }

        $rootScope.$on('driver.views.record:location-selected', function(event, data, recenter) {
            if (!ctl.map) {
                return;
            }

            var latlng = L.latLng(data.lat, data.lng);
            setMarker(latlng);
            if (recenter) {
                ctl.map.setView(latlng, zoomInLevel, {animate: true});
            }
        });

        // destroy map state when record is closed
        $scope.$on('driver.views.record:close', function() {
            ctl.map = null;
            ctl.locationMarker = null;
        });

        return ctl;
    }

    angular.module('driver.views.record')
    .controller('embedMapController', EmbedMapController);

})();
