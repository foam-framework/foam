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
  name: 'DocRefView',

  extends: 'foam.ui.View',
  label: 'Documentation Reference View',
  documentation: 'The view of a documentation reference link.',

  requires: ['foam.documentation.DocRef as DocRef',
             'Documentation'],

  imports: ['documentViewRequestNavigation'],

  documentation: function() { /*
    <p>An inline link to another place in the documentation. See $$DOC{ref:'DocView'}
    for notes on usage.</p>
    */},

  properties: [

    {
      name: 'ref',
      documentation: 'Shortcut to set reference by string.',
      postSet: function() {
        this.docRef = this.DocRef.create({ ref: this.ref });
      },
      documentation: function() { /*
        The target reference in string form. Use this instead of setting
        $$DOC{ref:'.docRef'} directly if you only have a string.
        */}
    },
    {
      name: 'docRef',
      documentation: 'The reference object.',
      preSet: function(old,nu) { // accepts a string ref, or an DocRef object
        if (typeof nu === 'string') {
          return this.DocRef.create({ ref: nu });
        } else {
          return nu;
        }
      },
      postSet: function() {
        this.tooltip = this.docRef.ref;
        this.updateHTML();
        this.docRef.addListener(this.onReferenceChange);
      },
      documentation: function() { /*
        The target reference.
        */}
    },
    {
      name: 'text',
      documentation: 'Text to display instead of the referenced object&apos;s default label or name.',
      documentation: function() { /*
          Text to display instead of the referenced object&apos;s default label or name.
        */}
    },
    {
      name: 'className',
      defaultValue: 'docLink',
      hidden: true
    },
    {
      name: 'usePlural',
      defaultValue: false,
      documentation: 'If true, use the Model.plural instead of Model.name in the link text.',
      documentation: function() { /*
          If true, use the $$DOC{ref:'Model.plural',text:'Model.plural'}
          instead of $$DOC{ref:'Model.name',text:'Model.name'} in the link text,
          for convenient pluralization.
        */}
    },
    {
      name: 'acceptInvalid',
      type: 'Boolean',
      defaultValue: false,
      documentation: function() { /*
        If true, an invalid reference will just render as static text, rather than show an error.
      */}
    }
  ],

  templates: [
    // kept tight to avoid HTML adding whitespace around it
    function toInnerHTML()    {/*<%
      this.destroy();
      if (!this.docRef || !this.docRef.valid) {
        if (this.acceptInvalid) {
          if (this.text && this.text.length > 0) {
            %><%=this.text%><%
          } else if (this.docRef) {
            %><%=this.docRef.ref%><%
          } else if (this.ref) {
            %><%=this.ref%><%
          } else {
            %>___<%
          }
        } else {
          if (this.docRef && this.docRef.ref) {
            %>[INVALID_REF:<%=this.docRef.ref%>]<%
          } else {
            %>[INVALID_REF:*no_reference*]<%
          }
        }
      } else {
        var mostSpecificObject = this.docRef.resolvedObject;
        if (this.text && this.text.length > 0) {
          %><%=this.text%><%
        } else if (this.usePlural && mostSpecificObject.plural) {
          %><%=mostSpecificObject.plural%><%
        } else if (mostSpecificObject.name) {
          %><%=mostSpecificObject.name%><%
        } else if (mostSpecificObject.id) {
          %><%=mostSpecificObject.id%><%
        } else {
          %><%=this.docRef.ref%><%
        }
        this.on('click', this.onClick, this.id);
      }


      %>*/}
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.tagName = 'span';

      this.setClass('docLinkNoDocumentation', function() {
        if (this.docRef && this.docRef.valid) {
          mostSpecificObject = this.docRef.resolvedObject;
          return !( mostSpecificObject.documentation
                   || (mostSpecificObject.model_ && this.Documentation.isSubModel(mostSpecificObject.model_)));
        }
      }.bind(this), this.id);
    }
  },

  listeners: [
    {
      name: 'onReferenceChange',
      code: function(evt) {
        this.tooltip = this.docRef.ref;
        this.updateHTML();
      }
    },
    {
      name: 'onClick',
      code: function(evt) {
        if (this.docRef && this.docRef.valid && this.documentViewRequestNavigation) {
          this.documentViewRequestNavigation(this.docRef);
        }
      }
    }
  ],
});
