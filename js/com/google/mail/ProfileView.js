CLASS({
  name: 'ProfileView',
  package: 'com.google.mail',
  extendsModel: 'DetailView',
  requires: ['com.google.mail.GMailUserInfo'],
  properties: [
    {
      model_: 'ModelProperty',
      name: 'model',
      factory: function() { return this.GMailUserInfo; }
    }
  ],
  templates: [
    function toHTML() {/*
      <div id="%%id">
        $$avatarUrl{ model_: 'ImageView' }
        $$name{ mode: 'read-only',  extraClassName: 'name' }
        $$email{ mode: 'read-only', extraClassName: 'email' }
      </div>
    */}
  ]
});
