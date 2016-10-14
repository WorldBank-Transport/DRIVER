(function() {
    'use strict';

    /* ngInject */
    /*
     Scope args:
         datetime {Date} - normal javascript datetime object
         placeholder {string} - placeholder text for the text field
         on-change {function} - function to call when datetime is changed
     */
    function DatePicker($timeout, DateLocalization) {
        var internalCalendar;
        var dateConfig;
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/localization/date-picker-partial.html',
            scope: {
                datetime: '=',
                placeholder: '@',
                onChange: '&'
            },
            link: link,
            replace: true
        };
        return module;

        function link(scope, element) {
            dateConfig = DateLocalization.currentDateFormats();
            internalCalendar = $.calendars.instance(
                dateConfig.calendar, dateConfig.language
            );
            $.calendarsPicker.setDefaults($.calendarsPicker.regionalOptions['']);
            var calendarOptions = angular.extend({
                calendar: internalCalendar,
                dateFormat: dateConfig.formats.numeric,
                showAnim: '',
                showTrigger:
                '<span class="input-group-addon picker">' +
                    '<span class="glyphicon glyphicon-calendar"></span>' +
                '</span>'
            }, $.calendarsPicker.regionalOptions[dateConfig.language]);

            $(element)
                .calendarsPicker(calendarOptions);
            // Set up the selection callback on the next digest so that we don't
            // do it on initialization.
            $timeout(function() {
                $(element).calendarsPicker(
                    'option', 'onSelect', function(dates) {
                        $timeout(function() {
                            if (dates.length > 0) {
                                updateDate(scope.datetime, dates[0]);
                                scope.onChange();
                            }
                        });
                    }
                );
            });

            scope.$watch(function() {return scope.datetime;}, function(date) {
                if (!date) {
                    return;
                }
                $(element).calendarsPicker(
                    'setDate', internalCalendar.fromJSDate(date)
                );
            });

        }

        function updateDate(date, cdate) {
            var gregCDate = DateLocalization.convertToCalendar(cdate, 'gregorian', 'en');
            var newDatetime = gregCDate._calendar.toJSDate(gregCDate);
            if (newDatetime.valueOf() !== date.valueOf()) {
                date.setTime(newDatetime.getTime());
            }
        }
    }
    angular.module('driver.localization')
        .directive('azDatePicker', DatePicker);
})();
