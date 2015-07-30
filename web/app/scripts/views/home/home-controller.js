(function () {
    'use strict';

    /* ngInject */
    function HomeController($stateParams, RecordTypes) {
        var ctl = this;
        initialize();

        function initialize() {
            ctl.recordTypes = RecordTypes.query({ active: 'True' });
        }
    }

    angular.module('driver.views.home')
    .controller('HomeController', HomeController);

})();
