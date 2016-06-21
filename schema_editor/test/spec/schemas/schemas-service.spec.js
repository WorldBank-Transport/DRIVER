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
            properties: jasmine.anything(),
            type: 'object'
        }));
    });

    it('should serialize a textOptions key in text fields', function () {
        var schemaFormData = [{
            fieldType: 'text',
            isRequired: false,
            fieldTitle: 'Text',
            textOptions: 'datetime'
        }];
        var dataFormSchemaDef = Schemas.definitionFromSchemaFormData(schemaFormData);
        expect(dataFormSchemaDef.properties.Text.format).toEqual(schemaFormData[0].textOptions);
    });

    it('should serialize an isSearchable key', function () {
        var schemaFormData = [{
            fieldType: 'text',
            isRequired: false,
            isSearchable: true,
            fieldTitle: 'Text',
            textOptions: 'datetime'
        }];
        var dataFormSchemaDef = Schemas.definitionFromSchemaFormData(schemaFormData);
        expect(dataFormSchemaDef.properties.Text.isSearchable)
            .toEqual(schemaFormData[0].isSearchable);
    });

    it('should serialize an enum key in selectlist fields', function () {
        var schemaFormData = [{
            fieldType: 'selectlist',
            isRequired: false,
            fieldTitle: 'Text',
            fieldOptions: ['opt1', 'opt2', 'opt3']
        }];
        var dataFormSchemaDef = Schemas.definitionFromSchemaFormData(schemaFormData);
        expect(dataFormSchemaDef.properties.Text['enum']).toEqual(schemaFormData[0].fieldOptions);
    });

    it('should serialize a displayType key in selectlist fields', function () {
        var schemaFormData = [{
            fieldType: 'selectlist',
            displayType: 'select',
            isRequired: false,
            fieldTitle: 'Text',
            fieldOptions: ['opt1', 'opt2', 'opt3']
        }];
        var dataFormSchemaDef = Schemas.definitionFromSchemaFormData(schemaFormData);
        expect(dataFormSchemaDef.properties.Text.displayType).toEqual(schemaFormData[0].displayType);
    });

    it('should serialize a media key in image fields', function () {
        var schemaFormData = [{
            fieldType: 'image',
            isRequired: false,
            fieldTitle: 'Photo'
        }];
        var dataFormSchemaDef = Schemas.definitionFromSchemaFormData(schemaFormData);
        expect(dataFormSchemaDef.properties.Photo.media).toBeDefined();
    });

    it('should properly serialize watch and enumSource keys into reference fields', function () {
        var schemaFormData = [{
            fieldType: 'reference',
            isRequired: false,
            fieldTitle: 'Reference',
            referenceTarget: 'OtherType'
        }];
        // Stub out only the keys that we need on the existing schema
        var stubSchema = {
            definitions: {
                OtherType: {
                    properties: {
                        property1: {},
                        property2: {},
                        property3: {}
                    }
                }
            }
        };
        var dataFormSchemaDef = Schemas.definitionFromSchemaFormData(schemaFormData,
            stubSchema,
            'NotOtherType');
        expect(dataFormSchemaDef.properties.Reference.watch).toBeDefined();
        expect(dataFormSchemaDef.properties.Reference.enumSource).toBeDefined();
        expect(dataFormSchemaDef.properties.Reference.enumSource).toEqual([{
            source: 'target',
            title: '{{item.property1}} {{item.property2}} {{item.property3}}',
            value: '{{item._localId}}'
        }]);
    });

    it('should add to the "required" key when fields have isRequired: true', function () {
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
        expect(dataFormSchemaDef.required.length).toEqual(2); // Everything has required: ['_localId']
        expect(dataFormSchemaDef.required).toContain('Photo');
    });

    it('should create a required "_localId" field on all definitions', function () {
        var schemaFormData = [{
            fieldType: 'selectlist',
            isRequired: false,
            fieldTitle: 'Text',
            fieldOptions: ['opt1', 'opt2', 'opt3']
        },{
            fieldType: 'image',
            isRequired: false,
            fieldTitle: 'Photo'
        }];
        var dataFormSchemaDef = Schemas.definitionFromSchemaFormData(schemaFormData);
        expect(dataFormSchemaDef.required).toBeDefined();
        expect(dataFormSchemaDef.required.length).toBe(1);
        expect(dataFormSchemaDef.required).toContain('_localId');
    });

    it('should calculate and set propertyOrder based on the ordering of fields', function () {
        var schemaFormData = [];
        for (var i in [0,1,2,3,4]) {
            schemaFormData.push({
                fieldType: 'text',
                fieldTitle: 'Title' + i,
                indexShouldBe: i
            });
        }
        var dataFormSchemaDef = Schemas.definitionFromSchemaFormData(schemaFormData);
        for (var j in [0,1,2,3,4]) {
            var field = dataFormSchemaDef.properties['Title' + j];
            expect(field.propertyOrder.toString()).toEqual(j);
        }
    });

    it('should validate that no two Schema Entry Form fields have the same title', function () {
        var schemaFormData = [{
            fieldType: 'selectlist',
            isRequired: false,
            fieldTitle: 'Same1',
            fieldOptions: ['opt1', 'opt2', 'opt3']
        },{
            fieldType: 'image',
            isRequired: true,
            fieldTitle: 'Same2'
        },{
            fieldType: 'text',
            isRequired: false,
            fieldTitle: 'Same1'
        },{
            fieldType: 'text',
            isRequired: false,
            fieldTitle: 'Diff'
        },{
            fieldType: 'text',
            isRequired: false,
            fieldTitle: 'Same2'
        }];
        var errors = Schemas.validateSchemaFormData(schemaFormData);
        expect(errors.length).toEqual(2);
        expect(errors).toEqual(jasmine.arrayContaining([{
            message: jasmine.stringMatching('Same1')
        }]));
        expect(errors).toEqual(jasmine.arrayContaining([{
            message: jasmine.stringMatching('Same2')
        }]));
        expect(errors).not.toEqual(jasmine.arrayContaining([{
            message: jasmine.stringMatching('Diff')
        }]));
    });

    // NOTE: This test must be updated when new field types are added.
    it('should preserve all information when serializing and deserializing schemas', function () {
        // In practice this means that the serialize and deserialize methods are inverses
        var stubSchema = {
            definitions: {
                OtherType: {
                    properties: {
                        property1: {},
                        property2: {},
                        property3: {}
                    }
                }
            }
        };
        // The forward and backward functions have different signatures, so we need to "curry"
        // the forward function so we can pass the results back and forth directly.
        var f = function(formData) {
            return Schemas.definitionFromSchemaFormData(formData, stubSchema, 'NotOtherType');
        };
        var b = Schemas.schemaFormDataFromDefinition;

        var schemaFormData = [{
            fieldType: 'selectlist',
            isSearchable: false,
            displayType: 'checkbox',
            isRequired: false,
            fieldTitle: 'Select',
            fieldOptions: ['opt1', 'opt2'],
            propertyOrder: 0 // The serializer uses the ordering of the incoming form data to
                             // determine and set the propertyOrder value, since this is how
                             // JSON-Editor expresses the value. Therefore this value must match
                             // the ordering of the array in order to ensure that the output
                             // matches the input, otherwise the serializer will assume that the
                             // ordering has changed and update the propertyOrder field, causing
                             // the test to fail.
        },{
            fieldType: 'number',
            isSearchable: true,
            isRequired: false,
            fieldTitle: 'Number Field',
            minimum: undefined,
            maximum: undefined,
            propertyOrder: 1
        },{
            fieldType: 'image',
            isSearchable: false,
            isRequired: true,
            fieldTitle: 'Image',
            propertyOrder: 2
        },{
            fieldType: 'text',
            isSearchable: false,
            isRequired: false,
            fieldTitle: 'Text',
            textOptions: 'datetime',
            propertyOrder: 3
        },{
            fieldType: 'reference',
            isRequired: false,
            isSearchable: false,
            fieldTitle: 'Local reference',
            referenceTarget: 'OtherType',
            propertyOrder: 4
        }];

        // Transform back and forth a few times
        var output = b(f(b(f(b(f(b(f(b(f(b(f(schemaFormData))))))))))));
        expect(output).toEqual(schemaFormData);

        // Ensure all field types are represented in this test
        var formDataFields = _.map(schemaFormData, 'fieldType').sort();
        var schemaFields = _.keys(Schemas.FieldTypes).sort();
        expect(formDataFields).toEqual(jasmine.objectContaining(schemaFields));
    });

    it('should sort by propertyOrder when deserializing schemas', function () {
        var definition = {
            properties: {
                appearsSecond: {
                    fieldType: 'text',
                    propertyOrder: 1
                },
                appearsThird: {
                    fieldType: 'text',
                    propertyOrder: 2
                },
                appearsFirst: {
                    fieldType: 'text',
                    propertyOrder: 0
                }
            }
        };

        var formData = Schemas.schemaFormDataFromDefinition(definition);
        for (var i = 1; i < formData.length; i++) {
            expect(formData[i].propertyOrder).toBeGreaterThan(formData[i-1].propertyOrder);
        }
    });

});
