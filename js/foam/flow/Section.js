CLASS({
  name: 'Section',
  extendsModel: 'View',

  properties: [
    {
      name: 'title'
    },
    {
      name: 'inner'
    },
  ],

  templates: [
    function toHTML() {/*<div class="flow-section">$$body</div>*/}
  ]
});