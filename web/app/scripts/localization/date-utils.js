(function() {
    'use strict';

    /* ngInject */
    function DateUtils(LanguageState, WebConfig) {
        /* jshint quotmark: false */
        var languageMap = {
            'ar-sa': {
                language: 'ar',
                calendar: 'ummalqura',
                formats: {
                    'short': 'M Y',
                    'longNoTime': 'd MM, Y',
                    'long': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy'
                }
            },
            'en-us': {
                language: 'en',
                calendar: 'gregorian',
                formats: {
                    'short': 'M Y',
                    'long': 'MM d, Y',
                    'numeric': 'mm/dd/yyyy'
                }
            },
            'exclaim': {
                language: 'en',
                calendar: 'gregorian',
                formats: {
                    'short': "'!'M Y",
                    'longNoTime': "'!'MM d, Y",
                    'long': "'!'MM d,Y",
                    'numeric': "'!'mm/dd/yyyy"
                }
            }
        };
        /* jshint quotmark: single */

        var module = {
            getLocalizedDateString: getLocalizedDateString
        };
        return module;

        /*
         * Get a localized date string for a date, using the LanguageState to
         * choose the correct language. LanguageState is set using the language
         * selector in the navbar
         *
         * Args:
         *     date (Date): the date to process
         *     format (string): which string format to process the date into.
         *                      Formats are defined per language in the languageMap
         *     includeTime (string): Include the time in the returned string
         */
        function getLocalizedDateString(date, format, includeTime) {
            var localizedDate = moment(date).tz(WebConfig.localization.timeZone).toDate();
            if (isNaN(localizedDate.getDate())) {
                return '';
            }
            var selected = LanguageState.getSelected();
            var language = selected.id;
            if (!language) {
                language = 'exclaim';
            }
            var isRtl = selected.rtl;
            var conversion = languageMap[language];
            var convertedDate = $.calendars.instance(conversion.calendar, conversion.language)
                .fromJSDate(localizedDate);
            var datestring = convertedDate.formatDate(conversion.formats[format], convertedDate);
            if (includeTime) {
                var minutes = localizedDate.getMinutes() + '';
                if (minutes.length < 2) {
                    minutes = '0' + minutes;
                }
                var hours = localizedDate.getHours() + '';
                if (hours.length < 2) {
                    hours = '0' + hours;
                }
                var seconds = localizedDate.getSeconds() + '';
                if (seconds.length < 2) {
                    seconds = '0' + seconds;
                }
                if (isRtl) {
                    datestring = hours + ':' + minutes + ':' + seconds + ' - ' + datestring;
                } else {
                    datestring = datestring + ' - ' + hours + ':' + minutes + ':' + seconds;
                }
            }
            return datestring;
        }
    }

    /* ngInject */
    function LocalizeDateFilter(DateUtils) {
        function module(d, format, includeTime) {
            return DateUtils.getLocalizedDateString(new Date(Date.parse(d)), format, includeTime === 'time');
        }
        return module;
    }


    angular.module('driver.localization')
        .factory('DateUtils', DateUtils)
        .filter('localizeRecordDate', LocalizeDateFilter);
})();
