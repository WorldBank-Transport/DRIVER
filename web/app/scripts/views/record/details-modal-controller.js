(function () {
    'use strict';

    /* ngInject */
    function RecordDetailsModalController($modalInstance, record, recordType, recordSchema) {
        var ctl = this;
        ctl.record = record;
        ctl.recordType = recordType;
        ctl.recordSchema = recordSchema;

        ctl.close = function () {
            $modalInstance.close();
        };
    }

    angular.module('driver.views.record')
    .controller('RecordDetailsModalController', RecordDetailsModalController);

})();
