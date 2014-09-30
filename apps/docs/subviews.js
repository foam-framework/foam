/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved
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
  name: 'DocView',
  extendsModel: 'View',
  label: 'Documentation View Base',
  help: 'Base Model for documentation views.',

	documentation: function() {/*
		<p>Underlying the other documentation views, $$DOC{ref:'.'} provides the ability
		to specify $$DOC{ref:'DocRef', text:"$$DOC{ref:'MyModel.myFeature'}"} tags in your
		documentation templates, creating child $$DOC{ref:'DocRefView'} views and $$DOC{ref:'DocRef'}
		references.</p>
		<p>In addition, the $$DOC{ref:'.', text:"$$THISDATA{}"} tag allows your template to
		pass on its data directly, rather than a property of that data.</p>
		<p>Views that wish to use DOC reference tags should extend this model. To display the
		$$DOC{ref:'Model.documentation'} of a model, use a $$DOC{ref:'DocModelView'} or
		$$DOC{ref:'DocBodyView'}.</p>
		<p>Documentation views require that a this.X.documentViewParentModel $$DOC{ref:'SimpleValue'} 
		be present on the context. The supplied model is used as the base for resolving documentation
		references. If you are viewing the documentation for a Model, it will be that Model. If you
		are viewing a feature's documentation (a $$DOC{ref:'Method'}, $$DOC{ref:'Property'}, etc.)
		it will be the Model that contains that feature.</p>
    <p>See $$DOC{ref:'DocumentationBook'} for information on creating documentaion
    that is not directly associated with a $$DOC{ref:'Model'}.
	*/},

  methods: {
    init: function() { /* <p>Warns if this.X.documentViewParentModel is missing.</p>
			*/
      this.SUPER();
      if (!this.X.documentViewParentModel) {
        console.warn("*** Warning: DocView ",this," can't find documentViewParentModel in its context "+this.X.NAME);
      }
    },

    
    createReferenceView: function(opt_args) { /* 
      <p>Creates $$DOC{ref:'DocRefView'} reference views from $$DOC{ref:'.',text:'$$DOC'}
          tags in documentation templates.</p>
			*/
      var X = ( opt_args && opt_args.X ) || this.X; 
      var v = X.DocRefView.create(opt_args);
      this.addChild(v);
      return v;
    },

    createExplicitView: function(opt_args) { /*
      <p>Creates subviews from the $$DOC{ref:'.',text:'$$THISDATA'} tag, using
        an explicitly defined "model_: $$DOC{ref:'Model.name'}" in opt_args.</p>
      */
      var X = ( opt_args && opt_args.X ) || this.X;
      var v = X[opt_args.model_].create({ args: opt_args }); // we only support model_ in explicit mode
      if (!opt_args.data) { // explicit data is honored
        if (this.data) { // TODO: when refactoring $$THISDATA below, figure out what we can assume about this.data being present
          v.data = this.data;
        } else {
          v.data = this; // TODO: correct assumption? do we want data set to this?
        }
      } else {
        v.data = opt_args.data;
      }
      this.addChild(v);
      return v;
    },

    createTemplateView: function(name, opt_args) {
      /*
        Overridden to add support for the $$DOC{ref:'.',text:'$$DOC'} and
        $$DOC{ref:'.',text:'$$THISDATA'} tags.
      */
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
  name: 'DocModelView',
  extendsModel: 'DocView',
  help: 'Displays the documentation of the given Model.',

  properties: [
    {
      name: 'data',
      help: 'The Model for which to display documentation.',
      postSet: function() {
        this.updateHTML();
      }
    },
  ],

  templates: [

    function toInnerHTML()    {/*
<%    this.destroy(); %>
<%    if (this.data && DocumentationBook.isSubModel(this.data)) {  %>
        $$THISDATA{ model_: 'DocBookView', data: this.data.documentation }
<%    } else if (this.data) {  %>
        <div class="introduction">
          <h1><%=this.data.name%></h1>
<%        if (this.data.extendsModel) { %>
            <h2>Extends $$DOC{ref: this.data.extendsModel }</h2>
<%        } else { %>
            <h2>Extends $$DOC{ref: 'Model' }</h2>
<%        } %>
          $$data{ model_: 'DocModelBodyView' }
        </div>
        <div class="members">
          $$data{ model_: 'DocPropertiesView' }
        </div>
        <div class="members">
          $$data{ model_: 'DocMethodsView' }
        </div>
        <div class="members">
          $$data{ model_: 'DocActionsView' }
        </div>
        <div class="members">
          $$data{ model_: 'DocListenersView' }
        </div>
        <div class="members">
          $$data{ model_: 'DocTemplatesView' }
        </div>
        <div class="members">
          $$data{ model_: 'DocRelationshipsView' }
        </div>
        <div class="members">
          $$data{ model_: 'DocIssuesView' }
        </div>
<%    } %>
    */}
  ]

});

