CLASS({
  name: 'View',
  package: 'foam.ui.polymer',

  extendsModel: 'View',

  properties: [
    {
      model_: 'ModelProperty',
      name: 'tooltipModel',
      defaultValue: 'foam.ui.polymer.Tooltip'
    }
  ],

  methods: [
    {
      name: 'installInDocument',
      code: function(X, document) {
        var superRtn = this.SUPER.apply(this, arguments);
        if ( ! this.HREF ) return superRtn;

        var l = document.createElement('link');
        l.setAttribute('rel', 'import');
        l.setAttribute('href', this.HREF);
        document.head.appendChild(l);

        return superRtn;
      }
    },
    {
      name: 'maybeInitTooltip',
      code: function() {
        if ( ! this.tooltip_ ) {
          this.tooltip_ = this.tooltipModel.create({
            text: this.tooltip,
            target: this.$
          });
        }
      }
    },
    {
      name: 'updateAttribute',
      code: function(name, prev, next) {
        if ( ! this.$ || prev === next ) return;

        if ( next ) {
          if (next !== true) this.$.setAttribute(name, next);
          else               this.$.setAttribute(name, '');
        } else {
          this.$.removeAttribute(name);
        }
      }
    },
    {
      name: 'updateAttributes',
      code: function() {
        if ( ! this.POLYMER_ATTRIBUTES ) return;

        this.POLYMER_ATTRIBUTES.forEach(function(attrName) {
          this.updateAttribute(attrName, undefined, this[attrName]);
        }.bind(this));
      }
    },
    {
      name: 'initHTML',
      code: function() {
        var rtn = this.SUPER();
        this.updateAttributes();
        return rtn;
      }
    }
  ],

  listeners: [
    {
      name: 'openTooltip',
      documentation: function() {/*
        The base View class binds an openTooltip listener to anything with a
        tooltip. Polymer tooltips attach/detach when tooltip text is available,
        so this is a no-op.
      */},
      code: function() {}
    },
    {
      name: 'closeTooltip',
      documentation: function() {/*
        The base View class binds an closeTooltip listener to anything with a
        tooltip. Polymer tooltips attach/detach when tooltip text is available,
        so this is a no-op.
      */},
      code: function() {}
    }
  ]
});
