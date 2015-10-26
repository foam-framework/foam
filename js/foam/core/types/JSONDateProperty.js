/**
 * @fileoverview Combination of DateProperty and JSONPropertyTrait.
 */
CLASS({
  package: 'foam.core.types',
  name: 'JSONDateProperty',
  extends: 'DateProperty',
  traits: ['foam.core.types.JSONPropertyTrait'],
  constants: {
    DAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  }
});
