
CLASS({
  name: 'ImageBooleanView',
  package: 'foam.ui',

  extendsModel: 'foam.ui.LeafDataView',
  traits: ['foam.ui.HTMLViewTrait'],

  properties: [
    {
      name:  'name',
      label: 'Name',
      type:  'String',
      defaultValue: ''
    },
    {
      name: 'trueImage'
    },
    {
      name: 'falseImage'
    },
    {
      name: 'trueClass'
    },
    {
      name: 'falseClass'
    }
  ],

  methods: {
    onDataChange: function(old,nu) {
      this.SUPER(old,nu);
      this.updateHTML();
    },
    image: function() {
      return this.data ? this.trueImage : this.falseImage;
    },
    toHTML: function() {
      var id = this.id;
 // TODO: next line appears slow, check why
      this.on('click', this.onClick, id);
      return this.name ?
        '<img id="' + id + '" ' + this.cssClassAttr() + '" name="' + this.name + '">' :
        '<img id="' + id + '" ' + this.cssClassAttr() + '>' ;
    },
    initHTML: function() {
      if ( ! this.$ ) return;
      this.SUPER();
      this.updateHTML();
    },
    updateHTML: function() {
      if ( ! this.$ ) return;
      this.$.src = this.image();

      if ( this.data ) {
        this.trueClass  && this.$.classList.add(this.trueClass);
        this.falseClass && this.$.classList.remove(this.falseClass);
      } else {
        this.trueClass  && this.$.classList.remove(this.trueClass);
        this.falseClass && this.$.classList.add(this.falseClass);
      }
    },
  },

  listeners: [
    {
      name: 'onClick',
      code: function(e) {
        e.stopPropagation();
        this.data = ! this.data;
      }
    }
  ]
});
