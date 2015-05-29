function ps(_, v) { return v ? v.intern() : v ; }

CLASS({
  package: 'foam.demos.olympics',
  name: 'Medal',

  properties: [
    { name: 'id',          hidden: true },
    { name: 'city',        preSet: ps },
    {
      name: 'color',
      preSet: ps,
      defaultValue: 'Gold',
      compareProperty: function(o1, o2) {
        if ( o1 === o2       ) return  0;
        if ( o1 === 'Gold'   ) return -1;
        if ( o1 === 'Bronze' ) return  1;
        return -1;
      }
    },
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
