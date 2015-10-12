(function () {
    'use strict';

    /* ngInject */
    function RecentProportionsController() {
        var ctl = this;

        ctl.proportions = [
          { proportion: 'About half', label: 'birds' },
          { proportion: 'Some', label: 'frozen waffles' },
          { proportion: '1.2%', label: 'covers of \'Freebird\'' }
        ];
        return ctl;
    }

    angular.module('driver.recentProportions')
    .controller('RecentProportionsController', RecentProportionsController);

})();
