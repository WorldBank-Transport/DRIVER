'use strict';

describe('schema-editor: Schema', function () {

    // load the controller's module
    beforeEach(module('schema-editor'));

    var Schema;
    var $log;

    beforeEach(inject(function (_$log_, _Schema_) {
        $log = _$log_;
        Schema = _Schema_;
    }));

    it('should ensure a new TextField serializes to jsonschema', function () {

        var textField = new Schema.TextField({
            fieldTitle: 'Primary Name'
        });

        var schema = textField.toJsonSchema();

        expect(schema.title).toEqual('Primary Name');
        expect(schema.format).toEqual('text');
        expect(schema.type).toEqual('string');
        expect(schema.options.searchable).toBe(false);
    });
});