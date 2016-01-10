var Service = FOAM({
  model_: 'Model',

  name: 'Service',

  properties: [
    {
      type: 'String',
      name: 'name',
      mode: 'read-only'
    },
    {
      type: 'Boolean',
      name: 'selected'
    },
    {
      type: 'String',
      name: 'description'
    },
    {
      type: 'Int',
      name: 'cost',
      mode: 'read-only'
    }
  ],

  methods: {
    getDetailView: function() {
      return DetailView.create({ model: Service });
    },
    getSummaryView: function() {
      return ServiceSummaryView.create({ model: Service });
    }
  }
});

var CompositeService = FOAM({
  model_: 'Model',

  name: 'CompositeService',
  extends: 'Service',

  properties: [
    {
      type: 'Array',
      name: 'children',
      postSet: function(_, value) {
        var self = this;
        Events.dynamicFn(function() {
          var selected = false;
          var cost = 0;
          for ( var i = 0; i < value.length; i++ ) {
            var subSelected = value[i].selected;
            var subCost = value[i].cost;
            selected = selected || subSelected;
            if ( subSelected ) {
              cost += subCost;
            }
          }
          self.selected = selected;
          self.cost = cost;
        });
      }
    },
    {
      type: 'Boolean',
      name: 'exclusive'
    }
  ],

  methods: {
    getDetailView: function() {
      return CompositeServiceView.create({});
    },
    getSummaryView: function() {
      return CompositeServiceSummaryView.create({});
    }
  }
});

var OptionalServiceView = FOAM({
  model_: 'Model',

  name: 'OptionalServiceView',

  extends: 'foam.ui.View',

  properties: [
    {
      name: 'delegate',
      postSet: function(oldValue, newValue) {
        oldValue && this.removeChild(oldValue);
        this.addChild(newValue);
      }
    },
    {
      name: 'innerView',
      factory: function() { return BooleanView.create(); },
      postSet: function(oldValue, newValue) {
        oldValue && this.removeChild(oldValue);
        this.addChild(newValue);
      }
    },
    {
      name: 'value',
      factory: function() { return SimpleValue.create(); }
    }
  ],

  methods: {
    setValue: function(value) {
      this.value = value;
      this.delegate.setValue(value);
      this.innerView.setValue(
          value.get().propertyValue('selected'));
    },

    toHTML: function() {
      return this.innerView.toHTML() + this.delegate.toHTML();
    }
  }
});

var CompositeServiceView = FOAM({
  model_: 'Model',

  name: 'CompositeDetailView',

  extends: 'foam.ui.View',

  properties: [
    {
      name: 'value',
      factory: function() { return SimpleValue.create(); },
      postSet: function(oldValue, newValue) {
        oldValue && oldValue.removeListener(this.renderChoices);
        newValue.addListener(this.renderChoices);
      }
    }
  ],

  methods: {
    setValue: function(value) {
      this.value = value;
      this.renderChoices();
    },
    toHTML: function() {
      return '<div id="' + this.id + '"></div>';
    },
    initHTML: function() {
      this.SUPER();
      this.renderChoices();
    }
  },

  listeners: [
    {
      name: 'renderChoices',
//      isFramed: true,
      code: function() {
        if ( ! this.$ ) return;

        var html = '';
        var service = this.value.get();
        var views = [];
        for ( var i = 0; i < service.children.length; i++ ) {
          var subView = service.children[i].getDetailView();

          subView = OptionalServiceView.create({
            children: [],
            delegate: subView
          });

          html += subView.toHTML();
          subView.setValue(SimpleValue.create(service.children[i]));
          if ( service.exclusive ) {
            (function(composite, service) {
              service.propertyValue('selected').addListener(function() {
                for ( var i = 0; i < composite.children.length; i++ ) {
                  if ( composite.children[i] != service ) {
                    composite.children[i].selected = false;
                  }
                }
              });
            })(service, service.children[i]);
          }
          views.push(subView);
        }

        this.$.innerHTML = html;
        views.forEach(function(v) { v.initHTML(); });
      }
    }
  ]
});

var ServiceSummaryView = FOAM({
  model_: 'Model',

  name: 'ServiceSummaryView',

  extends: 'foam.ui.DetailView',

  templates: [
    {
      name: 'toHTML',
      template: '<div id="<%= this.id %>"><%= this.createView(Service.NAME).toHTML() %>' +
        '<%= this.createView(Service.COST).toHTML() %></div>'
    }
  ]
});

var CompositeServiceSummaryView = FOAM({
  model_: 'Model',

  name: 'CompositeServiceSummaryView',

  extends: 'foam.ui.DetailView',

  properties: [
/*    {
      name: 'value',
      factory: function() { return SimpleValue.create(); },
      postSet: function(oldValue, newValue) {
        oldValue && oldValue.removeListener(this.valueChange);
        newValue.addListener(this.valueChange);
      }
    }*/
  ],

  methods: {
    toHTML: function() {
      var total = this.createView(Service.COST);
      return '<div id="' + this.id + '"></div><div>--' + total.toHTML() + '</div>';
    },
    setValue: function(value) {
      this.value = value;
      this.value.addListener(this.valueChange);
    },
    initHTML: function() {
      this.SUPER();
      this.valueChange();
    }
  },

  listeners: [
    {
      name: 'valueChange',
      code: function() {
        Events.dynamicFn(this.render);
      }
    },
    {
      name: 'render',
//      isFramed: true,
      code: function() {
        if ( ! this.$ ) return;

        var html = '';
        var service = this.value.get();
        var views = [];
        for ( var i = 0; i < service.children.length; i++ ) {
          if ( !service.children[i].selected ) continue;
          var subView = service.children[i].getSummaryView();

          html += subView.toHTML();
          subView.setValue(SimpleValue.create(service.children[i]));
          views.push(subView);
        }

        this.$.innerHTML = html;
        views.forEach(function(v) { v.initHTML(); });
      }
    }
  ]
});


var order = CompositeService.create({
  children: [
    CompositeService.create({
      children: [
        Service.create({
          name: 'A',
          cost: 150,
          description: 'Service A'
        }),
        Service.create({
          name: 'B',
          cost: 10,
          description: 'Service B'
        }),
      ],
      exclusive: true
    }),
    CompositeService.create({
      children: [
        Service.create({
          name: 'Option A',
          cost: 75,
          description: 'Optional component A'
        }),
        Service.create({
          name: 'Option B',
          cost: 60,
          description: 'Optional component B'
        })
      ],
      exclusive: false
    })
  ],
  exclusive: false
});

var OrderSummaryView = FOAM({
  model_: 'Model',
  name: 'OrderSummaryView',
  extends: 'CompositeServiceSummaryView',

  methods: {
    toHTML: function() {
      return '<div>Order Summary</div><div id="' +
        this.id + '"></div><div>Total: ' +
        this.createView(Service.COST).toHTML() + '</div>';
    }
  }
});

var detail = order.getDetailView();
var summary = OrderSummaryView.create({});

document.body.innerHTML = detail.toHTML() + summary.toHTML();
detail.value.set(order);
summary.value.set(order);
detail.initHTML();
summary.initHTML();
