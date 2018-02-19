# Best Practices for DRIVER Data

## Overview
This document provides an overview of DRIVER's data model, as well as best practices for designing DRIVER schemas and managing changes to data stored in a DRIVER system. This document assumes some familiarity with the DRIVER administrative interface. Instructions on how to use this interface can be found in the DRIVER user manual.

## Data model
DRIVER uses a flexible data model. This means that new fields can be added to a DRIVER system using DRIVER's administrative interface, without making changes to database tables. This flexibility allows DRIVER to be easily adapted for use by agencies with different data requirements.

When designing a DRIVER schema, you always start by defining a **Record Type**. Each Record Type, in turn, contains associated **Related Content**.

### Record Type
A Record Type is used to represent a certain type of data that DRIVER will be used to track. Most DRIVER configurations will have a Record Type representing vehicle crashes, which may be called "Crashes", "Incidents", "Accidents", or similar. All records stored in DRIVER represent occurrences of a Record Type and automatically contain information about the occurrence's location, date/time, and address.

**Best practice: Use Record Types for things that happen.**
Record Types are designed to store data about things that happen in a particular location, such as crashes. They're not designed for storing information about things like vehicles, people, buildings, or roads. You can use Related Content to associate this information with a Record Type (see below).

Note that a DRIVER system can store and track multiple different Record Types. For example, the Interventions feature, which helps track changes made to the road network in an effort to reduce the number of crashes, uses a second Record Type to track these interventions.

**Best practice: keep Record Types general.**
This is because DRIVER can only calculate statistics and perform searches of one type of Record Type at a time. For example, it would not be very useful to create multiple Record Types representing crashes of different severity levels, because it would prevent DRIVER from calculating statistics involving total crash numbers. Instead, you should create a single Record Type for crashes, and then add a field to represent the severity. DRIVER will then allow you to filter records based on that field.

### Related Content
Related Content is used to organize data that is associated with occurrences of a Record Type. Every Record Type is created with a related "Details" content by default. This Details content can be used to store general information about each record, such as road condition, road type, cause of the crash, severity level, and so on. You can use the DRIVER administrative interface to add Related Content and make changes to the information stored in each type of Related Content.

**Best practice: Use Related Content to store data about vehicles and people.**
This is because all data associated with a particular record must be related to that record. Therefore, if you want to track the vehicles involved in a crash, or information about the drivers and passengers, these should be added as Related Content. You can have as many types of related content attached to a Record Type as you want, and you can attach multiple instances of related content to each record. For example, a crash between two vehicles might have two entries in its "Vehicles" related content, and two (or more, if there were passengers or bystanders involved) entries in its "People" related content. There are other ways to set up the data schema, but having related content for "People" and "Vehicles" is common.

## Managing Changes
DRIVER's administrative interface allows making changes to the data stored in Related Content. This can be done without making changes to the underlying database, making it accessible even to users who are not familiar with database administration. As data requirements change, the fields stored by DRIVER can be updated. However, there are some guidelines that should be followed in order to make sure that changes don't impact the availability of data.

**Best practice: Prefer adding fields rather than modifying or deleting them.**
This is because DRIVER's search functionality is based off of the _current_ set of fields; deleting or modifying fields may cause confusing or incorrect results. To see why, let's imagine that you have a select list field called "Severity" on your Record's "Details" related content, which has the following possible values:
- Fatal
- Injury
- Property

Now, let's imagine that you want to start tracking whether injuries were severe enough to require hospitalization. One option would be to change the "Severity field" to look like this:
- Fatal
- Hospitalized
- Light injury
- Property

However, this would make it difficult to search for older records that use the previous three-choice "Severity" field. Because the search options would be "Hospitalized" or "Light injury", you would no longer be able to filter for records whose "Severity" field is just "Injury".

 A better approach in this situation would be to add a new field. It could be called "Hospitalization required" and the values would be:
 - Yes
 - No

 The older records would not have this field, so you wouldn't be able to filter for them using "Hospitalization required", but they would still be available by filtering for records with "Injury" in their "Severity".

 If you _do_ need to delete or modify a field, make sure that you have other ways to filter older records without that change before doing so.

 **Note:** The data of individual records is never deleted by DRIVER when you make changes to fields on Related Content. However, records may become functionally useless or invisible if their fields don't match the current set of fields, so it is best to stick to adding new fields whenever possible.
