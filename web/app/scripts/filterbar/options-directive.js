(function () {
    'use strict';

    /* ngInject */
    function OptionsField($log) {
        var module = {
            restrict: 'A',
            require: ['^driver-filterbar', 'options-field'],
            templateUrl: 'scripts/filterbar/options.html',
            controller: 'optionsController',
            scope: {
                data: '=',
                label: '='
            },
            link: function(scope, elem, attrs, ctlArray) {

                var filterbarController = ctlArray[0];
                var controller = ctlArray[1];

                init();

                function init() {

                    // TODO: get/set existing selection in localStorage using 'state' module
                    controller.selection = null;
                }

                /**
                 * A simple wrapper around driver-filterbar's updateFilter function;
                 *  filters should only be updated when data validates
                 *
                 * @param filterLabel {string} label of which field to filter
                 * @param filterObj {object} filter data
                 */
                scope.updateFilter = function(filterLabel, filterObj) {
                    filterbarController.updateFilter(filterLabel, filterObj);
                };
            }
        };
        return module;
    }

    angular.module('driver.filterbar')
    .directive('optionsField', OptionsField);

})();
