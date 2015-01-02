CLASS({
  name: 'TooltipDemo',
  package: 'foam.ui.polymer.demo',
  extendsModel: 'View',
  requires: [
    'foam.ui.polymer.demo.ElementWithTooltip',
    'foam.ui.polymer.Tooltip'
  ],

  properties: [
    {
      model_: 'StringProperty',
      name: 'right',
      view: 'foam.ui.polymer.demo.ElementWithTooltip',
      defaultValue: 'Right'
    },
    {
      model_: 'StringProperty',
      name: 'top',
      view: 'foam.ui.polymer.demo.ElementWithTooltip',
      defaultValue: 'Top'
    },
    {
      model_: 'StringProperty',
      name: 'left',
      view: 'foam.ui.polymer.demo.ElementWithTooltip',
      defaultValue: 'Left'
    },
    {
      model_: 'StringProperty',
      name: 'bottom',
      view: 'foam.ui.polymer.demo.ElementWithTooltip',
      defaultValue: 'Bottom'
    },
    {
      model_: 'StringProperty',
      name: 'noArrow',
      view: 'foam.ui.polymer.demo.ElementWithTooltip',
      defaultValue: 'NoArrow'
    },
    {
      model_: 'StringProperty',
      name: 'richText',
      view: 'foam.ui.polymer.demo.ElementWithTooltip',
      defaultValue: 'RichText'
    },
    {
      model_: 'StringProperty',
      name: 'show',
      view: 'foam.ui.polymer.demo.ElementWithTooltip',
      defaultValue: 'Show'
    }
  ],

  templates: [
    function toHTML() {/*
      <div class="centeredDiv">
        $$top{ tooltipConfig: {
          text: 'Tooltip on the top',
          position: 'top'
        } }
      </div><div class="centeredDiv">
        $$left{ tooltipConfig: {
          text: 'Tooltip on the left',
          position: 'left'
        } }
      </div><div class="centeredDiv">
        $$right{ tooltipConfig: {
          text: 'Tooltip on the right',
          position: 'right'
        } }
      </div><div class="centeredDiv">
        $$bottom{ tooltipConfig: {
          text: 'Tooltip on the bottom',
          position: 'bottom'
        } }
      </div><div class="centeredDiv">
        $$noArrow{ tooltipConfig: {
          text: 'Tooltip without arrow',
          noarrow: true
        } }
      </div><div class="centeredDiv">
        $$richText{ tooltipConfig: {
          html: 'Tooltip with <b>rich</b> <i>text</i>'
        } }
      </div><div class="centeredDiv">
        $$show{ tooltipConfig: {
          text: 'Tooltip always shown',
          show: true
        } }
      </div>
    */},
    function CSS() {/*
      .centeredDiv { cursor: pointer; width: 0; margin: 0 auto; }
    */}
  ]
});
