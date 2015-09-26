
// We define an EsConnector module that depends on the elasticsearch module.     
var EsConnector = angular.module('EsConnector', ['elasticsearch' , 'youtube-embed' , 'onsen']);

// Create the es service from the esFactory
EsConnector.service('es', function (esFactory) {
  return esFactory({ host: 'localhost:9200' });
});


EsConnector.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
}
]);

EsConnector.run(function () {
    var tag = document.createElement('script');
    tag.src = "http://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
});


// We define an Angular controller that returns the server health
// Inputs: $scope and the 'es' service

EsConnector.controller('ServerHealthController', function($scope, es) {

    es.cluster.health(function (err, resp) {
        if (err) {
            $scope.data = err.message;
        } else {
            $scope.data = resp;
        }
    });
});

// We define an Angular controller that returns query results,
// Inputs: $scope and the 'es' service

EsConnector.controller('QueryController', function($scope, es , $window , VideosService , $http , $log) {

    init();

    function init() {
        $scope.youtube = VideosService.getYoutube();
        $scope.results = VideosService.getResults();
        $scope.history = VideosService.getHistory();
    }

    $scope.launch = function (video, archive) {
        VideosService.launchPlayer(video.id, video.title);
        if (archive) {
            VideosService.archiveVideo(video);
        }
        $log.info('Launched id:' + video.id + ' and title:' + video.title);
    };

    $scope.nextPageToken = '';
    $scope.label = 'You haven\'t searched for any video yet!';
    $scope.loading = false;

    $scope.search = function (isNewQuery) {
        $scope.loading = true;
        $http.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                key: 'AIzaSyDG0JEUeRnLKk93qOazUSmJ-RkSxSsMwJs',
                type: 'video',
                maxResults: '10',
                pageToken: isNewQuery ? '' : $scope.nextPageToken,
                part: 'id,snippet',
                fields: 'items/id,items/snippet/title,items/snippet/description,items/snippet/thumbnails/default,items/snippet/channelTitle,nextPageToken',
                q: this.query
            }
        })
            .success( function (data) {
                if (data.items.length === 0) {
                    $scope.label = 'No results were found!';
                }
                VideosService.listResults(data, $scope.nextPageToken && !isNewQuery);
                $scope.nextPageToken = data.nextPageToken;
                $log.info(data);
            })
            .error( function () {
                $log.info('Search error');
            })
            .finally( function () {
                $scope.loadMoreButton.stopSpin();
                $scope.loadMoreButton.setDisabled(false);
                $scope.loading = false;
            })
        ;
    };

    $scope.url = 'https://www.youtube.com/watch?v=7SnG9xC2yoY';
// search for documents
    es.search({
    index: 'fuadindex',
    type:'users',
    size: 50,
    body: {
    "query":
        {
            "match": {
                name:"fuad"
            }   
        }
    }
       
    }).then(function (response) {
      console.log("This is my response ",response);
      $scope.hits = response.hits.hits;
    });




}).controller('VideosController', function ($scope, $http, $log, VideosService) {

    init();

    function init() {
        $scope.youtube = VideosService.getYoutube();
        $scope.results = VideosService.getResults();
        console.log("This is the resultssss....");
        $scope.history = VideosService.getHistory();
    }

    $scope.launch = function (video, archive) {
        VideosService.launchPlayer(video.id, video.title);
        if (archive) {
            VideosService.archiveVideo(video);
        }
        $log.info('Launched id:' + video.id + ' and title:' + video.title);
    };

    $scope.nextPageToken = '';
    $scope.label = 'You haven\'t searched for any video yet!';
    $scope.loading = false;

    $scope.search = function (isNewQuery) {
        $scope.loading = true;
        $http.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                key: 'AIzaSyDiByKCET1fLAuBHJL462BXx2lnKXce6so',
                type: 'video',
                maxResults: '10',
                pageToken: isNewQuery ? '' : $scope.nextPageToken,
                part: 'id,snippet',
                fields: 'items/id,items/snippet/title,items/snippet/description,items/snippet/thumbnails/default,items/snippet/channelTitle,nextPageToken',
                q: this.query
            }
        })
            .success( function (data) {
                if (data.items.length === 0) {
                    $scope.label = 'No results were found!';
                }
                VideosService.listResults(data, $scope.nextPageToken && !isNewQuery);
                $scope.nextPageToken = data.nextPageToken;
                $log.info(data);
            })
            .error( function () {
                $log.info('Search error');
            })
            .finally( function () {
                $scope.loadMoreButton.stopSpin();
                $scope.loadMoreButton.setDisabled(false);
                $scope.loading = false;
            })
        ;
    };
});



EsConnector.service('VideosService', ['$window', '$rootScope', '$log', function ($window, $rootScope, $log) {

    var service = this;

    var youtube = {
        ready: false,
        player: null,
        playerId: null,
        videoId: null,
        videoTitle: null,
        playerHeight: '100%',
        playerWidth: '100%',
        state: 'stopped'
    };
    var results = [];
    var history = [];

    $window.onYouTubeIframeAPIReady = function () {
        $log.info('Youtube API is ready');
        youtube.ready = true;
        service.bindPlayer('placeholder');
        service.loadPlayer();
        $rootScope.$apply();
    };

    this.bindPlayer = function (elementId) {
        $log.info('Binding to ' + elementId);
        youtube.playerId = elementId;
    };

    this.createPlayer = function () {
        $log.info('Creating a new Youtube player for DOM id ' + youtube.playerId + ' and video ' + youtube.videoId);
        return new YT.Player(youtube.playerId, {
            height: youtube.playerHeight,
            width: youtube.playerWidth,
            playerVars: {
                rel: 0,
                showinfo: 0
            }
        });
    };

    this.loadPlayer = function () {
        if (youtube.ready && youtube.playerId) {
            if (youtube.player) {
                youtube.player.destroy();
            }
            youtube.player = service.createPlayer();
        }
    };

    this.launchPlayer = function (id, title) {
        youtube.player.loadVideoById(id);
        youtube.videoId = id;
        youtube.videoTitle = title;
        return youtube;
    }

    this.listResults = function (data, append) {
        if (!append) {
            results.length = 0;
        }
        for (var i = data.items.length - 1; i >= 0; i--) {
            results.push({
                id: data.items[i].id.videoId,
                title: data.items[i].snippet.title,
                description: data.items[i].snippet.description,
                thumbnail: data.items[i].snippet.thumbnails.default.url,
                author: data.items[i].snippet.channelTitle
            });
        }
        return results;
    }

    this.archiveVideo = function (video) {
        history.unshift(video);
        return history;
    };

    this.getYoutube = function () {
        return youtube;
    };

    this.getResults = function () {
        return results;
    };

    this.getHistory = function () {
        return history;
    };

}]);

