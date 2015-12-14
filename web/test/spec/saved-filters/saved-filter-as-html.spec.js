'use strict';

describe('driver.savedFilters: SavedFiltersAsHTML', function () {

    var $filter;

    beforeEach(function () {
        module('driver.savedFilters');

        inject(function (_$filter_) {
            $filter = _$filter_;
        });
    });

    it('should render single containment', function () {
        var testObj = {
            'Accident Details#Severity': {
                'contains': [
                    'Injury'
                ],
                '_rule_type': 'containment'
            }
        };
        var expected = '<b>Severity</b>: Injury<span class="divider">|</span>';
        expect($filter('savedFilterAsHTML')(testObj)).toBe(expected);
    });

    it('should render multiple containment', function () {
        var testObj = {
            'Accident Details#Severity': {
                'contains': [
                    'Injury',
                    'Fatality'
                ],
                '_rule_type': 'containment_multiple'
            }
        };
        var expected = '<b>Severity</b>: Injury, Fatality<span class="divider">|</span>';
        expect($filter('savedFilterAsHTML')(testObj)).toBe(expected);
    });

    it('should render min range', function () {
        var testObj = {
            'Accident Details#Num driver casualties': {
                '_rule_type': 'intrange',
                'min': 2
            }
        };
        var expected = '<b>Num driver casualties</b>: &gt; 2<span class="divider">|</span>';
        expect($filter('savedFilterAsHTML')(testObj)).toBe(expected);
    });

    it('should render max range', function () {
        var testObj = {
            'Accident Details#Num driver casualties': {
                '_rule_type': 'intrange',
                'max': 2
            }
        };
        var expected = '<b>Num driver casualties</b>: &lt; 2<span class="divider">|</span>';
        expect($filter('savedFilterAsHTML')(testObj)).toBe(expected);
    });

    it('should render min and max range', function () {
        var testObj = {
            'Accident Details#Num driver casualties': {
                '_rule_type': 'intrange',
                'min': 1,
                'max': 2
            }
        };
        var expected = '<b>Num driver casualties</b>: 1-2<span class="divider">|</span>';
        expect($filter('savedFilterAsHTML')(testObj)).toBe(expected);
    });

    it('should not render empty min and max', function () {
        var testObj = {
            'Accident Details#Num driver casualties': {
                '_rule_type': 'intrange',
                'min': null,
                'max': null
            }
        };
        var expected = '';
        expect($filter('savedFilterAsHTML')(testObj)).toBe(expected);
    });

    it('should render a complex set of filters', function () {
        var testObj = {
            'Accident Details#Main cause': {
                'contains': [
                    'Vehicle defect'
                ],
                '_rule_type': 'containment'
            },
            'Accident Details#Weather': {
                'contains': [
                    'Wind'
                ],
                '_rule_type': 'containment'
            },
            'Accident Details#Num driver casualties': {
                'max': 4,
                '_rule_type': 'intrange',
                'min': 1
            },
            'Accident Details#Severity': {
                'contains': [
                    'Injury'
                ],
                '_rule_type': 'containment'
            },
            'Accident Details#Collision type': {
                'contains': [
                    'Right angle'
                ],
                '_rule_type': 'containment'
            }
        };
        var expected = '<b>Main cause</b>: Vehicle defect<span class="divider">|</span>' +
                '<b>Weather</b>: Wind<span class="divider">|</span>' +
                '<b>Num driver casualties</b>: 1-4<span class="divider">|</span>' +
                '<b>Severity</b>: Injury<span class="divider">|</span>' +
                '<b>Collision type</b>: Right angle<span class="divider">|</span>';
        expect($filter('savedFilterAsHTML')(testObj)).toBe(expected);
    });

});
