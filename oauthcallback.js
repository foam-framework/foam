window.onload = function() {
  var hash = window.location.hash.substr(1);
  var chunks = hash.split('&');

  var params = {};
  var callbackid;

  for (var i = 0; i < chunks.length; i++) {
    var parts = chunks[i].split('=');
    if (parts[0] == 'state') callbackid = decodeURIComponent(parts[1]);
    else if (parts[0] == 'access_token') params.token = decodeURIComponent(parts[1]);
    else if (parts[0] == 'token_type') params.type = decodeURIComponent(parts[1]);
    else if (parts[0] == 'expires_in') params.expire = decodeURIComponent(parts[1]);
  }

  if (!callbackid) {
    console.log('No callback id returned');
  }

  window.opener['__oauth_' + callbackid](params);
  window.close();
};