MODEL({
  name: 'DocBookView',
  extendsModel: 'DocView',
  help: 'Displays the documentation of the given book.',

  properties: [
    {
      name: 'data',
      help: 'The documentation to display.',
      postSet: function() {
        this.updateHTML();
      }
    },
  ],

  templates: [

    function toInnerHTML()    {/*
<%    this.destroy(); %>
<%    if (this.data) {  %>
        <div class="introduction">
          <h2><%=this.data.label%></h2>
          $$data{ model_: 'DocModelBodyView', data: "", docSource: this.data }
        </div>
        <div class="chapters">
          $$data{ model_: 'DocChaptersView', data: this.data }
        </div>
<%    } %>
    */}
  ]

});




MODEL({
  name: 'DocBodyView',
  extendsModel: 'DocView',
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

  documentation: function() { /*
    <p>An inline link to another place in the documentation. See $$DOC{ref:'DocView'}
    for notes on usage.</p>
    */},

  properties: [

    {
      name: 'ref',
      help: 'Shortcut to set reference by string.',
      postSet: function() {
        this.docRef = this.X.DocRef.create({ ref: this.ref });
      },
      documentation: function() { /*
        The target reference in string form. Use this instead of setting
        $$DOC{ref:'.docRef'} directly if you only have a string.
        */}
    },
    {
      name: 'docRef',
      help: 'The reference object.',
      preSet: function(old,nu) { // accepts a string ref, or an DocRef object
        if (typeof nu === 'string') {
          return this.X.DocRef.create({ ref: nu });
        } else {
          return nu;
        }
      },
      postSet: function() {
        this.updateHTML();
        this.docRef.addListener(this.onReferenceChange);
      },
      documentation: function() { /*
        The target reference.
        */}
    },
    {
      name: 'text',
      help: 'Text to display instead of the referenced object&apos;s default label or name.',
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
      help: 'If true, use the Model.plural instead of Model.name in the link text.',
      documentation: function() { /*
          If true, use the $$DOC{ref:'Model.plural',text:'Model.plural'}
          instead of $$DOC{ref:'Model.name',text:'Model.name'} in the link text,
          for convenient pluralization.
        */}
    }
  ],

  templates: [
    // kept tight to avoid HTML adding whitespace around it
    function toInnerHTML()    {/*<%
      this.destroy();
      if (!this.docRef || !this.docRef.valid) {
        if (this.docRef && this.docRef.ref) {
          %>[INVALID_REF:<%=this.docRef.ref%>]<%
        } else {
          %>[INVALID_REF:*no_reference*]<%
        }
      } else {
        var mostSpecificObject = this.docRef.resolvedModelChain[this.docRef.resolvedModelChain.length-1];
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
      }

      this.on('click', this.onClick, this.id);

      %>*/}
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.tagName = 'span';

      this.setClass('docLinkNoDocumentation', function() {
        return !(this.docRef && this.docRef.valid && this.docRef.resolvedModelChain[this.docRef.resolvedModelChain.length-1].documentation);
      }.bind(this), this.id);
    }
  },

  listeners: [
    {
      name: 'onReferenceChange',
      code: function(evt) {
        this.updateHTML();
      }
    },
    {
      name: 'onClick',
      code: function(evt) {
        if (this.docRef && this.docRef.valid && this.X.documentViewRequestNavigation) {
          this.X.documentViewRequestNavigation(this.docRef);
        }
      }
    }
  ],
});

