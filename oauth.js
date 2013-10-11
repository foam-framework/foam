var OAuth2 = FOAM({
  model_: 'Model',

  name: 'OAuth2',
  label: 'OAuth 2.0',


  properties: [
    {
      name: 'accesstoken'
    },
    {
      name: 'refreshtoken'
    },
    {
      name: 'authcode',
      postSet: function(oldValue, newValue) {
        this.updateRefreshToken_();
      }
    },
    {
      name: 'clientid',
      required: true
    },
    {
      name: 'clientsecret',
      required: true
    },
    {
      name: 'scope',
      required: true
    },
    {
      name: 'endpoint',
      type: 'String',
      defaultValue: "https://accounts.google.com/o/oauth2/auth"
    }
  ],

  methods: {
    updateRefreshToken_: function() {
      var postdata = [
        'code=' + (this.authcode),
        'client_id=' + (this.clientid),
        'client_secret=' + (this.clientsecret),
        'grant_type=authorization_code'
      ];

      var xhr = new XMLHttpRequest();
      xhr.open("POST", this.endpoint);
      aseq(
        function(ret) {
          xhr.asend(ret, postdata.join('&'));
        },
        function() {
          console.log('auth result: ' + xhr.responseText);
        })();
    },

    auth: function() {
/*      var queryparams = [
        '?response_type=code',
        'client_id=' + encodeURIComponent(this.clientid),
        'redirect_uri=urn:ietf:wg:oauth:2.0:oob',
        'scope=' + encodeURIComponent(this.scope)
      ];*/
      var queryparams = [
        '?response_type=token',
        'client_id=' + encodeURIComponent(this.clientid),
        'redirect_uri=http://localhost:8080/oauth2callback',
        'scope=' + encodeURIComponent(this.scope)
      ];
      window.open(this.endpoint + queryparams.join('&'));
    }
  }
});
