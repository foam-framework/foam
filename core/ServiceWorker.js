console.log('ServiceWorker Support');
navigator.serviceWorker.register('../core/sw.js', {
  scope: '/'
}).then(function() {
  console.log('Service Worker registered.');
}).catch(function(err) {
  console.log('Service Worker Error: ', err.toString());
});