(function () {
    'use strict';

    /* ngInject */
    function LabelFormatter() {
        /* Return control label for presentation.
         *
         * @param {String} Nampespaced label description in the form `parent#child`
         * @return {String} Label prettified to just `child`
         */
        return function(label) {
            if (!label) {
                return '';
            }

            var split = label.split('#');
            return split[split.length - 1];
        };
    }

    angular.module('driver.filterbar')
    .filter('labelFormatter', LabelFormatter);
})();
