/*
 * angular-lazy-load
 *
 * Copyright(c) 2014 Paweł Wszoła <wszola.p@gmail.com>
 * MIT Licensed
 *
 */

/**
 * @author Paweł Wszoła (wszola.p@gmail.com)
 *
 */

angular.module('angularLazyImg', []);

angular.module('angularLazyImg').factory('LazyImgMagic', [
  '$window', '$rootScope', 'lazyImgConfig', 'lazyImgHelpers', '$timeout',
  function($window, $rootScope, lazyImgConfig, lazyImgHelpers, $timeout){
    'use strict';

    var winDimensions, $win, images, imagesLoaded, imagesInLoad, isListening, options;
    var checkImagesT, saveWinOffsetT, containers;

    imagesLoaded = [];
    imagesInLoad = 0;
    images = [];
    isListening = false;
    options = lazyImgConfig.getOptions();
    $win = angular.element($window);
    winDimensions = lazyImgHelpers.getWinDimensions();
    saveWinOffsetT = lazyImgHelpers.throttle(function(){
      winDimensions = lazyImgHelpers.getWinDimensions();
    }, options.delayWin);
    containers = [options.container || $win];

    var runCheckCancel = $rootScope.$on('lazyImg.runCheck', function () {
      checkImages();
    });
    var refreshCancel = $rootScope.$on('lazyImg:refresh', function () {
      checkImages();
    });
    var resetCancel = $rootScope.$on('lazyImg:reset', function () {
      resetLazy();
    });

    function checkImages(){
      for(var i = images.length - 1; i >= 0; i--){
        var image = images[i];
        if(image && lazyImgHelpers.isElementInView(image.$elem, options.offset, winDimensions, image.src)){
          loadImage(image);
          images.splice(i, 1);
        }
      }
      if(images.length === 0){ stopListening(); }
    }

    checkImagesT = lazyImgHelpers.throttle(checkImages, options.delayCheck);

    function listen(param){
      containers.forEach(function (container) {
        container[param]('scroll', checkImagesT);
        container[param]('touchmove', checkImagesT);
      });
      $win[param]('resize', checkImagesT);
      $win[param]('resize', saveWinOffsetT);
    }

    function startListening(){
      isListening = true;
      $timeout(function(){
        checkImages();
        listen('on');
      });
    }

    function stopListening(){
      isListening = false;
      listen('off');
    }

    function resetLazy() {
      stopListening();
      images = [];
      imagesInLoad = 0;
      $rootScope.$emit('lazy:endLoading');
    }

    function removeImage(image){
      var index = images.indexOf(image);
      if(index !== -1) {
        images.splice(index, 1);
      }
    }

    function addInLoad() {
      if (imagesInLoad == 0) {
        $rootScope.$emit('lazy:startLoading');
      }
      imagesInLoad += 1;
    }

    function removeInLoad() {
      if (imagesInLoad > 0) {
        imagesInLoad -= 1;
      }
      if (!imagesInLoad) {
        $rootScope.$emit('lazy:endLoading');
      }
    }

    function forceLoadImage(image){
      var index = images.indexOf(image);
      if(index !== -1) {
        loadImage(image);
        images.splice(index, 1);
      }
    }

    function loadImage(photo){
      photo.src = photo.src.trim();
      photo.srcset = photo.src;
      // src is a srcset if , separator
      if (photo.src.indexOf(',')>0) {
        var sr = photo.src.slice(0, photo.src.indexOf(','));
        photo.src = sr.slice(0, sr.lastIndexOf(' '));
      }
      if (imagesLoaded.indexOf(photo.srcset) > -1) return setPhotoSrc(photo.$elem, photo.src, photo.srcset);
      if (imagesLoaded.indexOf(photo.src) > -1) return setPhotoSrc(photo.$elem, photo.src);
      addInLoad();
      var img = new Image();
      img.onerror = function(){
        if(options.errorClass){
          photo.$elem.addClass(options.errorClass);
        }
        $rootScope.$emit('lazyImg:error', photo);
        options.onError(photo);
        removeInLoad();
        if (photo.srcset.indexOf(',')>0) {
          photo.srcset = null;
          return loadImage(photo);
        }
      };
      img.onload = function(){
        setPhotoSrc(photo.$elem, photo.src, photo.srcset);
        if(options.successClass){
          photo.$elem.addClass(options.successClass);
        }
        $rootScope.$emit('lazyImg:success', photo);
        options.onSuccess(photo);
        if (imagesLoaded.indexOf(photo.srcset) === -1) imagesLoaded.push(photo.srcset);
        removeInLoad();
      };
      img.srcset = photo.srcset;
    }

    function setPhotoSrc($elem, src, srcset){
      if ($elem[0].nodeName.toLowerCase() === 'img') {
        if (srcset) $elem[0].srcset = srcset;
        $elem[0].src = src;
      } else {
        $elem.css('background-image', 'url("' + src + '")');
      }
    }

    // PHOTO
    function Photo($elem){
      this.$elem = $elem;
    }

    Photo.prototype.setSource = function(source){
      if (options.already && imagesLoaded.indexOf(source) > -1) {
        var sr = source.trim();
        var srset = sr;
        if (sr.indexOf(',')>0) {
          sr = sr.slice(0, sr.indexOf(','));
          sr = sr.slice(0, sr.lastIndexOf(' '));
          if (imagesLoaded.indexOf(sr) > -1) {
            this.$elem[0].src = sr;
            this.$elem[0].srcset = sr;
            return;
          }
        }
        this.$elem[0].srcset = srset;
        this.$elem[0].src = sr;
        return;
      }
      this.src = source;
      images.unshift(this);
      if (!isListening){ startListening(); }
    };

    Photo.prototype.removeImage = function(){
      removeImage(this);
      if(images.length === 0){ stopListening(); }
    };

    Photo.prototype.forceLoadImage = function(){
      forceLoadImage(this);
      if(images.length === 0){ stopListening(); }
    };

    Photo.prototype.checkImages = function(){
      checkImages();
    };

    Photo.prototype.resetLazy = function(){
      resetLazy();
    };

    Photo.addContainer = function (container) {
      stopListening();
      containers.push(container);
      startListening();
    };

    Photo.removeContainer = function (container) {
      stopListening();
      containers.splice(containers.indexOf(container), 1);
      startListening();
    };

    return Photo;

  }
]);
