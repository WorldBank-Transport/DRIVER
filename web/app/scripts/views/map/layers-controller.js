(function() {
    'use strict';

    /* ngInject */
    function DriverLayersController(
        $q, $filter, $log, $scope, $rootScope, $timeout, $compile,
        AuthService, FilterState, RecordState, GeographyState,
        RecordSchemaState, BoundaryState, QueryBuilder,
        MapState, TileUrlService, InitialState, BlackspotSets) {
        var ctl = this;
        var localDateTimeFilter = $filter('localDateTime');
        var dateFormat = 'M/D/YYYY, h:mm:ss A';

        ctl.recordType = 'ALL';
        ctl.recordTypeLabel = 'Record';
        ctl.layerSwitcher = null;
        ctl.drawControl = null;
        ctl.map = null;
        ctl.overlays = null;
        // baseMaps was renamed to bMaps because the test framework does an
        // unguarded string replace on the word "base" with the base url
        // in its error messages... 
        ctl.bMaps = null;
        ctl.editLayers = null;
        ctl.tilekey = null;
        ctl.userCanWrite = false;
        ctl.eventLayerGroup = null;
        ctl.heatmapLayerGroup = null;
        ctl.blackspotLayerGroup = null;
        ctl.boundariesLayerGroup = null;

        var cartoDBAttribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>';
        var filterStyle = {
            color: '#f357a1',
            fillColor: '#f357a1',
            fill: true
        };
        var defaultLayerOptions = {
            attribution: 'PRS',
            detectRetina: true
        };

        // Ensure initial state is ready before initializing layers
        ctl.initLayers = function(map) {
            // TODO (maybe): This approach to setting map options is only tenable so
            // long as most of our maps use the same options, with very limited
            // exceptions. If we ever need to have lots of customized options
            // for each map, then we'll need to find a way to insert arbitrary
            // config options into each map directive instance. One possibility
            // would be to define them as attributes, similar to how
            // angular-leaflet-directive does it, but there may be better approaches.
            map.scrollWheelZoom.enable();
            InitialState.ready().then(function() {
                ctl.init(map);
            });
        };

        /**
         * Initialize layers on map.
         * First calls to get the current selection in the record type drop-down.
         *
         * @param {Object} map Leaflet map returned by leaflet directive initialization.
         */
        // TODO: Split into smaller directives to encapsulate related functionality and simplify
        // this function.
        // TODO: Enable polygon filtering whenever Windshaft boundary filtering is fixed (currently,
        // all but the simplest boundaries result in a 414 URI Too Long
        ctl.init = function(map) {

            ctl.map = map;
            ctl.userCanWrite = AuthService.hasWriteAccess();
            var bmapDefer = $q.defer();
            ctl.bMaps = bmapDefer.promise;

            // get the current record type selection for filtering
            RecordState.getSelected().then(function(selected) {
                if (selected && selected.uuid) {
                    /* jshint camelcase: false */
                    ctl.recordType = selected.uuid;
                    ctl.recordTypeLabel = selected.label;
                    RecordSchemaState.getFilterables(selected.current_schema)
                        .then(function(filterables) {
                            ctl.recordSchemaFilterables = filterables;
                        });
                    /* jshint camelcase: true */
                } else {
                    ctl.recordSchemaFilterables = [];
                    ctl.recordType = 'ALL';
                    ctl.recordTypeLabel = 'Record';
                }
            }).then(function() {
                return BoundaryState.getSelected().then(function(selected) {
                    if (selected && selected.uuid) {
                        ctl.boundaryId = selected.uuid;
                    }
                });
            }).then(function() {
                return QueryBuilder.djangoQuery(true, 0, getAdditionalParams())
                    .then(function(records) {
                        ctl.tilekey = records.tilekey;
                    });
            }).then(function() {
                // add base layer
                var streetsOptions = {
                    attribution: cartoDBAttribution,
                    detectRetina: false,
                    zIndex: 1
                };
                TileUrlService.baseLayerUrl().then(function(streetsUrl) {
                    var streets = new L.tileLayer(streetsUrl, streetsOptions);
                    ctl.map.addLayer(streets);
                    bmapDefer.resolve({
                        'CartoDB Positron': streets
                    });
                });
            }).then(function() {
                // add polygon draw control and layer to edit on
                ctl.editLayers = new L.FeatureGroup();
                ctl.map.addLayer(ctl.editLayers);

                ctl.drawControl = new L.Control.Draw({
                    draw: {
                        // TODO: figure out a good way to export circles.
                        // Calling toGeoJSON on the Leaflet feature layer
                        // returns a point with no radius set in the properties.
                        circle: false,
                        marker: false,
                        polyline: false,
                        polygon: {
                            allowIntersection: false,
                            showArea: true,
                            drawError: {
                                // TODO: pick a custom color to set, or remove option
                                //color: '#e1e100', // Color the shape will turn when intersects
                                message: '<strong>Filter area cannot intersect itself.</strong>'
                            },
                            shapeOptions: {
                                //color: '#bdda55'
                            }
                        }
                    },
                    edit: {
                        featureGroup: ctl.editLayers
                    }
                });

                ctl.map.addControl(ctl.drawControl);

                // handle map draw events
                ctl.map.on('draw:created', function(e) {
                    filterShapeCreated(e.layer);
                });

                ctl.map.on('draw:edited', function(e) {
                    e.layers.eachLayer(function(layer) {
                        filterShapeCreated(layer);
                    });
                });

                // only allow one filter shape at a time
                // TODO: temporarily remove interactivity layer while editing
                ctl.map.on('draw:drawstart', function() {
                    clearEditLayers();
                    $rootScope.$broadcast('driver.views.map:filterdrawn', null);
                });

                ctl.map.on('draw:deleted', function() {
                    clearEditLayers();
                    $rootScope.$broadcast('driver.views.map:filterdrawn', null);
                });

                ctl.map.on('zoomend', function() {
                    MapState.setZoom(ctl.map.getZoom());
                });

                ctl.map.on('moveend', function() {
                    MapState.setLocation(ctl.map.getCenter());
                });

                // TODO: Find a better way to ensure this doesn't happen until filterbar ready
                // (without timeout, filterbar components aren't ready to listen yet)
                // add filtered overlays
                // this will trigger `driver.filterbar:changed` when complete
                $timeout(FilterState.restoreFilters, 1000);
            }).then(function() {
                if (MapState.getLocation() && MapState.getZoom()) {
                    ctl.map.setView(MapState.getLocation(), MapState.getZoom());
                } else {
                    BoundaryState.getSelected().then(function(selected) {
                        if (selected && selected.bbox) {
                            ctl.map.fitBounds(selected.bbox);
                        }
                    });
                }
                if (MapState.getFilterGeoJSON()) {
                    var layer = L.geoJson(MapState.getFilterGeoJSON());
                    layer.setStyle(filterStyle);
                    ctl.editLayers.addLayer(layer);
                }
            });

            $scope.$on('driver.state.recordstate:selected', function(event, selected) {
                if (ctl.recordType !== selected && selected && selected.uuid) {
                    /* jshint camelcase: false */
                    ctl.recordType = selected.uuid;
                    ctl.recordTypeLabel = selected.label;
                    RecordSchemaState.getFilterables(selected.current_schema)
                        .then(function(filterables) {
                            ctl.recordSchemaFilterables = filterables;
                        });
                    /* jshint camelcase: false */
                    // re-add the layers to refresh with filtered content
                    ctl.setRecordLayers();
                }
            });

            $scope.$on('driver.state.boundarystate:selected', function(event, selected) {
                if (selected && selected.uuid !== ctl.boundaryId) {
                    ctl.boundaryId = selected.uuid;
                    QueryBuilder.djangoQuery(true, 0, getAdditionalParams())
                        .then(function(records) {
                            ctl.tilekey = records.tilekey;
                            ctl.setRecordLayers();
                        });
                }
            });
        };

        // Clears editLayers and informs the map state service
        function clearEditLayers() {
            ctl.editLayers.clearLayers();
            MapState.setFilterGeoJSON(null);
        }

        function filterShapeCreated(layer) {
            // TODO: is the shape type useful info?
            //var type = event.layerType;
            clearEditLayers();

            layer.setStyle(filterStyle);
            ctl.editLayers.addLayer(layer);
            $rootScope.$broadcast('driver.views.map:filterdrawn');

            // Use GeoJSON instead of a normal layer - theres a strange bug likely stemming from
            //  race conditions on the Leaflet Map object otherwise
            MapState.setFilterGeoJSON(getPolygonFromLayer(ctl.editLayers));

            // pan/zoom to selected area

            ctl.map.fitBounds(layer.getBounds());

            // Send exported shape to filterbar, which will send `changed` event with filters.
            var geojson = getPolygonFromLayer(ctl.editLayers);
            $rootScope.$broadcast('driver.views.map:filterdrawn', geojson);

            // TODO: use an interaction event to remove the drawn filter area?
            /*
            layer.on('click', function(e) {
                $log.debug('draw layer clicked!');
                $log.debug(e);
            });
            */
        }


        ctl.setRecordLayers = function() {
            if (!ctl.map) {
                $log.error('Map controller has no map! Cannot add layers.');
                return;
            }

            if(ctl.layerSwitcher){
                getUrls().then(updateLayerGroups);
            } else {
                getUrls().then(updateLayerGroups)
                    .then(addBoundaryLayers)
                    .then(addLayerSwitcher);
            }

        };

        /**
         * Returns a promise which resolves to the URls for the record,
         * utfgridtile, heatmap, and blackspot layers as an array of form:
         * [baseRecordsUrl, baseUtfGridUrl, baseHeatmapUrl, blackspotsUrl]
         */
        function getUrls() {
            return $q.all(
                [TileUrlService.recTilesUrl(ctl.recordType),
                    TileUrlService.recUtfGridTilesUrl(ctl.recordType),
                    TileUrlService.recHeatmapUrl(ctl.recordType),
                    BlackspotSets.query({
                        'effective_at': FilterState.getDateFilter().maxDate,
                        'record_type': ctl.recordType
                    }).$promise.then(function(blackspotSet) {
                        var set = blackspotSet[blackspotSet.length - 1];
                        if (set) {
                            return TileUrlService.blackspotsUrl(set.uuid);
                        }
                        return undefined;
                    })
                ]
            );
        }

        /**
         * Given an array of urls in form:
         * [baseRecordsUrl, baseUtfGridUrl, baseHeatmapUrl, blackspotsUrl],
         * updates the layer groups so that the layer switcher does not
         * need to be re-initialized every time layer urls change
         */
        function updateLayerGroups(urls) {
            var baseRecordsUrl = urls[0];
            var baseUtfGridUrl = urls[1];
            var baseHeatmapUrl = urls[2];
            var blackspotsUrl = urls[3];

            updateEventLayer(baseRecordsUrl, baseUtfGridUrl);
            updateHeatmapLayer(baseHeatmapUrl);
            updateBlackspotLayer(blackspotsUrl);
        }

        /**
         * Adds the boundary layers.  This function should only be called once
         * before the layer switcher is initialized.  These layers should never
         * be updated, so they are not contained in layer groups
         */
        function addBoundaryLayers() {
            // only add boundary layers to the map once
            if(ctl.boundariesLayerGroup) {
                return $q.when();
            }

            return GeographyState.getOptions()
                .then(function(options) {
                    var boundaryLayerOptions = angular.extend(defaultLayerOptions, {
                        zIndex: 2
                    });

                    var layerPromises = options.map(function(boundary) {
                        return TileUrlService.boundaryTilesUrl(boundary.uuid).then(
                            function(baseBoundUrl) {
                                var colorUrl =
                                    (baseBoundUrl +
                                     '?color=' +
                                     encodeURIComponent(
                                         boundary.color.toLowerCase()));
                                var layer = new L.tileLayer(
                                    colorUrl, boundaryLayerOptions);
                                return [boundary.label, layer];
                            }
                        );
                    });

                    return $q.all(layerPromises).then(function(layerLabelPairs) {
                        ctl.boundariesLayerGroup = _.zipObject(layerLabelPairs);
                    });
                });
        }

        /**
         * Adds the layer switcher to the map.
         * The overlays are added as layer groups because they must be
         * allowed to change when a new filter is applied, and the
         * layer picker makes it complicated without using layer groups
         *
         * The layer switcher is only initialized once so that
         * when a new filter is applied, layer selection is preserved
         */
        function addLayerSwitcher() {
            var overlays = angular.extend(
                {
                    Events: ctl.eventLayerGroup,
                    Heatmap: ctl.heatmapLayerGroup,
                    Blackspots: ctl.blackspotLayerGroup
                },
                ctl.boundariesLayerGroup
            );
            ctl.bMaps.then(
                function(baseMaps){
                    // only add the layer switcher once
                    if(!ctl.layerSwitcher){
                        ctl.layerSwitcher = L.control.layers(
                            baseMaps,
                            overlays,
                            {
                                autoZIndex: false
                            }
                        );

                        ctl.layerSwitcher.addTo(ctl.map);
                    }
                }
            );
        }

        /**
         * Updates the event layer group
         * The event layer group is composed of the records layer for the actual
         * records on the map, and the utfGridRecords layer which is for the
         * click events and popup
         */
        function updateEventLayer(baseRecordsUrl, baseUtfGridUrl){
            var recordsLayerOptions = angular.extend(defaultLayerOptions, {
                zIndex: 3
            });

            var recordsLayer = new L.tileLayer(
                ctl.getFilterQuery(baseRecordsUrl, ctl.tilekey),
                recordsLayerOptions);

            var utfGridRecordsLayer = new L.UtfGrid(
                ctl.getFilterQuery(baseUtfGridUrl, ctl.tilekey), {
                    useJsonP: false,
                    zIndex: 5
                });

            addGridRecordEvent(utfGridRecordsLayer);

            if (!ctl.eventLayerGroup) {
                ctl.eventLayerGroup = new L.layerGroup(
                    [recordsLayer, utfGridRecordsLayer]);
                ctl.map.addLayer(ctl.eventLayerGroup);
            } else {
                _.forEach(ctl.eventLayerGroup._layers,function(layer) {
                    if (typeof layer.off === 'function') {
                        layer.off('click');
                    }
                    ctl.eventLayerGroup.removeLayer(layer);
                });
                ctl.eventLayerGroup.addLayer(recordsLayer);
                ctl.eventLayerGroup.addLayer(utfGridRecordsLayer);
            }
        }

        /**
         * Adds the onClick event to the specified utfGridRecordsLayer
         * in order to create the info popups
         */
        function addGridRecordEvent(utfGridRecordsLayer) {
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

                $compile($('#record-popup'))($scope);
            });
        }

        /**
         * Updates the heatmap layer group.
         * Can be called as many times as necessary.  Removes the old
         * heatmap layer and adds a new one to the layer group with
         * the updated URL
         */
        function updateHeatmapLayer(baseHeatmapUrl) {
            var heatmapOptions = angular.extend(defaultLayerOptions, {
                zIndex: 4
            });
            var heatmapLayer = new L.tileLayer(
                ctl.getFilterQuery(baseHeatmapUrl, ctl.tilekey),
                heatmapOptions);

            if (ctl.heatmapLayerGroup) {
                for (var hlayer in ctl.heatmapLayerGroup._layers) {
                    ctl.heatmapLayerGroup.removeLayer(hlayer);
                }
                ctl.heatmapLayerGroup.addLayer(heatmapLayer);
            } else {
                ctl.heatmapLayerGroup = new L.layerGroup(
                    [heatmapLayer]);
            }
        }

        /**
         * Updates the blackspot layer group.
         * Can be called as many times as necessary.  Removes the old
         * blackspot layer and adds a new one to the layer group with
         * the updated URL
         */
        function updateBlackspotLayer(blackspotsUrl) {
            var blackspotOptions = angular.extend(defaultLayerOptions, {
                zIndex: 6
            });
            if (ctl.blackspotLayerGroup) {
                for (var blayer in ctl.blackspotLayerGroup._layers) {
                    ctl.blackspotLayerGroup.removeLayer(blayer);
                }
            } else {
                ctl.blackspotLayerGroup = new L.layerGroup([]);
            }
            if (blackspotsUrl) {
                ctl.blackspotLayerGroup.addLayer(
                    new L.tileLayer(blackspotsUrl, blackspotOptions));
            }

            var blackspotsLayer = new L.layerGroup([]);
            if (blackspotsUrl) {
                blackspotsLayer.addLayer(
                    new L.tileLayer(blackspotsUrl, blackspotOptions));
            }
        }

        /**
         * Build popup content from arbitrary record data.
         *
         * @param {Object} UTFGrid interactivity data from interaction event object
         * @returns {String} HTML snippet for a Leaflet popup.
         */
        ctl.buildRecordPopup = function(record) {
            // add header with event date constant field
            /* jshint camelcase: false */
            // DateTimes come back from Windshaft without tz information, but they're all UTC
            var occurredStr = localDateTimeFilter(moment.utc(record.occurred_from), dateFormat);
            var str = '<div id="record-popup" class="record-popup">';
            str += '<div><h5>' + ctl.recordTypeLabel + ' Details</h5><h3>' + occurredStr + '</h3>';
            /* jshint camelcase: true */

            // The ng-click here refers to a function which sits on the map-controller's scope
            str += '<a ng-click="showDetailsModal(\'' + record.uuid + '\')">';
            str += '<span class="glyphicon glyphicon-log-in"></span> View</a>';
            // Hardcoded href because dynamically added
            if (ctl.userCanWrite) {
                str += '<a href="/#!/record/' + record.uuid + '/edit" target="_blank">';
                str += '<span class="glyphicon glyphicon-pencil"></span> ';
                str += 'Edit</a>';
            }
            str += '</div></div>';
            return str;
        };


        /**
         * Helper function to add a tilekey parameter to the windshaft URL
         *
         * @param {String} baseUrl Map layer URL
         * @param {String} tilekey tilekey parameter to append to the request URL
         * @returns {String} The baseUrl with the record type parameter set to the selected type.
         */
        ctl.getFilterQuery = function(baseUrl, tilekey) {
            var url = baseUrl;
            if (tilekey) {
                // TODO: find a less hacky way to handle building URLs for Windshaft
                url += (url.match(/\?/) ? '&' : '?') + 'tilekey=';
                url += tilekey;
            }
            return url;
        };

        // Gets a polygon object from a FeatureCollection
        // A FeatureCollection may contain a FeatureCollection, so recurse
        function getPolygonFromFeatureCollection(featureCollection) {
            if (!featureCollection.features || !featureCollection.features.length) {
                return null;
            }

            var feature = featureCollection.features[0];
            switch (feature.geometry.type) {
                case 'FeatureCollection':
                    return getPolygonFromFeatureCollection(feature.geometry);
                case 'Polygon':
                    return feature.geometry;
                default:
                    $log.warn('Unexpected feature type: ', feature.geometry.type);
                    return null;
            }
        }

        // Gets the polygon object from a layer
        function getPolygonFromLayer(layer) {
            if (!layer) {
                return null;
            }

            var geojson = layer.toGeoJSON();
            if (!geojson || !geojson.features) {
                return null;
            }

            return getPolygonFromFeatureCollection(geojson);
        }

        // Gets the additional parameters to be sent in the request to Django
        function getAdditionalParams() {
            var params = {
                tilekey: true
            };
            var geojson = getPolygonFromLayer(ctl.editLayers);
            if (geojson) {
                params.polygon = geojson;
            }
            if (ctl.boundaryId) {
                /* jshint camelcase: false */
                params.polygon_id = ctl.boundaryId;
                /* jshint camelcase: true */
            }

            return params;
        }

        /**
         * Update map when filters change
         */
        var filterHandler = $rootScope.$on('driver.filterbar:changed', function() {

            // get the raw SQL for the filter to send along to Windshaft
            QueryBuilder.djangoQuery(true, 0, getAdditionalParams()).then(function(records) {
                ctl.tilekey = records.tilekey;
                ctl.setRecordLayers();
            });
        });

        // $rootScope listeners must be manually unbound when the $scope is destroyed
        $scope.$on('$destroy', filterHandler);

        return ctl;
    }

    angular.module('driver.views.map')
        .controller('driverLayersController', DriverLayersController);

})();
