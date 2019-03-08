(function() {
    'use strict';

    /* ngInject */
    function DateLocalization(LanguageState, WebConfig) {
        var languageMap = {
            '': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'mm/dd/yyyy',
                    'short': 'M Y'
                }
            },
            'af': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                }
            },
            'am': {
                calendar: 'ethiopian',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                }
            },
            'ar': {
                calendar: 'islamic',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                }
            },
            'ar-dz': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'ar-DZ'
            },
            'ar-eg': {
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
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd.mm.yyyy',
                    'short': 'M Y'
                }
            },
            'bg': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd.mm.yyyy',
                    'short': 'M Y'
                }
            },
            'bn': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                }
            },
            'bs': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd.mm.yy',
                    'short': 'M Y'
                }
            },
            'ca': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                }
            },
            'cs': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd.mm.yyyy',
                    'short': 'M Y'
                }
            },
            'da': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd-mm-yyyy',
                    'short': 'M Y'
                }
            },
            'de': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd.mm.yyyy',
                    'short': 'M Y'
                }
            },
            'de-ch': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd.mm.yyyy',
                    'short': 'M Y'
                },
                language: 'de-CH'
            },
            'el': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                }
            },
            'en-au': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'en-AU'
            },
            'en-gb': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'en-GB'
            },
            'en-nz': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'en-NZ'
            },
            'en-us': {
                formats: {
                    'long': 'MM d, Y',
                    'longNoTime': 'MM d, Y',
                    'numeric': 'm/dd/yyyy',
                    'short': 'M Y'
                },
                language: 'en'
            },
            'eo': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                }
            },
            'es': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                }
            },
            'es-ar': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'es-AR'
            },
            'es-pe': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'es-PE'
            },
            'et': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd.mm.yyyy',
                    'short': 'M Y'
                }
            },
            'eu': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'yyyy/mm/dd',
                    'short': 'M Y'
                }
            },
            'exclaim': {
                formats: {
                    'long': 'MM d, Y',
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
                }
            },
            'fi': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd.mm.yyyy',
                    'short': 'M Y'
                }
            },
            'fo': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd-mm-yyyy',
                    'short': 'M Y'
                }
            },
            'fr': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                }
            },
            'fr-ch': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd.mm.yyyy',
                    'short': 'M Y'
                },
                language: 'fr-CH'
            },
            'gl': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                }
            },
            'gu': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd-M-yyyy',
                    'short': 'M Y'
                }
            },
            'he': {
                calendar: 'hebrew',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                }
            },
            'hi-in': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'hi-IN'
            },
            'hr': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd.mm.yyyy.',
                    'short': 'M Y'
                }
            },
            'hu': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'yyyy-mm-dd',
                    'short': 'M Y'
                }
            },
            'hy': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd.mm.yyyy',
                    'short': 'M Y'
                }
            },
            'id': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                }
            },
            'is': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                }
            },
            'it': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                }
            },
            'ja': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'yyyy/mm/dd',
                    'short': 'M Y'
                }
            },
            'ka': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                }
            },
            'km': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                }
            },
            'ko': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'yyyy-mm-dd',
                    'short': 'M Y'
                }
            },
            'lo': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                }
            },
            'lt': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'yyyy-mm-dd',
                    'short': 'M Y'
                }
            },
            'lv': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd-mm-yyyy',
                    'short': 'M Y'
                }
            },
            'me': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                }
            },
            'me-me': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'me-ME'
            },
            'mk': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                }
            },
            'ml': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                }
            },
            'ms': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                }
            },
            'mt': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                }
            },
            'ne': {
                calendar: 'nepali',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                }
            },
            'nl': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd-mm-yyyy',
                    'short': 'M Y'
                }
            },
            'nl-be': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'nl-BE'
            },
            'no': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd.mm.yyyy',
                    'short': 'M Y'
                }
            },
            'pa': {
                calendar: 'nanakshahi',
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd-mm-yyyy',
                    'short': 'M Y'
                }
            },
            'pl': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'yyyy-mm-dd',
                    'short': 'M Y'
                }
            },
            'pt-br': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'pt-BR'
            },
            'rm': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                }
            },
            'ro': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd.mm.yyyy',
                    'short': 'M Y'
                }
            },
            'ru': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd.mm.yyyy',
                    'short': 'M Y'
                }
            },
            'sk': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd.mm.yyyy',
                    'short': 'M Y'
                }
            },
            'sl': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd.mm.yyyy',
                    'short': 'M Y'
                }
            },
            'sq': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd.mm.yyyy',
                    'short': 'M Y'
                }
            },
            'sr': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                }
            },
            'sr-sr': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                },
                language: 'sr-SR'
            },
            'sv': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'yyyy-mm-dd',
                    'short': 'M Y'
                }
            },
            'ta': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                }
            },
            'th': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                }
            },
            'tr': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd.mm.yyyy',
                    'short': 'M Y'
                }
            },
            'tt': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd.mm.yyyy',
                    'short': 'M Y'
                }
            },
            'uk': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                }
            },
            'ur': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                }
            },
            'vi': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd/mm/yyyy',
                    'short': 'M Y'
                }
            },
            'zh-cn': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'yyyy-mm-dd',
                    'short': 'M Y'
                },
                language: 'zh-CN'
            },
            'zh-hk': {
                formats: {
                    'long': 'd MM, Y',
                    'longNoTime': 'd MM, Y',
                    'numeric': 'dd-mm-yyyy',
                    'short': 'M Y'
                },
                language: 'zh-HK'
            },
            'zh-tw': {
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

        function getLanguageConfigObject(languageId) {
            var result = languageMap[languageId];
            if(result === undefined) {
                // Empty string covers all default languages
                result = languageMap[''];
            }

            if(result.language === undefined) {
                // Some calendars have an override language code, but default to languageId
                result.language = languageId;
            }

            if(result.calendar === undefined) {
                // For calendars that don't specify, assume they're gregorian
                result.calendar = 'gregorian';
            }

            return result;
        }

        /**
         * Return the date formatting configuration for the currently selected interface language
         */
        function currentDateFormats() {
            return getLanguageConfigObject(
                LanguageState.getSelected().id
            );
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
            conversion = getLanguageConfigObject(language);
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
