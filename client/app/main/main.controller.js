'use strict';

angular.module('bsquaryDesignerApp')
  .controller('MainCtrl', function ($scope, $http, $famous) {

    var Engine = $famous['famous/core/Engine'],
        EventHandler = $famous['famous/core/EventHandler'],        
        Modifier = $famous['famous/core/Modifier'],        
        Transitionable = $famous['famous/transitions/Transitionable'],
        SpringTransition = $famous['famous/transitions/SpringTransition'],
        Transform = $famous['famous/core/Transform'],
        Easing = $famous['famous/transitions/Easing'],
        Lightbox = $famous['famous/views/Lightbox'],
        Surface = $famous['famous/physics/constraints/Surface'],
        sizeFactor = 5,               
        defaultBox = {
          origin: [1, 1],
          align: [0.5, 0.5],
          menuShown: false,
          borderColor: '#444444',
          color:  '#ffffff',
          menu: {
            size: [100,20],
            opacity: 0,
            origin: [0, 0],
            align: [0.5, 0.5],
            openTransition: [10, -30, 0],
            closeTransition: [0, 0, 0]
          }
        }

        /**
        * in cm
        */
        $scope.referenceWidth = 5000;
        //Used to pre select the width
        $scope.selectedReferenceWidth = $scope.referenceWidth;

        $scope.colorPicker = {
          position: new Transitionable([10,200,0]),
          opacityTransition: new Transitionable([0])
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

        $scope.referenceWidths = [
          {
            display: '5m',
            widthInMM: 5000
          },
          {
            display: '4m',
            widthInMM: 4000
          },
          {
            display: '3m',
            widthInMM: 3000
          },
          {
            display: '2m',
            widthInMM: 2000
          }
        ]



    Transitionable.registerMethod('spring', SpringTransition);



    $scope.boxes = [];

    $scope.boxTypes = [];  

    $scope.lastActiveBox = null;

    $scope.colorGridOptions = {
      dimensions: [4, 4]
    };  


    // $http.get('/api/things').success(function(awesomeThings) {
    //   $scope.awesomeThings = awesomeThings;
    // });

    $scope.addBox = function(type) {
      if(!type) {
        console.log('addBox: no type given');
        return;
      }

      var boxToAdd = angular.copy(type);

      boxToAdd.handler = new EventHandler();
      boxToAdd.position = new Transitionable([0,0,0]);
      boxToAdd.menu.transition = new Transitionable([-boxToAdd.size[0],-boxToAdd.size[1],0]);
      boxToAdd.menu.openTransition = [-boxToAdd.size[0]+10,-boxToAdd.size[1]-30,0];
      boxToAdd.menu.closeTransition = [-boxToAdd.size[0],-boxToAdd.size[1],0];
      boxToAdd.menu.opacityTransition = new Transitionable([0]);
      boxToAdd.menu.rotate = new Transitionable(0);

      //Get box position
      // boxToAdd.handler.on('end', function (e) {
      //  boxToAdd.currentPosition = e.position;
      //  console.log('New position=' + boxToAdd.currentPosition);
      // });

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
         box.menu.openTransition = [10, -box.size[0]-30, 0];
         box.menu.closeTransition = [0, -box.size[0], 0];
         box.menu.transition.set(box.menu.openTransition, {duration: 300, curve: 'easeOutBounce'});  
      } else {        
        box.menu.rotate.set(0, {
            curve: Easing['outElastic'],
            duration: 1000,
            dampingRatio: 0.3
          });
        // box.menu.openTransition = [10, -30, 0];
        // box.menu.closeTransition = [-boxToAdd.size[0], -boxToAdd.size[1], 0];
        box.menu.openTransition = [-box.size[0]+10,-box.size[1]-30,0];
        box.menu.closeTransition = [-box.size[0],-box.size[1],0];
        // box.menu.openTransition = [-boxToAdd.size[0] + 10, -boxToAdd.size[1] -30, 0];
        box.menu.transition.set(box.menu.openTransition, {duration: 300, curve: 'easeOutBounce'}); 
      }
      
    }

    $scope.deleteBox = function(box) {
      if(!box) {
        console.error("deleteBox: No box given.")
        return;
      }

      hideColorPicker();


      angular.forEach($scope.boxes, function(b, index) {
        if(b == box) {
          var removedBox = $scope.boxes.splice(index,1);
          removedBox = null;
        }
      })
    }

    $scope.showBoxMenu = function(box) {
      console.log('showBoxMenu');
      if($scope.menuOpenPermitted) {
        if($scope.lastActiveBox != null && $scope.lastActiveBox == box) {
          //same box with open menu clicked                    
          $scope.hideBoxMenu($scope.lastActiveBox);
          hideColorPicker();
        } else {
          var pos = box.position.get();
          box.position.set([pos[0],pos[1],1]);

          if($scope.lastActiveBox) {
            //hide prev clicked box                        
            $scope.hideBoxMenu($scope.lastActiveBox); 
          }
          
          $scope.lastActiveBox = box;
          box.menu.opacityTransition.set([1], {duration: 300, curve: 'easeInOut'});          
          box.menu.transition.set(box.menu.openTransition, {duration: 300, curve: 'easeOutBounce'});  
          $scope.colorPicker.opacityTransition.set([1], {duration: 300, curve: 'easeInOut'});
        }        
      }            
    };

    $scope.hideBoxMenu = function(box) {
      
      console.log('hideBoxMenu');
      if(!box) {
        console.error("hideBoxMenu: no box given");
      }

      if($scope.lastActiveBox) {
        var lastPos = $scope.lastActiveBox.position.get();
        $scope.lastActiveBox.position.set([lastPos[0],lastPos[1],0]);
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

    $scope.boxMenuToggleTouch = function(toggle, event, box) {
      console.log('boxMenuToggle: ' + toggle);
      if($scope.menuOpenPermitted != toggle) {
        $scope.menuOpenPermitted = toggle;  
      }
      

      event.target.ontouchmove = function() {
        console.log('boxMenuToggleTouch: prevent menu opening');
        $scope.menuOpenPermitted = false; 
        event.target.onmousemove = null;
      }      
    }

    $scope.changeBoxColor = function(color) {
      if(!$scope.lastActiveBox) {
        console.log("changeBoxColor: no lastActiveBox provided");
        return;
      }

      $scope.lastActiveBox.color = color.code;
    }

    // $scope.showColorPicker = function(box) {
    //   // $scope.colorPicker.position.set([box.currentPosition[0], box.currentPosition[1], 1], {duration: 300, curve: 'easeOutBounce'});  
    //   var context = Engine.getContexts()[0];
    //   var modal = new Surface({
    //       size:[500,500],
    //       content: '<h1>MODAL</h1>',
    //       properties:{
    //           backgroundColor:'red'
    //       }
    //   });
    //   var a = $famous;
    //   modal.lightbox = new Lightbox({
    //     inTransform: Transform.translate(0,500,0),
    //     outTransform: Transform.translate(0,500,0),
    //     inTransition: {duration:1000, curve:Easing.outElastic},
    //     outTransition: {duration:200, curve:Easing.inOutQuad},
    //   });
    //   // context.add(modal);
    //   context.add(new Modifier({origin:[0,0]})).add(modal);
    //   // modal.lightbox.show(modal);
    // }

    // $scope.toggleBoxForeground = function(toggle, box) {
    //   if(toggle) {
    //     console.log('toggleBoxForeground: bring to foreground');
    //     box.position.set([0,0,100]);
    //   } else {
    //     console.log('toggleBoxForeground: move to background');
    //     box.position.set([0,0,0]);
    //   }        
    // }

    function calculateSizeFactor() {
      //calculate ratio reference width to boxes
      var ratio = $scope.referenceWidth / window.innerWidth;
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
              name: 'bTokyo L',
              defSizeX: 400,
              defSizeY: 400,
              size: [400/sizeFactor, 400/sizeFactor],
            }, defaultBox),
            angular.extend({
              name: 'bTokyo M',
              defSizeX: 300,
              defSizeY: 300,
              size: [300/sizeFactor, 300/sizeFactor],
            }, defaultBox),  
           angular.extend({
            name: 'bHamburg L',
            defSizeX: 500,
            defSizeY: 350,
            size: [500/sizeFactor, 350/sizeFactor],
          }, defaultBox), 
            angular.extend({
            name: 'bHamburg M',
            defSizeX: 400,
            defSizeY: 200,
            size: [400/sizeFactor, 200/sizeFactor],
          }, defaultBox), 
         angular.extend({
          name: 'bParis L',
          defSizeX: 250,
          defSizeY: 600,
          size: [250/sizeFactor, 600/sizeFactor],
         }, defaultBox)
    ];
    }

    function hideColorPicker() {
      $scope.colorPicker.opacityTransition.set([0], {duration: 300, curve: 'easeInOut'});
    }

    $scope.recalculateBoxSizes = function() {
      $scope.boxTypes = getBoxTypes();
      // $scope.boxTypeToAdd = $scope.boxTypes[0];

      angular.forEach($scope.boxes, function(box, index) {
        //recalc box size
        box.size[0] = box.defSizeX/sizeFactor;
        box.size[1] = box.defSizeY/sizeFactor;
        //recalc box menu position
        if(Math.abs(Math.round(box.menu.rotate.get())) == 0) {      
          box.menu.openTransition = [-box.size[0]+10,-box.size[1]-30,0];
          box.menu.closeTransition = [-box.size[0],-box.size[1],0];
          box.menu.transition.set(box.menu.openTransition, {duration: 300, curve: 'easeOutBounce'}); 
        } else {        
          box.menu.openTransition = [10, -box.size[0]-30, 0];
          box.menu.closeTransition = [0, -box.size[0], 0];
          box.menu.transition.set(box.menu.openTransition, {duration: 300, curve: 'easeOutBounce'});          
        }

      });


    };

    function init() {
      $scope.boxTypes = getBoxTypes();
      // $scope.boxTypeToAdd = $scope.boxTypes[0];
      //5000mm = 1500px
      //400mm = ? px
      //5000mm/1500 = 1px (=ratio)
      //5000/1500 * X = 400mm
      //ratio * X = 400m
      
      window.addEventListener('resize', function() {
        //TODO add timeout so recalculation doesn't happen multiple times
        $scope.boxTypes = getBoxTypes();
        $scope.recalculateBoxSizes();
        console.log('init: DEBUG RESIZE');
     });
    }

    $scope.referenceWidthChanged = function(selectedReferenceWidth) {
      $scope.referenceWidth = selectedReferenceWidth;
      $scope.recalculateBoxSizes();
    }

    init();


  });
