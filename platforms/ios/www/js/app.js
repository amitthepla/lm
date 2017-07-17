// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic','starter.controllers', 'ngOpenFB','starter.services','starter.factories','ngCordova','base64','ionic','ion-gallery'])

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

.run(function($ionicPlatform,$http, $cordovaPush,$rootScope,$window,$ionicPopup,$state) {
    var iosConfig = {
		"badge": true,
		"sound": true,
		"alert": true,
    };
     $ionicPlatform.ready(function() {
		$cordovaPush.register(iosConfig).then(function(deviceToken) {
		// Success -- send deviceToken to server, and store for future use
            window.localStorage["device_token"] = deviceToken;
            window.sessionStorage.setItem("DeviceTokenCookie", deviceToken);
            console.log(deviceToken);
			//alert("deviceToken: " + deviceToken);
		}, function(err) {
			//alert("Registration error: " + err);
		});
        $rootScope.$on('$cordovaPush:notificationReceived', function(event, notification) {
			if (notification.alert) {
                       
               var TeamNewsPostID = window.localStorage.getItem("TeamNewsPostIdValue");
               var EventPushNotifyId = window.localStorage.getItem("EventPushNotifyId");
                       
               if(TeamNewsPostID != notification.news_item_id && EventPushNotifyId != notification.event_id){                      
                if(notification.foreground == "1") {
                    //alert(JSON.stringify(notification, null, 4));
					var confirmPopup = $ionicPopup.confirm({
						title: 'Notification',
						cssClass : 'error_msg',
						template: notification.alert
					});
					confirmPopup.then(function(res) {
						if(res) {
							if(window.localStorage.getItem("auth_token")) {
							   window.localStorage["org_id"] = notification.org_id;
							   window.localStorage["is_push_notify"] = true;
								if(notification.type == 'news_item') {
								   window.localStorage["push_news_id"] = notification.news_item_id;
								   $("#content-loader").show();
                                   confirmPopup.close();
								   $window.location.href = "#/site_news_detail";
                                   $state.reload();
								} else if(notification.type == 'event') {
								   window.localStorage["push_event_id"] = notification.event_id;
								   $("#content-loader").show();
                                   confirmPopup.close();
								   $window.location.href = "#/event_detail";
								   $state.reload();
								}
							} else {
								$window.location.href = "#/login";
								confirmPopup.close();
							}
						} else {
							confirmPopup.close();
						}
					});
				}
               else {
                   if(window.localStorage.getItem("auth_token")) {
                       window.localStorage["org_id"] = notification.org_id;
                       window.localStorage["is_push_notify"] = true;
                       if(notification.type == 'news_item') {
                            window.localStorage["push_news_id"] = notification.news_item_id;
                            $("#content-loader").show();
                            $window.location.href = "#/site_news_detail";
                            $state.reload();
                       } else if(notification.type == 'event') {
                            window.localStorage["push_event_id"] = notification.event_id;
                            $("#content-loader").show();
                            $window.location.href = "#/event_detail";
                       }
                    } else {
                       $window.location.href = "#/login";
                    }
               }
              }
			}
			if (notification.sound) {
				var snd = new Media(event.sound);
				snd.play();
			}
			if (notification.badge) {
				$cordovaPush.setBadgeNumber(notification.badge).then(function(result) {
					
				}, function(err) {});
			}
        });
        $cordovaPush.unregister(options).then(function(result) {
            // Success!
        }, function(err) {
            //alert(err);
        });
    });
})

