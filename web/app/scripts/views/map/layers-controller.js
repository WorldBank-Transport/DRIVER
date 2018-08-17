(function() {
    'use strict';

    /* ngInject */
    function DriverLayersController(
        $q, $filter, $log, $scope, $rootScope, $timeout, $translate, $compile,
        AuthService, WebConfig, FilterState, RecordState, GeographyState,
        RecordSchemaState, BoundaryState, QueryBuilder,
        MapState, TileUrlService, BaseLayersService, InitialState, BlackspotSets,
        $http) {
        var ctl = this;
        var localizeRecordDateFilter = $filter('localizeRecordDate');
        var dateFormat = 'numeric';

        var blackSpotLabel = $translate.instant('MAP.BLACKSPOT');
        var severityScoreLabel = $translate.instant('MAP.SEVERITY_SCORE');
        var numSevereLabel = $translate.instant('MAP.NUM_SEVERE');
        var detailsLabel = $translate.instant('RECORD.DETAILS');
        var viewLabel = $translate.instant('COMMON.VIEW');
        var editLabel = $translate.instant('COMMON.EDIT');

        /* jshint camelcase: false */
        ctl.recordType = {
            uuid: 'ALL',
            label: $translate.instant('RECORD.RECORD'),
            plural_label: $translate.instant('RECORD.RECORDS')
        };
        /* jshint camelcase: true */
        ctl.layerSwitcher = null;
        ctl.drawControl = null;
        ctl.map = null;
        ctl.overlays = null;
        // baseMaps was renamed to bMaps because the test framework does an
        // unguarded string replace on the word "base" with the base url
        // in its error messages.
        ctl.bMaps = null;
        ctl.editLayers = null;
        ctl.tilekey = null;
        ctl.userCanWrite = false;
        ctl.primaryLayerGroup = null;
        ctl.secondaryLayerGroup = null;
        ctl.heatmapLayerGroup = null;
        ctl.blackspotLayerGroup = null;
        ctl.boundariesLayerGroup = null;

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
        ctl.init = function(map) {

            ctl.map = map;
            ctl.userCanWrite = AuthService.hasWriteAccess();
            var bmapDefer = $q.defer();
            ctl.bMaps = bmapDefer.promise;

            // get the current record type selection for filtering
            RecordState.getSelected().then(function(selected) {
                if (selected && selected.uuid) {
                    /* jshint camelcase: false */
                    ctl.recordType = selected;
                    RecordSchemaState.getFilterables(selected.current_schema)
                        .then(function(filterables) {
                            ctl.recordSchemaFilterables = filterables;
                        });
                    RecordState.getSecondary().then(function (secondaryType) {
                        ctl.secondaryType = secondaryType;
                    });
                } else {
                    ctl.recordSchemaFilterables = [];
                    ctl.recordType = {
                        uuid: 'ALL',
                        label: $translate.instant('RECORD.RECORD'),
                        plural_label: $translate.instant('RECORD.RECORDS')
                    };
                    /* jshint camelcase: true */
                    ctl.secondaryType = null;
                }
            }).then(function() {
                return BoundaryState.getSelected().then(function(selected) {
                    if (selected && selected.uuid) {
                        ctl.boundaryId = selected.uuid;
                    }
                });
            }).then(
                getTilekeys
            ).then(function() {
                // load base layers
                var layers = BaseLayersService.baseLayers();
                bmapDefer.resolve(layers);

                // set the base layer to the one selected in MapState
                var baseLayer = _.find(layers, function (l) {
                    return l.slugLabel === MapState.getBaseLayerSlugLabel();
                });

                // use the first layer if a match could not be made
                baseLayer = baseLayer || layers[0];
                ctl.map.addLayer(baseLayer.layer);

                // add polygon draw control and layer to edit on
                ctl.editLayers = new L.FeatureGroup();
                ctl.map.addLayer(ctl.editLayers);

                // Drawn polygons default to clickable: true, which swallows click events
                // before they get to the map at all, which prevents them from making it into
                // Leaflet's event system.
                // Setting clickable: false in shapeOptions solves the immediate issue, but
                // then makes it impossible to delete a polygon after it has been created.
                // This re-fires any click events on the polygon onto the map.
                ctl.editLayers.on('click', function(e) {
                  ctl.map.fire('click', e);
                });

                // The datepicker calendar div gets added to the end of <body> where it doesn't
                // get to hear all the clicks that Leaflet swallows. This crappy workaround still
                // leaves some bad behavior when clicks don't make it through to the map (e.g.
                // they're on the layer switcher or an incident pop-up) but it handles the most
                // common case of clicking in empty map space.
                ctl.map.on('click', function() {
                    angular.element('.datepicker').hide();
                });

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

                ctl.map.on('baselayerchange', function(e) {
                    var baseLayers = BaseLayersService.baseLayers();
                    var baseLayer = _.find(baseLayers, function(l) {
                        return l.label === e.name;
                    });

                    // use the first layer if a match could not be made
                    baseLayer = baseLayer || baseLayers[0];
                    MapState.setBaseLayerSlugLabel(baseLayer.slugLabel);
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
                if (selected && selected.uuid && ctl.recordType.uuid !== selected.uuid) {
                    /* jshint camelcase: false */
                    ctl.recordType = selected;
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
                    getTilekeys().then(function () {
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
                getBlackspotSetId()
                    .then(updateLayerGroups);
            } else {
                getBlackspotSetId()
                    .then(updateLayerGroups)
                    .then(addBoundaryLayers)
                    .then(addLayerSwitcher);
            }
        };

        /**
         * Returns a promise which resolves to the blackspot set id given the current filters
         */
        function getBlackspotSetId() {
            var polygon = getPolygonFromLayer(ctl.editLayers);

            if (polygon) {
              return BlackspotSets.query({
                'effective_at': FilterState.getDateFilter().maxDate,
                'record_type': ctl.recordType.uuid,
                'polygon': polygon
              }).$promise;
            }
            return BlackspotSets.query({
                'effective_at': FilterState.getDateFilter().maxDate,
                'record_type': ctl.recordType.uuid
            }).$promise;
        }

        /**
         * Returns an object containing the URLs for all the layers
         */
        function getUrls(response) {
            var urls = {
                primaryRecordsUrl:    TileUrlService.recTilesUrl(ctl.recordType.uuid),
                primaryUtfGridUrl:    TileUrlService.recUtfGridTilesUrl(ctl.recordType.uuid),
                primaryHeatmapUrl:    TileUrlService.recHeatmapUrl(ctl.recordType.uuid),
                blackspotsUrl:        '',
                blackspotsUtfGridUrl: '',
                blackspotTileKey:     false,
                secondaryRecordsUrl:  '',
                secondaryUtfGridUrl:  ''
            };
            if (response && response[0] && response[0].tilekey) {
                var data = response[0];
                if (data.tilekey) {
                    urls.blackspotsUrl = TileUrlService.blackspotsUrl(data.tilekey);
                    urls.blackspotsUtfGridUrl = TileUrlService.blackspotsUtfGridUrl(data.tilekey);
                    urls.blackspotTileKey = true;
                }
            } else if (response && response[0] && response[0].uuid) {
                var uuid = response[0].uuid;
                urls.blackspotsUrl = TileUrlService.blackspotsUrl(uuid);
                urls.blackspotsUtfGridUrl = TileUrlService.blackspotsUtfGridUrl(uuid);
            }
            if (ctl.secondaryType) {
                urls.secondaryRecordsUrl = TileUrlService.secondaryTilesUrl(ctl.secondaryType.uuid);
                urls.secondaryUtfGridUrl = TileUrlService.recUtfGridTilesUrl(ctl.secondaryType.uuid);
            }

            return urls;
        }

        /**
         * Updates the layer groups so that the layer switcher does not
         * need to be re-initialized every time layer urls change
         */
        function updateLayerGroups(response) {
            var urls = getUrls(response);
            // N.B. The order in which UTF Grid layers are added to the map determines their click
            // event precedence; layers are added on top of each other, so the last layer added
            // will intercept click events first; this is apparently the case regardless of
            // whether a z-index has been set on some or all of the UTF Grid layers.
            if (WebConfig.blackSpots.visible) {
                updateBlackspotLayer(urls.blackspotsUrl, urls.blackspotsUtfGridUrl,
                                     urls.blackspotTileKey);
            }
            updateSecondaryLayer(urls.secondaryRecordsUrl, urls.secondaryUtfGridUrl);
            updatePrimaryLayer(urls.primaryRecordsUrl, urls.primaryUtfGridUrl);
            if (WebConfig.heatmap.visible) {
                updateHeatmapLayer(urls.primaryHeatmapUrl);
            }
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

                    var layerLabelPairs = options.map(function(boundary) {
                        var colorUrl = (TileUrlService.boundaryTilesUrl(boundary.uuid) +
                            '?color=' + encodeURIComponent(boundary.color.toLowerCase()));
                        var layer = new L.tileLayer(colorUrl, boundaryLayerOptions);
                        return [boundary.label, layer];
                    });

                    ctl.boundariesLayerGroup = _.zipObject(layerLabelPairs);
                    return ctl.boundariesLayerGroup;
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
            /* jshint camelcase: false */
            var recordLayers = [[ctl.recordType.plural_label, ctl.primaryLayerGroup]];
            if (ctl.secondaryType) {
                recordLayers.push([ctl.secondaryType.plural_label, ctl.secondaryLayerGroup]);
            }
            /* jshint camelcase: true */

            if (WebConfig.heatmap.visible) {
                recordLayers.push([$translate.instant('MAP.HEATMAP'), ctl.heatmapLayerGroup]);
            }
            if (WebConfig.blackSpots.visible) {
                recordLayers.push([$translate.instant('MAP.BLACKSPOTS'), ctl.blackspotLayerGroup]);
            }
            var overlays = angular.extend(_.zipObject(recordLayers), ctl.boundariesLayerGroup);

            ctl.bMaps.then(
                function(baseMaps) {
                    // only add the layer switcher once
                    if(!ctl.layerSwitcher){
                        ctl.layerSwitcher = L.control.layers(
                            _.zipObject(_.map(baseMaps, 'label'), _.map(baseMaps, 'layer')),
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
         * Updates the primary layer group
         * The primary layer group is composed of the records layer for the actual
         * records on the map, and the utfGridRecords layer which is for the
         * click events and popup
         */
        function updatePrimaryLayer(primaryRecordsUrl, primaryUtfGridUrl){
            var recordsLayerOptions = angular.extend(defaultLayerOptions, {
                zIndex: 5
            });

            var recordsLayer = new L.tileLayer(
                ctl.getFilterQuery(primaryRecordsUrl, ctl.tilekey),
                recordsLayerOptions);

            var utfGridRecordsLayer = new L.UtfGrid(
                ctl.getFilterQuery(primaryUtfGridUrl, ctl.tilekey), {
                    useJsonP: false,
                    zIndex: 7
                });

            addGridRecordEvent(utfGridRecordsLayer, { label: ctl.recordType.label });

            if (!ctl.primaryLayerGroup) {
                ctl.primaryLayerGroup = new L.layerGroup(
                    [recordsLayer, utfGridRecordsLayer]);
                ctl.map.addLayer(ctl.primaryLayerGroup);
            } else {
                _.forEach(ctl.primaryLayerGroup._layers,function(layer) {
                    if (typeof layer.off === 'function') {
                        layer.off('click');
                    }
                    ctl.primaryLayerGroup.removeLayer(layer);
                });
                ctl.primaryLayerGroup.addLayer(recordsLayer);
                ctl.primaryLayerGroup.addLayer(utfGridRecordsLayer);
            }
        }

        /**
         * Updates the secondary layer group
         * The secondary layer group is composed of the records layer for the actual
         * records on the map, and the utfGridRecords layer which is for the
         * click events and popup
         */
        function updateSecondaryLayer(recordsUrl, utfGridUrl){
            if (!ctl.secondaryType) {
                ctl.secondaryLayerGroup = null;
                return;
            }

            var recordsLayerOptions = angular.extend(defaultLayerOptions, {
                zIndex: 9
            });

            var recordsLayer = new L.tileLayer(
                ctl.getFilterQuery(recordsUrl, ctl.secondaryTilekey),
                recordsLayerOptions);

            var utfGridRecordsLayer = new L.UtfGrid(
                ctl.getFilterQuery(utfGridUrl, ctl.secondaryTilekey), {
                    useJsonP: false,
                    zIndex: 11
                });

            var secondaryParams = {};
            if (ctl.secondaryType) {
                secondaryParams = { label: ctl.secondaryType.label };
            }

            addGridRecordEvent(utfGridRecordsLayer, secondaryParams);

            if (!ctl.secondaryLayerGroup) {
                ctl.secondaryLayerGroup = new L.layerGroup(
                    [recordsLayer, utfGridRecordsLayer]);
            } else {
                _.forEach(ctl.secondaryLayerGroup._layers,function(layer) {
                    if (typeof layer.off === 'function') {
                        layer.off('click');
                    }
                    ctl.secondaryLayerGroup.removeLayer(layer);
                });
                ctl.secondaryLayerGroup.addLayer(recordsLayer);
                ctl.secondaryLayerGroup.addLayer(utfGridRecordsLayer);
            }
        }

        /**
         * Adds the onClick event to the specified utfGridRecordsLayer
         * in order to create the info popups
         */
        function addGridRecordEvent(utfGridRecordsLayer, popupParams) {
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
                    .setContent(ctl.buildRecordPopup(e.data, popupParams, e.latlng))
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
        function updateHeatmapLayer(primaryHeatmapUrl) {
            var heatmapOptions = angular.extend(defaultLayerOptions, {
                zIndex: 6
            });
            var heatmapLayer = new L.tileLayer(
                ctl.getFilterQuery(primaryHeatmapUrl, ctl.tilekey),
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
        function updateBlackspotLayer(blackspotsUrl, blackspotsUtfGridUrl, tilekey) {
            var blackspotOptions = angular.extend(defaultLayerOptions, {
                zIndex: 3
            });
            // Clear blackspot layer group, or initialize it if it doesn't exist
            if (ctl.blackspotLayerGroup) {
                _.forEach(ctl.blackspotLayerGroup._layers,function(layer) {
                    if (typeof layer.off === 'function') {
                        layer.off('click');
                    }
                    ctl.blackspotLayerGroup.removeLayer(layer);
                });
            } else {
                ctl.blackspotLayerGroup = new L.layerGroup([]);
            }

            // Add Blackspot tiles, optionally filtered by a tilekey
            if (blackspotsUrl && tilekey) {
                ctl.blackspotLayerGroup.addLayer(
                    new L.tileLayer(addBlackspotParams(blackspotsUrl, tilekey),
                                    blackspotOptions));
            } else if (blackspotsUrl) {
                ctl.blackspotLayerGroup.addLayer(
                    new L.tileLayer(blackspotsUrl, blackspotOptions));
            }

            // Add blackspot interactivity via UtfGrid.
            if (blackspotsUtfGridUrl){
                var blackspotUtfGridLayer = new L.UtfGrid(
                    addBlackspotParams(blackspotsUtfGridUrl, tilekey),
                    {
                        useJsonP: false,
                        zIndex: 4
                    });
                addGridBlackspotEvent(blackspotUtfGridLayer);
                ctl.blackspotLayerGroup.addLayer(blackspotUtfGridLayer);
            }
        }

        function addBlackspotParams(baseUrl, tilekey) {
            var url = baseUrl;
            if(tilekey) {
                url += (url.match(/\?/) ? '&' : '?') + 'tilekey=';
                url += tilekey;
                return url;
            }
            return url;
        }

        function addGridBlackspotEvent(blackspotUtfGridLayer) {
            blackspotUtfGridLayer.on('click', function (e) {
                // ignore clicks where there is no blackspot
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
                    .setContent(ctl.buildBlackspotPopup(e.data, e.latlng))
                    .openOn(ctl.map);

                $compile($('#blackspot-popup'))($scope);
            });
        }

        function getMapillaryHtmlString() {
            return '<img id="mapillaryimg" />' +
                '<p id="mapillaryattributionp" align="right">' +
                    'Image powered by <a target="_blank" href="https://www.mapillary.com/">Mapillary</a>.' +
                '</p>';
        }

        function getMapillaryImg(latlng) {
            var clientId = WebConfig.mapillary.clientId;
            var mapillaryRadius = WebConfig.mapillary.range;
            $http.get('https://a.mapillary.com/v3/images?closeto=' + latlng.lng + ',' + latlng.lat + '&radius=' + mapillaryRadius + '&client_id=' + clientId, { cache: true })
                .success(function(data) {
                    if (data.features.length !== 0) {
                        var mapillaryImg = document.querySelector('#mapillaryimg');
                        var mapillaryAttributionP = document.querySelector('#mapillaryattributionp');
                        mapillaryImg.setAttribute('src', 'https://d1cuyjsrcm0gby.cloudfront.net/' + data.features[0].properties.key + '/thumb-320.jpg');
                        mapillaryAttributionP.style.display = 'block';
                    }
                })
                .error(function(data, status) {
                    $log.error('Failed to get Mapillary data:');
                    $log.error(status);
                    $log.error(data);
                });
        }

        /**
         * Build popup content from blackspot data
         *
         * @param {Object} UTFGrid interactivity data from interaction event object
         * @returns {String} HTML snippet for a Leaflet popup
         */
        ctl.buildBlackspotPopup = function(blackspot, latlng) {
            /* jshint camelcase: false */
            var str = '<div id="blackspot-popup" class="blackspot-popup">';
            str += '<div><h4>' + blackSpotLabel + '</h4></div>';
            str += '<div><h6>' + severityScoreLabel + ': ' + blackspot.severity_score + '</h6></div>';
            str += '<div><h6>' + ctl.recordType.plural_label + ': ' +
                blackspot.num_records + '</h6></div>';
            str += '<div><h6>' + numSevereLabel + ': ' + blackspot.num_severe + '</h6></div>';
            /* jshint camelcase: true */

            // Mapillary Image in popup
            if (WebConfig.mapillary.enabled) {
                str += getMapillaryHtmlString();
                getMapillaryImg(latlng);
            }

            return str;
        };

        /**
         * Build popup content from arbitrary record data.
         *
         * @param {Object} UTFGrid interactivity data from interaction event object
         * @returns {String} HTML snippet for a Leaflet popup.
         */
        ctl.buildRecordPopup = function(record, popupParams, latlng) {
            // add header with record date constant field
            /* jshint camelcase: false */
            // DateTimes come back from Windshaft without tz information, but they're all UTC
            var occurredStr = localizeRecordDateFilter(moment.utc(record.occurred_from), dateFormat, true);
            var str = '<div id="record-popup" class="record-popup">';
            str += '<div><h5>' + popupParams.label + ' ' + detailsLabel +
                '</h5><h3>' + occurredStr + '</h3>';
            /* jshint camelcase: true */

            // Mapillary Image in popup
            if (WebConfig.mapillary.enabled) {
                str += getMapillaryHtmlString();
                getMapillaryImg(latlng);
            }

            // The ng-click here refers to a function which sits on the map-controller's scope
            str += '<a ng-click="showDetailsModal(\'' + record.uuid + '\')">';
            str += '<span class="glyphicon glyphicon-log-in"></span> ' + viewLabel + '</a>';
            // Hardcoded href because dynamically added
            if (ctl.userCanWrite) {
                str += '<a href="/#!/record/' + record.uuid + '/edit" target="_blank">';
                str += '<span class="glyphicon glyphicon-pencil"></span> ';
                str += editLabel + '</a>';
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

            return params;
        }

        function getTilekeys() {
            var primary = QueryBuilder.djangoQuery(0, getAdditionalParams(), {}, false).then(
                function(records) { ctl.tilekey = records.tilekey; }
            );
            var secondary = $q.resolve('');
            if (ctl.secondaryType) {
                var params = getAdditionalParams();
                /* jshint camelcase: false */
                params.record_type = ctl.secondaryType.uuid;
                /* jshint camelcase: true */
                secondary = QueryBuilder.djangoQuery(0, params, {doJsonFilters: false}, false).then(
                    function(records) { ctl.secondaryTilekey = records.tilekey; }
                );
            }
            return $q.all([primary, secondary]);
        }

        /**
         * Update map when filters change
         */
        var filterHandler = $rootScope.$on('driver.filterbar:changed', function() {
            getTilekeys().then(function() {
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