MODEL({
  name: 'DocRef',
  label: 'Documentation Reference',
  help: 'A reference to a documented Model or feature of a Model',

  documentation: function() { /*
    <p>A link to another place in the documentation. See $$DOC{ref:'DocView'}
    for notes on usage.</p>
    <p>Every reference must have documentViewParentModel set on the context.
      This indicates the starting point of the reference for relative name
      resolution.</p>
    */},

  properties: [
    {
      name: 'resolvedModelChain',
      defaultValue: [],
      documentation: function() { /*
        If this $$DOC{ref:'DocRef'} is valid, actual instances corresponding each
        part of the reference are in this list. The last item in the list
        is the target of the reference.
      */}
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
      },
      documentation: function() { /*
        The rebuilt version of $$DOC{ref:'.ref'}, by asking each part of the
        $$DOC{ref:'.resolvedModelChain'} for its name or id. This may not correspond
        to the actual value of $$DOC{ref:'.ref'} and can be used for debugging
        if reference resolution is not behaving as expected.
      */}
    },
    {
      name: 'ref',
      help: 'The reference to link. Must be of the form "Model", "Model.feature", or ".feature"',
      postSet: function() {
        this.resolveReference(this.ref);
      },
      documentation: function() { /*
        The string reference to resolve.
      */}
    },
    {
      name: 'valid',
      defaultValue: false,
      documentation: function() { /*
        Indicates if the reference is valid. $$DOC{ref:'.resolveReference'} will set
        $$DOC{ref:'.valid'} to true if resolution succeeds and
        $$DOC{ref:'.resolvedModelChain'} is usable, false otherwise.
      */}
    }

  ],

  methods: {
    init: function() {
      /* Warns if documentViewParentModel is missing from the context. */
      if (!this.X.documentViewParentModel) {
        //console.log("*** Warning: DocView ",this," can't find documentViewParentModel in its context "+this.X.NAME);
      } else {
      // TODO: view lifecycle management. The view that created this ref doesn't know
      // when to kill it, so the addListener on the context keeps this alive forever.
      // Revisit when we can cause a removeListener at the appropriate time.
        //        this.X.documentViewParentModel.addListener(this.onParentModelChanged);
      }
    },

    resolveReference: function(reference) {
  /* <p>Resolving a reference has a few special cases at the start:</p>
    <ul>
      <li>Beginning with ".": relative to Model in X.documentViewParentModel</li>
      <li>Containing only ".": the Model in X.documentViewParentModel</li>
      <li>The name after the first ".": a feature of the Model accessible by "getFeature('name')"</li>
    </ul>
    <p>Note that the first name is a Model definition (can be looked up by this.X[modelName]),
     while the second name is an instance of a feature on that Model, and subsequent
     names are sub-objects on those instances.</p>
  */

      this.resolvedModelChain = [];
      var newResolvedModelChain = [];

      this.valid = false;

      if (!reference) return;

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
        if (args[1] === "documentation") {
          // special case for links into documentation books
          foundObject = model.documentation;
        } else {
          foundObject = model.getFeature(args[1]);
        }
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

        if (!remainingArgs.every(function (arg) {
            var newObject;

            // null arg is an error at this point
            if (arg.length <= 0) return false;

            // check if arg is the name of a sub-object of foundObject
            var argCaller = Function('return this.'+arg);
            if (argCaller.call(foundObject)) {
              newObject = argCaller.call(foundObject);

            // otherwise if foundObject is a list, check names of each thing inside
            } else if (foundObject.mapFind) {
              foundObject.mapFind(function(f) {
                if (f && f.name && f.name === arg) {
                  newObject = f;
                }
              })
            }
            foundObject = newObject; // will reset to undefined if we failed to resolve the latest part
            if (!foundObject) {
              return false;
            } else {
              newResolvedModelChain.push(foundObject);
              return true;
            }
          })) {
          return; // the loop failed to resolve something
        }
      }

//      console.log("resolving "+ reference);
//      newResolvedModelChain.forEach(function(m) {
//        console.log("  ",m.name,m);
//      });

      this.resolvedModelChain = newResolvedModelChain;
      this.valid = true;
    },
  },

  // TODO: make sure these reference objects aren't being kept alive too long. See above.
//  listeners: [
//    {
//        name: 'onParentModelChanged',
//        code: function() {
//          this.resolveReference(this.ref);
//        }
//    }
//  ]

});



