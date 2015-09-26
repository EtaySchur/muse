
var app = angular.module('myApp', ['onsen' , 'elasticsearch']);

// Run

app.run(function ($rootScope) {
  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);



});

// Config

app.config( function ($httpProvider) {
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
});



app.service('es', function (esFactory) {
    return esFactory({ host: 'localhost:9200' });
});

// Service



