(function () {
    'use strict';

    /* ngInject */
    function DetailsConstantsController() {
        var ctl = this;
        ctl.dateFormat = 'MMM d, y h:mm:ss a';
    }

    angular.module('driver.details')
    .controller('DetailsConstantsController', DetailsConstantsController);

})();
