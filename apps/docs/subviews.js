/**
 * @license
 * Copyright 2013 Google Inc. All Rights Reserved
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



MODEL({
  name: 'DocBodyView',
  extendsModel: 'View',
  label: 'Documentation Body View Base',
  help: 'Base Model for documentation body-text views.',

  properties: [
    {
      name: 'data',
      help: 'The model or feature from which to extract documentation.',
      required: true,
      preSet: function(old, nu) {
        if (old && Documentation.isInstance(old.documentation)) {
          Events.unfollow(old.documentation$, this.docSource$);
        }
        return nu;
      },
      postSet: function() {
        // grab the documentation and compile a template to use in this view
        if (this.data && Documentation.isInstance(this.data.documentation)) {
          // bind docSource
          Events.follow(this.data.documentation$, this.docSource$);
        }
      }
    },
    {
      name: 'docSource',
      type: 'Documentation',
      help: 'The documentation object to render.',
      postSet: function() {
        this.updateHTML();
      }
    },
  ],

  methods: {
    init: function() {
      this.SUPER();
      if (!this.X.documentViewParentModel) {
        console.log("*** Warning: DocView ",this," can't find documentViewParentModel in its context "+this.X.NAME);
      }
    },

    renderDocSourceHTML: function() {
      // only update if we have all required data
      if (this.docSource.body && this.X.documentViewParentModel
          && this.X.documentViewParentModel.model_ && this.data.model_) {
        // The first time this method is hit, replace it with the one that will
        // compile the template, then call that. Future calls go direct to lazyCompile's
        // returned function. You could also implement this the same way lazyCompile does...
        this.renderDocSourceHTML = TemplateUtil.lazyCompile(this.docSource.body);
        return this.renderDocSourceHTML();
      } else {
        return ""; // no data yet
      }
    },

    /** Create the special reference lookup sub-view from property info. **/
    createReferenceView: function(opt_args) {
      var X = ( opt_args && opt_args.X ) || this.X; // TODO: opt_args should have ref and text auto-set on the view?
      var v = X.DocRefView.create({ ref:opt_args.ref, text: opt_args.text, args: opt_args});
      this.addChild(v);
      return v;
    },

    createExplicitView: function(opt_args) {
      var X = ( opt_args && opt_args.X ) || this.X;
      var v = X[opt_args.model_].create({ args: opt_args });
      v.data = this.data;
      this.addChild(v);
      return v;
    },

    createTemplateView: function(name, opt_args) {
      // name has been constantized ('PROP_NAME'), but we're
      // only looking for certain doc tags anyway.
      if (name === 'DOC') {
        var v = this.createReferenceView(opt_args);
        return v;
      } else if (name === 'THISDATA') { // TODO: refactor this into view.js, as it is very similar to the normal case
        return this.createExplicitView(opt_args);
      } else {
        return this.SUPER(name, opt_args);
      }
    }
  }
});


MODEL({
  name: 'DocModelBodyView',
  extendsModel: 'DocBodyView',
  label: 'Documentation Model View',
  help: 'Shows the documentation body for a Model.',

  properties: [
    {
      name: 'data',
      help: 'The Model from which to extract documentation.',
      postSet: function() {
        this.X[this.model_.extendsModel].DATA.postSet.call(this); // TODO: implement this.SUPER() for these
        this.parentModel = this.data;
      }
    },

  ],

  templates: [
    function toInnerHTML()    {/*
      <%    this.destroy(); %>
      <%    if (this.data) {  %>
              <%=this.renderDocSourceHTML()%>
      <%    } %>
    */}
  ],

});

MODEL({
  name: 'DocFeatureBodyView',
  extendsModel: 'DocBodyView',
  label: 'Documentation Feature View',
  help: 'Shows documentation body for a feature of a Model.',

  // You must set both data and parentModel

  templates: [
    function toInnerHTML()    {/*
      <%    this.destroy(); %>
      <%    if (this.data) {  %>
              <h2><%=this.data.name%></h2>
              <%=this.renderDocSourceHTML()%>
      <%    } %>
    */}
  ]
});




