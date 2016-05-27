(function() {
    'use strict';

    /**
     * @ngInject
     */
    function SettingsListController ($log, $scope, BlackSpotConfig, Notifications, Utils) {

        var ctl = this;
        ctl.blackSpotSeverityUpdateClicked = blackSpotSeverityUpdateClicked;
        initialize();

        function initialize() {
            BlackSpotConfig.query().$promise.then(function (results) {
                // The BlackSpotConfig setting is a singleton -- there is guaranteed to be only one
                ctl.blackSpotConfig = results[0];
            });
        }

        function blackSpotSeverityUpdateClicked() {
            /* jshint camelcase: false */
            var threshold = ctl.blackSpotConfig.severity_percentile_threshold;
            /* jshint camelcase: true */

            // Validate the black spot severity threshold value.
            // The threshold will be undefined if it didn't meet the criteria of the input field.
            // The range check has been added as well, just in case, but probably isn't needed.
            if (threshold === undefined || threshold < 0 || threshold > 1) {
                Notifications.show({
                    html: '<h4>Black spot severity threshold must be between 0 and 1</h4>',
                    displayClass: 'alert-danger'
                });
                return;
            }

            BlackSpotConfig.update(ctl.blackSpotConfig, function() {
                Notifications.show({
                    text: 'Successfully updated black spot severity threshold',
                    displayClass: 'alert-success',
                    timeout: 3000
                });
            }, function(error) {
                $log.error('error updating black spot severity threshold:');
                $log.error(error);

                var errorHtml = '<h4>Failed to update black spot severity threshold</h4>';
                errorHtml += Utils.buildErrorHtml(error);

                Notifications.show({
                    html: errorHtml,
                    displayClass: 'alert-danger'
                });
            });
        }
    }

    angular.module('ase.views.settings')
        .controller('SettingsListController', SettingsListController);

})();
