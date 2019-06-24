# Translating DRIVER
## Introduction
DRIVER supports translation to other languages. However, the various pieces of the DRIVER system are translated in different ways. This document describes how each part of DRIVER allows translation, and how to add new translations to DRIVER.

This document can be used by anyone, but in some cases, you will probably need to work with a software developer or system administrator to install your translations into the DRIVER system.

## Translation systems
DRIVER has four different translation systems, which affect different parts of the application:

1. Web interface translation
2. Schema translations
3. Calendar translations
4. Android app translations

## Web interface translations
The web interface translations determine most of the text that is visible when accessing DRIVER using a web browser. The two exceptions are:

1. Text from the DRIVER schema
    * Note that this includes filter controls, which are generated from the schema.
2. The calendar filter

In other words, text that is in the web interface, but that is _not_ part of the DRIVER data schema or the calendar filter, is translated using the web interface translation system.

To add languages to the web interface, first make a copy of `web/app/i18n/exclaim.json`, and name the copy with the [2-letter _language code_](https://www.loc.gov/standards/iso639-2/php/code_list.php) (not country code) for the language you want to add. For example, if you wanted to translate DRIVER into Russian, the file would be `web/app/i18n/ru.json`. If one of the existing DRIVER languages is easier for you to translate, feel free to copy that file instead of `exclaim.json`, but the instructions below will be slightly different.

Next, open the new file with a plain text editor (such as Notepad on Windows or Text Editor on Mac), or copy and paste it into an online editing tool such as [jsoneditoronline.org](http://jsoneditoronline.org/). Each translation string will be in English inside double quotes (`"`) and prefixed by an exclamation point (`!`). You should _replace_ the whole string inside the double quotes with the language you are translating to. You should _not_ alter the strings in all capital letters.

For example, if you were translating to Russian, the line:
```
"DAY": "!Day",
```
would become
```
"DAY": "День",
```

In order to for the new translations to appear in your copy of DRIVER, we suggest that you [make a pull request](https://github.com/WorldBank-Transport/DRIVER/pulls) with your changes. You may need to get a developer or system administrator to help you do this.

Once your language is available in DRIVER, you will need to update your copy of DRIVER to use the new version and enable your language. Please see [System Administration](system-administration.md) for how to do this. In particular, you will need to update list of languages for your DRIVER instance using the [Configuration Wizard](system-administration.md#configuration-wizard).
## Schema translations
The schema translation determines the language that will be used for data entry forms and editing forms, and for filter controls. Currently, the schema cannot be translated by switching the web interface language. Instead, you should pick a single language for the schema that will be usable by a majority of your users. If your instance of DRIVER has a schema in English, simply use the schema editor to translate all fields into your language.

If you need to store data in multiple languages, we suggest that you do this by including all languages in the the field names. For example, if you want to have a field called "Vehicles" in both English and Russian, you should create one field called "Vehicles / Машины". In this case, users should enter data in both languages if possible.
## Calendar translations
The calendar filter in DRIVER already supports more languages than the rest of the application. For a list of supported languages, please see: http://keith-wood.name/calendars.html . 

If you need a language that is not already available in the calendar, you will need to download the [calendars](https://github.com/azavea/calendars/) module source code. Once you have downloaded it, make a copy of `jquery.calendars-en-GB.js` (or one of the other files with a similar name that is in a language that is easier to translate) and change the language code in the name to the language code matching your language (see the first section). Then, translate all the strings in the file into your language. 

Once you have made your translations, you will need to make a [pull request](https://github.com/azavea/calendars/pulls) to add your new language to the calendars source code. You may need to get a developer or system administrator to help you do this.

Once your language is available in DRIVER, you will need to update your copy of DRIVER to use the new version and enable your language. Please see [System Administration](system-administration.md) for how to do this.
## Android app translations
The Android app is translated using Android's built-in translation functionality. In order to translate it to a new language, you will need to use [Android Studio](https://developer.android.com/studio/) in order to add the translations. You will likely need to work with a developer who has experience developing Android applications in order to do this.

Once you have installed Android studio (see the link above), you can download the [DRIVER Android app source code](https://github.com/WorldBank-Transport/DRIVER-Android). Then, open the source code using Android Studio and use the [translations editor](https://developer.android.com/studio/write/translations-editor) to add your language. Once you are finished, you can build a new version of the Android application and deploy it. Please see the [README](https://github.com/WorldBank-Transport/DRIVER-Android/blob/develop/README.md) for the Android application for instructions on how to do this.
