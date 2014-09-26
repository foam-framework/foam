
document.addEventListener('DOMContentLoaded', function(e) {
  var url = window.location.search; // Takes the form ?url=$URL, but encoded.
  url = decodeURIComponent(url.substring(5));
  var question = url.indexOf('?');
  if ( question < 0 ) {
    url = url + '?no_qbug=1';
  } else {
    url = url.substring(0, question) + '?no_qbug=1&' + url.substring(question+1);
  }
  document.getElementById('link').textContent = url;
  document.getElementById('link').href = url;
});