.config(function(ionGalleryConfigProvider) {
  ionGalleryConfigProvider.setGalleryConfig({
                          action_label: 'Close',
                          toggle: false,
                          row_size: 3
  });
})
.config(function($stateProvider, $urlRouterProvider,$ionicConfigProvider) {
	if(!ionic.Platform.isAndroid())$ionicConfigProvider.scrolling.jsScrolling(false);
    $ionicConfigProvider.views.swipeBackEnabled(false);
	$stateProvider
	.state('login', {
		url: '/login',
		cache: false,
		templateUrl: 'templates/login.html'
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
		url: '/create_event/:eventId',
		cache: false,
		templateUrl: 'templates/manage_schedule/create_event.html',
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
		templateUrl: 'templates/manage_schedule/add_result.html',
		controller: 'AddResultCtrl'
	})
	.state('cancel_event', {
		url: '/cancel_event',
		cache: false,
		templateUrl: 'templates/manage_schedule/cancel_event.html',
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
		templateUrl: 'templates/team_page/news_list.html',
		controller: 'NewsListCtrl'
	})
	.state('post_news', {
		url: '/post_news',
		cache: false,
		templateUrl: 'templates/team_page/post_news.html',
		controller: 'PostNewsCtrl'
	})
	.state('select_photo_account', {
		url: '/select_photo_account',
		cache: false,
		templateUrl: 'templates/team_page/select_photo_account.html',
		controller: 'SelectPhotoAccountCtrl'
	})
	.state('select_link_article_menus', {
		url: '/select_link_article_menus',
		cache: false,
		templateUrl: 'templates/team_page/select_link_article_menus.html',
		controller: 'SelectLinkArticleMenusCtrl'
	})
	.state('select_link_article', {
		url: '/select_link_article',
		cache: false,
		templateUrl: 'templates/team_page/select_link_article.html',
		controller: 'SelectLinkArticleCtrl'
	})
	.state('select_team_pages', {
		url: '/select_team_pages',
		cache: false,
		templateUrl: 'templates/team_page/select_team_pages.html',
		controller: 'SelectTeamPagesArticleCtrl'
	})
	.state('select_children_team_page', {
		url: '/select_children_team_page',
		cache: false,
		templateUrl: 'templates/team_page/select_children_team_page.html',
		controller: 'SelectChildrenTeamPagesArticleCtrl'
	})
	.state('select_children_team_page2', {
		url: '/select_children_team_page2',
		cache: false,
		templateUrl: 'templates/team_page/select_children_team_page2.html',
		controller: 'SelectChildrenTeamPagesArticle2Ctrl'
	})
	.state('select_children_page', {
		url: '/select_children_page',
		cache: false,
		templateUrl: 'templates/team_page/select_children_page.html',
		controller: 'SelectChildrenPageCtrl'
	})
	.state('select_external_website', {
		url: '/select_external_website',
		cache: false,
		templateUrl: 'templates/team_page/select_external_website.html',
		controller: 'SelectTeamExternalWebsiteCtrl'
	})
	.state('select_photos', {
		url: '/select_photos',
		cache: false,
		templateUrl: 'templates/team_page/select_photos.html',
		controller: 'SelectPhotosCtrl'
	})
	.state('select_photo_albums', {
		url: '/select_photo_albums',
		cache: false,
		templateUrl: 'templates/team_page/select_photo_albums.html',
		controller: 'SelectPhotoAlbumsCtrl'
	})
	.state('news_detail', {
		url: '/news_detail',
		cache: false,
		templateUrl: 'templates/team_page/news_detail.html',
		controller: 'NewsDetailCtrl'
	})
	.state('select_feeds', {
		url: '/select_feeds',
		cache: false,
		templateUrl: 'templates/News/select_feeds.html',
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
		url: '/team_schedule',
		cache: false,
		templateUrl: 'templates/team_page/team_schedule.html',
		controller: 'TeamScheduleCtrl'
	})
	.state('send_message', {
		url: '/send_message',
		cache: false,
		templateUrl: 'templates/team_page/send_message.html',
		controller: 'SendMessageCtrl'
	})
	.state('standing', {
		url: '/standing',
		cache: false,
		templateUrl: 'templates/team_page/standing.html',
		controller: 'StandingCtrl'
	})
	.state('roster', {
		url: '/roster',
		cache: false,
		templateUrl: 'templates/team_page/roster.html',
		controller: 'RosterCtrl'
	})
	.state('add_coordinator', {
		url: '/add_coordinator',
		cache: false,
		templateUrl: 'templates/team_page/add_coordinator.html',
		controller: 'AddCoordinatorCtrl'
	})
	.state('add_player', {
		url: '/add_player',
		cache: false,
		templateUrl: 'templates/team_page/add_player.html',
		controller: 'AddPlayerCtrl'
	})
	.state('photos', {
		url: '/photos',
		cache: false,
		templateUrl: 'templates/team_page/photos.html',
		controller: 'PhotosCtrl'
	})
	.state('months', {
		url: '/months',
		cache: false,
		templateUrl: 'templates/manage_schedule/month.html',
		controller: 'MonthsCtrl'
	})
	.state('new_location', {
		url: '/new_location',
		cache: false,
		templateUrl: 'templates/manage_schedule/new_location.html',
		controller: 'NewLocationCtrl'
	})
	.state('new_venue', {
		url: '/new_venue/:locationId',
		cache: false,
		templateUrl: 'templates/manage_schedule/new_venue.html',
		controller: 'NewVenueCtrl'
	})
    .state('google_map', {
		url: '/google_map/:location',
		cache: false,
		templateUrl: 'templates/google_map.html',
		controller: 'GoogleMapCtrl'
	})
	/**Manage schedule**/
	.state('manage_schedule_list', {
		url: '/manage_schedule_list',
		cache: false,
		templateUrl: 'templates/manage_schedule/manage_schedule_list.html',
		controller: 'ManageScheduleListCtrl'
	})
	.state('manage_event_detail', {
		url: '/manage_event_detail',
		cache: false,
		templateUrl: 'templates/manage_schedule/manage_event_detail.html',
		controller: 'ManageEventDetailCtrl'
	})
	.state('manage_activity_filter', {
		url: '/manage_activity_filter',
		cache: false,
		templateUrl: 'templates/manage_schedule/manage_activity_filter.html',
		controller: 'ManageActivityFilterCtrl'
	})
	.state('news', {
		url: '/news',
		cache: false,
		templateUrl: 'templates/News/news.html',
		controller: 'NewsCtrl'
	})
	.state('site_news_detail', {
		url: '/site_news_detail',
		cache: false,
		templateUrl: 'templates/News/site_news_detail.html',
		controller: 'SiteNewsDetailCtrl'
	})	
	.state('post_site_news', {
		url: '/post_site_news',
		cache: false,
		templateUrl: 'templates/News/post_site_news.html',
		controller: 'PostSiteNewsCtrl'
	})
	.state('select_photo_account_site', {
		url: '/select_photo_account_site',
		cache: false,
		templateUrl: 'templates/News/select_photo_account_site.html',
		controller: 'SelectPhotoAccountSiteCtrl'
	})
	.state('select_team_pages_site', {
		url: '/select_team_pages_site',
		cache: false,
		templateUrl: 'templates/News/select_team_pages_site.html',
		controller: 'SelectTeamPagesArticleSiteCtrl'
	})
	.state('select_children_team_page_site', {
		url: '/select_children_team_page_site',
		cache: false,
		templateUrl: 'templates/News/select_children_team_page_site.html',
		controller: 'SelectChildrenTeamPagesArticleSiteCtrl'
	})
	.state('select_children_team_page2_site', {
		url: '/select_children_team_page2_site',
		cache: false,
		templateUrl: 'templates/News/select_children_team_page2_site.html',
		controller: 'SelectChildrenTeamPagesArticle2SiteCtrl'
	})
	.state('select_children_page_site', {
		url: '/select_children_page_site',
		cache: false,
		templateUrl: 'templates/News/select_children_page_site.html',
		controller: 'SelectChildrenPageSiteCtrl'
	})
	.state('select_external_website_site', {
		url: '/select_external_website_site',
		cache: false,
		templateUrl: 'templates/News/select_external_website_site.html',
		controller: 'SelectTeamExternalWebsiteSiteCtrl'
	})
	.state('select_photos_site', {
		url: '/select_photos_site',
		cache: false,
		templateUrl: 'templates/News/select_photos_site.html',
		controller: 'SelectPhotosSiteCtrl'
	})
	.state('select_photo_albums_site', {
		url: '/select_photo_albums_site',
		cache: false,
		templateUrl: 'templates/News/select_photo_albums_site.html',
		controller: 'SelectPhotoAlbumsSiteCtrl'
	})
	.state('select_link_article_menus_site', {
		url: '/select_link_article_menus_site',
		cache: false,
		templateUrl: 'templates/News/select_link_article_menus_site.html',
		controller: 'SelectLinkArticleMenusSiteCtrl'
	})
	.state('select_link_article_site', {
		url: '/select_link_article_site',
		cache: false,
		templateUrl: 'templates/News/select_link_article_site.html',
		controller: 'SelectLinkArticleSiteCtrl'
	})
	.state('reminder', {
		url: '/reminder',
		cache: false,
		templateUrl: 'templates/reminder.html',
		controller: 'ReminderCtrl'
	})

	$urlRouterProvider.otherwise('/login')
})