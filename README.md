# Textbox Revision Tracker

A simple jQuery plugin to track text revisions to HTML inputs or text areas.  Revisions can be saved, undone, redone, diffed and fetched.  Revision data of text, time of revision and revision number are stored.

## [Demo](http://jonmbake.github.io/textbox-revision-tracker/demo.html)

## Getting Started
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/jonmbake/jquery-textbox-revision-tracker/master/dist/textbox-revision-tracker.min.js
[max]: https://raw.github.com/jonmbake/jquery-textbox-revision-tracker/master/dist/textbox-revision-tracker.js

In your web page:

```html
<textarea id="ta"></textarea>

<script src="jquery.js"></script>
<script src="dist/textbox-revision-tracker.min.js"></script>
<!-- provide diff function if you want diff support, alternatively you supply your own diff function, which is passed as an option -->
<script src="libs/diff.js"></script>

<script>
//window.diffString provided by libs/diff.js
$('textarea#ta').revisionTracker({diffFunction: window.diffString});
</script>
```
## Initialization Options

Name         | Type        | Description
------------ | ----------- | -----------
diffFunction | Function |Takes the text of two revisions and performs a diff.  This only needs to be provided if calling the `diff` method in the API.
autoSave      | Number | If provided, will automatically create a revision after specified number seconds of paused typing

## API

To call a method on an instantiated *RevisionTracker*, use the syntax `$('textarea').('methodName', arguments...);`.

### Available Methods

Method             | Description                                                                                                    | Arguments
------------------ | ------------------------------- | ---------
revisions          | List of all revisions.  Revisions are objects with *text*, *time* and *revisionNumber* properties. | *None*
save               | Save the current text as a revsion. | *None*
getRevision        | Get a particular revision. | *RevisionNumber*
undo               | Undo last revision.         | *None*
redo               | Redo last undone revision.  | *None*
goToRevision       | Go to a particular revision. | *RevisionNumber*
getDiff            | Get a diff of two revisions. | *RevisionNumber1*, *RevisionNumber2*

## Example Usage

```html
//init
$('textarea').revisionTracker();
//type in some text
$('textarea').val('foo');
//save the text as a revision
$('textarea').revisionTracker('save');
$('textarea').revisionTracker('revisions');  //returns [{"text":"foo","time":1438307922004,"revisionNumber":1}]
$('textarea').revisionTracker('undo');
$('textarea').revisionTracker('revisions');  //returns []
$('textarea').val() //return ""
$('textarea').revisionTracker('redo');
$('textarea').val() //return "foo"
```

## Release History
0.1 - Initial Release
