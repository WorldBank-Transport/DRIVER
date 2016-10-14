(function() {
    'use strict';

    /* ngInject */
    function DateTimePicker() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/localization/datetime-picker-partial.html',
            controller: 'azDateTimePickerController',
            controllerAs: 'ctl',
            bindToController: true,
            scope: {
                datetime: '=',
                onChange: '&'
            },
        };
        return module;
    }

    /* ngInject */
    function DateTimePickerController() {
        var ctl = this;

        ctl.$onInit = initialize();

        function initialize() {
            // We don't want minutes or seconds in the default datetime
            var defaultDateTime = new Date();
            defaultDateTime.setMinutes(0);
            defaultDateTime.setSeconds(0);

            ctl.updateDate = updateDate;
            ctl.updateTime = updateTime;
            ctl.date = defaultDateTime;
            ctl.time = defaultDateTime;
            updateDateTime();
        }

        // Time updates happen via ngChange, so they are within the digest cycle.
        // Therefore we can just run updateDateTime and be done with it.
        function updateTime() {
            updateDateTime();
        }

        // Date updates happen via the onSelect event from the calendars-picker code,
        // so these are outside the Angular digest cycle and need to be wrapped in
        // a call to $apply.
        function updateDate() {
            updateDateTime();
        }

        function updateDateTime() {
            var hours = ctl.time.getHours();
            var minutes = ctl.time.getMinutes();
            var newDatetime = new Date(ctl.date);
            newDatetime.setHours(hours);
            newDatetime.setMinutes(minutes);
            ctl.datetime = newDatetime;
            ctl.onChange();
        }
    }

    angular.module('driver.localization')
        .directive('azDateTimePicker', DateTimePicker)
        .controller('azDateTimePickerController', DateTimePickerController);
})();
