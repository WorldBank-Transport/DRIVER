(function () {
    'use strict';

    /* ngInject */
    function RecentProportionsController() {
        var ctl = this;

        ctl.proportions = [
          { proportion: 6.9, label: 'Jeepneys' },
          { proportion: '23.8', label: 'Motorcycles' },
          { proportion: '55', label: 'Cars' }
        ];
        return ctl;
    }

    angular.module('driver.recentProportions')
    .controller('RecentProportionsController', RecentProportionsController);

})();
