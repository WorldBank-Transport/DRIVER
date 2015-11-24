(function () {
    'use strict';

    /* ngInject */
    function SavedFiltersModalController($modalInstance, $rootScope,
                                         FilterState, Notifications, SavedFilters) {
        var ctl = this;
        ctl.label = '';
        ctl.save = save;
        ctl.closeModal = closeModal;

        return ctl;

        // Saves the current filter
        function save() {
            if (!ctl.label) {
                return;
            }

            var filters = _.cloneDeep(FilterState.filters);
            // Don't include the date range on the saved filter. Doing so would
            // lock the start/end time of the filter, whereas users would most likely
            // want to see filters applied to their current date range.
            if (filters.hasOwnProperty('__dateRange')) {
                delete filters.__dateRange;
            }

            /* jshint camelcase: false */
            var dataToSave = {
                label: ctl.label,
                filter_json: filters
            };
            /* jshint camelcase: true */

            SavedFilters.create(dataToSave, function () {
                ctl.label = '';
                $rootScope.$broadcast('driver.state.savedfilter:refresh');
            }, function (error) {
                showErrorNotification(['<p>Error saving filter</p><p>',
                   error.status,
                   ': ',
                   error.statusText,
                   '</p>'
                ].join(''));
            });
        }

        // Closes the modal
        // Note: linter complains if this function is named 'close' for some reason
        function closeModal() {
            $modalInstance.close();
        }

        // Helper to display errors when form fails to save
        function showErrorNotification(message) {
            Notifications.show({
                displayClass: 'alert-danger',
                header: 'Filter Not Saved',
                html: message
            });
        }
    }

    angular.module('driver.savedFilters')
    .controller('SavedFiltersModalController', SavedFiltersModalController);

})();
