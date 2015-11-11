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
  package: 'com.google.watlobby',
  name: 'TopicDetailView',
  extends: 'foam.ui.md.DetailView',
  methods: [
    function initHTML() {
      this.SUPER();
      this.data.model$.addListener(this.onModelChange);
      this.onModelChange();

    }
  ],
  listeners: [
    {
      name: 'onModelChange',
      isFramed: true,
      code: function() {
        var model = this.data.model;
        this.videoView.$.style.display = model === 'Video' ? 'block' : 'none';
        this.textView.$.style.display  = ( model === 'Video' || model === 'Background' || model === 'Redirect' ) ? 'none' : 'block';
        this.redirectView.$.style.display  = model === 'Redirect' ? 'block' : 'none';
      }
    }
  ]
});
