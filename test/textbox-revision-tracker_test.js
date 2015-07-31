(function($) {
  /*
    ======== A Handy Little QUnit Reference ========
    http://api.qunitjs.com/

    Test methods:
      module(name, {[setup][ ,teardown]})
      test(name, callback)
      expect(numberOfAssertions)
      stop(increment)
      start(decrement)
    Test assertions:
      ok(value, [message])
      equal(actual, expected, [message])
      notEqual(actual, expected, [message])
      deepEqual(actual, expected, [message])
      notDeepEqual(actual, expected, [message])
      strictEqual(actual, expected, [message])
      notStrictEqual(actual, expected, [message])
      throws(block, [expected], [message])
  */

  module('jQuery#textbox_revision_tracker', {
    // This will run before each test in this module.
    setup: function() {
      this.$elem = $('#qunit-fixture');
      this.rt = this.$elem.revisionTracker({diffFunction: window.diffString});
    },
    saveAFewRevs: function () {
      this.$elem.val('foo');
      this.$elem.revisionTracker('save');
      this.$elem.val('foo bar');
      this.$elem.revisionTracker('save');
    }
  });

  test('can save revisions', function() {
    expect(1);
    this.saveAFewRevs();
    equal(this.$elem.revisionTracker('revisions').length, 2, 'There is one revision added');
  });

  test('should not save revison if text has not changed', function() {
    expect(1);
    this.$elem.val('foo');
    this.$elem.revisionTracker('save');
    this.$elem.revisionTracker('save');
    equal(this.$elem.revisionTracker('revisions').length, 1);
  });

  test('can get a revision', function() {
    expect(1);
    this.saveAFewRevs();
    equal(this.$elem.revisionTracker('getRevision', 1).text, 'foo');
  });

  test('can got to a revision', function() {
    expect(1);
    this.saveAFewRevs();
    this.$elem.revisionTracker('goToRevision', 1);
    equal(this.$elem.val(), 'foo');
  });

  test('can undo revisions', function() {
    expect(1);
    this.saveAFewRevs();
    this.$elem.revisionTracker('undo');
    equal(this.$elem.val(), 'foo', 'The revision has been undone');
  });

  test('can redo revisions', function() {
    expect(1);
    this.saveAFewRevs();
    this.$elem.revisionTracker('undo');
    this.$elem.revisionTracker('redo');
    equal(this.$elem.val(), 'foo bar', 'The revison has been redone');
  });

  test('can diff revisions', function() {
    this.saveAFewRevs();
    equal(this.$elem.revisionTracker('getDiff', 1, 2), ' foo <span class="diff-ins">bar\n</span>');
  });
}(jQuery));
