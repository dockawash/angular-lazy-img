angular.module('angularLazyImg')
  .directive('lazyImg', [
    '$rootScope', 'LazyImgMagic', function ($rootScope, LazyImgMagic) {
      'use strict';

      function link(scope, element, attributes) {
        var lazyImage = new LazyImgMagic(element);
        var cancelObserver = attributes.$observe('lazyImg', function (newSource) {
          if (newSource) {
            lazyImage.setSource(newSource);
            cancelObserver();
          }
        });
        // scope.$on('$destroy', function () {
        //   lazyImage.removeImage();
        // });
        var cancelForce = scope.$on('lazyImg:forceLoad', function () {
          lazyImage.forceLoadImage();
          cancelForce();
        });
      }

      return {
        link: link,
        restrict: 'A'
      };
    }
  ])
  .directive('lazyImgContainer', [
    'LazyImgMagic', function (LazyImgMagic) {
      'use strict';

      function link(scope, element) {
        LazyImgMagic.addContainer(element);
        scope.$on('$destroy', function () {
          LazyImgMagic.removeContainer(element);
        });
      }

      return {
        link: link,
        restrict: 'A'
      };
    }
  ]);
