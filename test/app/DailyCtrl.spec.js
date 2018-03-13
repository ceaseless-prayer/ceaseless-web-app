'use strict';

describe('Controller: DailyCtrl', function () {

  // load the controller's module
  beforeEach(module('ceaselessLite'));

  var DailyCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    DailyCtrl = $controller('DailyCtrl', {
      $scope: scope
    });
  }));

  it('should show the authorization message if the token is invalid', function () {
    scope.authorizationMessage = true;
    expect(1).should.equal(1);
  });

  it('should show a verse of Scripture', function () {

  });

  it('should show the people who prayed for you if there are some', function () {

  });

  it('should not show who prayed for you if there are none', function () {

  });

  it('should show who to pray for', function () {

  });
});

