
angular.module('myApp')

// Controller

.controller('VideosController', function ($scope, $http, $log, VideosService , es , $rootScope , $interval , ElasticSearchService  , $ionicModal) {

    init();

        $scope.updateVideos = function() {
            ElasticSearchService.searchRangedVideos("200km" , $rootScope.currentUser.userLocation.lat , $rootScope.currentUser.userLocation.lon).then(function(result){
                console.log("This is my service result (All Users With Videos )" ,result);
                $rootScope.allUserWithVideos = result;
            });
        }

       // $interval( function(){ $scope.updateVideos(); }, 30000);




        ElasticSearchService.login("FuadUser3" , "avinimni").then(function(result){
           console.log("This is my login result ",result);
            $scope.updateVideos();
        });



    function init() {
      $scope.youtube = VideosService.getYoutube();
      $scope.results = VideosService.getResults();
      console.log("This is the resultssss....");
      $scope.history = VideosService.getHistory();
    }

    $scope.launch = function (video, archive) {
        if(VideosService.getYoutube().state ==='playing'){
            VideosService.getYoutube().player.stopVideo()
        }
        console.log("Youtube service ? ",VideosService.getYoutube().state);
        $rootScope.currentUser.liveVideo = video;
        if($rootScope.currentUser.playList == undefined){
            $rootScope.currentUser.playList = [];
        }
        $rootScope.currentUser.playList.push(video);

        ElasticSearchService.updateObject($rootScope.currentUser).then(function(result){
           console.log("Update Playlist result ",result);
        });

        /*
        es.update({
            index: 'fuadindex',
            type: 'users',
            id: $rootScope.currentUser._id,
            body: {
                // put the partial document under the `doc` key
                doc:
                    $rootScope.currentUser

            }
        }, function (error, response) {
            // ...
        })
        */
        console.log("Lunching Video ",video);
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
});