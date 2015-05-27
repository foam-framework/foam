function ps(_, v) { return v ? v.intern() : v ; }

CLASS({
  package: 'foam.demos.olympics',
  name: 'Medal',

  properties: [
    { name: 'id',          hidden: true },
    { name: 'city',        preSet: ps },
    { name: 'color',       preSet: ps, defaultValue: 'Gold' },
    { name: 'country',     preSet: ps },
    { name: 'discipline',  preSet: ps },
    { name: 'eventGender', preSet: ps, defaultValue: 'M' },
    { name: 'firstName',   preSet: ps },
    { name: 'gender',      preSet: ps, defaultValue: 'Men' },
    { name: 'lastName',    preSet: ps },
    { name: 'sport',       preSet: ps },
    { model_: 'IntProperty', name: 'year',        preSet: ps }
  ]
});
