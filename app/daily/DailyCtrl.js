'use strict';

angular.module('ceaselessLite')
  .controller('DailyCtrl', function ($scope, $http, ScriptureFactory, $window, APP_CONFIG) {
    $scope.scripture = 'Trust in the Lord with all your heart and lean not upon your own understanding (Proverbs 3:5-6)';
    $scope.chooseVerse = ScriptureFactory.chooseVerse;
    $scope.getText = $scope.chooseVerse(function (text, citation) {
      $scope.scripture = text;
      $scope.citation = citation;
    });
    $scope.getPrayerSuggestion = function (callback) {
      $http.get(APP_CONFIG.apiEndpoint+'suggestedWayToPray').success(function (suggestion) {
        $scope.suggestedWayToPray = suggestion.suggestion;
      });
    };
    $scope.getPrayerSuggestion();
    window.getText = $scope.getText;
    $scope.validToken = true;
    $scope.reauthorizationMessage = 'If you cannot see friend statuses or pictures, click here.';
    $scope.friends = [
      {id: 123, name: 'Chris Armas', prayedFor: false, img: 'http://photos4.meetupstatic.com/photos/member/b/2/2/2/thumb_190185602.jpeg', statuses: [
        'please pray for the technologists and entrepreneurs coming to Code for the Kingdom this weekend.'],
        prayedForDate: new Date() - 1000000000,
        contactInfo:{'mobile':'111-111-1111', 'email': 'chris.armas@leadnet.org'},
        invited: true
      },
      {
        id: 321, name: 'Troy Carl', prayedFor: false, img: 'http://sf.codeforthekingdom.org/wp-content/uploads/sites/6/2014/04/troy-d5068815e8342b969b22239f8232b903-185x170.png',
        statuses: ['excited to see how developers spread the word of God in China #c4tk'],
        prayedForDate: '2014-04-25T01:32:21.196Z',
        contactInfo:{},
        invited: false
      },
      {
        id: 456,
        name: 'Kim-Fu Lim', prayedFor: false, img: 'http://pray.theotech.org/c4tk/images/kim-fu.jpg', statuses:
        [
        'VMWare is awesome!'
        ],
        prayedForDate: '',
        contactInfo:{'email': 'kimfu.lim@gmail.com'},
        invited: false
      }
    ];

    $scope.prayedForYou = [
      {id: 124, name: 'Nancy Ortberg', img: 'http://sf.codeforthekingdom.org/wp-content/blogs.dir/6/files/2014/05/NOrtberg-Head-Arm-4c-995ce02aefca75558dc0f21418e63539-185x170.jpg'},
      {id:152, name: 'Kent Shaffer', img: 'http://sf.codeforthekingdom.org/wp-content/blogs.dir/6/files/2014/05/2012-12-Kent-Shaffer-color-square-3cc9e9d43580d9363e78a64207fd2213-185x170.jpg'}
    ];

    $scope.noStatusMessage = 'No statuses available';
    $scope.prayedToday = false;
    $scope.saveNote = function () {
      $scope.savedNote = true;
      $scope.statuses.push($scope.newNote);
    };

    $scope.prayed = function () {
      $scope.prayedToday = true;
      $window.scrollTo(0,0);
    };
  });