(function (angular) {
  var module = angular.module('whcyit-search-model', ['whcyit']);
  module.factory('cySearchModel', ['cyCors', '$q', '$ionicModal', '$rootScope',
    function (cyCors, $q, $ionicModal, $rootScope) {
    var getTemplate = function (itemHtml) {
      var modalTemplate =
        '<ion-modal-view>' +
          '<div class="bar bar-{{::theme}} bar-header item-input-inset">' +
            '<button class="filter-bar-cancel button back-button button-clear" ng-click="closeModal()">' +
              '<i class="icon ion-{{::platform}}-close"></i>' +
            '</button>' +
            '<label class="item-input-wrapper">' +
              '<i class="icon ion-ios-search placeholder-icon"></i>' +
              '<input type="search" ng-model="model.filterText" placeholder="请输入查询内容">' +
            '</label>' +
            '<button class="button button-clear" ng-click="doSearch(model.filterText, false)">搜索</button>' +
          '</div>' +
          '<ion-content class="no-padding has-header">' +
            '<ion-list>' +
              '<ion-item ng-repeat="item in pagination.items" class="item-icon-right item-text-wrap" ng-click="doSelected(item)">' +
                 itemHtml +
                '<i class="icon ion-chevron-right icon-accessory"></i>' +
              '</ion-item>' +
            '</ion-list>' +
            '<ion-infinite-scroll ng-if="pagination.hasNext" spinner="ios" on-infinite="doSearch(model.filterText, true)" immediate-check="false"></ion-infinite-scroll>' +
          '</ion-content>' +
        '</ion-modal-view>';
      return modalTemplate;
    }
    var queryPage = function(url, pagination, searchStr){
      return $q(function (resolve) {
        var options = {
          url: url,
          data: {
            searchStr: searchStr,
            "pageNum": pagination.nextPage()
          }
        };
        cyCors.ajax(options, function (response) {
          resolve(response.data);
        });
      });
    }
    return {
      show: function(opts){
        var scope = $rootScope.$new(true);
        scope.model = {};
        angular.extend(scope, {
          theme: 'positive',
          platform: ionic.Platform.isAndroid() ? 'android' : 'ios',
          onSelected: angular.noop
        }, opts);

        scope.model = $ionicModal.fromTemplate(getTemplate(opts.itemHtml), {
          scope: scope
        });
        scope.doSearch = function (filterText, loadNextPage) {
          if(filterText && filterText != ''){
            if(!loadNextPage) scope.pagination = new whcyit.Pagination();
            queryPage(opts.url, scope.pagination, filterText).then(function(page) {
              scope.pagination.hasNext = page.hasNextPage;
              scope.pagination.items = scope.pagination.items.concat(page.items);
              if(loadNextPage){
                scope.$broadcast("scroll.infiniteScrollComplete");
              }
            })
          }
        }
        scope.doSelected = function (item) {
          scope.onSelected(item);
          scope.closeModal();
        }
        scope.closeModal = function(){
          scope.model.remove();
          scope.model = null;
        }
       scope.model.show();
      }
    }
  }])
})(angular);