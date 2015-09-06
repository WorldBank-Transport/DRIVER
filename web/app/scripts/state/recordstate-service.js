/**
 * Record Type state control - changes to the private vars which define this state
 *  are broadcast to rootscope for use by controllers
 */
(function () {
    'use strict';

    /* ngInject */
    function RecordState($log, $rootScope, $q, localStorageService, RecordTypes) {
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
          svc.updateOptions();
        }

        /**
         * Query the backend for the available options
         *
         * @param {object} params - The query params to use in place of defaultParams
         */
        function updateOptions(params) {
            var filterParams = angular.extend({}, params, defaultParams);
            return RecordTypes.query(filterParams).$promise.then(function(results) {
                  options = results;
                  $rootScope.$broadcast('driver.state.recordstate:options', options);
                  if (!results.length) {
                      $log.warn('No record types returned');
                  } else {
                      if (!selected) {
                          selected = options[0];
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
            if (!selected && !initialized) {
                selected = localStorageService.get('geography.selected');
                initialized = true;
            }

            if (_.includes(options, selection)) {
                selected = selection;
            } else if (options.length) {
                selected = options[0];
            } else {
                selected = null;
            }
            localStorageService.set('recordtype.selected', selected);
            $rootScope.$broadcast('driver.state.recordstate:selected', selected);
            return selected;
        }

        function getSelected() {
            var deferred = $q.defer();
            if (!selected && !options.length) {
                updateOptions().then(function() { deferred.resolve(selected); });
            } else if (!selected) {
                deferred.resolve(setSelected());
            } else {
                deferred.resolve(selected);
            }
            return deferred.promise;
        }

        return svc;
    }

    angular.module('driver.state')
    .factory('RecordState', RecordState);
})();
