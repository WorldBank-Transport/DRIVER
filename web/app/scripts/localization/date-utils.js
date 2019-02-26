(function() {
    'use strict';

    /* ngInject */
    function DateLocalization(LanguageState, WebConfig) {
        var languageMap = {
            '': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'mm/dd/yyyy',
                    'short': 'M Y'
                },
                language: ''
            },
            'af': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'af'
            },
            'am': {
                calendar: 'ethiopian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'am'
            },
            'ar': {
                calendar: 'islamic',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'ar'
            },
            'ar-DZ': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'ar-DZ'
            },
            'ar-EG': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'ar-EG'
            },
            'ar-sa': {
                calendar: 'ummalqura',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'ar'
            },
            'az': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd.mm.yyyy',
                    'short': 'M Y'
                },
                language: 'az'
            },
            'bg': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd.mm.yyyy',
                    'short': 'M Y'
                },
                language: 'bg'
            },
            'bn': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'bn'
            },
            'bs': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd.mm.yy',
                    'short': 'M Y'
                },
                language: 'bs'
            },
            'ca': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'ca'
            },
            'cs': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd.mm.yyyy',
                    'short': 'M Y'
                },
                language: 'cs'
            },
            'da': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd-mm-yyyy',
                    'short': 'M Y'
                },
                language: 'da'
            },
            'de': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd.mm.yyyy',
                    'short': 'M Y'
                },
                language: 'de'
            },
            'de-CH': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd.mm.yyyy',
                    'short': 'M Y'
                },
                language: 'de-CH'
            },
            'el': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'el'
            },
            'en-AU': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'en-AU'
            },
            'en-GB': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'en-GB'
            },
            'en-NZ': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'en-NZ'
            },
            'en-us': {
                calendar: 'gregorian',
                formats: {
                    'long': 'MM d, Y',
                    'longNoTime': 'MM d, Y',
                    'numeric': 'm/dd/yyyy',
                    'short': 'M Y'
                },
                language: 'en'
            },
            'eo': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'eo'
            },
            'es': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'es'
            },
            'es-AR': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'es-AR'
            },
            'es-PE': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'es-PE'
            },
            'et': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd.mm.yyyy',
                    'short': 'M Y'
                },
                language: 'et'
            },
            'eu': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'yyyy/mm/dd',
                    'short': 'M Y'
                },
                language: 'eu'
            },
            'exclaim': {
                calendar: 'gregorian',
                formats: {
                    'long': 'MM d,Y',
                    'longNoTime': 'MM d, Y',
                    'numeric': 'm/dd/yyyy',
                    'short': 'M Y'
                },
                language: 'en'
            },
            'fa': {
                calendar: 'persian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'yyyy/mm/dd',
                    'short': 'M Y'
                },
                language: 'fa'
            },
            'fi': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd.mm.yyyy',
                    'short': 'M Y'
                },
                language: 'fi'
            },
            'fo': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd-mm-yyyy',
                    'short': 'M Y'
                },
                language: 'fo'
            },
            'fr': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'fr'
            },
            'fr-CH': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd.mm.yyyy',
                    'short': 'M Y'
                },
                language: 'fr-CH'
            },
            'gl': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'gl'
            },
            'gu': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd-M-yyyy',
                    'short': 'M Y'
                },
                language: 'gu'
            },
            'he': {
                calendar: 'hebrew',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'he'
            },
            'hi-IN': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'hi-IN'
            },
            'hr': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd.mm.yyyy.',
                    'short': 'M Y'
                },
                language: 'hr'
            },
            'hu': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'yyyy-mm-dd',
                    'short': 'M Y'
                },
                language: 'hu'
            },
            'hy': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd.mm.yyyy',
                    'short': 'M Y'
                },
                language: 'hy'
            },
            'id': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'id'
            },
            'is': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'is'
            },
            'it': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'it'
            },
            'ja': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'yyyy/mm/dd',
                    'short': 'M Y'
                },
                language: 'ja'
            },
            'ka': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'ka'
            },
            'km': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'km'
            },
            'ko': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'yyyy-mm-dd',
                    'short': 'M Y'
                },
                language: 'ko'
            },
            'lo': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'lo'
            },
            'lt': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'yyyy-mm-dd',
                    'short': 'M Y'
                },
                language: 'lt'
            },
            'lv': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd-mm-yyyy',
                    'short': 'M Y'
                },
                language: 'lv'
            },
            'me': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'me'
            },
            'me-ME': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'me-ME'
            },
            'mk': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'mk'
            },
            'ml': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'ml'
            },
            'ms': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'ms'
            },
            'mt': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'mt'
            },
            'ne': {
                calendar: 'nepali',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'lt'
            },
            'nl': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd-mm-yyyy',
                    'short': 'M Y'
                },
                language: 'nl'
            },
            'nl-BE': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'nl-BE'
            },
            'no': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd.mm.yyyy',
                    'short': 'M Y'
                },
                language: 'no'
            },
            'pa': {
                calendar: 'nanakshahi',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd-mm-yyyy',
                    'short': 'M Y'
                },
                language: 'pa'
            },
            'pl': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'yyyy-mm-dd',
                    'short': 'M Y'
                },
                language: 'pl'
            },
            'pt-BR': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'pt-BR'
            },
            'rm': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'rm'
            },
            'ro': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd.mm.yyyy',
                    'short': 'M Y'
                },
                language: 'ro'
            },
            'ru': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd.mm.yyyy',
                    'short': 'M Y'
                },
                language: 'ru'
            },
            'sk': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd.mm.yyyy',
                    'short': 'M Y'
                },
                language: 'sk'
            },
            'sl': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd.mm.yyyy',
                    'short': 'M Y'
                },
                language: 'sl'
            },
            'sq': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd.mm.yyyy',
                    'short': 'M Y'
                },
                language: 'sq'
            },
            'sr': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'sr'
            },
            'sr-SR': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'sr-SR'
            },
            'sv': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'yyyy-mm-dd',
                    'short': 'M Y'
                },
                language: 'sv'
            },
            'ta': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'ta'
            },
            'th': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'th'
            },
            'tr': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd.mm.yyyy',
                    'short': 'M Y'
                },
                language: 'tr'
            },
            'tt': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd.mm.yyyy',
                    'short': 'M Y'
                },
                language: 'tt'
            },
            'uk': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'uk'
            },
            'ur': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'ur'
            },
            'vi': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'vi'
            },
            'zh-CN': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'yyyy-mm-dd',
                    'short': 'M Y'
                },
                language: 'zh-CN'
            },
            'zh-HK': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd-mm-yyyy',
                    'short': 'M Y'
                },
                language: 'zh-HK'
            },
            'zh-TW': {
                calendar: 'gregorian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'yyyy/mm/dd',
                    'short': 'M Y'
                },
                language: 'zh-TW'
            }
        };

        var module = {
            getLocalizedDateString: getLocalizedDateString,
            currentDateFormats: currentDateFormats,
            convertToCalendar: convertToCalendar,
            convertNonTimezoneDate: convertNonTimezoneDate
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
         *     excludeSeconds (string): Exclude seconds in the returned string
         */
        function getLocalizedDateString(date, format, includeTime, excludeSeconds) {
            var conversion;
            var localizedMoment = moment(date).tz(WebConfig.localization.timeZone);
            var localizedDate = new Date(localizedMoment.format('MMM DD YYYY'));
            if (isNaN(localizedDate.getDate())) {
                return '';
            }
            var selected = LanguageState.getSelected();
            var language = selected.id;
            if (!language) {
                language = 'exclaim';
            }
            var isRtl = selected.rtl;
            if (language in languageMap) {
                conversion = languageMap[language];
            } else {
                // Empty string covers all default languages
                conversion = languageMap[''];
            }
            var convertedDate = $.calendars.instance(conversion.calendar, conversion.language)
                .fromJSDate(localizedDate);
            var datestring = convertedDate.formatDate(conversion.formats[format], convertedDate);
            if (includeTime) {
                var hms = localizedMoment.format(excludeSeconds ? 'H:mm' : 'H:mm:ss');

                if (isRtl) {
                    datestring = hms + ', ' + datestring;
                } else {
                    datestring = datestring + ', ' + hms;
                }
            }
            return datestring;
        }

        /**
         * Since the date and time pickers rely on the browser's local timezone with
         * no way to override, we need to modify the occurred datetime before it gets
         * to the pickers. We want to show the datetime in the configured local tz,
         * so we need to apply offsets for both the browser's tz and the configured
         * local tz so it shows up as desired. This also needs to be undone before
         * sending data over to the server when saving this request. This is a hack,
         * but there's no clearly better way around it.
         *
         * @param {Date} date The record object where occurred_to resides
         * @param {bool} reverse True if the fix is being reversed for API purposes
         */
        function convertNonTimezoneDate(date, reverse) {
            var dateDT = new Date(date);
            var browserTZOffset = dateDT.getTimezoneOffset();
            var configuredTZOffset = moment(dateDT).tz(WebConfig.localization.timeZone)._offset;
            // Note that the native js getTimezoneOffset returns the opposite of what
            // you'd expect: i.e. EST which is UTC-5 gets returned as positive 5.
            // The `moment` method of returning the offset would return this as a -5.
            // Therefore if the browser tz is the same as the configured local tz,
            // the following offset will cancel out and return zero.
            var offset = (browserTZOffset + configuredTZOffset) * (reverse ? -1 : +1);

            dateDT.setMinutes(dateDT.getMinutes() + offset);
            return dateDT;
        }
    }

    /* ngInject */
    function LocalizeDateFilter(DateLocalization) {
        function module(d, format, includeTime, excludeSeconds) {
            return DateLocalization.getLocalizedDateString(
                new Date(Date.parse(d)),
                format,
                includeTime,
                excludeSeconds
            );
        }
        return module;
    }


    angular.module('driver.localization')
        .factory('DateLocalization', DateLocalization)
        .filter('localizeRecordDate', LocalizeDateFilter);
})();
