/**
 * @fileoverview Trait for properties with a custom path in JSON format.
 */
CLASS({
  package: 'foam.core.types',
  name: 'JSONPropertyTrait',
  properties: [
    {
      name: 'jsonPath',
      defaultValue: null,
      adapt: function(old, nu) {
        return typeof nu === 'string' ? [nu] : nu;
      }
    },
  ],

  methods: [
    function fromJSON(obj, json) {
      if (this.jsonPath && this.jsonPath.length) {
        for (var i = 0; i < this.jsonPath.length; i++) {
          json = json[this.jsonPath[i]];
          if (typeof json === 'undefined') return;
        }
        obj[this.name] = json;
      }
    },
  ]
});
