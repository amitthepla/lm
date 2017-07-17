// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic','starter.controllers', 'ngOpenFB','starter.services','starter.factories','ngCordova','base64'])

.directive("datepicker", function () {
    return {
        restrict: "A",
        link: function (scope, el, attr) {
            el.datepicker({
                            dateFormat: 'yy-mm-dd'
                        });
        }
    };
})
.directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit('ngRepeatFinished');
                });
            }
        }
    }
})
.directive('numbersOnly', function(){
   return {  
        restrict: 'A',  
        link: function (scope, elm, attrs, ctrl) {  
            elm.on('keydown', function (event) { 
                var $input = $(this);  
                var value = $input.val();  
                value = value.replace(/[^0-9\.]/g, '')  
                var findsDot = new RegExp(/\./g)  
                var containsDot = value.match(findsDot)  
                if (containsDot != null && ([46, 110, 190].indexOf(event.which) > -1)) {  
                    event.preventDefault();  
                    return false;  
                }
                $input.val(value);  
				if(($input.val().indexOf('.') != -1) && ($input.val().substring($input.val().indexOf('.'),$input.val().indexOf('.').length).length>2 )){
					if (event.keyCode !== 8 && event.keyCode !== 46 ){ //exception
						event.preventDefault();
					}
				}
                if (event.which == 64 || event.which == 16) {  
                    // numbers  
                    return false;  
                } if ([8, 13, 27, 37, 38, 39, 40, 110].indexOf(event.which) > -1) {  
                    // backspace, enter, escape, arrows  
                    return true;  
                } else if (event.which >= 48 && event.which <= 57) {  
                    // numbers  
                    return true;  
                } else if (event.which >= 96 && event.which <= 105) {  
                    // numpad number  
                    return true;  
                } else if ([46, 110, 190].indexOf(event.which) > -1) {  
                    // dot and numpad dot  
                    return true;  
                } else {  
                    event.preventDefault();  
                    return false;  
                }  
            });  
        }  
    } 
})


.directive('horizontalSlider', function ($ionicGesture) {
  return function(scope, $element, attr) {
    var left = 0;

    $element.addClass('horizontal-slider');

    var width = parseInt(attr.horizontalSlider) || 500;
    $element[0].style.width = width + 'px';

    var handleDrag = function(e) {
      $element[0].style[ionic.CSS.TRANSFORM] = 'translate3d(' + (left + Math.round(e.gesture.deltaX)) + 'px, 0, 0)'

      if ($element.hasClass('slider-bounce')) { $element.removeClass('slider-bounce'); }
    };

    var releaseFn = function(e) {
      var pattern = new RegExp('translate3d\\((-?[0-9]*)px, 0px, 0px\\)');
      var transformMatches = pattern.exec($element.css(ionic.CSS.TRANSFORM));

      left = Math.round(transformMatches[1]);

      if(left < (320 - width)) left = 320 - width;
      if(left > 0) left = 0;
      $element.addClass('slider-bounce');
      $element[0].style[ionic.CSS.TRANSFORM] = 'translate3d(' + left + 'px, 0, 0)';
    };

    var releaseGesture = $ionicGesture.on('release', releaseFn, $element);
    var dragGesture = $ionicGesture.on('drag', handleDrag, $element);
    scope.$on('$destroy', function() {
      $ionicGesture.off(dragGesture, 'drag', handleDrag);
    });
  }
})

.run(function ($ionicPlatform, $location,ngFB) {
})

