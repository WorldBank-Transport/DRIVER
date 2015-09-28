/**
 * Boundary Type state control - changes to the private vars which define this state
 *  are broadcast to rootscope for use by controllers
 */
(function () {
    'use strict';

    /* ngInject */
    function BoundaryState($log, $rootScope, $q, localStorageService, Polygons) {
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
          defaultParams = {'active': 'True'};
        }

        /**
         * Query the backend for the available options
         *
         * @param {object} params - The query params to use in place of defaultParams
         */
        function updateOptions(params) {
            var filterParams = angular.extend({}, defaultParams, params);
            return Polygons.query(filterParams).$promise.then(function(results) {
                  options = results;
                  $rootScope.$broadcast('driver.state.boundarystate:options', options);
                  if (!results.length) {
                      $log.warn('No boundaries returned');
                  } else {
                      if (!selected && options[0]) {
                          svc.setSelected(options[0]);
                      } else if (!_.includes(options, selected)) {
                          svc.setSelected(selected);
                      }
                  }
            });
        }

        function getOptions() {
            var deferred = $q.defer();
            if (!options) {
                updateOptions().then(function() { deferred.resolve(options); });
            }
            deferred.resolve(options);
            return deferred.promise;
        }

        /**
         * Set the state selection
         *
         * @param {object} selection - The selection among available options
         */
        function setSelected(selection) {
            if (!initialized) {
                selection = _.find(options, function(d) {
                    var oldPoly = localStorageService.get('boundary.selected');
                    if (!oldPoly) {
                        return {'id': ''};
                    }
                    return d.id === oldPoly.id;
                });
                initialized = true;
            }

            if (_.find(options, function(d) {
                if (!selection) { return false; }
                return d.id === selection.id;
            })) {
                selected = selection;
            } else if (options.length) {
                selected = options[0];
            } else {
                selected = null;
            }
            localStorageService.set('boundary.selected', selected);
            $rootScope.$broadcast('driver.state.boundarystate:selected', selected);
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
    .service('BoundaryState', BoundaryState);
})();
