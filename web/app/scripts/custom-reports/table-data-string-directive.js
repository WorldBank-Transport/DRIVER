(function () {
    'use strict';

    /* Special directive for cramming hand-composed HTML tables into the custom reports view.
     * Watches its argument then sets its HTML to the given value and stops watching.
     */

    /* ngInject */
    function tableDataString() {
        var module = {
            restrict: 'A',
            scope: {
                tableDataString: '='
            },
            link: function (scope, element) {
                // Watch for the composed HTML and dump it into the element.
                // Calling the watcher unbinds it.
                var watcher = scope.$watch('tableDataString', function (newData) {
                    element.html(newData);
                    watcher();
                });
            }
        };
        return module;
    }

    angular.module('driver.customReports')
    .directive('tableDataString', tableDataString);
})();
