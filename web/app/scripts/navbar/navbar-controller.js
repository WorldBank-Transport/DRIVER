(function () {
    'use strict';

    /* ngInject */
    function NavbarController($log, $rootScope, $state, $stateParams,
                              Geography, Polygons, RecordTypes) {
        var ctl = this;
        ctl.onGeographySelected = onGeographySelected;
        ctl.onPolygonSelected = onPolygonSelected;
        ctl.onRecordTypeSelected = onRecordTypeSelected;
        ctl.onStateSelected = onStateSelected;
        ctl.navigateToStateName = navigateToStateName;
        ctl.getPolygonLabel = getPolygonLabel;

        setGeographies().then(setPolygons);
        setRecordTypes();
        setStates();
        $rootScope.$on('$stateChangeSuccess', setStates);

        // Sets states that can be navigated to (exclude current state, since we're already there)
        function setStates() {
            ctl.stateSelected = $state.current;
            ctl.availableStates = _.chain($state.get())
                .map(function(name) { return $state.get(name); })
                .filter(function(state) {
                    return state.showInNavbar && state.name !== $state.current.name;
                })
                .value();
        }

        // Updates the ui router state based on selected navigation parameters
        function updateState() {
            $state.go(ctl.stateSelected.name, {
                rtuuid: ctl.recordTypeSelected.uuid,
                geouuid: ctl.geographySelected.uuid,
                polyuuid: ctl.polygonSelected.id
            });
        }

        // Handler for when a geography is selected from the dropdown
        function onGeographySelected(geography) {
            ctl.geographySelected = geography;

            // Need to get the new list of polygons for the selected geography
            $stateParams.polyuuid = null;
            setPolygons().then(function(polygons) {
                if (polygons && polygons.length) {
                    // Default to the first polygon in the list
                    ctl.polygonSelected = polygons[0];
                }
                updateState();
            });
        }

        // Handler for when a polygon is selected from the dropdown
        function onPolygonSelected(polygon) {
            ctl.polygonSelected = polygon;
            updateState();
        }

        // Handler for when a record type is selected from the dropdown
        function onRecordTypeSelected(recordType) {
            ctl.recordTypeSelected = recordType;
            updateState();
        }

        // Handler for when a navigation state is selected from the dropdown
        function onStateSelected(navState) {
            ctl.stateSelected = navState;
            updateState();
        }

        // Handler for when a navigation state is selected from the dropdown
        function navigateToStateName(stateName) {
            onStateSelected($state.get(stateName));
        }

        // Returns the label for a polygon, based on the currently selected geography
        // TODO: this should eventually be moved to an angular filter if needed elsewhere
        function getPolygonLabel(polygon) {
            if (!polygon || !polygon.properties || !polygon.properties.data) {
                return '';
            }
            /* jshint camelcase: false */
            return polygon.properties.data[ctl.geographySelected.display_field];
            /* jshint camelcase: true */
        }

        // Gets list of polygons and sets the selected one
        function setPolygons() {
            return setResourceObjects(Polygons, 'polygon', 'polyuuid', 'id', {
                boundary: ctl.geographySelected.uuid
            });
        }

        // Gets list of geographies and sets the selected one
        function setGeographies() {
            return setResourceObjects(Geography, 'geography', 'geouuid', 'uuid', {});
        }

        // Gets list of record types and sets the selected one
        function setRecordTypes() {
            return setResourceObjects(RecordTypes, 'recordType', 'rtuuid', 'uuid', {
                active: 'True'
            });
        }

        /*
         * Queries for objects of a desired Resource and sets results to controller variables
         * @param {object} resource The $resource object to query
         * @param {string} name Name used for setting local variables
         * @param {string} stateParamName Key on $stateParams to look for the active uuid
         * @param {string} idProperty ID key on the result object
         * @param {object} params Parameter object to send along with the query
         * @return {promise} promise of query results
         */
        function setResourceObjects(resource, name, stateParamName, idProperty, params) {
            // Variable used for storing results for the objects.
            // E.g. 'recordType' results will be stored in ctl.recordTypeResults
            var resultsName = name + 'Results';

            // Variable used for storing the selected object.
            // E.g. the selected 'recordType' will be stored in ctl.recordTypeSelected
            var selectedName = name + 'Selected';

            return resource.query(params).$promise.then(function(results) {
                ctl[resultsName] = results;
                if (!results.length) {
                    $log.warn('No ' + name + ' objects returned');
                } else {
                    if ($stateParams[stateParamName]) {
                        var index = _.findIndex(results, function(result) {
                            return result[idProperty] === $stateParams[stateParamName];
                        });

                        if (index > 0) {
                            ctl[selectedName] = results[index];
                        }
                    }

                    if (!ctl[selectedName]) {
                        ctl[selectedName] = results[0];
                    }
                }
                return results;
            });
        }
    }

    angular.module('driver.navbar')
    .controller('NavbarController', NavbarController);

})();
