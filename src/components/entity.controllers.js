/**
 * Created by: dhayes on 4/15/14.
 * Filename: entity.controllers.js
 */
angular.module('entity.controllers',['alert.services'])

    .controller('EntityController', ['repository', 'entityName', '$scope', function(repository, entityName, $scope) {
        $scope.repository = repository;

        $scope.entityName = entityName;
    }])

    .controller('ListController', ['entities', '$scope', 'ConfirmService', 'AlertService', function(entities, $scope, confirmService, alertService) {
        $scope.entities = entities;
        $scope.remove = function(entity) {

            confirmService.confirm("Are you sure you want to delete "+$scope.entityName+" "+entity.name, function () {
                $scope.repository.remove(entity).then(function(){
                    $scope.entities = _.without($scope.entities, entity);
                    alertService.growl('success', $scope.entityName + ' '+entity.name+' successfully removed.', true);
                }, function(err){

                });
            }, function(){
                alertService.growl('info', 'Delete canceled', true);
            });

        };
    }])

    .controller('ShowController', ['$scope', '$state', 'entity', 'tabs', function($scope, $state, entity, tabs) {
        $scope.entity = entity;
        $scope.tabs = tabs;

        $scope.go = function(route){
            $state.go(route);
        };

        $scope.active = function(route){
            return $state.is(route);
        };

        $scope.$on("$stateChangeSuccess", function() {
            $scope.tabs.forEach(function(tab) {
                tab.active = $scope.active(tab.route);
            });
        });

    }])

    .controller('EntityFormController', ['entity', '$scope', 'AlertService', '$state', '$log', function(entity, $scope, alertService, $state, $log) {
        $scope.entity = entity;

        var isNew = function() {
            return !$scope.entity._id;
        };

        if (!isNew()) {
            $scope.pageTitle = 'Edit '+$scope.entityName;
        } else {
            $scope.pageTitle = 'Add '+$scope.entityName;
        }

        $scope.isNew = isNew;

        $scope.save = function() {
            if (!isNew()) {
                $scope.repository.update($scope.entity).then(function(saved) {
                    alertService.growl('success', $scope.entityName + ' '+saved.name+' updated successfully', true);
                    $state.go($state.current.successState);
                }, function(err){
                    $log.error(err);
                    alertService.inline('danger', 'Saved failed\n\n'+err.data.error.message);
                });

            } else {
                $scope.repository.save($scope.entity).then(function(saved) {
                    alertService.growl('success', $scope.entityName+' '+saved.name+' created successfully', true);
                    $state.go($state.current.successState);
                }, function(err){
                    $log.error(err);
                    alertService.inline('danger', 'Saved failed\n\n'+err.data.error.message);
                });

            }
        };
    }]);