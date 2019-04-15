(function () {
    'use strict';

    /* ngInject */
    function RecordDetailsModalController($modalInstance, record, recordType,
                                          recordSchema, userCanWrite, RecordState) {
        var ctl = this;
        initialize();

        function initialize() {
            ctl.record = record;
            ctl.recordType = recordType;
            ctl.recordSchema = recordSchema;
            ctl.userCanWrite = userCanWrite;

            ctl.close = function () {
                $modalInstance.close();
            };

            RecordState.getSecondary().then(function (secondaryType) {
                if (!!secondaryType && secondaryType.uuid === ctl.recordType.uuid) {
                    ctl.record.isSecondary = true;
                } else {
                    ctl.record.isSecondary = false;
                }
                ctl.isSecondary = ctl.record.isSecondary;
            });
        }
    }

    angular.module('driver.views.record')
    .controller('RecordDetailsModalController', RecordDetailsModalController);

})();
