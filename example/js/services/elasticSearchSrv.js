/**
 * Created by etay on 9/26/15.
 */

app.factory('ElasticSearchService', ['$window', '$rootScope', '$log', '$rootScope' , 'es' , '$q', function ($window, $rootScope, $log , $rootScope , es , $q) {


    var INDEX = 'fuadindex';
    var USERS_TYPE = 'users';


    var searchRangedVideos = function(distance , lat , lon){
        var deferred = $q.defer();
        es.search({
            index: INDEX,
            type:  USERS_TYPE,
            size: 20,
            body: {
                "query":
                {
                    "filtered" : {
                        "filter" : {
                            "geo_distance" : {
                                "distance" : distance,
                                "userLocation" : {
                                    "lat" : lat,
                                    "lon" : lon
                                }
                            }
                        }

                    }
                }
            }
        }).then(function (response) {

            //$rootScope.allUserWithVideos = response.hits.hits;
            console.log("This is the all users with videos ",response.hits.hits);
            deferred.resolve(response.hits.hits);
        } , deferred.reject);

        return deferred.promise;
    }

    var login = function(userName , password){
        var deferred = $q.defer();
        es.search({
            index: INDEX,
            type: USERS_TYPE,
            size: 1,
            body: {
                "query":
                {
                    "bool" : {
                        "must" : [{
                            "match" : {
                                "name" : userName
                            }
                        }]
                    }
                }
            }

        }).then(function (response) {
            console.log("This is the response");
            console.log(response);
            if(response.hits.hits.length > 0 && response.hits.hits[0]._source.name == userName && response.hits.hits[0]._source.password == password){
                console.log("init current user");
                $rootScope.currentUser = response.hits.hits[0]._source;
                $rootScope.currentUserId = response.hits.hits[0]._id;
                //$rootScope.currentUser.playList = $rootScope.currentUser._source.playList;
            }else{
                deferred.resolve(false);
            }
            console.log("This is the current user ",$rootScope.currentUser);
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(showPosition);
            } else {

            }

            function showPosition(position) {
                if($rootScope.currentUser.userLocation == undefined){
                    $rootScope.currentUser.userLocation = {};
                }
                $rootScope.currentUser.userLocation.lat = position.coords.latitude;
                $rootScope.currentUser.userLocation.lon = position.coords.longitude;
                deferred.resolve($rootScope.currentUser);
                es.update({
                    index: INDEX,
                    type: USERS_TYPE,
                    id: $rootScope.currentUserId,
                    body: {
                        // put the partial document under the `doc` key
                        doc:
                            $rootScope.currentUser


                    }
                }, function (error, response) {
                    console.log("updated ? ",response);
                    //$scope.updateVideos()
                })



            }

        }, deferred.reject);
        return deferred.promise;
    }


    var updateObject = function(object){
        var deferred = $q.defer();
        console.log("updating object ",object);
        es.update({
            index: INDEX,
            type: USERS_TYPE,
            id: $rootScope.currentUserId,
            body: {
                // put the partial document under the `doc` key
                doc:
                    object

            }
        }, function (error, response) {
            console.log("update response ",response)
            deferred.resolve(response);


        })
        return deferred.promise;
    }

    return {
        updateObject: updateObject,
        searchRangedVideos:searchRangedVideos,
        login:login
    };
}]);
