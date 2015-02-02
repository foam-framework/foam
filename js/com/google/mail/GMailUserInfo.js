CLASS({
  name: 'GMailUserInfo',
  package: 'com.google.mail',
  properties: ['email', 'name', 'avatarUrl'],
  methods: {
    fromJSON: function(obj) {
      this.email = obj.email;
      this.name = obj.name;
      this.avatarUrl = obj.picture + '?sz=50';
    }
  }
});
