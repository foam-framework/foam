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
  name: 'QIssuePreviewBorder',
  package: 'foam.apps.quickbug.ui',
  help: 'Wraps a QIssueDetailView in a manner appropriate for a popup.',

  methods: {
    toHTML: function(border, delegate, args) {
      return '<div id="' + this.id + '" ' +
        'class="QIssuePreview" ' +
        'style="position:absolute;height:500px;width:875px;background:white">' +
        this.toInnerHTML() +
        '</div>';
    }
  }
});
