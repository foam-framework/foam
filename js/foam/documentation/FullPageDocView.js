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
  package: 'foam.documentation',
  name: 'FullPageDocView',
  extendsModel: 'foam.documentation.DocView',
  label: 'Documentation View Full Page',
  documentation: 'Base Model for full page documentation views.',

  documentation: function() {/*
    For full-page views, typically including full lists of all features,
    subclass $$DOC{ref:'foam.documentation.FullPageDocView'}.</p>
    <p>Name your subclass with the name of the type you support:</p>
    <p><code>
    CLASS({ <br/>
    &nbsp;&nbsp;  name: 'PropertyFullPageDocView',<br/>
    &nbsp;&nbsp;  extendsModel: 'FullPageDocView'<br/>
    });<br/>
    // automatically creates PropertyFullPageDocView<br/>
    FullPageDocView.create({model:X.Property});<br/>
    </code></p>
  */}

});
