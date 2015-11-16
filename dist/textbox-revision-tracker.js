/*! Textbox Revision Tracker - v0.1.0 - 2015-11-15
* https://github.com/jonmbake/textbox-revision-tracker
* Copyright (c) 2015 Jon Bake; Licensed MIT */
(function($) {
  /**
   * Revision Tracker Base Class.
   * @constructor
   * @param {[type]} $el     jqeury element to attach revision tracker to
   * @param {[type]} options options -
   * Valid Options are:
   *   autoSave (integer) - will automatically create a revision after X seconds of paused typing
   *   diffFunction (function) - function to call when  performing a diff through the API
   */
  var RevisionTracker = function ($el, options) {
    options = options || {};

    this.$el = $el;
    this.revisions = [];
    this.undoneRevisions = [];

    this.diffFunction = options.diffFunction;
    if (options.autoSave) {
      var lastChange, saveAfter = parseInt(options.autoSave, 10);
      $el.on('change', function () {
        var now = Date.now();
        this.saveRevision((now - lastChange)/1000 > saveAfter);
        lastChange = now;
      }.bind(this));
    }
  };
  $.extend(RevisionTracker.prototype, {
    /**
     * Saves a revision if predicate passes truth test.
     *
     * @param  {Boolean} predicate - only save if predicate evaluates to true (or is undefined)
     * @return {Object} Revison with property of text and time
     */
    saveRevision: function (predicate) {
      if (predicate === void 0 || predicate === true) {
        this.revisions.push({text: this.$el.val(), time: Date.now()});
      }
    },
    /**
     * Get last revision made.
     * @return {Object} Revison with property of text and time
     */
    lastRevision: function () {
      return this.revisions[this.revisions.length - 1];
    },
    /**
     * Pop a revision from revisions to undone revisions (or vice versa if reverse is true).
     *
     * @param  {boolean} reverse if true pop from undone revisions to revisions
     * @param  {number} popTo   pop to a specific revisions
     * @return {Object} poped revison
     */
    popRevision: function (reverse, popTo) {
      var popped,
        fromArray = reverse ? this.undoneRevisions : this.revisions;
      if (fromArray.length === 0) {
        return;
      }
      if (popTo) {
        popped = fromArray.splice(popTo)[0];
      } else {
        popped = fromArray.pop();
      }
      (reverse ? this.revisions : this.undoneRevisions).push(popped);
      if (this.revisions.length > 0) {
        this.$el.val(this.lastRevision().text);
      } else {
        this.$el.val('');
      }
      return popped;
    },
    /**
     * Get a particular revision.
     *
     * @param  {number} revisionNumber number of revision to get
     * @return {Object} Revison with property of text and time
     */
    getRevision: function (revisionNumber) {
      return this.revisions[parseInt(revisionNumber, 10) - 1];
    },
    /**
     * Go to a revision number.
     *
     * @param  {number} revisionNumber revision number to make active
     * @return {Object} newly active revision
     */
    goToRevision: function (revisionNumber) {
      revisionNumber = parseInt(revisionNumber, 10);
      if (revisionNumber < 0 || revisionNumber > this.revisions.length) {
        throw new Error('Attempting to go to an invalid revision number');
      }
      return this.popRevision(false, revisionNumber);
    },
    /**
     * Undo the last revision.
     *
     * @return {object} undone revision
     */
    undo: function () {
      return this.popRevision();
    },
    /**
     * Redo a revision.
     *
     * @return {object} revision that was re-applied
     */
    redo: function () {
      return this.popRevision(true);
    },
    /**
     * Diff two revisions.
     *
     * @param  {number} firstRevNumber  first revision
     * @param  {number} secondRevNumber second revision
     * @return {string}                 diff of first and second revision
     */
    diff: function (firstRevNumber, secondRevNumber) {
      if (!this.diffFunction) {
        throw new Error('In order to use RevisionTracker#diff, a diffFunction must be supplied as an option');
      }
      var first = this.getRevision(firstRevNumber) || {text: ''},
        second = this.getRevision(secondRevNumber);
      if (second) {
        return this.diffFunction(first.text, second.text);
      }
    }
  });
  /**
   * Returns revision track data for element.
   *
   * @return {RevisionTracker} revision tracker obj.
   */
  var getData = function ($el) {
    var rt = $el.data('revisionTracker');
    if (!rt) {
      throw new Error('Element is currently not tracking revisions');
    }
    return rt;
  };
  /**
   * Public API.
   *
   * @type {Object} api
   */
  var api = {
    /**
     * Inititialize this element to track revisions.
     *
     * @param  {Object} options revision
     * @return {[type]}         [description]
     */
    init: function (options) {
      var rt = new RevisionTracker(this, options);
      this.data('revisionTracker', rt);
      return this;
    },
    /**
     * Get revisions for an element.
     *
     * @param  {jQuery element} $el element to get revisions for
     * @return {Array} revision history
     */
    revisions: function () {
      //also include revision number
      return getData(this).revisions.map(function (val, index) {
        val.revisionNumber = index + 1;
        return val;
      });
    },
    /**
     * @see {@link RevisionTracker.prototype.saveRevision}
     */
    save: function () {
      //can bypass saving if last revision is the same
      var d = getData(this);
      var lastRev = d.lastRevision();
      if (lastRev && lastRev.text === this.val()) {
        return lastRev;
      }
      return getData(this).saveRevision();
    },
    /**
     * @see {@link RevisionTracker.prototype.getRevision}
     */
    getRevision: function (revisionNumber) {
      return getData(this).getRevision(revisionNumber);
    },
    /**
     * @see {@link RevisionTracker.prototype.undo}
     */
    undo: function () {
       return getData(this).undo();
    },
    /**
     * @see {@link RevisionTracker.prototype.redo}
     */
    redo: function () {
       return getData(this).redo();
    },
    /**
     * @see {@link RevisionTracker.prototype.goToRevision}
     */
    goToRevision: function (revisionNumber) {
       return getData(this).goToRevision(revisionNumber);
    },
    /**
     * @see {@link RevisionTracker.prototype.diff}
     */
    getDiff: function (firstRevNumber, secondRevNumber) {
      return getData(this).diff(firstRevNumber, secondRevNumber);
    }
  };	
  //Expose the plugin!
  $.fn.revisionTracker = function(firstArg) {
    var pluginArgs = arguments;
    var isApiCall = typeof firstArg === 'string';
    var r = this.filter('textarea,input').map(function () {
      if (firstArg === void 0 || typeof firstArg === 'object') { //calling the constructor
        return api.init.call($(this), firstArg);
      } else if (isApiCall && api[firstArg]) { //calling an API method
        return api[firstArg].apply($(this), Array.prototype.slice.call(pluginArgs, 1));
      } else { //calling a method that is not part of the API -- throw an error
        throw new Error("Calling method that is not part of the API");
      }
    });
    //if API call, "un-jquery" the return value 
    if (isApiCall) {
      //if a "get" call just return a single element
      if (firstArg.indexOf('get') === 0) {
        return r[0];
      }
      return r.toArray();
    }
    return r;
  };
}(jQuery));
