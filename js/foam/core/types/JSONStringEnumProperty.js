/**
 * @fileoverview Combination of StringEnumProperty and JSONPropertyTrait.
 */
CLASS({
  package: 'foam.core.types',
  name: 'JSONStringEnumProperty',
  extends: 'foam.core.types.StringEnumProperty',
  traits: ['foam.core.types.JSONPropertyTrait']
});
