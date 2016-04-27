(function () {
    'use strict';

    // Angular filter for displaying a date time using the configured local time zone
    /* ngInject */
    function LocalDateTime(WebConfig) {
        return function(input, format) {
            // Format is optional, if unspecified it is displayed as a 'short' datetime
            // e.g. 9/22/15 11:44 AM
            // TODO: default date format needs localization
            format = format || 'M/D/YY h:mm A';
            return moment(input).tz(WebConfig.localization.timeZone).format(format);
        };
    }

    angular.module('driver.localization')
    .filter('localDateTime', LocalDateTime);

})();
