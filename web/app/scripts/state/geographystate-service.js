/**
 * Geography state control - changes to the private vars which define this state
 *  are broadcast to rootscope for use by controllers
 */
(function () {
    'use strict';

    /* ngInject */
    function GeographyState($log, $rootScope, Geography) {
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
          defaultParams = {};
          svc.updateOptions();
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
                  $rootScope.$broadcast('driver.state.geographystate:options', options);
                  if (!results.length) {
                      $log.warn('No geographies returned');
                  } else {
                      if (!_.includes(options, selected)) {
                          svc.setSelected(selected);
                      }
                  }
            });
        }

        function getOptions() {
            return options;
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
                var fromUrl = _.findWhere(options, { uuid: $stateParams.geouuid });
                selected = fromUrl || options[0];
            } else {
                selected = null;
            }
            $rootScope.$broadcast('driver.state.geographystate:selected', selected);
        }

        function getSelected() {
            return selected;
        }

        return svc;

    }

    angular.module('driver.state')
    .factory('GeographyState', GeographyState);
})();
