(function() {
    'use strict';

    /* ngInject */
    function DateLocalization(LanguageState, WebConfig) {
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
                    'longNoTime': 'MM d, Y',
                    'long': 'MM d, Y',
                    'numeric': 'mm/dd/yyyy'
                }
            },
            'exclaim': {
                language: 'en',
                calendar: 'gregorian',
                formats: {
                    'short': 'M Y',
                    'longNoTime': 'MM d, Y',
                    'long': 'MM d,Y',
                    'numeric': 'mm/dd/yyyy'
                }
            }
        };

        var module = {
            getLocalizedDateString: getLocalizedDateString,
            currentDateFormats: currentDateFormats,
            convertToCalendar: convertToCalendar
        };
        return module;

        /**
         * Return the date formatting configuration for the currently selected interface language
         */
        function currentDateFormats() {
            return languageMap[LanguageState.getSelected().id];
        }

        /**
         * Convert a CDate to a different calendar, identified by 'calendarName' and 'calendarLang'
         * @param cDate {CDate}: CDate object to convert
         * @param calendarName {string}: String identifying the name of the calendar to convert to
         * @param calendarLang {string}: Two-character language code for the calendar
         * @returns {CDate}: The date in the new calendar
         *
         */
        function convertToCalendar(cDate, calendarName, calendarLang) {
            return $.calendars.instance(calendarName, calendarLang)
                .fromJD(cDate._calendar.toJD(cDate));
        }

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
    function LocalizeDateFilter(DateLocalization) {
        function module(d, format, includeTime) {
            return DateLocalization.getLocalizedDateString(
                new Date(Date.parse(d)),
                format,
                includeTime === 'time'
            );
        }
        return module;
    }


    angular.module('driver.localization')
        .factory('DateLocalization', DateLocalization)
        .filter('localizeRecordDate', LocalizeDateFilter);
})();
