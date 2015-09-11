(function () {
    'use strict';

    /* ngInject */
    function OptionsField() {
        var module = {
            restrict: 'A',
            require: ['^driver-filterbar', 'options-field'],
            templateUrl: 'scripts/filterbar/options.html',
            controller: 'optionsController',
            scope: {
                data: '=',
                label: '=',
                selection: '='
            },
            link: function(scope, elem, attrs, ctlArray) {

                var filterbarController = ctlArray[0];

                // TODO: use controller?
                //var controller = ctlArray[1];

                init();

                function init() {

                    // TODO: get/set existing selection in localStorage using 'state' module

                    /**
                     * A simple wrapper around driver-filterbar's updateFilter function.
                     *
                     * @param filterLabel {string} label of which field to filter
                     */
                    scope.updateFilter = function(filterLabel, selection) {
                        filterbarController.updateFilter(filterLabel, selection);
                    };
                }
            }
        };
        return module;
    }

    angular.module('driver.filterbar')
    .directive('optionsField', OptionsField);

})();
