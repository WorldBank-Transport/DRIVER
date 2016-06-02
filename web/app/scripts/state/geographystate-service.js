/**
 * Geography state control - changes to the private vars which define this state
 *  are broadcast to rootscope for use by controllers
 */
(function () {
    'use strict';

    /* ngInject */
    function GeographyState($log, $rootScope, $q, localStorageService,
                            InitialState, Geography) {
        var defaultParams, selected, options;
        var initialized = false;
        var svc = this;
        svc.updateOptions = updateOptions;
        svc.getOptions = getOptions;
        svc.setSelected = setSelected;
        svc.getSelected = getSelected;
        init();

        /**
         * initialization
         */
        function init() {
          selected = null;
          options = [];
          defaultParams = {};
        }

        /**
         * Query the backend for the available options
         *
         * @param {object} params - The query params to use in place of defaultParams
         */
        function updateOptions(params) {
            // app just started and we have stored vals in localstorage:
            var filterParams = params || defaultParams;
            return Geography.query(filterParams).$promise.then(function(results) {
                options = results;
                $rootScope.$broadcast('driver.state.geographystate:options', options);
                if (!results.length) {
                    $log.warn('No geographies returned');
                } else {
                    if (!selected && options[0]) {
                        selected = svc.setSelected(options[0]);
                    } else if (!_.includes(options, selected)) {
                        svc.setSelected(selected);
                    }
                }
            });
        }

        function getOptions() {
            if(_.isEmpty(options)) {
                return updateOptions().then(function(){
                    return options;
                });
            } else {
                return $q.when(options);
            }
        }

        /**
         * Set the state selection
         *
         * @param {object} selection - The selection among available options
         */
        function setSelected(selection) {
            if (!initialized) {
                var oldSelection = _.find(options, function(d) {
                    var oldGeo = localStorageService.get('geography.selected');
                    if (!oldGeo) {
                        return {'uuid': ''};
                    }
                    return d.uuid === oldGeo.uuid;
                });
                if (oldSelection) {
                    selection = oldSelection;
                }
                initialized = true;
                InitialState.setGeographyInitialized();
            }

            if (_.find(options, function(d) { return d.uuid === selection.uuid; })) {
                selected = selection;
            } else if (options.length) {
                selected = options[0];
            } else {
                selected = null;
            }
            localStorageService.set('geography.selected', selected);
            $rootScope.$broadcast('driver.state.geographystate:selected', selected);
            return selected;
        }

        function getSelected() {
            var deferred = $q.defer();
            if (!selected) {
                updateOptions().then(function() { deferred.resolve(selected); });
            } else {
                deferred.resolve(selected);
            }
            return deferred.promise;
        }

        return svc;

    }

    angular.module('driver.state')
    .factory('GeographyState', GeographyState);
})();
