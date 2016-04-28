'use strict';

describe('driver.state: InitialState', function () {

    beforeEach(module('driver.state'));
    beforeEach(module('pascalprecht.translate'));

    var $timeout;
    var InitialState;

    beforeEach(inject(function (_$timeout_, _InitialState_) {
        $timeout = _$timeout_;
        InitialState = _InitialState_;
    }));

    it('should wait to resolve `ready` promises', function () {
        var testVar1 = false;
        InitialState.ready().then(function() {
            testVar1 = true;
        });

        expect(testVar1).toEqual(false);

        var testVar2 = false;
        InitialState.ready().then(function() {
            testVar2 = true;
        });

        InitialState.setRecordTypeInitialized();
        expect(testVar1).toEqual(false);
        expect(testVar2).toEqual(false);


        var testVar3 = false;
        InitialState.ready().then(function() {
            testVar3 = true;
        });

        InitialState.setBoundaryInitialized();
        expect(testVar1).toEqual(false);
        expect(testVar2).toEqual(false);
        expect(testVar3).toEqual(false);

        InitialState.setGeographyInitialized();
        InitialState.setLanguageInitialized();

        $timeout(function() {
            expect(testVar1).toEqual(true);
            expect(testVar2).toEqual(true);
            expect(testVar3).toEqual(true);
        }, 0);
        $timeout.flush();
    });

});
