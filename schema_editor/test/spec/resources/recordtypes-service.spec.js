'use strict';

describe('ase.resources: RecordTypes', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.resources'));

    var $httpBackend;
    var RecordTypes;
    var ResourcesMock;

    beforeEach(inject(function (_$httpBackend_, _RecordTypes_, _ResourcesMock_) {
        $httpBackend = _$httpBackend_;
        RecordTypes = _RecordTypes_;
        ResourcesMock = _ResourcesMock_;
    }));

    it('should extract record types from paginated response', function () {
        var requestUrl = /\/api\/recordtypes/;
        $httpBackend.whenGET(requestUrl).respond(ResourcesMock.RecordTypeResponse);
        RecordTypes.query({ active: 'True' }).$promise.then(function (data) {
            expect(data.length).toBe(2);

            var accidents = data[0];
            expect(accidents.label).toBe('Accident');
            /* jshint camelcase: false */
            expect(accidents.plural_label).toBe('Accidents');
            /* jshint camelcase: true */
            expect(accidents.description).toBe('An accident.');
            expect(accidents.active).toBe(true);

            var birds = data[1];
            expect(birds.label).toBe('Bird Sighting');
            /* jshint camelcase: false */
            expect(birds.plural_label).toBe('Bird Sightings');
            /* jshint camelcase: true */
            expect(birds.description).toBe('Birds and their environments.');
            expect(birds.active).toBe(true);
        });
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
