console.log("SW startup");

this.addEventListener('install', function(e) {
  console.log("SW installed");
  e.waitUntil(caches.create('v1'));
});

this.addEventListener('activate', function(e) {
  console.log("SW activated");
});

this.addEventListener('fetch', function(e) {
  console.log("fetch: ", e, e.request.url);

  e.respondWith(
    // Check to see if request is found in cache
    caches.match(e.request).catch(function() {
      console.log('CacheMiss: ', e.request.url);
      // It's not? Prime the cache and return the response.
      return caches.get("v1").then(function(cache) {
        return fetch(e.request).then(function(response) {
          cache.put(e.request, response);
          return response;
        });
      });
    }).catch(function() {
      // Connection is down? Simply fallback to a pre-cached page.
      return caches.match("/fallback.html");
    }));
});
