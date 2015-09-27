angular.module('starter.controllers', [])

    .controller('DashCtrl', function ($scope, $rootScope, VideosService) {

    })
    .controller('LoginCtrl', function ($scope, $rootScope, VideosService , $rootScope , $location) {
        $scope.userName = "Fuad The 1st";
        $scope.password = "Fuad";

//        $rootScope.parseLogin = function (userName, password) {
//            Parse.User.logIn(userName, password, {
//                success: function (user) {
//                    $rootScope.currentParseUser = user;
//                    $rootScope.initCurrentUserData();
//                    $location.url('/tab/chats');
//
//                },
//                error: function (user, error) {
//                    console.log("Login Error ? ", error);
//                }
//            });
//
//        }
    })

    .controller('MainCtrl', function ($scope, $ionicModal, ElasticSearchService, $rootScope, VideosService, $log, $location) {


//        ElasticSearchService.login("FuadUser35", "avinimni").then(function (result) {
//            console.log("This is my login result ", result);
//            console.log("User Log in ", $rootScope.currentUser);
//            $scope.updateVideos();
//        });

        $rootScope.initCurrentUserData = function () {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(showPosition);
            } else {

            }

            function showPosition(position) {
//                        if($rootScope.currentParseUser.userLocation == undefined){
//                            $rootScope.currentParseUser.userLocation = {};
//                        }

                var point = new Parse.GeoPoint({latitude: position.coords.latitude, longitude: position.coords.longitude});
                $rootScope.currentParseUser.set("userLocation", point);
                console.log("Trting to save ?");
                $rootScope.currentParseUser.save();
                console.log("Setting Parse USer ", $rootScope.currentParseUser);

// Create a query for places
                var query = new Parse.Query("_User");
// Interested in locations near user.
                query.near("userLocation", point);
// Limit what could be a lot of points.
                query.limit(10);
// Final list of objects
                query.find({
                    success: function (placesObjects) {
                        console.log("Place Objects ? ", placesObjects);
                        $rootScope.rangedVideos = placesObjects;
                    },
                    error: function (error) {
                        console.log("Place Objects ERRRRRRORRRRRR? ", error);
                    }
                });

//                        if($rootScope.currentUser.searchRangeDistance == undefined){
//                            $rootScope.currentUser.searchRangeDistance = 10;
//                        }
//
//                        if($rootScope.currentUser.playList == undefined){
//                            $rootScope.currentUser.playList = [];
//                        }


            }
        }

        Parse.initialize("La50BQc9X1fu8ogp1KwHSRzSc3Tw3SfkpDQTVWsc", "h6aicGGyly7OBgujsLD3aPIPWP7dmhpymYo2xbcw");
        var point;
        Parse.User.logOut();
        var currentUser = Parse.User.current();
        console.log("I HAVE CURRENT USER ? ", currentUser);
        if (currentUser) {
            $rootScope.currentParseUser = currentUser;
            $rootScope.initCurrentUserData();
            console.log("live video ? ", currentUser.get("liveVideo"));
        } else {
           // console.log("Stating ? 1?!?!?!?!?!??!?!!?");
           // $location.url('/login');
            $rootScope.parseLogin("Fuad The 1st" , "Fuad");
        }

        $rootScope.parseLogin = function (userName, password) {
            Parse.User.logIn(userName, password, {
                success: function (user) {
                    $rootScope.currentParseUser = user;
                    $rootScope.initCurrentUserData();
                    //$location.url('/tab/chats');

                },
                error: function (user, error) {
                    console.log("Login Error ? ", error);
                }
            });

        }


        /*

         /*
         user.signUp(null, {
         success: function(user) {
         $rootScope.currentParseUser = user;
         console.log($rootScope.currentParseUser);
         },
         error: function(user, error) {
         // Show the error message somewhere and let the user try again.
         console.log("Error: " + error.code + " " + error.message);
         }
         });
         */
        var query = new Parse.Query("Monsters");
        query.equalTo("name", "Frankeistein");
        query.first()
            .then(function (result) {
                $scope.monsters = result;
            });

        $scope.updateSetting = function () {
            console.log($rootScope.currentUser.searchRangeDistance);
//            ElasticSearchService.updateObject($rootScope.currentUser).then(function(result){
//                console.log("Update Settings ",result);
//            });
        }

        $scope.updateVideos = function () {
            /*
             ElasticSearchService.searchRangedVideos($rootScope.currentUser.searchRangeDistance+"km" , $rootScope.currentUser.userLocation.lat , $rootScope.currentUser.userLocation.lon).then(function(result){
             console.log("This is my service result (All Users With Videos )" ,result);
             $rootScope.allUserWithVideos = result;
             });
             */
        }

        $scope.getImageDegree = function (index) {
            return 360 / $rootScope.rangedVideos.length * index;
        }

        $scope.launch = function (video, archive) {
            $rootScope.currentUser.liveVideo = video;
            /*
             if(VideosService.getYoutube().state ==='playing'){
             VideosService.getYoutube().player.stopVideo()
             }
             */


//            ElasticSearchService.updateObject($rootScope.currentUser).then(function(result){
//                console.log("Update live video ",result);
//            });

            $rootScope.currentParseUser.set('liveVideo', video);
            $rootScope.currentParseUser.save();
            console.log("current parse user UPDATED ? ", $rootScope.currentParseUser);
            console.log("Lunching Video ", video);
            VideosService.launchPlayer(video.id, video.title);
            $scope.playerState = 'playing';
            if (archive) {
                VideosService.archiveVideo(video);
            }
            $log.info('Launched id:' + video.id + ' and title:' + video.title);
        };


    })

    .controller('ChatsCtrl', function ($scope, Chats, $log, VideosService, $http, $rootScope, $ionicModal, es, ElasticSearchService) {
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
            console.log("This is the resultssss....", $scope.youtube);
            $scope.history = VideosService.getHistory();
        }

        init();

        $scope.addVideoToFav = function (video) {
            var found = false;
            var index = null;


            if ($rootScope.currentParseUser.attributes.favourites == undefined) {
                $rootScope.currentParseUser.attributes.favourites = [];
            }


            for (var i = 0; i < $rootScope.currentParseUser.attributes.favourites.length; i++) {
                if ($rootScope.currentParseUser.attributes.favourites[i].id == video.id) {
                    found = true;
                    index = i;
                    console.log("SPLICING!!!!!!!!");
                }
            }

            if (found) {
                $rootScope.currentParseUser.attributes.favourites.splice(index, 1);
            } else {
                console.log("Adding");
                $rootScope.currentParseUser.attributes.favourites.push(video);
                console.log($rootScope.currentParseUser);
            }

            $rootScope.currentParseUser.save();
//            ElasticSearchService.updateObject($rootScope.currentUser).then(function(result){
//                console.log("Update Playlist result ",result);
//            });
        }

        $scope.isFavo = function (video) {

            for (var i = 0; i < $rootScope.currentParseUser.attributes.favourites.length; i++) {
                if ($rootScope.currentParseUser.attributes.favourites[i].id == video.id) {
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
                .success(function (data) {
                    if (data.items.length === 0) {
                        $scope.label = 'No results were found!';
                    }
                    VideosService.listResults(data, $scope.nextPageToken && !isNewQuery);
                    $scope.nextPageToken = data.nextPageToken;
                    $log.info(data);
                })
                .error(function () {
                    $log.info('Search error');
                })
                .finally(function () {
                    $scope.loadMoreButton.stopSpin();
                    $scope.loadMoreButton.setDisabled(false);
                    $scope.loading = false;
                })
            ;
        };

        $scope.chats = Chats.all();
        $scope.remove = function (chat) {
            Chats.remove(chat);
        };
    })

    .controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
        $scope.chat = Chats.get($stateParams.chatId);
    })

    .controller('AccountCtrl', function ($scope) {
        $scope.settings = {
            enableFriends: true
        };
    });
