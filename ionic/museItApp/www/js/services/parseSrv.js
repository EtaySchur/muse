/**
 * Created by etay on 9/27/15.
 */

app.factory('ParseSDK', function() {

        // pro-tip: swap these keys out for PROD keys automatically on deploy using grunt-replace
        Parse.initialize("La50BQc9X1fu8ogp1KwHSRzSc3Tw3SfkpDQTVWsc", "h6aicGGyly7OBgujsLD3aPIPWP7dmhpymYo2xbcw");

        /*
        // FACEBOOK init
        window.fbPromise.then(function() {

            Parse.FacebookUtils.init({

                // pro-tip: swap App ID out for PROD App ID automatically on deploy using grunt-replace
                appId: 481650395275919, // Facebook App ID
                channelUrl: 'http://brandid.github.io/parse-angular-demo/channel.html', // Channel File
                cookie: true, // enable cookies to allow Parse to access the session
                xfbml: true, // parse XFBML
                frictionlessRequests: true // recommended

            });

        });
        */

    });
