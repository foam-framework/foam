/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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
  package: 'foam.memento',
  name: 'PushStateMementoMgr',

  imports: [
    'document',
    'history',
    'location',
    'window'
  ],

  properties: [
    {
      name: 'mementoValue',
      postSet: function(old, nu) {
        if (old) old.removeListener(this.onMementoChange);
        if (nu) nu.addListener(this.onMementoChange);
      }
    },
    {
      name: 'firstRun',
      documentation: 'Helps determine if this is a fresh memento manager. ' +
          'We use replaceState for the first call, and pushState for all ' +
          'later calls.',
      defaultValue: true
    },
    {
      name: 'justPopped',
      defaultValue: false
    }
  ],

  listeners: [
    {
      name: 'onPopState',
      code: function(event) {
        var mem = this.urlToMemento(this.location, event.state);
        this.justPopped = true;
        this.mementoValue.set(mem);
      }
    },
    {
      name: 'onMementoChange',
      isMerged: 100,
      code: function(buganizer, topic, old, nu) {
        var combined = this.mementoToURL(nu);
        var push = combined.push && !this.firstRun && !this.justPopped;
        this.justPopped = this.firstRun = false;
        if (push) {
          this.history.pushState(combined.state, '', combined.url);
        } else {
          this.history.replaceState(combined.state, '', combined.url);
        }
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.window.onpopstate = this.onPopState;
      // Check for a <base> tag in the <head>. If there is one, leave it.
      // If there is not, add one for the current base URL (ie. without the
      // path).
      var baseElements = this.document.getElementsByTagName('base');
      if (baseElements.length === 0) {
        this.document.head.insertAdjacentHTML('beforeend',
            '<base href="' + this.location.origin + '" />');
      }

      // Pretend we just popped to the current URL. This will set the memento
      // based on the URL we were launched with.
      this.onPopState({ state: this.history.state });
    },
    urlToMemento: function(url, state) {
      /* Function to convert an incoming URL into a memento. */
      /* Override this and $$DOC{ref:'.mementoToURL'} to customize the URLs. */
      return state;
    },
    mementoToURL: function(memento) {
      /* Function to convert a new memento into a URL. Returns an object
       * { url: 'blah', state: { some: object }, push: true } */
      /* Override this and $$DOC{ref:'.urlToMemento'} to customize the URLs. */
      return {
        url: this.location.pathname + this.location.search + this.location.hash,
        state: memento,
        push: false
      };
    }
  }
});