MODEL({
  name: 'DocRefView',
  extendsModel: 'View',
  label: 'Documentation Reference View',
  help: 'The view of a documentation reference link.',

  properties: [

    {
      name: 'ref',
      help: 'Shortcut to set reference by string.',
      postSet: function() {
        this.data = this.X.DocRef.create({ ref: this.ref });
      }
    },
    {
      name: 'data',
      help: 'The reference object.',
      postSet: function() {
        this.updateHTML();
        this.data.addListener(this.onReferenceChange);
      }
    },
    {
      name: 'text',
      help: 'Text to display instead of the referenced object&apos;s default label or name.'
    }

  ],

  templates: [
    // kept tight to avoid HTML adding whitespace around it
    function toInnerHTML()    {/*<%
      this.destroy();
      if (!this.data || !this.data.valid) {
        if (this.data && this.data.ref) {
          %>[INVALID_REF:<%=this.data.ref%>]<%
        } else {
          %>[INVALID_REF:*no_reference*]<%
        }
      } else {
        var mostSpecificObject = this.data.resolvedModelChain[this.data.resolvedModelChain.length-1];

        if (this.text && this.text.length > 0) {
          %>[<%=this.text%>]<%
        } else if (mostSpecificObject.label && mostSpecificObject.label.length > 0) {
          %>[<%=mostSpecificObject.label%>]<%
        } else if (mostSpecificObject.name) {
          %>[<%=mostSpecificObject.name%>]<%
        } else if (mostSpecificObject.id) {
          %>[<%=mostSpecificObject.id%>]<%
        } else {
          %>[INVALID_REF:<%=this.data.ref%>]<%
        }
      } %>*/}
  ],

  methods: {
    init: function() {
      this.SUPER();

      this.tagName = 'span';
    }
  },

  listeners: [
    {
      name: 'onReferenceChange',
      code: function(evt) {
        this.updateHTML();
      }
    }
  ],
});

MODEL({
  name: 'DocRef',
  label: 'Documentation Reference',
  help: 'A reference to a documented Model or feature of a Model',

  properties: [
    {
      name: 'resolvedModelChain',
      defaultValue: [],
    },
    {
      name: 'resolvedName',
      dynamicValue: function() {
        var fullname = "";
        newResolvedModelChain.forEach(function(m) {
          if (m.name)
            fullname.concat(m.name);
          else if (m.id)
            fullname.concat(m.id);
        });
        return fullname;
      }
    },
    {
      name: 'ref',
      help: 'The reference to link. Must be of the form "Model", "Model.feature", or ".feature"',
      postSet: function() {
        this.resolveReference(this.ref);
      }
    },
    {
      name: 'valid',
      defaultValue: false
    }

  ],

  methods: {
    init: function() {
      if (!this.X.documentViewParentModel) {
        console.log("*** Warning: DocView ",this," can't find documentViewParentModel in its context "+this.X.NAME);
        debugger;
      } else {
      // TODO: view lifecycle management. The view that created this ref doesn't know
      // when to kill it, so the addListener on the context keeps this alive forever.
      // Revisit when we can cause a removeListener at the appropriate time.
        //        this.X.documentViewParentModel.addListener(this.onParentModelChanged);
      }
    },

    resolveReference: function(reference) {
      this.resolvedModelChain = [];
      var newResolvedModelChain = [];

      this.valid = false;

      // parse "Model.feature" or "Model" or ".feature" with implicit Model==this.data
      args = reference.split('.');
      var foundObject;
      var model;

      // if model not specified, use parentModel
      if (args[0].length <= 0) {
        if (!this.X.documentViewParentModel) {
          return; // abort
        }
        model = this.X.documentViewParentModel.get(); // ".feature" or "."
      } else {
        model = this.X[args[0]];
      }

      if (!model) {
        return;
      }

      newResolvedModelChain.push(model);

      if (args.length > 1 && args[1].length > 0)
      {
        // feature specified "Model.feature" or ".feature"
        foundObject = model.getFeature(args[1]);
        if (!foundObject) {
          return;
        } else {
          newResolvedModelChain.push(foundObject);
        }
      }

      // allow further specification of sub properties or lists
      if (foundObject && args.length > 2)
      {
        remainingArgs = args.slice(2);

        remainingArgs.some(function (arg) {
          var newObject;

          // null arg is an error at this point
          if (arg.length <= 0) return false;

          // check if arg is the name of a sub-object of foundObject
          var argCaller = Function('return this.'+arg);
          if (argCaller.call(foundObject)) {
            newObject = argCaller.call(foundObject);
          } else if (foundObject.mapFind) {
            // otherwise if foundObject is a list, check names of each thing inside
            foundObject.mapFind(function(f) {
              if (f.name && f.name === arg && f) {
                newObject = f;
              }
            })
          }
          foundObject = newObject; // will reset to undefined if we failed to resolve the latest part
          if (!foundObject) {
            return false;
          } else {
            newResolvedModelChain.push(foundObject);
          }
        });
      }
      console.log("resolving "+ reference);
      newResolvedModelChain.forEach(function(m) {
        console.log("  "+m.name);
      });

      this.resolvedModelChain = newResolvedModelChain;
      this.valid = true;
    },
  },

  // TODO: make sure these reference objects aren't being kept alive too long
  listeners: [
    {
        name: 'onParentModelChanged',
        code: function() {
          this.resolveReference(this.ref);
        }
    }
  ]

});



