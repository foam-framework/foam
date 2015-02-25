/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

CLASS({
  package: 'foam.ui',
  name: 'FoamTagView',
  extendsModel: 'View',

  requires: [ 'foam.html.Element' ],

  imports: [ 'document' ],

  properties: [
    {
      name: 'element'
    },
    {
      name: 'className',
      defaultValue: 'foam-tag'
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      
      if ( ! this.Element.isInstance(this.element) ) this.install();
    },
    install: function() {
      var e = this.element;
      var models = [];
      var modelName = e.getAttribute('model' /*_*/);
      var viewName  = e.getAttribute('view' /*_*/);

      if ( modelName ) models.push(arequire(modelName));
      if ( viewName  ) models.push(arequire(viewName));

      aseq(apar.apply(null, models), function(ret) {
        var model = FOAM.lookup(modelName, this.X);

        if ( ! model ) {
          this.error('Unknown Model: ', modelName);
          return;
        }

        model.getPrototype();

        var obj = model.create(undefined, X);
        obj.fromElement(e);

        var view;

        if ( viewName ) {
          var viewModel = FOAM.lookup(viewName, X);
          view = viewModel.create({ model: model, data: obj });
        } else if ( View.isInstance(obj) || ( 'CView' in GLOBAL && CView.isInstance(obj) ) ) {
        view = obj;
      } else if ( obj.toView_ ) {
          view = obj.toView_();
        } else {
          var a = this.element.getAttribute('showActions');
          var showActions = ! a || ( 
            a.equalsIC('y')    ||
              a.equalsIC('yes')  ||
              a.equalsIC('true') ||
              a.equalsIC('t') );

          view = DetailView.create({
            model: model,
            data: obj,
            showActions: showActions
          });
        }

        if ( e.id ) this.document.FOAM_OBJECTS[e.id] = obj;
        obj.view_ = view;
        this.holder().outerHTML = view.toHTML();
        view.initHTML();
      }.bind(this))();
    },
    holder: function() {
      // TODO(kgr): Add an outerHTML setter to foam.html.Element instead
      return this.Element.isInstance(this.element) ? this.$ : this.element;
    },
    error: function(msg) {
      console.error(msg);
      this.holder.innerHTML = msg;
    },
    initHTML: function() {
      this.install();
    }
  },

  templates: [
    function CSS() {/*
       .foam-tag {
         background: pink;
       }
    */}
  ]
});