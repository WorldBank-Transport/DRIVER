/**
 * Polygon Type state control - changes to the private vars which define this state
 *  are broadcast to rootscope for use by controllers
 */
(function () {
    'use strict';

    /* ngInject */
    function PolygonState($window, $log, $rootScope, Polygons) {
        var defaultParams, selected, options;
        var _ = $window._;
        var svc = this;
        svc.updateOptions = updateOptions;
        svc.setSelected = setSelected;
        init();

        /**
         * initialization
         */
        function init() {
          selected = null;
          options = [];
          defaultParams = {'active': 'True'};
          svc.updateOptions();
        }

        /**
         * Query the backend for the available options
         *
         * @param {object} params - The query params to use in place of defaultParams
         */
        function updateOptions(params) {
            var filterParams = params || defaultParams;
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
        return svc;
    }

    angular.module('driver.state')
    .service('PolygonState', PolygonState);
})();
