
## URL Hierarchy

/recordtype/?offset=1               // get first page of recordtypes
/recordtype/?limit=all              // list all available recordtypes
/recordtype/add                     // Add new record type
/recordtype/:uuid                   // list related content for recordtype
/recordtype/:uuid/schema/add        // Add new related content type to recordtype
/recordtype/:uuid/schema/:schema    // List fields on given schema with edit/delete controls

/boundary                           // List available boundaries
/boundary/upload                    // Upload new boundary
