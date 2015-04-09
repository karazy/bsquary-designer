'use strict';

angular.module('bsquaryDesignerApp')
  .controller('MainCtrl', function ($scope, $http, $famous) {

    var EventHandler = $famous['famous/core/EventHandler'],        
        Transitionable = $famous['famous/transitions/Transitionable'],
        SpringTransition = $famous['famous/transitions/SpringTransition'],
        Transform = $famous['famous/core/Transform'],
        Easing = $famous['famous/transitions/Easing'],
        sizeFactor = 5,
        /**
        * in cm
        */
        referenceWidth = 2450,        
        defaultBox = {
          position: [0, 0],
          origin: [1, 1],
          align: [0.5, 0.5],
          menuShown: false,
          borderColor: '#444444',
          menu: {
            opacity: 0,
            origin: [1, 1],
            align: [0.5, 0.5],
            openTransition: [10, -30, 0],
            closeTransition: [0, 0, 0]
          }
        }

        $scope.boxColors = [ 
          {
            name: 'Weiß',
            code:  '#ffffff'
          },
          {
            name: 'Bordeauxrot',
            code: '#a02527'
          },
          {
            name: 'Dunkelbraun',
            code: '#2f2524'
          },
          {
            name: 'Hellbraun',
            code: '#d89427'
          },
          {
            name: 'Hellblau',
            code:  '#bedffe'
          },
          {
            name: 'Dunkelgrün',
            code:  '#293b25'
          },
          {
            name: 'Schwarz',
            code: '#000000'
          },
          {
            name: 'Hellgrau',
            code:  '#cdd4e4'
          },
          {
            name: 'Hellgelb',
            code:  '#fdea83'
          },
          {
            name: 'Hellgrün',
            code:  '#5ec95f'
          },
          {
            name: 'Pink',
            code:  '#e3a5ca'
          },
          {
            name: 'Natur unbeschichtet',
            code: '#edddc4'
          }
          // {
          //   name: 'Natur beschichtet',
          //   code: '#edddc4'
          // } 
        ];



    Transitionable.registerMethod('spring', SpringTransition);



    $scope.boxes = [];

    $scope.boxTypes = [];  

    $scope.colorGridOptions = {
      dimensions: [4, 4]
    };  


    // $http.get('/api/things').success(function(awesomeThings) {
    //   $scope.awesomeThings = awesomeThings;
    // });

    $scope.addBox = function(type) {
      // var boxToAdd = angular.copy(boxTypes[type]);
      var boxToAdd = angular.copy(type);

      boxToAdd.handler = new EventHandler();
      boxToAdd.position = new Transitionable([200,200,0]);
      boxToAdd.menu.transition = new Transitionable([0,0,0]);
      boxToAdd.menu.opacityTransition = new Transitionable([0]);
      boxToAdd.menu.rotate = new Transitionable(0);
      // boxToAdd.menu.rotate = Transform.identity;

      boxToAdd.handler.on('end', function (e) {
       boxToAdd.currentPosition = e.position;
       console.log('New position=' + boxToAdd.currentPosition);
      });

      // $http.post('/api/things', { name: $scope.newThing });
      $scope.boxes.push(boxToAdd);
    };

    $scope.rotateBox = function(box) {      
      var newSize = [];

      if(!box) {
        console.error("rotateBox: No box given.")
        return;
      }

      if(box.size[0] == box.size[1]) {
        console.error("rotateBox: box is square. don't rotate");
        return;
      }

      if(Math.abs(Math.round(box.menu.rotate.get())) == 0) {

         box.menu.rotate.set(Math.PI / 2, {
            curve: Easing['outElastic'],
            duration: 1000,
            dampingRatio: 0.3
          });
         box.menu.openTransition = [box.size[0] + 10, box.size[1] - box.size[0] -30, 0];
         box.menu.closeTransition = [box.size[0], box.size[1] - box.size[0], 0];
         box.menu.transition.set(box.menu.openTransition, {duration: 300, curve: 'easeOutBounce'});  
      } else {        
        box.menu.rotate.set(0, {
            curve: Easing['outElastic'],
            duration: 1000,
            dampingRatio: 0.3
          });
        box.menu.openTransition = [10, -30, 0];
        box.menu.closeTransition = [0, 0, 0];
        box.menu.transition.set(box.menu.openTransition, {duration: 300, curve: 'easeOutBounce'}); 
      }
      
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
          // $scope.lastActiveBox.position.set([0,0,1]);
        } else {
          // box.position.set([0,0,1]);
          // if($scope.lastActiveBox) {
          //   $scope.lastActiveBox.position.set([0,0,0]);
          // }

          if($scope.lastActiveBox) {
            //hide prev clicked box            
            $scope.hideBoxMenu($scope.lastActiveBox); 
            // $scope.lastActiveBox.position.set([0,0,0]);
          }
          $scope.lastActiveBox = box;
          box.menu.opacityTransition.set([1], {duration: 300, curve: 'easeInOut'});
          box.menu.transition.set(box.menu.openTransition, {duration: 300, curve: 'easeOutBounce'});  
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
      box.menu.transition.set(box.menu.closeTransition, {duration: 300, curve: 'easeInOut'});      
    };


    $scope.boxMenuToggle = function(toggle, event, box) {
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

    $scope.changeBoxColor = function(color) {
      $scope.lastActiveBox.color = color.code;
    }

    function calculateSizeFactor() {
      //calculate ratio reference width to boxes
      var ratio = referenceWidth / window.innerWidth;
      // ref = inner; 100%
      // 1 % = ref/inner;
      // refBoxWidth = pix?;

      sizeFactor = ratio;
      console.log('calculateSizeFactor: sizeFactor='+sizeFactor);
      
    }

    function getBoxTypes() {
      calculateSizeFactor();
      return [
          angular.extend({
              name: 'bTokyo - L',
              defSizeX: 400,
              defSizeY: 400,
              size: [400/sizeFactor, 400/sizeFactor],              
              color: '#cdd4e4',
            }, defaultBox), 
           angular.extend({
            name: 'bHamburg - L',
            defSizeX: 500,
            defSizeY: 350,
            size: [500/sizeFactor, 350/sizeFactor],
            color: 'blue',
          }, defaultBox), 
         angular.extend({
          name: 'bParis - L',
          defSizeX: 250,
          defSizeY: 600,
          size: [250/sizeFactor, 600/sizeFactor],
          color: 'yellow'
         }, defaultBox)
    ];
    }

    function recalculateBoxSizes() {
      angular.forEach($scope.boxes, function(box, index) {
        box.size[0] = box.defSizeX/sizeFactor;
        box.size[1] = box.defSizeY/sizeFactor;
      })
    };

    function init() {
     // calculateSizeFactor();
      $scope.boxTypes = getBoxTypes();
      $scope.boxTypeToAdd = $scope.boxTypes[0];
      //5000mm = 1500px
      //400mm = ? px
      //5000mm/1500 = 1px (=ratio)
      //5000/1500 * X = 400mm
      //ratio * X = 400m
      
      window.addEventListener('resize', function() {
        //TODO add timeout so recalculation doesn't happen multiple times
        $scope.boxTypes = getBoxTypes();
        recalculateBoxSizes();
        console.log('init:: DEBUG RESIZE');
     });
    }

    init();


  });
