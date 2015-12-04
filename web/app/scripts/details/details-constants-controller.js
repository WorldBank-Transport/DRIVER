(function () {
    'use strict';

    /* ngInject */
    function DetailsConstantsController() {
        var ctl = this;
        ctl.dateFormat = 'MMM D, YYYY h:mm:ss A'; // e.g. Sep 22, 2015 11:44:15 AM
    }

    angular.module('driver.details')
    .controller('DetailsConstantsController', DetailsConstantsController);

})();
