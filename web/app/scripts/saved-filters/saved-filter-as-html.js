(function () {
    'use strict';

    // Angular filter for  transforming a saved filter object to an HTML representation.
    // Note: if a new filter rule type is implemented, a new case must be added here for display.
    function SavedFilterAsHTML() {
        // Helper for determining if a value is a number
        function isNumeric(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        }

        return function(filterObj) {
            var html = '';

            _.forOwn(filterObj, function(val, key) {
                // All label keys start with the name of the related object plus a hash.
                // We only want to display what's after that as the label.
                var label = ' <u>' + key.split('#')[1] + '</u>: ';

                /* jshint camelcase: false */
                switch(val._rule_type) {
                    case 'containment_multiple':
                    case 'containment':
                        html += label + val.contains.join(', ');
                        break;

                    case 'intrange':
                        if (!isNumeric(val.min) && !isNumeric(val.max)) {
                            // No min or max are specified, don't display
                        } else {
                            html += label;

                            if (isNumeric(val.min) && isNumeric(val.max)) {
                                // Both min and max
                                html += val.min + '-' + val.max;
                            } else if (isNumeric(val.min)) {
                                // Only min
                                html += '&gt; ' + val.min;
                            } else {
                                // Only max
                                html += '&lt; ' + val.max;
                            }
                        }

                        break;

                    default:
                        html += 'Unknown rule type: ' + val._rule_type;
                        break;
                }
                /* jshint camelcase: true */
            });

            return html;
        };
    }

    angular.module('driver.savedFilters')
    .filter('savedFilterAsHTML', SavedFilterAsHTML);

})();
