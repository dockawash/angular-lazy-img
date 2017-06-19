angular.module('angularLazyImg').factory('lazyImgHelpers', [
  '$window', '$timeout', function($window, $timeout){
    'use strict';

    function getWinDimensions(){
      return {
        height: $window.innerHeight,
        width: $window.innerWidth
      };
    }

    function isElementInView(elem, offset, winDimensions, src) {
      if (!elem.is(':visible')) return false;
      var rect = elem[0].getBoundingClientRect();
      var bottomline = winDimensions.height + offset;
      var rightline = winDimensions.width + offset;
      var isInView = (
        !angular.equals(rect, {top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0})
        && (rect.left >= 0 - offset && rect.left <= rightline || rect.right >= 0 - offset && rect.right <= rightline)
        && (rect.top >= 0 - offset && rect.top <= bottomline || rect.bottom >= 0 - offset && rect.bottom <= bottomline)
      );
      return isInView;
    }

    // http://remysharp.com/2010/07/21/throttling-function-calls/
    function throttle(fn, threshhold, scope) {
      var last, deferTimer;
      return function () {
        var context = scope || this;
        var now = +new Date(),
            args = arguments;
        if (last && now < last + threshhold) {
          // clearTimeout(deferTimer);
          $timeout.cancel(deferTimer);
          // deferTimer = setTimeout(function () {
          deferTimer = $timeout(function () {
            last = now;
            fn.apply(context, args);
          }, threshhold);
        } else {
          last = now;
          fn.apply(context, args);
        }
      };
    }

    return {
      isElementInView: isElementInView,
      getWinDimensions: getWinDimensions,
      throttle: throttle
    };

  }
]);
