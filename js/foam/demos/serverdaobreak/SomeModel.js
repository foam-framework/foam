CLASS({
  name: 'SomeModel',
  package: 'foam.demos.serverdaobreak',
  traits: [
    'foam.core.dao.SyncTrait',
  ],
  properties: [
    'id',
    'from',
    'subject',
    'body',
  ],
});
