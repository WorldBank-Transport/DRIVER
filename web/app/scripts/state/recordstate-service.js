/**
 * Record Type state control - changes to the private vars which define this state
 *  are broadcast to rootscope for use by controllers
 */
(function () {
    'use strict';

    /* ngInject */
    function RecordState($log, $rootScope, $q, localStorageService,
                         InitialState, RecordTypes, WebConfig) {
        var defaultParams,
            selected,
            secondaryType,
            options,
            gettingSelected,
            selectedPromise,
            gettingOptions,
            optionPromise;
        var initialized = false;
        var svc = this;
        svc.updateOptions = updateOptions;
        svc.getOptions = getOptions;
        svc.setSelected = setSelected;
        svc.getSelected = getSelected;
        svc.getSecondary = getSecondary;
        init();

        /**
         * initialization
         */
        function init() {
            selected = null;
            gettingSelected = false;
            gettingOptions = false;
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
                    if (!selected && options[0]) {
                        selected = svc.setSelected(options[0]);
                    } else if (!_.includes(options, selected)) {
                        svc.setSelected(selected);
                    }
                }
            });
        }

        function getOptions() {
            if (!gettingOptions) {
                gettingOptions = true;
                var deferred = $q.defer();
                if (!options) {
                    updateOptions().then(function() { deferred.resolve(options); });
                } else {
                    deferred.resolve(options);
                }
                optionPromise = deferred.promise;
            }
            optionPromise.then(function() { gettingOptions = false; });
            return optionPromise;
        }

        /**
         * Set the state selection
         *
         * @param {object} selection - The selection among available options
         */
        function setSelected(selection) {
            if (!initialized) {
                // If the record type is not configured as visible, always use the primary.
                // The primary is obtained by finding a record type label matching the primaryLabel.
                if (!WebConfig.recordType.visible) {
                    selection = _.find(options, function(d) {
                        return d.label === WebConfig.recordType.primaryLabel;
                    });
                } else {
                    var oldRecordType = localStorageService.get('recordtype.selected');
                    if (oldRecordType) {
                        selection = _.find(options, function(d) {
                            return d.uuid === oldRecordType.uuid;
                        });
                    }
                }
                initializeSecondary();
            }
            if (_.find(options, function(d) { return d.uuid === selection.uuid; })) {
                selected = selection;
            } else if (options.length) {
                selected = options[0];
            } else {
                selected = null;
            }
            localStorageService.set('recordtype.selected', selected);
            $rootScope.$broadcast('driver.state.recordstate:selected', selected);
            if (!initialized) {
                initialized = true;
                InitialState.setRecordTypeInitialized();
            }
            return selected;
        }

        function initializeSecondary() {
            secondaryType = _.find(options, function(d) {
                return d.label === WebConfig.recordType.secondaryLabel;
            });
            localStorageService.set('secondaryrecordtype.selected', secondaryType);
        }

        function getSelected() {
            if (!gettingSelected) {
                gettingSelected = true;
            } else {
                return selectedPromise;
            }

            var deferred = $q.defer();
            if (!selected && !options.length) {
                updateOptions().then(function() { deferred.resolve(selected); });
            } else if (!selected) {
                deferred.resolve(setSelected());
            } else {
                deferred.resolve(selected);
            }
            selectedPromise = deferred.promise;

            selectedPromise.then(function() { gettingSelected = false; });
            return selectedPromise;
        }

        function getSecondary() {
            if (initialized) {
                return $q.resolve(secondaryType);
            } else {
                return getSelected().then(function () { return secondaryType; });
            }
        }

        return svc;
    }

    angular.module('driver.state')
    .factory('RecordState', RecordState);
})();
