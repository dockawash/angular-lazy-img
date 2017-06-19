angular.module('angularLazyImg').provider('lazyImgConfig', function() {
  'use strict';

  this.options = {
    already     : false,
    delayCheck  : 30,
    delayWin    : 60,
    offset      : 100,
    errorClass  : null,
    successClass: null,
    onError     : function(){},
    onSuccess   : function(){}
  };

  this.$get = function() {
    var options = this.options;
    return {
      getOptions: function() {
        return options;
      }
    };
  };

  this.setOptions = function(options) {
    angular.extend(this.options, options);
  };
});
