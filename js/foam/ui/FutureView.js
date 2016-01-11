/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

CLASS({
  package: 'foam.ui',
  name: 'FutureView',
  extends: 'foam.ui.SimpleView',
  requires: [
    'foam.ui.SpinnerView',
  ],
  // Works as follows: when it starts up, it will create a 10ms timer.
  // When the future is set, it begins listening to it.
  // In general, the 10ms timer expires before the future does, and then it
  // renders a spinner.
  // When the future resolves, it destroys the spinner and renders the innerView
  // with the data from the future.
  // If the future resolves within the 10ms, then the spinner is never rendered.
  documentation: 'Expects a Future for the data which will be passed to the ' +
      '$$DOC{ref:".innerView"}. Shows a $$DOC{ref:"SpinnerView"} until the ' +
      'future resolves.',

  imports: [
    'clearTimeout',
    'setTimeout'
  ],

  properties: [
    {
      type: 'ViewFactory',
      name: 'spinnerView',
      documentation: 'The view to use for the spinner. Defaults to SpinnerView.',
      defaultValue: 'foam.ui.SpinnerView'
    },
    {
      name: 'future',
      required: true,
      documentation: 'The Future for this View. Expects the data for ' +
          '$$DOC{ref:".innerView"} and an optional context to create it in.'
    },
    {
      name: 'preSpinnerTime',
      documentation: 'Time in milliseconds to wait before showing a spinner.',
      defaultValue: 500
    },
    {
      name: 'timer',
      hidden: true,
      factory: function() {
        return this.setTimeout(this.onTimer, this.preSpinnerTime);
      }
    },
    {
      name: 'spinner',
      documentation: 'The View instance for the spinner.'
    },
    {
      type: 'ViewFactory',
      name: 'innerView',
      documentation: 'The view to be rendered after the future resolves, and ' +
          'passed the data provided by the Future.'
    },
    {
      name: 'childView_'
    }
  ],

  listeners: [
    {
      name: 'onTimer',
      documentation: 'If the future resolves before the timer fires, the ' +
          'timer gets canceled. Since it fired, we know to render the spinner.',
      code: function() {
        this.timer = '';
        this.spinner = this.spinnerView();
        if ( this.$ ) {
          this.$.outerHTML = this.spinner.toHTML();
          this.spinner.initHTML();
        }
      }
    },
    {
      name: 'onFuture',
      code: function(data) {
        if ( this.timer ) this.clearTimeout(this.timer);

        var el;
        if ( this.spinner ) {
          el = this.spinner.$;
          this.spinner.destroy();
          this.spinner = '';
        } else {
          el = this.$;
        }
        this.childView_ = this.innerView({ data: data }, this.Y);
        if (el) {
          el.outerHTML = this.childView_.toHTML();
          this.childView_.initHTML();
        }
      }
    }
  ],

  methods: {
    toHTML: function() {
      if ( this.childView_ ) return this.childView_.toHTML();
      if ( this.spinner ) return this.spinner.toHTML();
      return this.SUPER();
    },
    initHTML: function() {
      if ( this.childView_ ) this.childView_.initHTML();
      if ( this.spinner ) this.spinner.initHTML();
      this.SUPER();
      (this.future.get || this.future)(this.onFuture);
    },
    destroy: function( isParentDestroyed ) {
      this.SUPER(isParentDestroyed);
      if ( this.spinner ) this.spinner.destroy();
      if ( this.childView_ ) this.childView_.destroy();
    }
  }
});
