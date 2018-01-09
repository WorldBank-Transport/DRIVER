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
                    'numeric': 'm/dd/yyyy'
                }
            },
            '': {
                calendar: 'gregorian',
                language: '',
                formats: {
                    'short': 'M Y',
                    'numeric': 'mm/dd/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'lt': {
                calendar: 'gregorian',
                language: 'lt',
                formats: {
                    'short': 'M Y',
                    'numeric': 'yyyy-mm-dd',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'ne': {
                calendar: 'nepali',
                language: 'lt',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'fr-CH': {
                calendar: 'gregorian',
                language: 'fr-CH',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd.mm.yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'pl': {
                calendar: 'gregorian',
                language: 'pl',
                formats: {
                    'short': 'M Y',
                    'numeric': 'yyyy-mm-dd',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'eo': {
                calendar: 'gregorian',
                language: 'eo',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'sv': {
                calendar: 'gregorian',
                language: 'sv',
                formats: {
                    'short': 'M Y',
                    'numeric': 'yyyy-mm-dd',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'hu': {
                calendar: 'gregorian',
                language: 'hu',
                formats: {
                    'short': 'M Y',
                    'numeric': 'yyyy-mm-dd',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'af': {
                calendar: 'gregorian',
                language: 'af',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'ml': {
                calendar: 'gregorian',
                language: 'ml',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'bs': {
                calendar: 'gregorian',
                language: 'bs',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd.mm.yy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'no': {
                calendar: 'gregorian',
                language: 'no',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd.mm.yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'hy': {
                calendar: 'gregorian',
                language: 'hy',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd.mm.yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'zh-CN': {
                calendar: 'gregorian',
                language: 'zh-CN',
                formats: {
                    'short': 'M Y',
                    'numeric': 'yyyy-mm-dd',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'pa': {
                calendar: 'nanakshahi',
                language: 'pa',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd-mm-yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'am': {
                calendar: 'ethiopian',
                language: 'am',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'de-CH': {
                calendar: 'gregorian',
                language: 'de-CH',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd.mm.yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'fi': {
                calendar: 'gregorian',
                language: 'fi',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd.mm.yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'sr-SR': {
                calendar: 'gregorian',
                language: 'sr-SR',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'ar': {
                calendar: 'islamic',
                language: 'ar',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'ro': {
                calendar: 'gregorian',
                language: 'ro',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd.mm.yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'hr': {
                calendar: 'gregorian',
                language: 'hr',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd.mm.yyyy.',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'bg': {
                calendar: 'gregorian',
                language: 'bg',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd.mm.yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'mt': {
                calendar: 'gregorian',
                language: 'mt',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'en-AU': {
                calendar: 'gregorian',
                language: 'en-AU',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'he': {
                calendar: 'hebrew',
                language: 'he',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'id': {
                calendar: 'gregorian',
                language: 'id',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'tr': {
                calendar: 'gregorian',
                language: 'tr',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd.mm.yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'ar-DZ': {
                calendar: 'gregorian',
                language: 'ar-DZ',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'km': {
                calendar: 'gregorian',
                language: 'km',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'ka': {
                calendar: 'gregorian',
                language: 'ka',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'eu': {
                calendar: 'gregorian',
                language: 'eu',
                formats: {
                    'short': 'M Y',
                    'numeric': 'yyyy/mm/dd',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'ko': {
                calendar: 'gregorian',
                language: 'ko',
                formats: {
                    'short': 'M Y',
                    'numeric': 'yyyy-mm-dd',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'fr': {
                calendar: 'gregorian',
                language: 'fr',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'mk': {
                calendar: 'gregorian',
                language: 'mk',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'de': {
                calendar: 'gregorian',
                language: 'de',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd.mm.yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'ur': {
                calendar: 'gregorian',
                language: 'ur',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'hi-IN': {
                calendar: 'gregorian',
                language: 'hi-IN',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'cs': {
                calendar: 'gregorian',
                language: 'cs',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd.mm.yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'nl-BE': {
                calendar: 'gregorian',
                language: 'nl-BE',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'es-AR': {
                calendar: 'gregorian',
                language: 'es-AR',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'th': {
                calendar: 'gregorian',
                language: 'th',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'me': {
                calendar: 'gregorian',
                language: 'me',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'zh-TW': {
                calendar: 'gregorian',
                language: 'zh-TW',
                formats: {
                    'short': 'M Y',
                    'numeric': 'yyyy/mm/dd',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'fo': {
                calendar: 'gregorian',
                language: 'fo',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd-mm-yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'pt-BR': {
                calendar: 'gregorian',
                language: 'pt-BR',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'it': {
                calendar: 'gregorian',
                language: 'it',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'sk': {
                calendar: 'gregorian',
                language: 'sk',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd.mm.yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'et': {
                calendar: 'gregorian',
                language: 'et',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd.mm.yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'ms': {
                calendar: 'gregorian',
                language: 'ms',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'es-PE': {
                calendar: 'gregorian',
                language: 'es-PE',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'lo': {
                calendar: 'gregorian',
                language: 'lo',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'es': {
                calendar: 'gregorian',
                language: 'es',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'nl': {
                calendar: 'gregorian',
                language: 'nl',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd-mm-yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'gl': {
                calendar: 'gregorian',
                language: 'gl',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'sr': {
                calendar: 'gregorian',
                language: 'sr',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'ta': {
                calendar: 'gregorian',
                language: 'ta',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'lv': {
                calendar: 'gregorian',
                language: 'lv',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd-mm-yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'rm': {
                calendar: 'gregorian',
                language: 'rm',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'da': {
                calendar: 'gregorian',
                language: 'da',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd-mm-yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'tt': {
                calendar: 'gregorian',
                language: 'tt',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd.mm.yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'fa': {
                calendar: 'persian',
                language: 'fa',
                formats: {
                    'short': 'M Y',
                    'numeric': 'yyyy/mm/dd',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'uk': {
                calendar: 'gregorian',
                language: 'uk',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'ja': {
                calendar: 'gregorian',
                language: 'ja',
                formats: {
                    'short': 'M Y',
                    'numeric': 'yyyy/mm/dd',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'az': {
                calendar: 'gregorian',
                language: 'az',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd.mm.yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'ca': {
                calendar: 'gregorian',
                language: 'ca',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'sq': {
                calendar: 'gregorian',
                language: 'sq',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd.mm.yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'vi': {
                calendar: 'gregorian',
                language: 'vi',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'sl': {
                calendar: 'gregorian',
                language: 'sl',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd.mm.yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'ru': {
                calendar: 'gregorian',
                language: 'ru',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd.mm.yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'bn': {
                calendar: 'gregorian',
                language: 'bn',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'en-GB': {
                calendar: 'gregorian',
                language: 'en-GB',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'gu': {
                calendar: 'gregorian',
                language: 'gu',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd-M-yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'zh-HK': {
                calendar: 'gregorian',
                language: 'zh-HK',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd-mm-yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'me-ME': {
                calendar: 'gregorian',
                language: 'me-ME',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'is': {
                calendar: 'gregorian',
                language: 'is',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'ar-EG': {
                calendar: 'gregorian',
                language: 'ar-EG',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'en-NZ': {
                calendar: 'gregorian',
                language: 'en-NZ',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'el': {
                calendar: 'gregorian',
                language: 'el',
                formats: {
                    'short': 'M Y',
                    'numeric': 'dd/mm/yyyy',
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y'
                }
            },
            'exclaim': {
                language: 'en',
                calendar: 'gregorian',
                formats: {
                    'short': 'M Y',
                    'longNoTime': 'MM d, Y',
                    'long': 'MM d,Y',
                    'numeric': 'm/dd/yyyy'
                }
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
