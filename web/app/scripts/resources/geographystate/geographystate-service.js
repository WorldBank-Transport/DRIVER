/**
 * Geography state control - changes to the private vars which define this state
 *  are broadcast to rootscope for use by controllers
 */
(function () {
    'use strict';

    /* ngInject */
    function GeographyState($window, $log, $rootScope, Geography) {
        var defaultParams, selected, options;
        var _ = $window._;
        this.updateOptions = updateOptions;
        this.setSelected = setSelected;
        var that = this;
        init();

        /**
         * initialization
         */
        function init() {
          selected = null;
          options = [];
          defaultParams = {};
          that.updateOptions();
        }

        /**
         * Query the backend for the available options
         *
         * @param {object} params - The query params to use in place of defaultParams
         */
        function updateOptions(params) {
            var filterParams = params || defaultParams;
            return Geography.query(filterParams).$promise.then(function(results) {
                  options = results;
                  $rootScope.$broadcast('driver.resources.geographystate:options', options);
                  if (!results.length) {
                      $log.warn('No geographies returned');
                  } else {
                      if (!_.includes(options, selected)) {
                          that.setSelected(selected);
                      }
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
            $rootScope.$broadcast('driver.resources.geographystate:selected', selected);
        }
    }

    angular.module('driver.resources.geographystate')
    .service('GeographyState', GeographyState);
})();
