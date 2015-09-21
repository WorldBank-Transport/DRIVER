(function () {
    'use strict';

    /* ngInject */
    function DetailsTextController() {
        var ctl = this;
        ctl.maxLength = 20;
    }

    angular.module('driver.details')
    .controller('DetailsTextController', DetailsTextController);

})();
