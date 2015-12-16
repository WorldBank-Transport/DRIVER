(function () {
    'use strict';

    /* ngInject */
    function RecordDetailsModalController($modalInstance, record, recordType,
                                          recordSchema, userCanWrite) {
        var ctl = this;
        ctl.record = record;
        ctl.recordType = recordType;
        ctl.recordSchema = recordSchema;
        ctl.userCanWrite = userCanWrite;

        ctl.close = function () {
            $modalInstance.close();
        };
    }

    angular.module('driver.views.record')
    .controller('RecordDetailsModalController', RecordDetailsModalController);

})();
