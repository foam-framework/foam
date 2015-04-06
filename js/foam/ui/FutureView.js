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
  extendsModel: 'foam.ui.View',
  // Works as follows: when it starts up, it will create a 10ms timer.
  // When the future is set, it begins listening to it.
  // In general, the 10ms timer expires before the future does, and then it
  // renders a spinner.
  // When the future resolves, it destroys the spinner and renders the view
  // passed by the future.
  // If the future resolves within the 10ms, then the spinner is never rendered.
  // TODO(jacksonic): check data handling here. Must be manually done to views before they
  // are passed in?
  documentation: 'Expects a Future for a $$DOC{ref:"View"}. Shows a ' +
      '$$DOC{ref:"SpinnerView"} until the future resolves.',

  imports: [
    'clearTimeout',
    'setTimeout'
  ],

  properties: [
    {
      model_: 'ViewFactoryProperty',
      name: 'spinnerView',
      documentation: 'The view to use for the spinner. Defaults to SpinnerView.',
      defaultValue: 'foam.ui.SpinnerView'
    },
    {
      name: 'future',
      required: true,
      documentation: 'The Future for this View. Returns a View.'
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
      name: 'childView',
      documentation: 'The real child view passed in the Future.'
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
      code: function(view) {
        if ( this.timer ) this.clearTimeout(this.timer);

        var el;
        if ( this.spinner ) {
          el = this.spinner.$;
          this.spinner.destroy();
          this.spinner = '';
        } else {
          el = this.$;
        }
        this.childView = view;
        if (el) {
          el.outerHTML = view.toHTML();
          view.initHTML();
        }
      }
    }
  ],

  methods: {
    toHTML: function() {
      if ( this.childView ) return this.childView.toHTML();
      if ( this.spinner ) return this.spinner.toHTML();
      return this.SUPER();
    },
    initHTML: function() {
      if ( this.childView ) this.childView.initHTML();
      if ( this.spinner ) this.spinner.initHTML();
      this.SUPER();
      (this.future.get || this.future)(this.onFuture);
    },
    destroy: function( isParentDestroyed ) {
      this.SUPER(isParentDestroyed);
      if ( this.spinner ) this.spinner.destroy();
      if ( this.childView ) this.childView.destroy();
    }
  }
});
