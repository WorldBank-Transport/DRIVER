'use strict';

describe('ase.views.recordtype: RTAdd', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.templates'));
    beforeEach(module('ase.views.recordtype'));

    var $compile;
    var $httpBackend;
    var $rootScope;
    var RecordTypes;
    var ResourcesMock;

    beforeEach(inject(function (_$compile_, _$httpBackend_, _$rootScope_,
                                _RecordTypes_, _ResourcesMock_) {
        $compile = _$compile_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        RecordTypes = _RecordTypes_;
        ResourcesMock = _ResourcesMock_;
    }));

    it('should allow adding new record type', function () {
        var scope = $rootScope.$new();
        var element = $compile('<ase-rt-add></ase-rt-add>')(scope);
        $rootScope.$apply();
        spyOn(scope.rt, 'submitForm');

        // Check for existence of 'Save' and 'Cancel' buttons
        expect(element.find('button').length).toEqual(2);
        var saveButton = element.find('button:submit');

        // Helper for testing whether or not the save button is disabled
        var checkSaveButtonDisabled = function(disabled) {
            expect(saveButton.prop('disabled')).toBe(disabled);
        };

        // Save button should be disabled until all the required fields are entered
        checkSaveButtonDisabled(true);
        element.find('#single-title').val('Incident').change();
        checkSaveButtonDisabled(true);
        element.find('#plural-title').val('Incidents').change();
        checkSaveButtonDisabled(true);
        element.find('#description').val('An incident').change();
        checkSaveButtonDisabled(false);

        // All required fields are entered, press Save and verify it's submitted
        saveButton.click();
        expect(scope.rt.submitForm).toHaveBeenCalled();
    });
});
