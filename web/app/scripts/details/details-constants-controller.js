(function () {
    'use strict';

    /* ngInject */
    function DetailsConstantsController() {
        var ctl = this;
        ctl.dateFormat = 'long';
    }

    angular.module('driver.details')
    .controller('DetailsConstantsController', DetailsConstantsController);

})();