.config(function($stateProvider, $urlRouterProvider,$ionicConfigProvider) {
	if(!ionic.Platform.isAndroid())$ionicConfigProvider.scrolling.jsScrolling(false);
    $ionicConfigProvider.views.swipeBackEnabled(false);
	$stateProvider
	.state('login', {
		url: '/login',
		cache: false,
		templateUrl: 'templates/login.html',
		controller: 'LoginCtrl'
	})
	.state('landing_page', {
		url: '/landing_page',
		cache: false,
		templateUrl: 'templates/landing_page.html',
		controller: 'LandCtrl'
	})
	.state('club', {
		url: '/landing_page/:clubId',
		cache: false,
		templateUrl: 'templates/club.html',
		controller: 'ClubCtrl'
	})
	.state('schedule_list', {
		url: '/schedule_list',
		cache: false,
		templateUrl: 'templates/schedule_list.html',
		controller: 'ScheduleCtrl'
	})
	.state('calender', {
		url: '/calender',
		cache: false,
		templateUrl: 'templates/calender.html',
		controller: 'CalenderCtrl'
	})
	.state('profile', {
		url: '/profile',
		cache: false,
		templateUrl: 'templates/profile.html',
		controller: 'ProfileCtrl'
	})
	.state('event_detail', {
		url: '/event_detail',
		cache: false,
		templateUrl: 'templates/event_detail.html',
		controller: 'EventCtrl'
	})
	.state('create_event', {
		url: '/create_event',
		cache: false,
		templateUrl: 'templates/create_event.html',
		controller: 'CreateEventCtrl'
	})
	.state('display_result', {
		url: '/display_result',
		cache: false,
		templateUrl: 'templates/display_result.html',
		controller: 'DisplayResultCtrl'
	})
	.state('add_result', {
		url: '/add_result',
		cache: false,
		templateUrl: 'templates/add_result.html',
		controller: 'AddResultCtrl'
	})
	.state('cancel_event', {
		url: '/cancel_event',
		cache: false,
		templateUrl: 'templates/cancel_event.html',
		controller: 'PostponeEventCtrl'
	})
	.state('registration', {
		url: '/registration',
		cache: false,
		templateUrl: 'templates/registration.html',
		controller: 'RegistrationCtrl'
	})
	.state('program_details', {
		url: '/registration/:programId',
		cache: false,
		templateUrl: 'templates/program_details.html',
		controller: 'ProgramDetailCtrl'
	})
	.state('registration_option', {
		url: '/registration_option',
		cache: false,
		templateUrl: 'templates/registration_option.html',
		controller: 'RegistrationOptionCtrl'
	})
	.state('progtyp_list', {
		url: '/progtyp_list',
		cache: false,
		templateUrl: 'templates/progtyp_list.html',
		controller: 'ProTypeListCtrl'
	})
	.state('individual', {
		url: '/individual/:programId',
		cache: false,
		templateUrl: 'templates/individual.html',
		controller: 'IndividualCtrl'
	})
	.state('terms_conditions', {
		url: '/terms_conditions',
		cache: false,
		templateUrl: 'templates/terms_conditions.html',
		controller: 'TermsConditionCtrl'
	})
	.state('cart', {
		url: '/cart',
		cache: false,
		templateUrl: 'templates/cart.html',
		controller: 'CartCtrl'
	})
	.state('side_menu', {
		url: '/side_menu',
		cache: false,
		templateUrl: 'templates/side_menu.html',
		controller: 'SideMenuCtrl'
	})
	.state('news_list', {
		url: '/news_list',
		cache: false,
		templateUrl: 'templates/news_list.html',
		controller: 'NewsListCtrl'
	})
	.state('post_news', {
		url: '/post_news',
		cache: false,
		templateUrl: 'templates/post_news.html',
		controller: 'PostNewsCtrl'
	})
	.state('news_detail', {
		url: '/news_list/:newsId',
		cache: false,
		templateUrl: 'templates/news_detail.html',
		controller: 'NewsDetailCtrl'
	})
	.state('select_feeds', {
		url: '/select_feeds',
		cache: false,
		templateUrl: 'templates/select_feeds.html',
		controller: 'SelectFeedsCtrl'
	})
	.state('place_order', {
		url: '/place_order',
		cache: false,
		templateUrl: 'templates/place_order.html',
		controller: 'PlaceOrderCtrl'
	})
	.state('payment_methods', {
		url: '/payment_methods',
		cache: false,
		templateUrl: 'templates/payment_methods.html',
		controller: 'PaymentMethodsCtrl'
	})
	.state('creditcard', {
		url: '/creditcard',
		cache: false,
		templateUrl: 'templates/creditcard.html',
		controller: 'AddCreditcardCtrl'
	})
	.state('orders', {
		url: '/orders',
		cache: false,
		templateUrl: 'templates/orders.html',
		controller: 'OrderCtrl'
	})
	.state('order_detail', {
		url: '/order_detail',
		cache: false,
		templateUrl: 'templates/order_detail.html',
		controller: 'OrderDetailCtrl'
	})
	.state('make_payment', {
		url: '/make_payment',
		cache: false,
		templateUrl: 'templates/make_payment.html',
		controller: 'MakePaymentCtrl'
	})
	.state('team', {
		url: '/team',
		cache: false,
		templateUrl: 'templates/team_page/team.html',
		controller: 'TeamCtrl'
	})
	.state('team_payment', {
		url: '/team_payment',
		cache: false,
		templateUrl: 'templates/team_page/team_payment.html',
		controller: 'TeamPaymentCtrl'
	})
	.state('team_details', {
		url: '/team_details',
		cache: false,
		templateUrl: 'templates/team_page/team_details.html',
		controller: 'TeamDetailCtrl'
	})
	.state('team_schedule', {
		url: '/team_schedule/:teamId',
		cache: false,
		templateUrl: 'templates/team_page/team_schedule.html',
		controller: 'TeamScheduleCtrl'
	})
	.state('send_message', {
		url: '/send_message',
		cache: false,
		templateUrl: 'templates/send_message.html',
		controller: 'SendMessageCtrl'
	})
	.state('standing', {
		url: '/standing',
		cache: false,
		templateUrl: 'templates/standing.html',
		controller: 'StandingCtrl'
	})
	.state('roster', {
		url: '/roster',
		cache: false,
		templateUrl: 'templates/roster.html',
		controller: 'RosterCtrl'
	})
	.state('add_coordinator', {
		url: '/add_coordinator',
		cache: false,
		templateUrl: 'templates/add_coordinator.html',
		controller: 'AddCoordinatorCtrl'
	})
	.state('add_player', {
		url: '/add_player',
		cache: false,
		templateUrl: 'templates/add_player.html',
		controller: 'AddPlayerCtrl'
	})
	.state('photos', {
		url: '/photos',
		cache: false,
		templateUrl: 'templates/photos.html',
		controller: 'PhotosCtrl'
	})
	
	.state('new_location', {
		url: '/new_location',
		cache: false,
		templateUrl: 'templates/new_location.html',
		controller: 'NewLocationCtrl'
	})
	.state('new_venue', {
		url: '/new_venue',
		cache: false,
		templateUrl: 'templates/new_venue.html',
		controller: 'NewVenueCtrl'
	})
    .state('google_map', {
		url: '/google_map/:location',
		cache: false,
		templateUrl: 'templates/google_map.html',
		controller: 'GoogleMapCtrl'
	})
	$urlRouterProvider.otherwise('/login')
})