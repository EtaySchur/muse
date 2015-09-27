angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope , $rootScope , VideosService) {

    })

.controller('MainCtrl', function($scope , $ionicModal , ElasticSearchService , $rootScope , VideosService , $log) {
        ElasticSearchService.login("FuadUser35" , "avinimni").then(function(result){
            console.log("This is my login result ",result);
            console.log("User Log in ",$rootScope.currentUser);
            $scope.updateVideos();
        });

        $scope.updateSetting = function(){
            console.log($rootScope.currentUser.searchRangeDistance);
            ElasticSearchService.updateObject($rootScope.currentUser).then(function(result){
                console.log("Update Settings ",result);
            });
        }

        $scope.updateVideos = function() {
            ElasticSearchService.searchRangedVideos($rootScope.currentUser.searchRangeDistance+"km" , $rootScope.currentUser.userLocation.lat , $rootScope.currentUser.userLocation.lon).then(function(result){
                console.log("This is my service result (All Users With Videos )" ,result);
                $rootScope.allUserWithVideos = result;
            });
        }

        $scope.getImageDegree = function(index){
                return 360 / $rootScope.allUserWithVideos.length * index;
        }

        $scope.launch = function (video, archive) {
            $rootScope.currentUser.liveVideo = video;
            /*
             if(VideosService.getYoutube().state ==='playing'){
             VideosService.getYoutube().player.stopVideo()
             }
             */


            ElasticSearchService.updateObject($rootScope.currentUser).then(function(result){
                console.log("Update live video ",result);
            });

            console.log("Lunching Video ",video);
            VideosService.launchPlayer(video.id, video.title);
            $scope.playerState = 'playing';
            if (archive) {
                VideosService.archiveVideo(video);
            }
            $log.info('Launched id:' + video.id + ' and title:' + video.title);
        };



    })

.controller('ChatsCtrl', function($scope, Chats , $log , VideosService , $http , $rootScope , $ionicModal , es , ElasticSearchService) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});



        $scope.nextPageToken = '';
        $scope.label = 'You haven\'t searched for any video yet!';
        $scope.loading = false;




        function init() {
            $scope.query = 'guy gerber';
            $scope.youtube = VideosService.getYoutube();
            $scope.results = VideosService.getResults();
            console.log("This is the resultssss...." , $scope.youtube);
            $scope.history = VideosService.getHistory();
        }

        init();

        $scope.addVideoToFav = function(video){
            var found = false;
            var index = null;


            if($rootScope.currentUser.playList == undefined){
                $rootScope.currentUser.playList = [];
            }


            for(var i = 0 ; i < $rootScope.currentUser.playList.length ; i++){
                if($rootScope.currentUser.playList[i].id == video.id){
                    found =  true;
                    index = i;
                }
            }

            if(found){
                $rootScope.currentUser.playList.splice( index , 1);
            }else{
                $rootScope.currentUser.playList.push(video);
            }


            ElasticSearchService.updateObject($rootScope.currentUser).then(function(result){
                console.log("Update Playlist result ",result);
            });
        }

        $scope.isFavo = function(video){
            for(var i = 0 ; i < $rootScope.currentUser.playList.length ; i++){
                if($rootScope.currentUser.playList[i].id == video.id){
                    return true;
                }
            }

            return false;
        }




        $scope.search = function (isNewQuery) {
            console.log("Searching ?");
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

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
