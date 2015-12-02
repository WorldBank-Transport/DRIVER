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
        var expected = ' <u>Severity</u>: Injury';
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
        var expected = ' <u>Severity</u>: Injury, Fatality';
        expect($filter('savedFilterAsHTML')(testObj)).toBe(expected);
    });

    it('should render min range', function () {
        var testObj = {
            'Accident Details#Num driver casualties': {
                '_rule_type': 'intrange',
                'min': 2
            }
        };
        var expected = ' <u>Num driver casualties</u>: &gt; 2';
        expect($filter('savedFilterAsHTML')(testObj)).toBe(expected);
    });

    it('should render max range', function () {
        var testObj = {
            'Accident Details#Num driver casualties': {
                '_rule_type': 'intrange',
                'max': 2
            }
        };
        var expected = ' <u>Num driver casualties</u>: &lt; 2';
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
        var expected = ' <u>Num driver casualties</u>: 1-2';
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
        var expected = ' <u>Main cause</u>: Vehicle defect <u>Weather</u>: Wind ' +
                '<u>Num driver casualties</u>: 1-4 <u>Severity</u>: Injury ' +
                '<u>Collision type</u>: Right angle';
        expect($filter('savedFilterAsHTML')(testObj)).toBe(expected);
    });

});
