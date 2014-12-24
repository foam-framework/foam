CLASS({
  name: 'ElementWithTooltip',
  package: 'foam.ui.polymer.demo',

  extendsModel: 'foam.ui.polymer.View',

  properties: [
    {
      model_: 'StringProperty',
      name: 'tagName',
      defaultValue: 'div'
    },
    {
      model_: 'StringProperty',
      name: 'data',
      defaultValue: 'Text with tooltip'
    },
    {
      name: 'tooltipConfig',
      defaultValue: {}
    }
  ],

  methods: [
    {
      name: 'maybeInitTooltip',
      code: function() {
        if ( this.tooltipConfig ) this.tooltipConfig.target = this.$;
        if ( ! this.tooltip_ ) {
          this.tooltip_ = this.tooltipModel.create(this.tooltipConfig);
        }
      }
    }
  ],

  templates: [
    function toHTML() {/*
      <{{{this.tagName}}} id="{{{this.id}}}">{{this.data}}</{{{this.tagName}}}>
    */}
  ]
});
