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

var PreviewView = Model.create({
  extendsModel: 'AbstractView',

  name: 'PreviewView',

  properties: [
    { name: 'id'  },
    { name: 'url' }
  ],

  methods: {
    toHTML: function() {
      var src = this.url + '/issues/peek?id=' + this.id;
      return '<webview id="' + this.getID() + '" class="QIssuePreview" style="position:absolute;height:375px;width:875px;" src="' + src + '"></webview>';
    }
  }

});

