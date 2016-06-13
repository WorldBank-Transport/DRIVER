(function () {
    'use strict';

    /* ngInject */
    function DateRangeController() {
        var ctl = this;
        ctl.error = {};

        /**
         * Determine validity of a min-max pairing
         * Expected to be Javascript Date objects
         */
        ctl.isMinMaxValid = function(minMax) {
            var min, max;
            if (minMax.min) { min = minMax.min; }
            if (minMax.max) { max = minMax.max; }

            if (max && min) {
                return max >= min;
            }

            if (max || min) {
                return true;
            }
            return false;
        };

        return ctl;
    }

    angular.module('driver.filterbar')
    .controller('dateRangeController', DateRangeController);

})();
