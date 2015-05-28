'use strict';

describe('ase.schemas:Schemas', function () {

    beforeEach(module('ase.schemas'));

    var Schemas;
    var schemaEnv = jjv();
    schemaEnv.addSchema('v4', jsonSchemaV4());

    // Initialize the controller and a mock scope
    beforeEach(inject(function (_Schemas_) {
        Schemas = _Schemas_;
    }));

    it('should ensure JsonObject is a valid jsonschema v4', function () {
        var obj = Schemas.JsonObject();
        expect(schemaEnv.validate('v4', obj)).toBe(null);
    });

    it('should add the $schema declaration to schemas', function () {
        var obj = Schemas.JsonObject();
        obj = Schemas.addVersion4Declaration(obj);
        expect(schemaEnv.validate('v4', obj)).toBe(null);
    });

    it('should serialize schema form outputs to data form schema snippets', function () {
        var schemaFormData = [{
            fieldType: 'text',
            isRequired: false,
            fieldTitle: 'Text'
        }];
        var dataFormSchemaDef = Schemas.definitionFromSchemaFormData(schemaFormData);
        expect(dataFormSchemaDef).toEqual(jasmine.objectContaining({
            required: jasmine.anything(),
            properties: jasmine.anything(),
            type: 'object'
        }));
    });

    it('should include an enum key in selectlist fields', function () {
        var schemaFormData = [{
            fieldType: 'selectlist',
            isRequired: false,
            fieldTitle: 'Text',
            fieldOptions: ['opt1', 'opt2', 'opt3']
        }];
        var dataFormSchemaDef = Schemas.definitionFromSchemaFormData(schemaFormData);
        expect(dataFormSchemaDef.properties.Text['enum']).toEqual(schemaFormData[0].fieldOptions);
    });

    it('should include a media key in image fields', function () {
        var schemaFormData = [{
            fieldType: 'image',
            isRequired: false,
            fieldTitle: 'Photo'
        }];
        var dataFormSchemaDef = Schemas.definitionFromSchemaFormData(schemaFormData);
        expect(dataFormSchemaDef.properties.Photo.media).toEqual(jasmine.anything());
    });

    it('should set the "required" key when fields have isRequired: true', function () {
        var schemaFormData = [{
            fieldType: 'selectlist',
            isRequired: false,
            fieldTitle: 'Text',
            fieldOptions: ['opt1', 'opt2', 'opt3']
        },{
            fieldType: 'image',
            isRequired: true,
            fieldTitle: 'Photo'
        }];
        var dataFormSchemaDef = Schemas.definitionFromSchemaFormData(schemaFormData);
        expect(dataFormSchemaDef.required.length).toEqual(1);
        expect(dataFormSchemaDef.required[0]).toEqual('Photo');
    });
});
