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
  name: 'IssueCitationView',
  package: 'foam.apps.mbug.ui',
  extends: 'foam.ui.DetailView',
  requires: [
    'foam.ui.ImageBooleanView',
    'foam.ui.md.MonogramStringView',
    'foam.apps.mbug.ui.PriorityCitationView'
  ],
  imports: [
    'mbug'
  ],
  properties: [
    {
      name: 'preferredHeight',
      defaultValue: 86
    }
  ],
  templates: [
    function toHTML() {/* 
      <div id=<%= this.id %> >
        <div id="<%= this.on('click', function() { this.mbug.editIssue(this.data.id); }) %>" class="issue-citation">
          $$owner{model_: 'foam.ui.md.MonogramStringView'}
          <div class="middle">
            $$id{mode: 'read-only', className: 'id'}
            $$metaPriority{ model_: 'foam.apps.mbug.ui.PriorityCitationView' }
            $$summary{mode: 'read-only'}
          </div>
          $$starred{
            model_: 'foam.ui.ImageBooleanView',
            className:  'star',
            trueImage:  'images/ic_star_24dp.png',
            falseImage: 'images/ic_star_outline_24dp.png'
          }
        </div>
      </div>
    */}
   ]
});
