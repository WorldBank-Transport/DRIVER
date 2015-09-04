/**
 * Polygon Type state control - changes to the private vars which define this state
 *  are broadcast to rootscope for use by controllers
 */
(function () {
    'use strict';

    /* ngInject */
    function PolygonState($log, $rootScope, $q, Polygons) {
        var defaultParams, selected, options;
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
                  $rootScope.$broadcast('driver.state.polygonstate:options', options);
                  if (!results.length) {
                      $log.warn('No polygons returned');
                  } else {
                      svc.setSelected(selected);
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
            if (_.includes(options, selection)) {
                selected = selection;
            } else if (options.length) {
                selected = options[0];
            } else {
                selected = null;
            }
            $rootScope.$broadcast('driver.state.polygonstate:selected', selected);
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
    .service('PolygonState', PolygonState);
})();
