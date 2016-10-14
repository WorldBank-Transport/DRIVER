(function () {
    'use strict';

    /* ngInject */
    function DetailsMultipleController() {
        var ctl = this;
        ctl.maxDataColumns = 4;
    }

    angular.module('driver.details')
    .controller('DetailsMultipleController', DetailsMultipleController);

})();
