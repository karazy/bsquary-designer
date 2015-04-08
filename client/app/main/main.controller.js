'use strict';

angular.module('bsquaryDesignerApp')
  .controller('MainCtrl', function ($scope, $http, $famous) {
    var EventHandler = $famous['famous/core/EventHandler'],
        sizeFactor = 5,
        Transitionable = $famous['famous/transitions/Transitionable'],
        SpringTransition = $famous['famous/transitions/SpringTransition'],
        Transform = $famous['famous/core/Transform'];

    Transitionable.registerMethod('spring', SpringTransition);

    $scope.boxes = [];
    $scope.boxTypes = [{
          name: 'bTokyo - L',
          size: [40*sizeFactor, 40*sizeFactor],
          position: [50, 50],
          origin: [0.5, 0.5],
          align: [0.5, 0.5],
          borderColor: '#987969',
          color: 'green',
          menuShown: false,
          menu: {
            opacity: 0
          }
        }, {
          name: 'bHamburg - L',
          size: [50*sizeFactor, 35*sizeFactor],
          position: [50, 50],
          borderColor: '#987969',
          color: 'blue',
          menuShown: false,
          origin: [0.5, 0.5],
          align: [0.5, 0.5],
          menu: {
            opacity: 0
          }
        }, {
          name: 'bParis - L',
          size: [25*sizeFactor, 60*sizeFactor],
          position: [50, 50],
          borderColor: '#987969',
          color: 'yellow',
          menuShown: false,
          origin: [0.5, 0.5],
          align: [0.5, 0.5],
          menu: {
            opacity: 0
          }
        }];


    // $http.get('/api/things').success(function(awesomeThings) {
    //   $scope.awesomeThings = awesomeThings;
    // });

    $scope.addBox = function(type) {
      // var boxToAdd = angular.copy(boxTypes[type]);
      var boxToAdd = angular.copy(type);

      boxToAdd.handler = new EventHandler();
      boxToAdd.menu.transition = new Transitionable([0,0,0]);
      boxToAdd.menu.opacityTransition = new Transitionable([0]);
      boxToAdd.menu.rotate = new Transitionable(0);
      // boxToAdd.menu.rotate = Transform.identity;

      // $http.post('/api/things', { name: $scope.newThing });
      $scope.boxes.push(boxToAdd);
    };

    $scope.rotateBox = function(box) {      
      var newSize = [];

      if(!box) {
        console.error("rotateBox: No box given.")
        return;
      }

      if(Math.abs(Math.round(box.menu.rotate.get())) == 0) {
         box.menu.rotate.set(Math.PI / 2, {
            method: 'spring',
            period: 500,
            dampingRatio: 0.4
          });
      //   box.menu.rotate = Math.PI/2;
      } else {
        // console.log('before box.origin=' + box.origin + ', box.align=' + box.origin + ', box.position=' + box.position);
        // box.origin = [box.position[0], box.position[1]];
        // box.align = [box.position[0], box.position[1]];
        // console.log('after box.origin=' + box.origin + ', box.align=' + box.origin + ', box.position=' + box.position);

        box.menu.rotate.set(0, {
            method: 'spring',
            period: 500,
            dampingRatio: 0.4
          });
      }
      

      // newSize.push(box.size[1]);
      // newSize.push(box.size[0]);
      
      // box.size = newSize;
    }

    $scope.deleteBox = function(box) {
      if(!box) {
        console.error("deleteBox: No box given.")
        return;
      }

      angular.forEach($scope.boxes, function(b, index) {
        if(b == box) {
          $scope.boxes.splice(index,1);
        }
      })
    }

    $scope.showBoxMenu = function(box) {
      console.log('showBoxMenu');
      if($scope.menuOpenPermitted) {
        if($scope.lastActiveBox && $scope.lastActiveBox == box) {
          //same box with open menu clicked
          $scope.hideBoxMenu($scope.lastActiveBox);
        } else if($scope.lastActiveBox) {
          //another box clicked
          $scope.hideBoxMenu($scope.lastActiveBox);
          $scope.lastActiveBox = box;
          box.menu.opacityTransition.set([1], {duration: 300, curve: 'easeInOut'});
          box.menu.transition.set([10, -30, 0], {duration: 300, curve: 'easeOutBounce'});
        } else {
          //no box prev clicked
          $scope.lastActiveBox = box;
          box.menu.opacityTransition.set([1], {duration: 300, curve: 'easeInOut'});
          box.menu.transition.set([10, -30, 0], {duration: 300, curve: 'easeOutBounce'});  
        }        
      }            
    };

    $scope.hideBoxMenu = function(box) {
      console.log('hideBoxMenu');
      if(!box) {
        console.error("hideBoxMenu: no box given");
      }
      $scope.lastActiveBox = null;
      box.menu.opacityTransition.set([0], {duration: 300, curve: 'easeInOut'});
      box.menu.transition.set([0, 0, 0], {duration: 300, curve: 'easeInOut'});      
    };

    // $scope.hideBoxMenus = function(event) {
    //   console.log('hideBoxMenus: ' + event);
    //   if($scope.lastActiveBox) {
    //     $scope.hideBoxMenu($scope.lastActiveBox);        
    //   }      
    // }

    $scope.boxMenuToggle = function(toggle, event) {
      console.log('boxMenuToggle: ' + toggle);
      if($scope.menuOpenPermitted != toggle) {
        $scope.menuOpenPermitted = toggle;  
      }

      event.target.onmousemove = function() {
        console.log('boxMenuToggle: prevent menu opening');
        $scope.menuOpenPermitted = false; 
        event.target.onmousemove = null;
      }      
    }


  });
