'use strict';
/**
 * Customized from this
 * {@link https://ryankaskel.com/blog/2013/05/27/a-different-approach-to-angularjs-navigation-menus}
 **/
angular.module('ceaselessLite')
    .directive('navMenu', function ($location, $modal, UserService) {
      return {
        replace: false,
        restrict: 'A',
        link: function (scope, element, attrs) {
          var links = element.find('a'),
              onClass = attrs.navMenu || 'on',
              routePattern,
              link,
              url,
              currentLink,
              urlMap = {},
              i;

          if (!$location.$$html5) {
            routePattern = /^#[^/]*/;
          }

          for (i = 0; i < links.length; i++) {
            link = angular.element(links[i]);
            url = link.attr('ng-href');
            if (!angular.isUndefined(url)) {
              if ($location.$$html5) {
                urlMap[url] = link;
              } else {
                urlMap[url.replace(routePattern, '')] = link;
              }
            }
          }

          var updateNavigation = function () {
            var pathLink = urlMap[$location.path()];
            if (pathLink) {
              if (currentLink) {
                currentLink.parent().removeClass(onClass);
              }
              currentLink = pathLink;
              currentLink.parent().addClass(onClass);
            }
          };

          scope.$on('$routeChangeStart', updateNavigation);

          // methods dealing with the login dialog
          var modalInstance = null;
          var showLogin = function () {
            modalInstance = $modal.open({
              templateUrl: 'user/login.html',
              controller: 'LoginCtrl',
              windowClass: 'login-form'
            });
          };
          scope.showLogin = showLogin;

          scope.$on('event:auth-loginRequired', function () {
            showLogin();
          });

          var hideLogin = function () {
            modalInstance.close();
          };
          scope.hideLogin = hideLogin;

          scope.$on('event:auth-loginConfirmed', function () {
            hideLogin();
          });

          scope.isAuthenticated = UserService.isAuthenticated;

          scope.logout = UserService.logout;
        }
      };
    });
