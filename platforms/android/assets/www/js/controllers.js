angular.module('starter.controllers', ['ngOpenFB','angular.filter','ui.bootstrap.datetimepicker','base64','ngCordova']) 

.controller('SideMenuCtrl', function($scope,$window,$ionicSideMenuDelegate,$filter,$state,CartCountFactory,$base64,getUserTypeFactory) {
	var orgId = window.localStorage.getItem("org_id");
    var auth_token = window.localStorage.getItem("auth_token");
	var result = getUserTypeFactory.getUserType($base64.encode(orgId),$base64.encode(auth_token));
	result.success(function(data){
		window.localStorage["is_admin"] = data.is_admin;
		$scope.isAdmin = data.is_admin;
	});
	result.error(function(data){});
	$scope.init = function() {
		$scope.isOrg = false;
		if(window.localStorage.getItem("org_id")) {
			var org_id = parseInt(window.localStorage.getItem("org_id"));
			var OrgList = JSON.parse(window.localStorage.getItem("orgList"));
			if(OrgList.length > 1) {
				$scope.isOrg = true;
			}
			var orgDetail = $filter('filter')(OrgList, {org_id: org_id},true)[0];
			$scope.orgTitle = orgDetail.name;
			window.localStorage["org_name_reminder"] = orgDetail.name; //This is require to set the organization name for reminder page
		}
		
		$scope.cartCountVal = 0;
			var orgId = window.localStorage.getItem("org_id");
			var auth_token = window.localStorage.getItem("auth_token");
			var result = CartCountFactory.countCart($base64.encode(orgId),$base64.encode(auth_token));
			result.success(function(data){
				if(data.status == 'success'){
					$scope.cartCountVal = data.total_cart_items;
					window.localStorage["CartItemCount"] = data.total_cart_items;
				}
			});
			result.error(function(data) {});
	}
	$scope.home = function() {
		$ionicSideMenuDelegate.toggleLeft();
		window.localStorage["is_filter"] = 0;
		$("#content-loader").show();
		$window.location.href = '#/landing_page';
	};
	$scope.logout = function() {
		window.localStorage.clear();
		$window.location.href = '#/login';
	};
	$scope.GoMySchedule = function() {
		$("#content-loader").hide();
		$ionicSideMenuDelegate.toggleLeft();
		window.localStorage["is_filter"] = 0;
        if(window.localStorage.getItem("filter_res")) {
			window.localStorage.removeItem("filter_res");
			window.localStorage.removeItem("BackEvent");
			$window.location.href = '#/calender';
			$state.reload();
		} else {
			$window.location.href = '#/calender';
		}
	};
	$scope.GoRegistration = function() {
		$ionicSideMenuDelegate.toggleLeft();
		window.localStorage["isRegFilter"] = 0;
		$window.location.href = '#/registration';
	};
	$scope.GoOrderHistory = function() {
        window.localStorage.removeItem("orderType");
        if(window.localStorage.getItem("OrderList")) {
			window.localStorage.removeItem("OrderList");
			window.localStorage.removeItem("order_page");
		}
		$ionicSideMenuDelegate.toggleLeft();
		$window.location.href = '#/orders';
	};
	$scope.GoNews = function() {
		$ionicSideMenuDelegate.toggleLeft();
		$window.location.href = '#/news';
	};
	$scope.GoTeam = function() {
		if(window.localStorage.getItem('TeamList')) {
			window.localStorage.removeItem('TeamList');
		}
		$ionicSideMenuDelegate.toggleLeft();
		$window.location.href = ' #/team';
	};
	$scope.GoCart = function() {
		$ionicSideMenuDelegate.toggleLeft();
		$window.location.href = '#/cart';
	};
	$scope.GoManageSchedule = function() {
		window.localStorage["is_manage_filter"] = 0;
		$ionicSideMenuDelegate.toggleLeft();
		$window.location.href = '#/manage_schedule_list';
	};
	$scope.OpenPhotos = function() {
		$ionicSideMenuDelegate.toggleLeft();
		$window.location.href = '#/photos';
	};
	$scope.notifications = function() {
        if ($(".DisplayData").is(":visible") == false) {
           $("#content-loader").show();
        }
		$ionicSideMenuDelegate.toggleLeft();
		$window.location.href = '#/reminder';
	};
})	

.controller('LoginCtrl', function($scope,$ionicModal, $timeout, ngFB,$ionicPlatform,$location,$timeout,$window,$ionicPopup,LoginFactory,$http,LoginFbFactory,$cordovaOauth) {
	if(window.localStorage.getItem("device_token") == null && window.sessionStorage.getItem("DeviceTokenCookie") != null) {
		window.localStorage["device_token"] = window.sessionStorage.getItem("DeviceTokenCookie");
	}   
    $scope.showLogin = true;
    $scope.showLoggingin = false;
    $scope.showFb = true;
    $scope.showFbLoad = false;
    $scope.init = function() {
		$("#content-loader").hide();
		if(window.localStorage.getItem("email")){
			if(window.localStorage.getItem("org_id")) {
				var orgid = window.localStorage.getItem("org_id");
				window.localStorage["is_filter"] = 0;
				$("#content-loader").show();
				$window.location.href = '#/landing_page/'+orgid;
			} else {
				$("#content-loader").show();
				$window.location.href = '#/landing_page';
			}
		} else {
			$window.location.href = '#/login';
		}
    };
    $scope.doLogin = function() {
        if ($scope.LoginForm.$valid) {
				$scope.showLoggingin = true;
				$scope.showLogin = false;
				if($scope.loginData) {
					var device_token = window.localStorage.getItem("device_token");
					var result = LoginFactory.userLogin($scope.loginData,device_token,device_type);
					result.success(function(data) {
								/*cordova.plugins.Keyboard.close();*/
                                window.localStorage["auth_token"] = data.auth_token;
                                window.localStorage["email"] = $scope.loginData.email;
                                window.localStorage["orgList"] = JSON.stringify(data.organizations_list);
                                $("#content-loader").show();
                                $window.location.href = '#/landing_page';

                    });
                    result.error(function(data) {
						var alertPopup = $ionicPopup.alert({
							title: 'Invalid Credentials',
							cssClass : 'error_msg',
							template: data.message
						});
                        $scope.loginData.password = '';
                        $scope.showLoggingin = false;
                        $scope.showLogin = true;
					});
				}
        }
    };
    $scope.fbLogin = function () {
    	$scope.showFb = false;
        $scope.showFbLoad = true;
        $cordovaOauth.facebook("1481679188828787", ["email", "public_profile"], {redirect_uri: "http://localhost/callback"}).then(function(result){
        	var access_token = result.access_token;
           	var expires_in = result.expires_in;
           	getFbUserData(access_token,expires_in);
    	},  function(error){
            //alert("Error: " + error);
			var alertPopup = $ionicPopup.alert({
				title: 'Error',
				cssClass : 'error_msg',
				template: error
			});
            $scope.showFb = true;
            $scope.showFbLoad = false;
    	});
	};
    function getFbUserData(access_token,expires_in) {
        $http.get("https://graph.facebook.com/v2.2/me", {params: {access_token: access_token, fields: "id,name,email,birthday,first_name,last_name,gender", format: "json" }}).then(function(result) {
        	var user = result.data;
			var device_token = window.localStorage.getItem("device_token");
            var record = LoginFbFactory.userLoginFb(access_token,expires_in,user,device_token,device_type);
            record.success(function(data) {
				/*cordova.plugins.Keyboard.close();*/
                window.localStorage["is_fb"] = 1;
                window.localStorage["access_token"] = access_token;
                window.localStorage["auth_token"] = data.auth_token;
                window.localStorage["email"] = user.email;
                window.localStorage["orgList"] = JSON.stringify(data.organizations_list);
				$("#content-loader").show();
                $window.location.href = '#/landing_page';
            });
            record.error(function(data) {
                 //alert(data.message);
				var alertPopup = $ionicPopup.alert({
					title: 'Error',
					cssClass : 'error_msg',
					template: data.message
				});
                 $scope.showFb = true;
                 $scope.showFbLoad = false;
            });   
        }, function(error) {
            //alert("There was a problem getting your profile.");
			var alertPopup = $ionicPopup.alert({
				title: 'Error',
				cssClass : 'error_msg',
				template: "There was a problem getting your profile."
			});
             $scope.showFb = true;
             $scope.showFbLoad = false;
        });
    }
})

.controller('LandCtrl', function ($scope, ngFB,$ionicPopover,$ionicHistory,$timeout,$ionicSideMenuDelegate,$window,getUserTypeFactory,$base64) {
	$("#content-loader").show();
    var auth_token = window.localStorage.getItem("auth_token");
    $scope.init = function () {
           	/*cordova.plugins.Keyboard.close();*/
			if(window.localStorage.getItem("is_fb")) {
				$("#profile_details").show();
			}
			var data = JSON.parse(window.localStorage.getItem("orgList"));
			var clubsArr = [];
            for (var i in data) {
                if(data[i].logo_url != "NA") {
                    data[i]['logo'] = logourls+data[i].logo_url;
                } else {
                    data[i]['logo'] = "img/icons/9.png";
                }
				clubsArr.push(data[i]);
			}
			$scope.clubs = clubsArr;
			$timeout(function() {
                $("#content-loader").hide();
            }, 1500);
			if(clubsArr.length == 1) {
				$("#content-loader").show();
				orgid = clubsArr[0].org_id;
				window.localStorage["org_id"] = orgid;
				window.localStorage["is_filter"] = 0;
				//$window.location.href = '#/calender';
				$window.location.href = "#/landing_page/"+orgid;
			}
	}
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		$("#content-loader").show();
		$window.history.back();
	};
	$scope.saveOrgId = function(orgid) {
		$("#content-loader").show();
		window.localStorage["org_id"] = orgid;
		window.localStorage["is_filter"] = 0;
		$window.location.href = "#/landing_page/"+orgid;
		//$window.location.href = '#/calender';
	}
})

.controller('ClubCtrl', function($scope,$ionicPopover,$ionicHistory,$timeout,$ionicSideMenuDelegate,$window,orgIdFactory,CartCountFactory,$stateParams,$filter,$base64,getUserTypeFactory) {
	$("#manage_schedule").hide();
	$("#site_news").hide();
	var orgId = window.localStorage.getItem("org_id");
    var auth_token = window.localStorage.getItem("auth_token");
	var result = getUserTypeFactory.getUserType($base64.encode(orgId),$base64.encode(auth_token));
	result.success(function(data){
		window.localStorage["is_admin"] = data.is_admin;
		if(data.is_admin) {
			$("#manage_schedule").show();
			$("#site_news").show();
		}
		$("#content-loader").hide();
	});
	result.error(function(data){
        $("#content-loader").hide();
    });
	var id = parseInt($stateParams.clubId);
	var data = JSON.parse(window.localStorage.getItem("orgList"));
	var orgDetail = $filter('filter')(data, {org_id: id},true)[0];
	$scope.orgTitle = orgDetail.name;
	window.localStorage["org_name_reminder"] = orgDetail.name; //This is require to set the organization name for reminder page
	$scope.cartCountVal = 0;
    if(orgDetail.logo_url != "NA") {
        $scope.orgLogo = API_URL+'/'+orgDetail.logo_url;
    } else {
        $scope.orgLogo = "img/icons/9.png";
    }
	$scope.init = function() {
		//if(window.localStorage.getItem("CartItemCount")){
		//	$scope.cartCountVal = window.localStorage.getItem("CartItemCount");
		//}else{
			var orgId = window.localStorage.getItem("org_id");
		    var auth_token = window.localStorage.getItem("auth_token");
			var result = CartCountFactory.countCart($base64.encode(orgId),$base64.encode(auth_token));
			result.success(function(data){
				//alert(JSON.stringify(data, null, 4));
				if(data.status == 'success'){
					$scope.cartCountVal = data.total_cart_items;
					window.localStorage["CartItemCount"] = data.total_cart_items;
				}
			});
			result.error(function(data) {});
		//}
	}
	
	orgIdFactory.setClubId(id);
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		$("#content-loader").show();
		$window.history.back();
	};
	$scope.openCalender = function() {
		$("#content-loader").show();
		window.localStorage["is_filter"] = 0;
        if(window.localStorage.getItem("filter_res")) {
            window.localStorage.removeItem("filter_res");
            window.localStorage.removeItem("BackEvent");
        }
		$window.location.href = "#/calender";
	};
	$scope.openRegistration = function() {
		$("#content-loader").show();
		window.localStorage["isRegFilter"] = 0;
		$window.location.href = "#/registration";
	};
	$scope.home = function() {
		window.localStorage["is_filter"] = 0;
		$("#content-loader").show();
		$window.location.href = '#/landing_page';
	};
	$scope.logout = function() {
		window.localStorage.clear();
		$window.location.href = '#/login';
	};
    $scope.openOrder = function() {
        window.localStorage.removeItem("orderType");
        if(window.localStorage.getItem("OrderList")) {
			window.localStorage.removeItem("OrderList");
			window.localStorage.removeItem("order_page");
		}
		$ionicSideMenuDelegate.toggleLeft();
		$window.location.href = '#/orders';
    };
	$scope.GoTeam = function() {
		if(window.localStorage.getItem('TeamList')) {
			window.localStorage.removeItem('TeamList');
		}
		$ionicSideMenuDelegate.toggleLeft();
		$window.location.href = ' #/team';
	};
	$scope.GoNews = function() {
		$ionicSideMenuDelegate.toggleLeft();
		$window.location.href = '#/news';
	};
	$scope.notifications = function() {
		$ionicSideMenuDelegate.toggleLeft();
		$("#content-loader").show();
		$window.location.href = '#/reminder';
	};
})

.controller('ProfileCtrl', function($scope,ngFB,$timeout,$ionicSideMenuDelegate,$window,$http) {
   	var access_token = window.localStorage.getItem("access_token");
   	$http.get("https://graph.facebook.com/v2.2/me", {params: {access_token: access_token, fields: "id,name,email,gender,picture", format: "json" }}).then(function(result) {
    	$scope.profileData = result.data;
	}, function(error) {
    	alert("There was a problem getting your profile.");
	});
    $scope.toggleLeft = function() {
        $ionicSideMenuDelegate.toggleLeft();
    };
    $scope.myGoBack = function() {
        //$("#content-loader").show();
        $window.history.back();
    };
})

.controller('ScheduleCtrl', function($scope,$ionicHistory,$timeout,$compile,$timeout,$ionicSideMenuDelegate,$window,$q,MyScheduleFactory,$base64,ActivityListFactory,activitiesFactory,displayDayService,RememberScheduleFactory) {
    $scope.isMessage = false;
    var orgId = window.localStorage.getItem("org_id");
    var auth_token = window.localStorage.getItem("auth_token");
	var all_schedules = JSON.parse(window.localStorage.getItem("AllSchedules"));
	$scope.isFilter = window.localStorage.getItem("is_filter");
	var condition;
	$scope.teams = [];
	$scope.schedules = [];
	$scope.ActivityTitles = [];
	function showButton() {
		if($scope.isFilter == 1) {
			var btn = '<button class="button button-block button-calm" ng-click="SelectAllCal()">Select All Calendars</button>';
		} else {
			var btn = '<button class="button button-block button-assertive" ng-click="DeselectAllCal()">De-select All Calendars</button>';
		}
		var temp = $compile(btn)($scope);
		$("#btn_content").html(temp);
	}
    $scope.init = function () {
		$("#content-loader").show();
		if(window.localStorage.getItem("FilterCase")) {
			window.localStorage.removeItem("FilterCase");
		}
        var result = MyScheduleFactory.myScheduleRec($base64.encode(orgId),$base64.encode(auth_token));
        result.success(function(data) {
            var defer = $q.defer();
            if(data.teams.length == 0) {
				condition = 1;
				var teamsArr = [];
				if(data.activities.length) {
					for (var i in data.activities) {
						teamsArr.push(data.activities[i]);
						$scope.ActivityTitles.push(data.activities[i].title);
					}
				}
				if(teamsArr.length == 0) {
					$scope.isMessage = true;
					$("#btn_content").children().attr( "disabled", "disabled" );
				}
				$scope.teams = teamsArr;
				if($scope.teams.length) {
					showButton();
				}
				$scope.teams.sort(function (a, b) {
					return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
				});
				$("#content-loader").hide();
            } else {
				condition = 2;
                defer.resolve({
                    data:data
                });
                var promise = defer.promise;
                promise.then(function (list) {
                    var schedulesArr = [];
                    for (var i in data.teams) {
                        if(data.teams[i].name.length > 20) {
                    		data.teams[i].name = $.trim(data.teams[i].name).substring(0, 20)
                             .trim(data.teams[i].name) + "...";
                    	}
                        schedulesArr.push(data.teams[i]);
                    }
					if(schedulesArr.length == 0) {
						$scope.isMessage = true;
						$("#btn_content").children().attr( "disabled", "disabled" );
					}
                    $scope.schedules = schedulesArr;
					if($scope.schedules.length) {
						showButton();
					}
					$scope.schedules.sort(function (a, b) {
						return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
					});
					$("#content-loader").hide();
                });
            }
			window.localStorage["FilterCase"] = condition;
        });
        result.error(function(data) {});
    };
	$scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
		var filter_schedules = [];
		if(window.localStorage.getItem("filter_res") && window.localStorage.getItem("filter_res") != 'all') {
			filter_schedules = JSON.parse(window.localStorage.getItem("filter_res"));
			if($scope.isFilter == 1) {
				for (var i in filter_schedules) {
					$("input[type=checkbox][value='"+filter_schedules[i]+"']").prop("checked",true);
				}
				if($('input:checkbox:checked').length == $('input:checkbox.chk-schedule').length) {
					var btn = '<button class="button button-block button-assertive" ng-click="DeselectAllCal()">De-select All Calendars</button>';
					var temp = $compile(btn)($scope);
					$("#btn_content").html(temp);
				}
			}
		} else if((window.localStorage.getItem("filter_res") && window.localStorage.getItem("filter_res") == 'all') || !window.localStorage.getItem("filter_res")) {
			$('input:checkbox.chk-schedule').each(function () {
				$(this).prop('checked', 'checked');
			});
			var btn = '<button class="button button-block button-assertive" ng-click="DeselectAllCal()">De-select All Calendars</button>';
			var temp = $compile(btn)($scope);
			$("#btn_content").html(temp);
		}
	});
    $scope.myGoBack = function() {
        $("#content-loader").show();
        $window.history.back();
    };
    $scope.check_schedule = function() {
        var x = 0;
        $('input:checkbox.chk-schedule').each(function () {
            if (this.checked == false) {
                x++;
            }
        });
        if(x>0 || x == $('input:checkbox.chk-schedule').length) {
            var btn = '<button class="button button-block button-calm" ng-click="SelectAllCal()">Select All Calendars</button>';
            var temp = $compile(btn)($scope);
            $("#btn_content").html(temp);
        }
        if(x == 0) {
            var btn = '<button class="button button-block button-assertive" ng-click="DeselectAllCal()">De-select All Calendars</button>';
            var temp = $compile(btn)($scope);
            $("#btn_content").html(temp);
        }
    };
    $scope.DeselectAllCal = function() {
        $('input:checkbox.chk-schedule').each(function () {
            $(this).prop('checked', '');
        });
        var btn = '<button class="button button-block button-calm" ng-click="SelectAllCal()">Select All Calendars</button>';
        var temp = $compile(btn)($scope);
        $("#btn_content").html(temp);
            
    };
    $scope.SelectAllCal = function() {
        $('input:checkbox.chk-schedule').each(function () {
            $(this).prop('checked', 'checked');
        });
        var btn = '<button class="button button-block button-assertive" ng-click="DeselectAllCal()">De-select All Calendars</button>';
        var temp = $compile(btn)($scope);
        $("#btn_content").html(temp);
    };
    $scope.toggleLeft = function() {
        $ionicSideMenuDelegate.toggleLeft();
    };
	$scope.showActivity = function() {
		if(window.localStorage.getItem("filter_res")) {
			window.localStorage.removeItem("filter_res");
		}
		if(window.localStorage.getItem("is_filter")) {
			window.localStorage.removeItem("is_filter");
		}
        var filter_res = [];
		var finalArray = [];
		var count = 0;
		$('input:checkbox.chk-schedule').each(function () {
			if (this.checked == true) {
				filter_res.push($(this).val());
				count++;
			}
        });
		
		var event_type = window.localStorage.getItem("FilterEvent");
		if(count>0 && (count == $('input:checkbox.chk-schedule').length)) {
			window.localStorage["filter_res"] = 'all';
			window.localStorage["is_filter"] = 1;
			$window.location.href = '#/calender';
		} else if(count>0 && (count != $('input:checkbox.chk-schedule').length)) {
			window.localStorage["filter_res"] = JSON.stringify(filter_res);
			window.localStorage["is_filter"] = 1;
			$window.location.href = '#/calender';
		} else if(count == 0){
			window.localStorage.removeItem("filter_res");
			window.localStorage["is_filter"] = 1;
			$window.location.href = '#/calender';
		}
    };
})
.controller('CalenderCtrl', function($scope,$ionicHistory,$ionicPopover,$timeout,$ionicSideMenuDelegate,$window,$filter,eventDetailFactory,ActivityListFactory,$base64,displayDayService,$ionicScrollDelegate) {
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	$scope.isMessage = false;
	$scope.isToday = false;
	var event_type = '';
	var AllEventsList = [];
	var page = 0;
	var team_ids = '';
	$scope.events = [];
    $scope.noMoreItemsAvailable = false;
    $scope.init = function () {
        $("#content-loader").hide();
		if(window.localStorage.getItem("is_filter") == 1) {
			//List of data after filter
			if(window.localStorage.getItem("EventType") == 'upcoming') {
				$scope.isToday = true;
				$("#upcoming_event").addClass("active");
				$("#recent_event").removeClass("active");
			} else {
				$scope.isToday = false;
				$("#recent_event").addClass("active");
				$("#upcoming_event").removeClass("active");
			}
		} else {
			//Initial records of calender
			if(window.localStorage.getItem("BackEvent")) {
					if(window.localStorage.getItem("EventType")) {
						window.localStorage.removeItem("EventType");
					}
					if(window.localStorage.getItem("BackEvent") == 'upcoming') {
						team_ids = 'all';
						event_type = 'upcoming';
						window.localStorage["EventType"] = event_type;
						$timeout(function() {
							$("#upcoming_event").addClass("active");
							$("#recent_event").removeClass("active");
							$scope.isToday = true;
						}, 200);
					} else {
						team_ids = 'all';
						event_type = 'completed';
						window.localStorage["EventType"] = event_type;
						$timeout(function() {
							$("#upcoming_event").removeClass("active");
							$("#recent_event").addClass("active");
							$scope.isToday = false;
						}, 200);
					}			
			} else {
				$timeout(function() {
					$("#upcoming_event").addClass("active");
					$("#recent_event").removeClass("active");
					$scope.isToday = true;
					team_ids = 'all';
					event_type = 'upcoming';
					window.localStorage["EventType"] = event_type;
				}, 200);
			}
		}
    };
    $scope.myGoBack = function() {
        $("#content-loader").show();
        $window.history.back();
    };
    $scope.toggleLeft = function() {
        $ionicSideMenuDelegate.toggleLeft();
    };
    $scope.createEvent = function() {
        $("#content-loader").show();
        $window.location.href = '#/create_event';
    };
    $scope.goEventDetail = function(id) {
		if(window.localStorage.getItem("BackEvent")) {
			window.localStorage.removeItem("BackEvent");
		}
		if($(".tab-menu .tab.active").attr('id') == 'upcoming_event') {
            var event_type = "upcoming";
        } else {
            var event_type = "completed";
        }
		window.localStorage["BackEvent"] = event_type;
		
		var id = parseInt(id);
        var AllEvent = $scope.events;
        var object_by_id = $filter('filter')(AllEvent, {id: id },true)[0];
        eventDetailFactory.setEvent(JSON.stringify(object_by_id));
        $window.location.href = "#/event_detail";  
    };
	$scope.filterSchedule = function() {
		if(window.localStorage.getItem("FilterEvent")) {
			window.localStorage.removeItem("FilterEvent");
		}
		if(window.localStorage.getItem("BackEvent")) {
			window.localStorage.removeItem("BackEvent");
		}
		var tab_id = $(".tab-menu .tab.active").attr('id');
        if(tab_id == 'upcoming_event') {
            var event_type = "upcoming";
		} else {
            var event_type = "completed";
        }
		window.localStorage["FilterEvent"] = event_type;
		window.localStorage["BackEvent"] = event_type;
		$window.location.href = "#/schedule_list";
    };
    $scope.showLocation = function(location) {
		if(window.localStorage.getItem("BackEvent")) {
			window.localStorage.removeItem("BackEvent");
		}
		if(window.localStorage.getItem("prev_hash")) {
			window.localStorage.removeItem("prev_hash");
		}
		if($(".tab-menu .tab.active").attr('id') == 'upcoming_event') {
            var event_type = "upcoming";
        } else {
            var event_type = "completed";
        }
		window.localStorage["BackEvent"] = event_type;
        window.localStorage["prev_hash"] = window.location.hash;
        $("#content-loader").show();
        $window.location.href = "#/google_map/"+location;
    };
    $scope.showTodayEvent = function() {
        $ionicScrollDelegate.$getByHandle('small').scrollTop(true);
    };
	$scope.display_event = function(event_type) {
		if(window.localStorage.getItem("EventType")) {
			window.localStorage.removeItem("EventType");
		}
		$("#norecord").hide();
        $("#content-loader").hide();
        $ionicScrollDelegate.$getByHandle('small').scrollTop(true);
        $scope.noMoreItemsAvailable = false;
		page = 0;
		$scope.isMessage = false;
		//window.localStorage["is_filter"] = 0;
		window.localStorage["EventType"] = event_type;
		$scope.events = [];
		AllEventsList = [];
		if(event_type == 'upcoming') {
			$scope.isToday = true;
			$("#upcoming_event").addClass("active");
			$("#recent_event").removeClass("active");
		} else {
			$scope.isToday = false;
			$("#recent_event").addClass("active");
			$("#upcoming_event").removeClass("active");
		}
    };
    $scope.LoadMore = function() {
		$timeout(function() {
			page = page+1;
            $("#content-loader").hide();
			var tab_id = $(".tab-menu .tab.active").attr('id');
            if(tab_id == 'upcoming_event') {
                var event_type = "upcoming";
                var arr_typ = "upcoming_schedules";
            } else {
                var event_type = "completed";
                var arr_typ = "recently_schedules";
            }
            if(window.localStorage.getItem("is_filter") == 1) {
				if(window.localStorage["FilterCase"] == 1) {
					if(window.localStorage.getItem("filter_res") && window.localStorage.getItem("filter_res") == 'all') {
						var filter = 'all';
					} else if(window.localStorage.getItem("filter_res") && window.localStorage.getItem("filter_res") != 'all') {
						var filter = JSON.parse(window.localStorage.getItem("filter_res"));
					}
					if(filter) {
						var result = ActivityListFactory.activityList($base64.encode(orgId),$base64.encode(auth_token),'all',event_type,PerPage,page);
						result.success(function(data) {
							$("#norecord").hide();
							if(data[arr_typ].length < PerPage) {
								$scope.noMoreItemsAvailable = true;
							}
							if(data[arr_typ].length == 0 && $scope.events.length == 0) {
								$("#norecord").show();
								if(event_type == 'upcoming') {
									$("#norecord").text("There are currently no upcoming events in your calendar.");
								} else if(event_type == 'completed') {
									$("#norecord").text("There are no recently completed events in your calendar.");
								}
								$scope.noMoreItemsAvailable = true;
							}
							if(data[arr_typ] && data[arr_typ].length>0) {
								$scope.$broadcast('scroll.infiniteScrollComplete');
									for (var i in data[arr_typ]) {
										if((filter != 'all' && filter.indexOf(data[arr_typ][i].activity_title) > -1) || (filter == 'all')) {
											if(data[arr_typ][i].date != "NA") {
												var day_date = data[arr_typ][i].date;
												var res = day_date.split(" ");
												data[arr_typ][i].actual_date = new Date(res[1]).getTime();
												data[arr_typ][i].day = displayDayService.showFullDay(res[0]);
												data[arr_typ][i].date = moment(res[1]).format('MMMM DD,YYYY').replace(",", ", ");
											} else {
												data[arr_typ][i].actual_date = "";
												data[arr_typ][i].day = "";
												data[arr_typ][i].date = "";
											}
											$scope.events.push(data[arr_typ][i]);
										}
										if(event_type == "completed") {
											$scope.events = $filter('orderBy')($scope.events, '-actual_date');
										}
									}
							} else {
								$scope.noMoreItemsAvailable = true;
							}
						});
						result.error(function(data) {});
					}  else {
						$scope.event = [];
						$("#norecord").show();
						if(event_type == 'upcoming') {
							$("#norecord").text("There are currently no upcoming events in your calendar.");
						} else if(event_type == 'completed') {
							$("#norecord").text("There are no recently completed events in your calendar.");
						}
						$scope.noMoreItemsAvailable = true;
					}
				} else {
					if(window.localStorage.getItem("filter_res") && window.localStorage.getItem("filter_res") == 'all') {
						var filter = 'all';
					} else if(window.localStorage.getItem("filter_res") && window.localStorage.getItem("filter_res") != 'all') {
						var filter = JSON.parse(window.localStorage.getItem("filter_res"));
					}
					if(filter) {
						var result = ActivityListFactory.activityList($base64.encode(orgId),$base64.encode(auth_token),filter,event_type,PerPage,page);
						result.success(function(data) {
							$("#norecord").hide();
							if(data[arr_typ].length < PerPage) {
								$scope.noMoreItemsAvailable = true;
							}
							if(data[arr_typ].length == 0 && $scope.events.length == 0) {
								$("#norecord").show();
								if(event_type == 'upcoming') {
									$("#norecord").text("There are currently no upcoming events in your calendar.");
								} else if(event_type == 'completed') {
									$("#norecord").text("There are no recently completed events in your calendar.");
								}
								$scope.noMoreItemsAvailable = true;
							}
							if((data[arr_typ] && data[arr_typ].length>0)) {
								$scope.$broadcast('scroll.infiniteScrollComplete');
									for (var i in data[arr_typ]) {
										if(data[arr_typ][i].date != "NA") {
											var day_date = data[arr_typ][i].date;
											var res = day_date.split(" ");
											data[arr_typ][i].actual_date = new Date(res[1]).getTime();
											data[arr_typ][i].day = displayDayService.showFullDay(res[0]);
											data[arr_typ][i].date = moment(res[1]).format('MMMM DD,YYYY').replace(",", ", ");
										} else {
											data[arr_typ][i].actual_date = "";
											data[arr_typ][i].day = "";
											data[arr_typ][i].date = "";
										}
										$scope.events.push(data[arr_typ][i]);
									}
									if(event_type == "completed") {
										$scope.events = $filter('orderBy')($scope.events, '-actual_date');
									}
							} else {
								$scope.noMoreItemsAvailable = true;
							}
						});
					
						result.error(function(data) {});
					} else {
						$scope.event = [];
						$("#norecord").show();
						if(event_type == 'upcoming') {
							$("#norecord").text("There are currently no upcoming events in your calendar.");
						} else if(event_type == 'completed') {
							$("#norecord").text("There are no recently completed events in your calendar.");
						}
						$scope.noMoreItemsAvailable = true;
					}
				}
              } else {
				team_ids = 'all';
				var result = ActivityListFactory.activityList($base64.encode(orgId),$base64.encode(auth_token),team_ids,event_type,PerPage,page);
				result.success(function(data) {
					$("#norecord").hide();
					if(data[arr_typ].length < PerPage) {
						$scope.noMoreItemsAvailable = true;
					}
					if(data[arr_typ].length == 0 && $scope.events.length == 0) {
						$("#norecord").show();
						if(event_type == 'upcoming') {
							$("#norecord").text("There are currently no upcoming events in your calendar.");
						} else if(event_type == 'completed') {
							$("#norecord").text("There are no recently completed events in your calendar.");
						}
						$scope.noMoreItemsAvailable = true;
					}
					if((data[arr_typ] && data[arr_typ].length>0)) {
						$scope.$broadcast('scroll.infiniteScrollComplete');
							for (var i in data[arr_typ]) {
								if(data[arr_typ][i].date != "NA") {
									var day_date = data[arr_typ][i].date;
									var res = day_date.split(" ");
									data[arr_typ][i].actual_date = new Date(res[1]).getTime();
									data[arr_typ][i].day = displayDayService.showFullDay(res[0]);
									data[arr_typ][i].date = moment(res[1]).format('MMMM DD,YYYY').replace(",", ", ");
								} else {
									data[arr_typ][i].actual_date = "";
									data[arr_typ][i].day = "";
									data[arr_typ][i].date = "";
								}
								$scope.events.push(data[arr_typ][i]);
							}
							if(event_type == "completed") {
								$scope.events = $filter('orderBy')($scope.events, '-actual_date');
							}
					} else {
						$scope.noMoreItemsAvailable = true;
                    }
					if(window.localStorage.getItem("AllSchedules")) {
						window.localStorage.removeItem("AllSchedules");
					}
                    window.localStorage["AllSchedules"] = JSON.stringify($scope.events);
				});
				result.error(function(data) {});
			}
		},500);
	};
	$(function() {
      if(window.localStorage.getItem("AllSchedules")) {
		var TotalDataLength = window.localStorage.getItem("AllSchedules").length;
		if(TotalDataLength == 0){
			$("#norecord").show();
			if(event_type == 'upcoming') {
				$("#norecord").text("There are currently no upcoming events in your calendar.");
			} else if(event_type == 'completed') {
				$("#norecord").text("There are no recently completed events in your calendar.");
			}
			$("#DisplayLoader").hide();
		}
      }
	});
})

.controller('GoogleMapCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,$ionicLoading, $compile) {
    var location = $stateParams.location;
    var latitude = '';
    var longitude = '';
    $scope.init = function() {
         
    };
    function initialize() {
        var geocoder = new google.maps.Geocoder();
        var address = location;
        geocoder.geocode({ 'address': address }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                latitude = results[0].geometry.location.lat();
                longitude = results[0].geometry.location.lng();

            } else {
                $("#content-loader").hide();
            }
        });
        $timeout(function() {
        var myLatlng = new google.maps.LatLng(latitude,longitude);
        var mapOptions = {
          center: myLatlng,
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("map"),
            mapOptions);
        var marker = new google.maps.Marker({
          position: myLatlng,
          map: map,
          title: location
        });

        google.maps.event.addListener(marker, 'click', function() {
          infowindow.open(map,marker);
        });

        $scope.map = map;
        $("#content-loader").hide();
        }, 2000);
      }
    ionic.Platform.ready(initialize);
    $scope.myGoBack = function() {
       $("#content-loader").show();
       $window.location.href = window.localStorage.getItem("prev_hash");
    };
})

.controller('EventCtrl', function($scope,$ionicPopover,$timeout,$ionicSideMenuDelegate,$window,eventDetailFactory,getPushEventsFactory,$base64,displayDayService) {
	var orgId = window.localStorage.getItem("org_id");
    var auth_token = window.localStorage.getItem("auth_token");
    $scope.init = function () {
    	if(window.localStorage.getItem("is_push_notify")==null && eventDetailFactory.getEvent()) {
	    	$scope.eventDetail = JSON.parse(eventDetailFactory.getEvent());
	    	change_format();
	    }
	    if(window.localStorage.getItem("is_push_notify") != null) {
	    	var push_event_id = window.localStorage.getItem("push_event_id");
	    	var result = getPushEventsFactory.getPushEvents($base64.encode(orgId),$base64.encode(auth_token),push_event_id);
            result.success(function(data) {
               //alert(JSON.stringify(data, null, 4));
               if(data.schedule.date != "NA") {
                  var day_date = data.schedule.date;
                  var res = day_date.split(" ");
                  data.schedule.actual_date = new Date(res[1]).getTime();
                  data.schedule.day = displayDayService.showFullDay(res[0]);
                  data.schedule.date = moment(res[1]).format('MMMM DD,YYYY').replace(",", ", ");
                } else {
                   data.schedule.actual_date = "";
                   data.schedule.day = "";
                   data.schedule.date = "";
                }
                $scope.eventDetail = data.schedule;
               	change_format();
            });
            result.error(function(data) {
               //alert(JSON.stringify(data, null, 4));
               $("#content-loader").hide();
            });
            window.localStorage.removeItem("is_push_notify");
	    }
	};
	function change_format() {
		if($scope.eventDetail.full_address != null && $scope.eventDetail.full_address != "") {
			if($scope.eventDetail.full_address.indexOf('-') === -1) {
				$scope.venue = $scope.eventDetail.full_address;
			} else {
				var arr = $scope.eventDetail.full_address.split("-");
				$scope.venue1 = arr[0];
				$scope.venue2 = arr[1];
			}
		}
		$scope.teams = '';
		if($scope.eventDetail.type == "Game" || $scope.eventDetail.type == "Scrimmage" || $scope.eventDetail.type == "Playoff") {
			if($scope.eventDetail.home_team != 'NA') {
				$scope.homeTeam = $scope.eventDetail.home_team;
			} else {
				$scope.homeTeam = 'TBD';
			}
			if($scope.eventDetail.visiting_team != 'NA') {
				$scope.visitingTeam = $scope.eventDetail.visiting_team;
			} else {
				$scope.visitingTeam = 'TBD';
			}
		} else {
			if($scope.eventDetail.home_team != 'TBD' && $scope.eventDetail.visiting_team != 'TBD') {
				$scope.teams = $scope.eventDetail.home_team+', '+$scope.eventDetail.visiting_team;
			} else if($scope.eventDetail.home_team != 'TBD' && $scope.eventDetail.visiting_team == 'TBD') {
				$scope.teams = $scope.eventDetail.home_team;
			} else if($scope.eventDetail.home_team == 'TBD' && $scope.eventDetail.visiting_team != 'TBD') {
				$scope.teams = $scope.eventDetail.visiting_team;
			}
		}
		if($scope.eventDetail.win_scoring == false) {
			var home_score_arr = [];
			var visit_score_arr = [];
			var result = [];
			if($scope.eventDetail.home_score) {
				if($scope.eventDetail.home_score.indexOf(',') === -1) {
					home_score_arr[0] = $scope.eventDetail.home_score;
				} else {
					home_score_arr = $scope.eventDetail.home_score.split(",");
				}
			}
			if($scope.eventDetail.visiting_score) {
				if($scope.eventDetail.visiting_score.indexOf(',') === -1) {
					visit_score_arr[0] = $scope.eventDetail.visiting_score;
				} else {
					visit_score_arr = $scope.eventDetail.visiting_score.split(",");
				}
			}
			for(var i in home_score_arr) {
				result.push({homeScore:parseInt(home_score_arr[i]),visitScore:parseInt(visit_score_arr[i])});
			}
		} else {
			var result = [];
			var tot_home = 0;
			var tot_vis = 0;
			if($scope.eventDetail.home_score) {
				if($scope.eventDetail.home_score.indexOf(',') === -1) {
					tot_home = parseInt($scope.eventDetail.home_score);
				} else {
					arr = $scope.eventDetail.home_score.split(",");
					for(var i in arr) {
						tot_home = tot_home+parseInt(arr[i]);
					}
				}
			}
			if($scope.eventDetail.visiting_score) {
				if($scope.eventDetail.visiting_score.indexOf(',') === -1) {
					tot_vis = parseInt($scope.eventDetail.visiting_score);
				} else {
					arr = $scope.eventDetail.visiting_score.split(",");
					for(var i in arr) {
						tot_vis = tot_vis+parseInt(arr[i]);
					}
				}
			}
			result.push({homeScore:tot_home,visitScore:tot_vis});
		}
		$scope.scoreResults = result;
		$("#content-loader").hide();
	}
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		$("#content-loader").show();
        $window.location.href = "#/calender";
	};
    $scope.showLocation = function(location) {
       window.localStorage["prev_hash"] = window.location.hash;
       $("#content-loader").show();
       $window.location.href = "#/google_map/"+location;
    }
})	

.controller('CreateEventCtrl', function($scope,$timeout,$ionicSideMenuDelegate,$window,ManageActivityFactory,$base64,ActivityDetailFactory,getVenueFactory,EditEventDateFormat,ConvertTimeFormat,$ionicPopup,$stateParams,getEventFactory,displayDayService,PrefillDateFormat,PrefillTimeFormat) {
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	var id = $stateParams.eventId;
	$scope.init = function () {
		$scope.isDisabled = true;
		$scope.isLocationDisabled = true;
		$scope.activities = [];
		var result = ManageActivityFactory.getActivity($base64.encode(orgId),$base64.encode(auth_token));
		result.success(function(data) {
			for(var i in data.activities) {
				$scope.activities.push({id:data.activities[i].id,title:data.activities[i].title});
			}
			$("#content-loader").hide();
		});
		result.error(function(data) {});
		if(window.localStorage.getItem('EventFormData')) {
			$scope.previousRecord = JSON.parse(window.localStorage.getItem('EventFormData'))[0];
			console.log($scope.previousRecord);
			window.localStorage.removeItem('EventFormData');
			if(id != 'new') {
				$("#activity").prop("disabled", true);
				$scope.isLocationDisabled = false;
			}
			var result = ActivityDetailFactory.getDetail($base64.encode(orgId),$base64.encode(auth_token),$scope.previousRecord.activity_id);
			result.success(function(data) {
				$scope.event_types = data.event_types;	
				$scope.locations = data.locations;
				$scope.teams = data.teams;
				$scope.isLocationDisabled = false;
			});
			result.error(function(data) {
				$("#content-loader").hide();
			});
			$("#event_name").val($scope.previousRecord.event_name);
			$("#start_date").val($scope.previousRecord.start_date);
			$("#start_time").val($scope.previousRecord.start_time);
			$("#end_date").val($scope.previousRecord.end_date);
			$("#end_time").val($scope.previousRecord.end_time);
			$("#detail").val($scope.previousRecord.details);
			if($scope.previousRecord.is_publish) {
				$("#is_publish").prop('checked', 'checked');
			} else {
				$("#is_publish").prop('checked', '');
			}
			if($scope.previousRecord.event_type == 'game' || $scope.previousRecord.event_type == 'scrimmage' || $scope.previousRecord.event_type == 'playoff') {
				$("#team_div").hide();
				$("#home_visit_div").show();
			} else {
				$("#team_div").show();
				$("#home_visit_div").hide();
			}if($scope.previousRecord.location_id != "") {
				//$("#content-loader").show();
				$timeout(function() {
					$scope.getLocationVenues();
				}, 3000);
			}
		} else {
			if(id != 'new') {
				$scope.heading = 'Edit Event';
				var response = getEventFactory.getEvent($base64.encode(orgId),$base64.encode(auth_token),id);
				response.success(function(data) {
					$scope.event_types = data.event_types;	
					$scope.locations = data.locations;
					$scope.teams = data.teams;

					if(data.event_details.date != 'NA') {
						var day_date = data.event_details.date;
						var res = day_date.split(" ");
						data.event_details.day = displayDayService.showFullDay(res[0]);
						data.event_details.date = moment(res[1]).format('MMMM DD,YYYY').replace(",", ", ");
					} else {
						data.event_details.day = "";
						data.event_details.date = "";
					}
					$scope.EventDetail = data.event_details;

					$scope.edit_activity_id = $scope.EventDetail.activity_id;
					$scope.isLocationDisabled = false;
					$("#activity").prop("disabled", true);

					$scope.edit_activity_type = $scope.EventDetail.type;
					if($scope.edit_activity_type == 'Game' || $scope.edit_activity_type == 'Scrimmage' || $scope.edit_activity_type == 'Playoff') {
						$("#team_div").hide();
						$("#home_visit_div").show();
					} else {
						$("#team_div").show();
						$("#home_visit_div").hide();
					}

                    if($scope.EventDetail.name != 'NA') {
                        $("#event_name").val($scope.EventDetail.name);
                    }
					if($scope.EventDetail.date && $scope.EventDetail.date != '') {
						$("#start_date").val(PrefillDateFormat.PrefillDate(new Date($scope.EventDetail.date)));
					}
					if($scope.EventDetail.time && $scope.EventDetail.time != 'NA') {
						$("#start_time").val(PrefillTimeFormat.PrefillTime($scope.EventDetail.time));
					}

					if($scope.EventDetail.location_id != null) {
						$scope.isDisabled = false;
						$scope.edit_location_id = $scope.EventDetail.location_id;
						var result = getVenueFactory.getVenue($base64.encode(orgId),$base64.encode(auth_token),$scope.edit_location_id);
						result.success(function(data) {
							$scope.venues = data.venues;	
							$("#content-loader").hide();
						});
						result.error(function(data) {
							$("#content-loader").hide();
						});
					}
					if($scope.EventDetail.venue_id != null) {
						$scope.edit_venue_id = $scope.EventDetail.venue_id;
					}

					$scope.edit_home = $scope.EventDetail.home_team;
					$scope.edit_visit = $scope.EventDetail.visiting_team;
					if($scope.EventDetail.description != 'NA') {
						$("#detail").val($scope.EventDetail.description);
					}

					$scope.edit_published = $scope.EventDetail.is_published;
					if($scope.edit_published) {
						$("#is_publish").prop('checked', 'checked');
					} else {
						$("#is_publish").prop('checked', '');
					}

					$("#content-loader").hide();
				});
				response.error(function(data) {
					console.log(data);
					$("#content-loader").hide();
				});
			}
			if(id == 'new') {
				$scope.heading = 'Create Event';
				$("#team_div").hide();
				$("#is_publish").prop('checked', 'checked');
			}
		}
	};
	$scope.selectActivity = function() {
		$("#content-loader").show();
		$scope.isDisabled = true;
		$scope.locations = [];
		$scope.activity_id = $("#activity option:selected").val();
		if($scope.activity_id != '') {
			$scope.isLocationDisabled = false;
		}
		var result = ActivityDetailFactory.getDetail($base64.encode(orgId),$base64.encode(auth_token),$scope.activity_id);
		result.success(function(data) {
			$scope.event_types = data.event_types;	
			$scope.locations = data.locations;
			$scope.teams = data.teams;
			$("#content-loader").hide();
		});
		result.error(function(data) {
			$("#content-loader").hide();
		});
	};
	$scope.getLocationVenues = function() {
		$scope.location_id = $("#location option:selected").val();
		if($scope.location_id == 'new') {
			$scope.create_location();
		} else {
			$(".venue-loader").show();
			if($scope.location_id) {
				$scope.isDisabled = false;
				var result = getVenueFactory.getVenue($base64.encode(orgId),$base64.encode(auth_token),$scope.location_id);
				result.success(function(data) {
					$scope.venues = data.venues;	
					$(".venue-loader").hide();
				});
				result.error(function(data) {
					$(".venue-loader").hide();
				});
			} else {
				$scope.venues = {};
				$scope.isDisabled = true;
				$(".venue-loader").hide();
			}
		}
	}
	$scope.selectType = function() {
		$("#content-loader").show();
		$scope.event_type = $("#event_type option:selected").val();
		if($scope.event_type == 'game' || $scope.event_type == 'scrimmage' || $scope.event_type == 'playoff') {
			$("#team_div").hide();
			$("#home_visit_div").show();
		} else {
			$("#team_div").show();
			$("#home_visit_div").hide();
		}
		$("#content-loader").hide();
	}
	$scope.SubmitForm = function() {
		var activity_id = "";
		var event_type = "";
		var event_name = "";
		var location_id = "";
		var venue_id = "";
		var home_team = "";
		var visit_team = "";
		var publish = false;
		var valid = 0; 

		var activity_id = $("#activity option:selected").val();
		var event_type = $("#event_type option:selected").val();
		var event_name = $("#event_name").val();

		/*date & time conversion*/
		var start_dt = $("#start_date").val();
		var end_dt = $("#end_date").val();
		if(start_dt != "") {
			var start = EditEventDateFormat.dateformat($("#start_date").val());
		} else {
			var start = "";
		}
		if(end_dt != "") {
			var end = EditEventDateFormat.dateformat($("#end_date").val());
		} else {
			var end = "";
		}
		if(start_dt != "") {
			var start_1i = start_dt.split("-")[0];
			var start_2i = start_dt.split("-")[1];
			var start_3i = start_dt.split("-")[2];
		} else {
			var start_1i = "";
			var start_2i = "";
			var start_3i = "";
		}
		if(end_dt != "") {
			var end_1i = end_dt.split("-")[0];
			var end_2i = end_dt.split("-")[1];
			var end_3i = end_dt.split("-")[2];
		} else {
			var end_1i = "";
			var end_2i = "";
			var end_3i = "";
		}
		var start_time = $("#start_time").val();
		var end_time = $("#end_time").val();
		if(start_time) {
			var start_4i = start_time.split(":")[0];
			var start_5i = start_time.split(":")[1];
		} else {
			var start_4i = "";
			var start_5i = "";
		}
		if(end_time) {
			var end_4i = end_time.split(":")[0];
			var end_5i = end_time.split(":")[1];
		} else {
			var end_4i = "";
			var end_5i = "";
		}
		if(start_4i) {
			var start_7i_ampm = (start_4i >= 12) ? "PM" : "AM";
			if(start_7i_ampm == 'AM') {
				var start_7i = -1;
			} else if(start_7i_ampm == 'PM') {
				var start_7i = -2;
			}
		} else {
			var start_7i = "";
		}
		if(end_4i) {
			var end_7i_ampm = (end_4i >= 12) ? "PM" : "AM";
			if(end_7i_ampm == 'AM') {
				var end_7i = -1;
			} else if(end_7i_ampm == 'PM') {
				var end_7i = -2;
			}
		} else {
			var end_7i = "";
		}
		if(start_time) {
			var start_val = ConvertTimeFormat.timeformat(start_time);
		} else {
			var start_val = "";
		}
		if(end_time) {
			var end_val = ConvertTimeFormat.timeformat(end_time);
		} else {
			var end_val = "";
		}
		if(start_dt && start_time) {
			var d1 = new Date(start_1i,start_2i,start_3i,start_4i,start_5i);
		}
		if(end_dt && end_time) {
			var d2 = new Date(end_1i,end_2i,end_3i,end_4i,end_5i);
		}
		/*end date & time conversion*/

		if($("#location option:selected").val()) {
			var location_id = $("#location option:selected").val();
		}
		if($("#venue option:selected").val()) {
			var venue_id = $("#venue option:selected").val();
		}
		if($("#team_div").is(":visible")) {
			if($("#team option:selected").val()) {
				var home_team = $("#team option:selected").val();
			}	
			var visit_team = "";
		} else if($("#home_visit_div").is(":visible")) {
			if($("#home option:selected").val()) {
				var home_team = $("#home option:selected").val();
			}
			if($("#visit option:selected").val()) {
				var visit_team = $("#visit option:selected").val();
			}	
		}
		var detail = $("#detail").val();
		if ($("#is_publish").is(':checked')) {
			var publish = true;
		} else {
			var publish = false;
		}

		/*Form validation*/
		if(activity_id == "") {
			var alertPopup = $ionicPopup.alert({
				title: 'Error',
				cssClass : 'error_msg',
				template: "Please select an activity."
			});
			alertPopup.then(function(res) {
				$("#loader-span").hide();
				valid = 0;
				return false;
			});
		} else if(event_type == "") {
			var alertPopup = $ionicPopup.alert({
				title: 'Error',
				cssClass : 'error_msg',
				template: "Please select event type."
			});
			alertPopup.then(function(res) {
				$("#loader-span").hide();
				valid = 0;
				return false;
			});
		} /*else if(event_name == "") {
			var alertPopup = $ionicPopup.alert({
				title: 'Error',
				cssClass : 'error_msg',
				template: "Please enter event name."
			});
			alertPopup.then(function(res) {
				$("#loader-span").hide();
				valid = 0;
				return false;
			});
		}*/ else if(d1 && d2 && d1.getTime() >= d2.getTime()) {
			var alertPopup = $ionicPopup.alert({
				title: 'Error',
				cssClass : 'error_msg',
				template: "Please select end time later than start time."
			});
			alertPopup.then(function(res) {
				$("#loader-span").hide();
				valid = 0;
				return false;
			});
		} else if((!start_time || !end_time) && new Date(end_dt) < new Date(start_dt)) {
			var alertPopup = $ionicPopup.alert({
				title: 'Error',
				cssClass : 'error_msg',
				template: "Please select a valid end date."
			});
			alertPopup.then(function(res) {
				$("#loader-span").hide();
				valid = 0;
				return false;
			});
		} else if(home_team && visit_team && home_team == visit_team) {
			var alertPopup = $ionicPopup.alert({
				title: 'Error',
				cssClass : 'error_msg',
				template: "Home and Visiting team can't be same."
			});
			alertPopup.then(function(res) {
				$("#loader-span").hide();
				valid = 0;
				return false;
			});
		} else {
			$("#loader-span").show();
			valid = 1;
		}

		/*API call*/
		if(valid) {
			if(id == 'new') {
				var str = '{"activity_id":"'+activity_id+'","event":{"kind":"'+event_type+'","name":"'+event_name+'","start":"'+start+'", "start(1i)":"'+start_1i+'", "start(2i)":"'+start_2i+'", "start(3i)":"'+start_3i+'", "start(4i)":"'+start_4i+'", "start(5i)":"'+start_5i+'", "start(7i)":"'+start_7i+'","end":"'+end+'", "end(1i)":"'+end_1i+'", "end(2i)":"'+end_2i+'", "end(3i)":"'+end_3i+'", "end(4i)":"'+end_4i+'", "end(5i)":"'+end_5i+'", "end(7i)":"'+end_7i+'","location_id":"'+location_id+'","venue_id":"'+venue_id+'","home_team_id":"'+home_team+'","visiting_team_id":"'+visit_team+'","published":"'+publish+'","description":"'+detail+'"},"start":{"time":"'+start_val+'"},"end":{"time":"'+end_val+'"}}';
				var URL = API_URL+'/api/v1/schedules/event/'+$base64.encode(auth_token)+'/'+$base64.encode(orgId)+'/create';
			} else {
				var event_id = $stateParams.eventId;
				var str = '{"event_id":"'+event_id+'","event":{"kind":"'+event_type+'","name":"'+event_name+'","start":"'+start+'", "start(1i)":"'+start_1i+'", "start(2i)":"'+start_2i+'", "start(3i)":"'+start_3i+'", "start(4i)":"'+start_4i+'", "start(5i)":"'+start_5i+'", "start(7i)":"'+start_7i+'","end":"'+end+'", "end(1i)":"'+end_1i+'", "end(2i)":"'+end_2i+'", "end(3i)":"'+end_3i+'", "end(4i)":"'+end_4i+'", "end(5i)":"'+end_5i+'", "end(7i)":"'+end_7i+'","location_id":"'+location_id+'","venue_id":"'+venue_id+'","home_team_id":"'+home_team+'","visiting_team_id":"'+visit_team+'","published":"'+publish+'","description":"'+detail+'"},"start":{"time":"'+start_val+'"},"end":{"time":"'+end_val+'"}}';
				var URL = API_URL+'/api/v1/schedules/event/'+$base64.encode(auth_token)+'/'+$base64.encode(orgId)+'/update';
			}
			if(str) {
				/*console.log(URL);*/
				$.ajax({
					type: "POST",
					url: URL,
					data: JSON.parse(str),
					success: function(data){
						var alertPopup = $ionicPopup.alert({
							title: 'Success',
							cssClass : 'error_msg',
							template: data.message
						});
						alertPopup.then(function(res) {
							$("#loader-span").hide();
							$window.location.href = '#/manage_schedule_list';
						});
					},
					error: function(data) {
						var alertPopup = $ionicPopup.alert({
							title: 'Error',
							cssClass : 'error_msg',
							template: data.message
						});
						alertPopup.then(function(res) {
							$("#loader-span").hide();
						});
					}
				});
			}
		}	
	}
	$scope.GoBack = function() {
		$window.history.back();
	};
	$scope.create_location = function() {
		if($("#activity option:selected").val()) {
			$("#content-loader").show();
			var location = "";
			var venue = "";
			store_records(location,venue);
			$window.location.href = '#/new_location';
		} else {
			var alertPopup = $ionicPopup.alert({
				title: 'Error',
				cssClass : 'error_msg',
				template: 'Please select an activity'
			});
			alertPopup.then(function(res) {
				$("#loader-span").hide();
			});
		}
	}
	$scope.change_venue = function() {
		if($("#venue option:selected").val() == 'new') {
			var venue = "";
			var location_id = $("#location option:selected").val();
			store_records(location_id,venue);
			$window.localStorage['Location_Name'] = $("#location option:selected").text();
			$window.location.href = '#/new_venue/'+location_id;
		}
	}
	function store_records(loc_id,ven_id) {
		if(window.localStorage.getItem('EventFormData')) {
			window.localStorage.removeItem('EventFormData');
		}
		var EventArray = [];
		if($("#team_div").is(":visible")) {
			EventArray.push({activity_id:$("#activity option:selected").val(),event_type:$("#event_type option:selected").val(),event_name:$("#event_name").val(),start_date:$("#start_date").val(),start_time:$("#start_time").val(),end_date:$("#end_date").val(),end_time:$("#end_time").val(),"team":$("#team option:selected").val(),"details":$("#detail").val(),"is_publish":$("#is_publish").prop("checked"),"location_id":loc_id,"venue_id":ven_id});
		} else if($("#home_visit_div").is(":visible")) {
			EventArray.push({activity_id:$("#activity option:selected").val(),event_type:$("#event_type option:selected").val(),event_name:$("#event_name").val(),start_date:$("#start_date").val(),start_time:$("#start_time").val(),end_date:$("#end_date").val(),end_time:$("#end_time").val(),"home_team":$("#home option:selected").val(),"visit_team":$("#visit option:selected").val(),"details":$("#detail").val(),"is_publish":$("#is_publish").prop("checked"),"location_id":loc_id,"venue_id":ven_id});
		}
		window.localStorage['EventFormData'] = JSON.stringify(EventArray);
	}
})

.controller('DisplayResultCtrl', function($scope,$ionicPopover,$timeout,$ionicSideMenuDelegate,$window) {
	$scope.init = function () {
		//$timeout(function() {
			var data = jQuery.parseJSON(EventDetails);
			$("#event_name").html(data.records.name);
			$("#event_venue").html(data.records.venue);
			$("#event_date").html(data.records.date+' @ '+data.records.time);
			$("#schedule_name").html(data.records.schedule_name);
			$("#schedule_type").html(data.records.schedule_type);
			$("#home_team").html(data.records.home);
			$("#visitor_team").html(data.records.visitor);
			var str="";
			for (var i in data.records.scores) {
				str = str + '<div class="score-div"><div class="fl">BLUE JAYS</div><div class="fr">'+data.records.scores[i].BlueJays+'</div><div class="cb"></div></div><div class="score-div"><div class="fl">RAVENS</div><div class="fr">'+data.records.scores[i].Ravens+'</div><div class="cb"></div></div><div style="height:3px;"></div>';
			}
			$("#score_list").html(str);
	//}, 3000);
	};
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		//$("#content-loader").show();
		$window.history.back();
	};
})	
.controller('AddResultCtrl', function($scope,$ionicPopover,$compile,$timeout,$ionicSideMenuDelegate,$window,GetEventScoreFactory,$base64,UpdateEventScoreFactory,$ionicPopup,EditEventFactory,displayDayService,$state) {
	$("#content-loader").show();
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	$scope.init = function () {
		if(window.localStorage.getItem("ManageEventDetail")) {
			$scope.EventDetail = JSON.parse(window.localStorage.getItem("ManageEventDetail"));
			var response = GetEventScoreFactory.getScore($base64.encode(orgId),$base64.encode(auth_token),$scope.EventDetail.activity_id,$scope.EventDetail.id);
			response.success(function(data) {
				if(data.total_scores[0].scores.length && data.total_scores[0].scores != 'NA'){
					$("#scoreDetail_home_0").val(data.total_scores[0].scores[0].home);
					$("#scoreDetail_away_0").val(data.total_scores[0].scores[0].visiting);
					$("#scoreDetail_id_0").val(data.total_scores[0].scores[0].id);
					if(data.total_scores[0].scores.length > 1) {
						for(var i in data.total_scores[0].scores) {
							if(i>0) {
								var rows= $('#score-tbl tbody tr.result-tbl').length;
								var newrow = '<tr class="result-tbl"><td class="txtrig"><label class="item item-input res-lab"><input type="text" pattern="[0-9]*" class="res-txt home-score" maxlength="4" id="scoreDetail_home_'+rows+'" value="'+data.total_scores[0].scores[i].home+'" autocomplete="off"></label></td><td class="txtlef" style="position:relative;"><label class="item item-input res-lab"><input type="text" pattern="[0-9]*" class="res-txt visit-score" maxlength="4" id="scoreDetail_away_'+rows+'" value="'+data.total_scores[0].scores[i].visiting+'" autocomplete="off"></label><div class="delete-row add-remove-score" ng-click="delete_row($event)"><img src="img/delete.png" style="width:30px;cursor:pointer;"/><input type="hidden" id="remove_status_'+rows+'" class="remove-status"/></div><input type="hidden" id="scoreDetail_id_'+rows+'" value="'+data.total_scores[0].scores[i].id+'" class="score-id"/></td></tr>';
								var temp = $compile(newrow)($scope);
								$("#score-tbl tr.result-tbl:last").after(temp);

							}
						}
					}
				}
				$("#content-loader").hide();
			});
			response.error(function(data) {console.log(data);//return false;
				$(".warning-div").show();
				$("#warning").html(data.message.message[0].error_msg);
				$("#content-loader").hide();
			});
		}
	}	
	$scope.update_score = function (e) {
		$("#loader-span").show();
		valid = 1;
		$('input.res-txt').each(function () {
			if($(this).val() == "" && $(this).is(':visible')) {
				valid = 0;
				var alertPopup = $ionicPopup.alert({
					title: 'Error',
					cssClass : 'error_msg',
					template: "Please enter score."
				});
				$("#loader-span").hide();
				return false;
			} else if($(this).val() && !$.isNumeric($(this).val()) && $(this).is(':visible')) {
				valid = 0;
				var alertPopup = $ionicPopup.alert({
					title: 'Error',
					cssClass : 'error_msg',
					template: "Please enter a valid score."
				});
				$("#loader-span").hide();
				return false;
			}
		});
		var total_row = $('input.home-score').length;
		var str='';
		if(valid) {
			for(var i=0;i<total_row;i++) {
				var home = $("#scoreDetail_home_"+i).val();
				var visit = $("#scoreDetail_away_"+i).val();
				if($("#scoreDetail_id_"+i).val()) {
					var id = $("#scoreDetail_id_"+i).val();
				} else {
					var id = '';
				}
				if(id && $("#remove_status_"+i).val()) {
					str += '&activity[events_attributes]['+$scope.EventDetail.id+'][scores_attributes]['+i+'][visiting]='+visit+'&activity[events_attributes]['+$scope.EventDetail.id+'][scores_attributes]['+i+'][home]='+home+'&activity[events_attributes]['+$scope.EventDetail.id+'][scores_attributes]['+i+'][id]='+id+'&activity[events_attributes]['+$scope.EventDetail.id+'][scores_attributes]['+i+'][processed_flag]=1&activity[events_attributes]['+$scope.EventDetail.id+'][scores_attributes]['+i+'][_destroy]=1';
				} else {
					str += '&activity[events_attributes]['+$scope.EventDetail.id+'][scores_attributes]['+i+'][visiting]='+visit+'&activity[events_attributes]['+$scope.EventDetail.id+'][scores_attributes]['+i+'][home]='+home+'&activity[events_attributes]['+$scope.EventDetail.id+'][scores_attributes]['+i+'][id]='+id+'&activity[events_attributes]['+$scope.EventDetail.id+'][scores_attributes]['+i+'][processed_flag]=1';
				}
			}
			if(str != '') {//return false;
				var str_final = 'activity_id='+$scope.EventDetail.activity_id+str;
				console.log(str_final);
				var URL = API_URL+'/api/v1/schedules/event/'+$base64.encode(auth_token)+'/'+$base64.encode(orgId)+'/update_results';
				console.log(URL);
				$.ajax({
					type: "POST",
					url: URL,
					data: str_final,
					success: function(data){console.log(data);
						var alertPopup = $ionicPopup.alert({
							title: 'Success',
							cssClass : 'error_msg',
							template: data.message
						});
						alertPopup.then(function(res) {
							$("#loader-span").hide();
							$scope.done();
						});
					},
					error: function(data) {
						console.log(data);
						$("#loader-span").hide();
					}
				});
			}
		}
	}
	$scope.addrow = function () {
		var rows= $('#score-tbl tbody tr.result-tbl').length;
		var newrow = '<tr class="result-tbl"><td class="txtrig"><label class="item item-input res-lab"><input type="text" pattern="[0-9]*" class="res-txt home-score" maxlength="4" id="scoreDetail_home_'+rows+'" autocomplete="off"></label></td><td class="txtlef" style="position:relative;"><label class="item item-input res-lab"><input type="text" pattern="[0-9]*" class="res-txt visit-score" maxlength="4" id="scoreDetail_away_'+rows+'" autocomplete="off"></label><div class="delete-row add-remove-score" ng-click="delete_row($event)"><img src="img/delete.png" style="width:30px;cursor:pointer;"/><input type="hidden" id="remove_status_'+rows+'" class="remove-status"/></div><input type="hidden" id="scoreDetail_id_'+rows+'" class="score-id"/></td></tr>';
		var temp = $compile(newrow)($scope);
		$("#score-tbl tr.result-tbl:last").after(temp);
	}
	$scope.done = function () {
		$("#content-loader").show();
		var response = EditEventFactory.editevent($base64.encode(orgId),$base64.encode(auth_token),$scope.EventDetail.id);
		response.success(function(data) {
			if(data.event_details.date != "NA") {
				var day_date = data.event_details.date;
				var res = day_date.split(" ");
				data.event_details.actual_date = new Date(res[1]).getTime();
				data.event_details.day = displayDayService.showFullDay(res[0]);
				data.event_details.date = moment(res[1]).format('MMMM DD,YYYY').replace(",", ", ");
			} else {
				data.event_details.actual_date = "";
				data.event_details.day = "";
				data.event_details.date = "";
			}
			window.localStorage["ManageEventDetail"] = JSON.stringify(data.event_details);
			$window.location.href = '#/manage_event_detail';
		});
		response.error(function(data) {
			console.log(data);
			$window.location.href = '#/manage_event_detail';
		});
		
	}
	$scope.delete_row = function (event) {
		var current_element = angular.element(event.target);
		var td = angular.element(event.target).parent().parent().parent();
		//angular.element(event.target).parent().parent().parent().remove();
		$(current_element).parent().children("input").val(1);
		$(td).hide();
	}	
	$scope.GoBack = function() {
		$window.history.back();
	};
})	
.controller('PostponeEventCtrl', function($scope,$filter,$ionicPopup,$window,eventDetailFactory,ButtonStatusFactory,$base64,cancelEventFactory,EditEventDateFormat,ConvertTimeFormat,PrefillDateFormat,PrefillTimeFormat) {
	$("#content-loader").show();
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	$scope.isDisable = true;
	$scope.button_value = "Postpone Event";
	$scope.action = 'postpone';
	var coordinator = 0;
	var players = 0;
	var officials = 0;
	var workteams = 0;
	var message = "";
	var newsfeed = 0;
	var facebook = 0;
	var twitter = 0;
	var include = 1;
	$scope.init = function () {
		if(window.localStorage.getItem("ManageEventDetail")) {
			$scope.EventDetail = JSON.parse(window.localStorage.getItem("ManageEventDetail"));
		}
		disable_enable_btn();
		$("#newDateTime").hide();
	}
	$scope.showSelectValue = function() {
		$("#content-loader").show();
		var action = $("#eventAction option:selected").val();
		$("#error_div").hide();
		if(action == 'reschedule') {
			$("#newDateTime").show();
			$scope.button_value = "Reschedule Event";
			if($scope.EventDetail.date && $scope.EventDetail.date != 'NA') {
				$("#start_date").val(PrefillDateFormat.PrefillDate(new Date($scope.EventDetail.date)));
			}
			if($scope.EventDetail.time && $scope.EventDetail.time != 'NA') {
				$("#start_time").val(PrefillTimeFormat.PrefillTime($scope.EventDetail.time));
			}
		} else if(action == 'cancel') {
			$("#newDateTime").hide();
			$scope.button_value = "Cancel Event";
		} else if(action == 'postpone') {
			$("#newDateTime").hide();
			$scope.button_value = "Postpone Event";
		}
		$scope.action = action;
		disable_enable_btn();
	};
	$scope.SubmitForm = function() {
		$("#loader-span2").show();
		var valid = 0;
		if($("#newDateTime").is(":visible")) {
			var start_dt = $("#start_date").val();
			var end_dt = $("#end_date").val();
			if(start_dt != "") {
				var start = EditEventDateFormat.dateformat($("#start_date").val());
			} else {
				var start = "";
			}
			if(end_dt != "") {
				var end = EditEventDateFormat.dateformat($("#end_date").val());
			} else {
				var end = "";
			}
			if(start_dt != "") {
				var start_1i = start_dt.split("-")[0];
				var start_2i = start_dt.split("-")[1];
				var start_3i = start_dt.split("-")[2];
			} else {
				var start_1i = "";
				var start_2i = "";
				var start_3i = "";
			}
			if(end_dt != "") {
				var end_1i = end_dt.split("-")[0];
				var end_2i = end_dt.split("-")[1];
				var end_3i = end_dt.split("-")[2];
			} else {
				var end_1i = "";
				var end_2i = "";
				var end_3i = "";
			}
			var start_time = $("#start_time").val();
			var end_time = $("#end_time").val();
			if(start_time) {
				var start_4i = start_time.split(":")[0];
				var start_5i = start_time.split(":")[1];
			} else {
				var start_4i = "";
				var start_5i = "";
			}
			if(end_time) {
				var end_4i = end_time.split(":")[0];
				var end_5i = end_time.split(":")[1];
			} else {
				var end_4i = "";
				var end_5i = "";
			}
			if(start_4i) {
				var start_7i_ampm = (start_4i >= 12) ? "PM" : "AM";
				if(start_7i_ampm == 'AM') {
					var start_7i = -1;
				} else if(start_7i_ampm == 'PM') {
					var start_7i = -2;
				}
			} else {
				var start_7i = "";
			}
			if(end_4i) {
				var end_7i_ampm = (end_4i >= 12) ? "PM" : "AM";
				if(end_7i_ampm == 'AM') {
					var end_7i = -1;
				} else if(end_7i_ampm == 'PM') {
					var end_7i = -2;
				}
			} else {
				var end_7i = "";
			}
			if(start_time) {
				var start_val = ConvertTimeFormat.timeformat(start_time);
			} else {
				var start_val = "";
			}
			if(end_time) {
				var end_val = ConvertTimeFormat.timeformat(end_time);
			} else {
				var end_val = "";
			}
			if(start_dt && start_time) {
				var d1 = new Date(start_1i,start_2i,start_3i,start_4i,start_5i);
			}
			if(end_dt && end_time) {
				var d2 = new Date(end_1i,end_2i,end_3i,end_4i,end_5i);
			}
		}
		if ($("#coordinator").is(':checked')){ 
			coordinator = 1;
		}
		if ($("#players").is(':checked')){ 
			players = 1;
		}
		if ($("#officials").is(':checked')){ 
			officials = 1;
		}
		if ($("#workteams").is(':checked')){ 
			workteams = 1;
		}
		if ($("#newsfeed").is(':checked')){ 
			newsfeed = 1;
		}
		if ($("#facebook").is(':checked')){ 
			facebook = 1;
		}
		if ($("#twitter").is(':checked')){ 
			twitter = 1;
		}
		if($("#message").val()) {
			message = $("#message").val();
		}
		if(newsfeed == 1 || facebook == 1 || twitter == 1) {
			include = 1;
		}
		/*validation*/
		if($scope.action == 'reschedule') {
			if(coordinator == 0 && players == 0 && officials == 0 && workteams == 0) {
				var alertPopup = $ionicPopup.alert({
					title: 'Error',
					cssClass : 'error_msg',
					template: "Please select atleast anyone option from notify."
				});
				alertPopup.then(function(res) {
					$("#loader-span2").hide();
					valid = 0;
					return false;
				});
			}/* else if(!start_dt) {
				var alertPopup = $ionicPopup.alert({
					title: 'Error',
					cssClass : 'error_msg',
					template: "Please select start date."
				});
				alertPopup.then(function(res) {
					$("#loader-span2").hide();
					valid = 0;
					return false;
				});
			} else if(!start_time) {
				var alertPopup = $ionicPopup.alert({
					title: 'Error',
					cssClass : 'error_msg',
					template: "Please select start time."
				});
				alertPopup.then(function(res) {
					$("#loader-span2").hide();
					valid = 0;
					return false;
				});
			}*/else if(d1 && d2 && d1.getTime() >= d2.getTime()) {
				var alertPopup = $ionicPopup.alert({
					title: 'Error',
					cssClass : 'error_msg',
					template: "Please select end time later than start time."
				});
				alertPopup.then(function(res) {
					$("#loader-span2").hide();
					valid = 0;
					return false;
				});
			} else {
				valid = 1;
			}
		} else {
			if(coordinator == 0 && players == 0 && officials == 0 && workteams == 0) {
				var alertPopup = $ionicPopup.alert({
					title: 'Error',
					cssClass : 'error_msg',
					template: "Please select atleast anyone from notify."
				});
				alertPopup.then(function(res) {
					$("#loader-span2").hide();
					valid = 0;
					return false;
				});
			} else {
				valid = 1;
			}
		}
		
		if(valid) {
			if($scope.action == 'reschedule') {
				var str = '{"to":{"coordinators":"'+coordinator+'","registrations":"'+players+'","officials":"'+officials+'","work_teams":"'+workteams+'"},"message":"'+message+'","news_item":{"include":"'+include+'","widget":"'+newsfeed+'","twitter":"'+twitter+'","facebook":"'+facebook+'"},"activity":{"events_attributes":{"'+$scope.EventDetail.id+'":{"id":"'+$scope.EventDetail.id+'","start":"'+start+'", "start(1i)":"'+start_1i+'", "start(2i)":"'+start_2i+'", "start(3i)":"'+start_3i+'", "start(4i)":"'+start_4i+'", "start(5i)":"'+start_5i+'", "start(7i)":"'+start_7i+'","end":"'+end+'", "end(1i)":"'+end_1i+'", "end(2i)":"'+end_2i+'", "end(3i)":"'+end_3i+'", "end(4i)":"'+end_4i+'", "end(5i)":"'+end_5i+'", "end(7i)":"'+end_7i+'"}}},"activity_id":"'+$scope.EventDetail.activity_id+'","start":{"time":"'+start_val+'"},"end":{"time":"'+end_val+'"}}';
				if(str) {
					var URL = API_URL+'/api/v1/schedules/event/'+$base64.encode(auth_token)+'/'+$base64.encode(orgId)+'/create_reschedule';
					$.ajax({
						type: "POST",
						url: URL,
						data: JSON.parse(str),
						success: function(data){
							var alertPopup = $ionicPopup.alert({
								title: 'Success',
								cssClass : 'error_msg',
								template: data.message
							});
							alertPopup.then(function(res) {
								$("#loader-span2").hide();
								$window.location.href = "#/manage_schedule_list";
							});
						},
						error: function(data) {
							$("#loader-span2").hide();
							$("#error_div").show();
							$("#payment_error").html(data.message);
						}
					});
				}
				//console.log(str);return false;
			} else {
				var result = cancelEventFactory.cancelevent($scope.action,$base64.encode(orgId),$base64.encode(auth_token),$scope.EventDetail.activity_id,$scope.EventDetail.id,message,include,newsfeed,twitter,facebook,coordinator,players,officials,workteams);
				
				result.success(function(data) {
					var alertPopup = $ionicPopup.alert({
						title: 'Success',
						cssClass : 'error_msg',
						template: data.message
					});
					alertPopup.then(function(res) {
						$("#loader-span2").hide();
						$window.location.href = '#/manage_schedule_list';
					});
				//$window.location.href = '#/calender';
				});
				result.error(function(data) {
					$("#loader-span2").hide();
					$("#error_div").show();
					$("#payment_error").html(data.message);
				});
			}
		}
	};
	$scope.myGoBack = function() {
		$window.history.back();
	};
	function disable_enable_btn() {
		var response = ButtonStatusFactory.getMessage($scope.action,$base64.encode(orgId),$base64.encode(auth_token),$scope.EventDetail.activity_id,$scope.EventDetail.id);
		response.success(function(data) {
			$scope.isDisable = false;
			$("#content-loader").hide();
		});
		response.error(function(data) {console.log(data);
			$("#error_div").show();
			$("#payment_error").html(data.message.message[0].error_msg);
			$scope.isDisable = true;
			$("#content-loader").hide();
		});
	}
})

.controller('ProTypeListCtrl', function($scope,$compile,$ionicHistory,$timeout,$ionicSideMenuDelegate,$window,ActivityTypeFactory,$q,$base64) {
	$scope.isMessage = false;
	$scope.isRegFilter = window.localStorage.getItem("isRegFilter");
	$scope.init = function () {
		var orgId = window.localStorage.getItem("org_id");
		var auth_token = window.localStorage.getItem("auth_token");
		var record = ActivityTypeFactory.activityTypeList($base64.encode(orgId),$base64.encode(auth_token));
		record.success(function(data) {
			var defer = $q.defer();
			defer.resolve({
                data:data
            });
			var promise = defer.promise;
			promise.then(function (list) {
				var proglistArr = [];
				if(data.activity_types.length) {
					for (var i in data.activity_types) {
						proglistArr.push(data.activity_types[i]);
					}
				} else {
					$scope.isMessage = true;
					$("#btn_content").children().attr( "disabled", "disabled" );
				}
				$scope.progTypes = proglistArr;
				$scope.progTypes.sort(function (a, b) {
					return a.activity_type.toLowerCase().localeCompare(b.activity_type.toLowerCase());
				});
				showButton();
				$("#content-loader").hide();
			});
		});
		record.error(function(data) {});
	}
	$scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
		if($scope.isRegFilter == 1) {
			if(window.localStorage.getItem("activity_type_id")) {
				var filter_evntyp = JSON.parse(window.localStorage.getItem("activity_type_id"));
				for (var i in filter_evntyp) {
					$("input[type=checkbox][value='"+filter_evntyp[i]+"']").prop("checked",true);
				}
				if($('input:checkbox:checked').length == $('input:checkbox.chk-schedule').length) {
					var btn = '<button class="button button-block button-assertive" ng-click="DeselectAllCal()">De-select All Types</button>';
					var temp = $compile(btn)($scope);
					$("#btn_content").html(temp);
				}
			}
		}
	});
	$scope.check_schedule = function() {
        var x = 0;
        $('input:checkbox.chk-schedule').each(function () {
            if (this.checked == false) {
                x++;
            }
        });
        if(x>0 || x == $('input:checkbox.chk-schedule').length) {
            var btn = '<button class="button button-block button-calm" ng-click="SelectAllCal()">Select All Types</button>';
            var temp = $compile(btn)($scope);
            $("#btn_content").html(temp);
        }
        if(x == 0) {
            var btn = '<button class="button button-block button-assertive" ng-click="DeselectAllCal()">De-select All Types</button>';
            var temp = $compile(btn)($scope);
            $("#btn_content").html(temp);
        }
    };
    $scope.DeselectAllCal = function() {
        $('input:checkbox.chk-schedule').each(function () {
            $(this).prop('checked', '');
        });
        var btn = '<button class="button button-block button-calm" ng-click="SelectAllCal()">Select All Types</button>';
        var temp = $compile(btn)($scope);
        $("#btn_content").html(temp);
            
    };
    $scope.SelectAllCal = function() {
        $('input:checkbox.chk-schedule').each(function () {
            $(this).prop('checked', 'checked');
        });
        var btn = '<button class="button button-block button-assertive" ng-click="DeselectAllCal()">De-select All Types</button>';
        var temp = $compile(btn)($scope);
        $("#btn_content").html(temp);
    };
	$scope.myGoBack = function() {
		$("#content-loader").show();
		$window.history.back();
	};
	$scope.filterProgram = function() {
		var activity_types = [];
        var count = 0;
		$('input:checkbox.chk-schedule').each(function () {
			if (this.checked == true) {
				activity_types.push($(this).val());
				count++;
			}
		});
		window.localStorage["isRegFilter"] = 1;
		if(activity_types.length) {
			window.localStorage["activity_type_id"] = JSON.stringify(activity_types);
		} else {
			window.localStorage.removeItem("activity_type_id");
		}
		$window.location.href = '#/registration';
	}
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	function showButton() {
		if($scope.isRegFilter == 1) {
			var btn = '<button class="button button-block button-calm" ng-click="SelectAllCal()">Select All Types</button>';
		} else {
			var btn = '<button class="button button-block button-assertive" ng-click="DeselectAllCal()">De-select All Types</button>';
		}
		var temp = $compile(btn)($scope);
		$("#btn_content").html(temp);
	}
})

.controller('RegistrationCtrl', function($scope,$ionicPopover,$ionicPopup,$timeout,RegOptFactory,$ionicSideMenuDelegate,$window,RegistrationFactory,$base64,allRegdFactory,$filter) {
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	$scope.isMessage = false;
	$scope.count = 0;
	$scope.init = function () {
		$("#content-loader").show();
		window.localStorage.removeItem("prev_page");
		if(window.localStorage.getItem("isRegFilter") == 0) {
			$scope.activity_type_id = 'all';
		} else {
			if(window.localStorage.getItem("activity_type_id")) {
				$scope.activity_type_id = JSON.parse(window.localStorage.getItem("activity_type_id"));
			} else {
				$scope.activity_type_id = null;
			}
		}
		var result = RegistrationFactory.getRegistrationRecord($base64.encode(orgId),$base64.encode(auth_token),$scope.activity_type_id);
		result.success(function(data) {
			var programsArr = [];
			if(data.activityies.length) {
				for (var i in data.activityies) {
					programsArr.push(data.activityies[i]);
				}
			} else {
				$scope.isMessage = true;
			}
			$scope.count = programsArr.length;
			$scope.programs = programsArr;
			$("#content-loader").hide();
		});
		result.error(function(data) {
			console.log(data);
		});
	}
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	/*****Registration popup******/
	$scope.showDetail = function(id) {
		window.localStorage["prev_page"] = window.location.hash;
		var id = parseInt(id);
		$("#content-loader").show();
		var object_by_id = $filter('filter')($scope.programs, {id: id },true)[0];
		allRegdFactory.setRegd(JSON.stringify(object_by_id));
		$window.location.href = '#/registration/'+id;
	};
	/******End Registration popup*****/
	$scope.myGoBack = function() {
		$("#content-loader").show();
		$window.history.back();
	};
	$scope.filterRegd = function() {
		$("#content-loader").show();
		$window.location.href = "#/progtyp_list";
	}
	$scope.showLocation = function(location) {
       window.localStorage["prev_hash"] = window.location.hash;
       $("#content-loader").show();
       $window.location.href = "#/google_map/"+location;
    }
	$scope.registerNow = function(id) {
		var id = parseInt(id);
		RegOptFactory.setOptions($filter('filter')($scope.programs, {id: id },true)[0]);
		$window.location.href = '#/registration_option';
	}
})

.controller('ProgramDetailCtrl', function($scope,$ionicPopover,$ionicPopup,$stateParams,$timeout,RegOptFactory,$ionicSideMenuDelegate,$window,allRegdFactory) {
	var id = $stateParams.programId;
	$scope.init = function () {
		var regOptions = JSON.parse(allRegdFactory.getRegd());
		if(regOptions.registration_start != null) {
			var x = new Date(regOptions.registration_start).toDateString();
			regOptions.registration_start = x.substring(x.indexOf(" "),x.lastIndexOf(" "));
		}
		if(regOptions.registration_end != null) {
			var y = new Date(regOptions.registration_end).toDateString();
			regOptions.registration_end = y.substring(y.indexOf(" "),y.lastIndexOf(" "));
		}
		$scope.regOptions = regOptions;
		$("#content-loader").hide();
	}
	$scope.myGoBack = function() {
		//$window.location.href = window.localStorage.getItem("prev_page");
		$window.location.href = '#/registration'
		//$window.history.back();
	};
	/*****Registration popup******/
	$scope.registerNow = function() {
		RegOptFactory.setOptions($scope.regOptions);
		$window.location.href = '#/registration_option';
	}
	/******End Registration popup*****/
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.showLocation = function(location) {
       window.localStorage["prev_hash"] = window.location.hash;
       $("#content-loader").show();
       $window.location.href = "#/google_map/"+location;
    }
})

/************************************************** Registration ***********************************************************/

.controller('RegistrationOptionCtrl', function($scope,$ionicHistory,$timeout,$stateParams,RegOptFactory,$ionicSideMenuDelegate,$window) {
	$scope.proId = $stateParams.programId;
	$scope.init = function () {
		$scope.regOptions = RegOptFactory.getOptions();
		window.localStorage["RegistrationEventTitle"] = $scope.regOptions.title; //Store the event Name here
		$("#content-loader").hide();
	}
	$scope.myGoBack = function() {
		//$window.history.back();
        $window.location.href = "#/registration";
	};
	/*$scope.redirect = function(type) {
		if(type === "Individuals") {
			$window.location.href = '#/individual/'+$scope.proId;
		}else if(type === "Teams") {
			$window.location.href = '#/team/'+$scope.proId;
		}else if(type === "Groups") {
		}
	}*/
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.RegisterProduct = function(RegProdId, RegProdType, RegProdPrice){
		window.localStorage["registration_product_id"] = RegProdId;
		window.localStorage["registration_product_type"] = RegProdType;
		window.localStorage["registration_product_price"] = RegProdPrice;
		window.localStorage['RegdPrevPage'] = window.location.hash;
        $window.location.href = "#/individual/"+RegProdId;
	};
})

.controller('IndividualCtrl', function($scope,$ionicHistory,$stateParams,$timeout,TnCFactory,calculateAgeService,TnCAcceptFactory,UserInfoFactory,$ionicSideMenuDelegate,$window,RegdRec,IndividualRegFactory,$base64,$ionicPopup,$http,EditIndividualRegFactory,changeDateFormat,EditChangeDateFormat) {
	$scope.isWaiver = false;
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	var Eventname = window.localStorage.getItem("RegistrationEventTitle");
	var EventnameType = window.localStorage.getItem("registration_product_type");
	var EventnamePrice = window.localStorage.getItem("registration_product_price");	
	$scope.Eventname = Eventname;
	$scope.EventnameType = EventnameType;
	$scope.EventnamePrice = EventnamePrice;
	var RegistrationProdId = $stateParams.programId;
	$("#content-loader").hide();		   
	/*$(function () {
		$("#birthDay").datepicker({
			dateFormat: 'dd/mm/yy'
		});
	});*/
	$scope.isDisabled = true;
	$("#beforeAccept").show();
	$scope.registrationDetails = [];
	function assignEditValue(data){
		var SaveEditIdValue = window.localStorage.getItem("SaveEditCardId");
		var AllRegDetails = {};
			var PaymentOptions = {};
			var WhomRegister = {};
			var skilllists = {};
			var divisionists = {};
			var shirtsizelists = {};
			var shortsizelists = {};
			var customlists = {};
			var customfieldlists = '';
			var teamcustomfieldlists = '';
			
			var waitlistPaymentOption = '';
			var waitlistPaymentPrice = '';
			
			var displayCustomFields = 1; //1: for not displaying the fields
			var WeekArr = new Array();
			WeekArr["M"]="Monday";
			WeekArr["T"]="Tueasday";
			WeekArr["W"]="Wednesday";
			WeekArr["TH"]="Thursday";
			WeekArr["F"]="Friday";
			WeekArr["Sa"]="Saturday";
			WeekArr["Su"]="Sunday";
			
			if(data.registration_details.non_participation.valid && data.registration_details.is_team){ //TEAM Condition check for displaying the register for section
				$(".registerFor").hide();
				$(".DisplayRosterAddForm").show();
				$(".DisplayCoachAddForm").show();
				$(".isTeamSts").val(data.registration_details.is_team);
				$(".validSts").val(data.registration_details.non_participation.valid);
			}else if(!data.registration_details.non_participation.valid && data.registration_details.is_team){ //GROUP Condition check for displaying the register for section
				$(".registerFor").show();
				$(".DisplayRosterAddForm").show();
				$(".DisplayCoachAddForm").show();
				$(".isTeamSts").val(data.registration_details.is_team);
				$(".validSts").val(data.registration_details.non_participation.valid);
				$(".Displaydob").show();
			}else if(!data.registration_details.non_participation.valid && !data.registration_details.is_team){ //INDIVIDUAL
				$(".registerFor").show();
				$(".DisplayRosterAddForm").hide();
				$(".DisplayCoachAddForm").hide();
				$(".isTeamSts").val(data.registration_details.is_team);
				$(".validSts").val(data.registration_details.non_participation.valid);
				$(".Displaydob").show();
			}

			if(data.registration_details.payment_options.waitlist.waitlist_open){ //This condition is required to display the waitlist payment option
				$(".DisplayPaymentOptions").hide();
				$(".DisplayWaitlistPayment").show();
				waitlistPaymentOption = data.registration_details.payment_options.waitlist.payment_type;
				waitlistPaymentPrice = data.registration_details.payment_options.waitlist.waitlist_fee;
			}else{
				$(".DisplayPaymentOptions").show();
				$(".DisplayWaitlistPayment").hide();
				angular.forEach(data.registration_details.payment_options.payment_type, function (playlist, key){
					if(playlist.type != "payment_plan_payment_options" && playlist.show == true){
						AllRegDetails[playlist.type] = playlist;
						if(playlist.due_on){
							var todayTime = new Date(playlist.due_on);
							var month = todayTime .getMonth() + 1;
							var day = todayTime .getDate();
							var year = todayTime .getFullYear();
							var paymentDue = month + "/" + day + "/" + year;
							if(playlist.show_star){
								PaymentOptions[playlist.type] = playlist.label+" * ( $"+playlist.price+" ) - balance due on "+paymentDue;
							}else{
								PaymentOptions[playlist.type] = playlist.label+" ( $"+playlist.price+" ) - balance due on "+paymentDue;
							}
						}else{
							if(playlist.show_star){
								PaymentOptions[playlist.type] = playlist.label+" * ( $"+playlist.price+" )";
							}else{
								PaymentOptions[playlist.type] = playlist.label+" ( $"+playlist.price+" )";
							}
						}
						//alert(key);
						//PaymentOptions[key].counterpay = key;
					}
					else if(playlist.type == "payment_plan_payment_options" && playlist.show == true && playlist.details){
						angular.forEach(playlist.details, function (value, key){
							//AllRegDetails[playlist.type+"##"+value.name] = value;
							//PaymentOptions[playlist.type+"##"+value.name] = value.name;
							AllRegDetails[value.payment_option_id] = value;
							PaymentOptions[value.payment_option_id] = value.name;
						});
					}
				});
				
				/* This is the code require to select the payment option on page load starts here */
				
					$("#payfulldiv").show();
					$("#payplandiv").hide();
					$scope.onlinepaymentdue = AllRegDetails['online'].price;
				
				/* This is the code require to select the payment option on page load ends here */
				
			}
			
			angular.forEach(data.registration_details.register_for.options, function (reglist, key){
				WhomRegister[reglist.value] = reglist;
			});
			
			if(data.registration_details.show_skill_level){
				displayCustomFields = 2;
				/*angular.forEach(data.registration_details.skill_level.values, function (skillist, key){
					//skilllists[skillist.trim()] = skillist.trim();
					skilllists[key] = skillist.trim();
				});*/
				
				skilllists = data.registration_details.skill_level.values
				$scope.skillLevelLable = data.registration_details.skill_level.label;
				$scope.skillLevelLableSelected = data.registration_details.skill_level.selected;
			}
			
			if(data.registration_details.show_division){
				displayCustomFields = 2;
				/*angular.forEach(data.registration_details.division.values, function (divisionlist, key){
					//divisionists[divisionlist.trim()] = divisionlist.trim();
					divisionists[key] = divisionlist.trim();
				});*/
				
				divisionists = data.registration_details.division.values;
				$scope.DivisonLable = data.registration_details.division.label;
				$scope.DivisonLableSelected = data.registration_details.division.selected;
			}
			
			if(data.registration_details.show_shirt_size){
				displayCustomFields = 2;
				/*angular.forEach(data.registration_details.shirt_size.values, function (shirtsizelist, key){
					//shirtsizelists[shirtsizelist.trim()] = shirtsizelist.trim();
					shirtsizelists[key] = shirtsizelist.trim();
				});*/
				shirtsizelists = data.registration_details.shirt_size.values;
				$scope.ShirtSizeLable = data.registration_details.shirt_size.label;
				$scope.ShirtSizeLableSelected = data.registration_details.shirt_size.selected;
			}
			
			if(data.registration_details.show_short_size){
				displayCustomFields = 2;
				/*angular.forEach(data.registration_details.short_size.values, function (shortsizelist, key){
					//shortsizelists[shortsizelist.trim()] = shortsizelist.trim();
					shortsizelists[key] = shortsizelist.trim();
				});*/
				shortsizelists = data.registration_details.short_size.values;
				$scope.ShortSizeLable = data.registration_details.short_size.label;
				$scope.ShortSizeLableSelected = data.registration_details.short_size.selected;
			}
			
			//This condition is requited to display the fields if the registration is not type of is_team=TRUE and valid=TRUE
			if(data.registration_details.is_team && data.registration_details.non_participation.valid && data.registration_details.non_participation.non_participation_details.participating){
				$(".nameDetails").show();
				$(".AddressCls").show();
				$(".AddInfos").show();
				if(data.registration_details.show_emergency_contact){
					$(".EmergContact").show();
				}
			}else if(data.registration_details.is_team && data.registration_details.non_participation.valid && !data.registration_details.non_participation.non_participation_details.participating){
				$(".nameDetails").hide();
				$(".AddressCls").hide();
				$(".AddInfos").hide();
				$(".EmergContact").hide();
			}
			
			if(data.registration_details.is_team){ //This is required to create teh custom fields for the Team section
				if(data.registration_details.team_details.details.show_team_custom_fields){
					displayCustomFields = 2;

					angular.forEach(data.registration_details.team_details.details.team_custom_fields, function (teamcustomlist, key){
						if(teamcustomlist.show_field){
							if(teamcustomlist.required){
								var TeamValidationClass = 'TeamClassValidation';
								var TeamValidationFieldType = 'validfieldtype="'+teamcustomlist.type+'"';
								var displayTeamValidateStarMark = "<span style='font-weight:bold;color:#FF0000;margin-left:1px;'>*</span>";
							}else{
								var TeamValidationClass = '';
								var TeamValidationFieldType = 'validfieldtype="'+teamcustomlist.type+'"';
								var displayTeamValidateStarMark = "";
							}
							

							if(teamcustomlist.type == "select"){
								teamcustomfieldlists += '<div class="fnt-bld" style="margin-top:10px;">'+teamcustomlist.field_name+displayTeamValidateStarMark+'</div><div class="list" style="margin-bottom:0px;"><select id="registration_custom_field_data_'+teamcustomlist.field_name.replace(/ /g, "_")+'" class="item item-input item-select selectlabel getTeamDataClass '+TeamValidationClass+'" customFieldname="'+teamcustomlist.field_name.replace(/ /g, "_")+'" name="registration[custom_field_data]['+teamcustomlist.field_name+']" '+TeamValidationFieldType+'>';
								teamcustomfieldlists += '<option value="">'+teamcustomlist.field_name+'</option>';
								angular.forEach(teamcustomlist.values, function (value, key1){
									teamcustomfieldlists += '<option value="'+value+'">'+value+'</option>';
								});
								teamcustomfieldlists += '</select></div>';
							}else if(teamcustomlist.type == "multiselect"){
								teamcustomfieldlists += '<div class="mt10"><div class="fnt-bld mb10 getTeamDataClass '+TeamValidationClass+'" '+TeamValidationFieldType+' customFieldname="'+teamcustomlist.field_name.replace(/ /g, "_")+'">'+teamcustomlist.field_name+displayTeamValidateStarMark+'</div>';
								angular.forEach(teamcustomlist.values, function (value2, key2){
									if(WeekArr[value2]){
										var CustomeMultiSelectvalue = WeekArr[value2];
									}else{
										var CustomeMultiSelectvalue = value2;
									}
									teamcustomfieldlists += '<div class="mt10 mb10"><div class="fl nrm-fnt">'+CustomeMultiSelectvalue+'</div><div class="fr sche-tog"><label class="toggle toggle-balanced"><input id="registration_custom_field_data_'+teamcustomlist.field_name.replace(/ /g, "_")+'_'+value2+'" name="registration[custom_field_data]['+teamcustomlist.field_name+']['+value2+']" type="checkbox" class="chk-day '+teamcustomlist.field_name.replace(/ /g, "_")+'" value="'+value2+'"/><div class="track"><div class="handle"></div></div></label></div><div class="cb"></div></div>';
								});
								teamcustomfieldlists += '</div>';
							}else if(teamcustomlist.type == "radio_buttons"){
								teamcustomfieldlists += '<div class="mt10"><div class="fnt-bld mb10 getTeamDataClass '+TeamValidationClass+'" '+TeamValidationFieldType+' customFieldname="'+teamcustomlist.field_name.replace(/ /g, "_")+'">'+teamcustomlist.field_name+displayTeamValidateStarMark+'</div>';
								angular.forEach(teamcustomlist.values, function (value3, key3){
									teamcustomfieldlists += '<div class="mt10 mb10"><div class="fl nrm-fnt"><input type="radio" id="registration_custom_field_data_'+teamcustomlist.field_name.replace(/ /g, "_")+'_'+value3.replace(/(<|>)/g, "_")+'" name="registration[custom_field_data]['+teamcustomlist.field_name+']" class="rad-chk '+teamcustomlist.field_name.replace(/ /g, "_")+'" value="'+value3+'"/> <code>'+value3+'</code></div><div class="cb"></div></div>';
								});
								teamcustomfieldlists += '</div>';
							}else if(teamcustomlist.type == "text_field"){
								teamcustomfieldlists += '<div class="mt10"><div class="fnt-bld mb10 getTeamDataClass">'+teamcustomlist.field_name+displayTeamValidateStarMark+'</div><div class="mt10 mb10"><label class="item item-input"><input type="text" placeholder="Textbox" id="registration_custom_field_data_'+teamcustomlist.field_name.replace(/ /g, "_")+'" name="registration[custom_field_data]['+teamcustomlist.field_name+']"></label></div></div>';
							}else if(teamcustomlist.type == "text_area"){
								teamcustomfieldlists += '<div class="mt10"><div class="fnt-bld mb10 getTeamDataClass">'+teamcustomlist.field_name+displayTeamValidateStarMark+'</div><div class="mt10 mb10"><label class="item item-input"><textarea id="AddCom" id="registration_custom_field_data_'+teamcustomlist.field_name.replace(/ /g, "_")+'" name="registration[custom_field_data]['+teamcustomlist.field_name+']"></textarea></label></div></div>';
							}else if(teamcustomlist.type == "check_box"){
								teamcustomfieldlists += '<div class="mt10"><div class="fnt-bld mb10 getTeamDataClass">'+teamcustomlist.field_name+displayTeamValidateStarMark+'</div>';
								angular.forEach(teamcustomlist.values, function (value4, key4){
									teamcustomfieldlists += '<div class="mt10 mb10"><div class="fl nrm-fnt"><input type="checkbox" id="registration_custom_field_data_'+teamcustomlist.field_name.replace(/ /g, "_")+'_'+value4.replace(/(<|>)/g, "_")+'" name="registration[custom_field_data]['+teamcustomlist.field_name+']"  class="chknoxcls" value="'+value4+'"/> <code>'+value4+'</code></div><div class="cb"></div></div>';
								});
								teamcustomfieldlists += '</div>';
							}
							
							
						}
					});
				}
			}
			
			if(data.registration_details.show_custom_fields){
				displayCustomFields = 2;
				angular.forEach(data.registration_details.custom_fields, function (customlist, key){

					if(customlist.show_field){

						if(customlist.required){
							var ValidationClass = 'ClassValidation';
							var ValidationFieldType = 'validfieldtype="'+customlist.type+'"';
							var displayValidateStarMark = "<span style='font-weight:bold;color:#FF0000;margin-left:1px;'>*</span>";
						}else{
							var ValidationClass = '';
							var ValidationFieldType = 'validfieldtype="'+customlist.type+'"';
							var displayValidateStarMark = "";
						}
						
						customlists[key] = customlist;
						if(customlist.type == "select"){
							customfieldlists += '<div class="fnt-bld" style="margin-top:10px;">'+customlist.field_name + displayValidateStarMark+'</div><div class="list" style="margin-bottom:0px;"><select id="registration_custom_field_data_'+customlist.field_name.replace(/ /g, "_")+'" class="item item-input item-select selectlabel getDataClass '+ValidationClass+'" customFieldname="'+customlist.field_name.replace(/ /g, "_")+'" name="registration[custom_field_data]['+customlist.field_name+']" '+ValidationFieldType+'>';
							customfieldlists += '<option value="">'+customlist.field_name+'</option>';
							angular.forEach(customlist.values, function (value, key1){
								customfieldlists += '<option value="'+value+'">'+value+'</option>';
							});
							customfieldlists += '</select></div>';
						}else if(customlist.type == "multiselect"){
							customfieldlists += '<div class="mt10"><div class="fnt-bld mb10 getDataClass '+ValidationClass+'" '+ValidationFieldType+' customFieldname="'+customlist.field_name.replace(/ /g, "_")+'">'+customlist.field_name+ displayValidateStarMark+'</div>';
							angular.forEach(customlist.values, function (value2, key2){
								if(WeekArr[value2]){
									var CustomeMultiSelectvalue = WeekArr[value2];
								}else{
									var CustomeMultiSelectvalue = value2;
								}
								customfieldlists += '<div class="mt10 mb10"><div class="fl nrm-fnt">'+CustomeMultiSelectvalue+'</div><div class="fr sche-tog"><label class="toggle toggle-balanced"><input id="registration_custom_field_data_'+customlist.field_name.replace(/ /g, "_")+'_'+value2+'" name="registration[custom_field_data]['+customlist.field_name+']['+value2+']" type="checkbox" class="chk-day '+customlist.field_name.replace(/ /g, "_")+'" value="'+value2+'"/><div class="track"><div class="handle"></div></div></label></div><div class="cb"></div></div>';
							});
							customfieldlists += '</div>';
						}else if(customlist.type == "radio_buttons"){
							customfieldlists += '<div class="mt10"><div class="fnt-bld mb10 getDataClass '+ValidationClass+'" '+ValidationFieldType+' customFieldname="'+customlist.field_name.replace(/ /g, "_")+'">'+customlist.field_name+ displayValidateStarMark+'</div>';
							angular.forEach(customlist.values, function (value3, key3){
								customfieldlists += '<div class="mt10 mb10"><div class="fl nrm-fnt"><input type="radio" id="registration_custom_field_data_'+customlist.field_name.replace(/ /g, "_")+'_'+value3.replace(/(<|>)/g, "_")+'" name="registration[custom_field_data]['+customlist.field_name+']" class="rad-chk '+customlist.field_name.replace(/ /g, "_")+'" value="'+value3+'"/> <code>'+value3+'</code></div><div class="cb"></div></div>';
							});
							customfieldlists += '</div>';
						}else if(customlist.type == "text_field"){
							customfieldlists += '<div class="mt10"><div class="fnt-bld mb10 getDataClass">'+customlist.field_name+displayValidateStarMark+'</div><div class="mt10 mb10"><label class="item item-input"><input type="text" placeholder="Textbox" id="registration_custom_field_data_'+customlist.field_name.replace(/ /g, "_")+'" name="registration[custom_field_data]['+customlist.field_name+']"></label></div></div>';
						}else if(customlist.type == "text_area"){
							customfieldlists += '<div class="mt10"><div class="fnt-bld mb10 getDataClass">'+customlist.field_name+displayValidateStarMark+'</div><div class="mt10 mb10"><label class="item item-input"><textarea id="AddCom" id="registration_custom_field_data_'+customlist.field_name.replace(/ /g, "_")+'" name="registration[custom_field_data]['+customlist.field_name+']"></textarea></label></div></div>';
						}else if(customlist.type == "check_box"){
							customfieldlists += '<div class="mt10"><div class="fnt-bld mb10 getDataClass">'+customlist.field_name+displayValidateStarMark+'</div>';
							angular.forEach(customlist.values, function (value4, key4){
								customfieldlists += '<div class="mt10 mb10"><div class="fl nrm-fnt"><input type="checkbox" id="registration_custom_field_data_'+customlist.field_name.replace(/ /g, "_")+'_'+value4.replace(/(<|>)/g, "_")+'" name="registration[custom_field_data]['+customlist.field_name+']"  class="chknoxcls" value="'+value4+'"/> <code>'+value4+'</code></div><div class="cb"></div></div>';
							});
							customfieldlists += '</div>';
						}
						
					}
				});
			}
			
			//This code is required to build the array for the roster details
			if((data.registration_details.team_details.details) && data.registration_details.team_details.details.team_invites.length > 0){
				$scope.totalRosterCount = data.registration_details.team_details.details.team_invites.length;
				var rosterfieldlists = '';
				var allRosters = data.registration_details.team_details.details.team_invites;
				
				if(SaveEditIdValue){
				
					angular.forEach(allRosters, function (rosterlist, key){
						if(rosterlist.email){
							rosterfieldlists = rosterfieldlists + '<div style="position:relative;"><div style="width:90%;"><label style="position:relative;overflow:inherit;width:92%;" class="item item-input LabelClassRoster"><input type="hidden" id="registration_team_invites_attributes_'+key+'_team_invite_id" value="'+rosterlist.team_invite_id+'"><input type="hidden" id="registration_team_invites_attributes_'+key+'_person_id" value="'+rosterlist.person_id+'"><input type="hidden" id="registration_team_invites_attributes_'+key+'_person_email_id" value="'+rosterlist.person_email_id+'"><input type="text" class="rosterEmailClass" value="'+rosterlist.email+'" placeholder="rosteremail" id="registration_team_invites_attributes_'+key+'_person_attributes_emails_attributes_'+key+'_email_address" placeholder="Roster Email" name="registration[team_invites_attributes]['+key+'][person_attributes][emails_attributes]['+key+'][email_address]" ng-model="IndReg.rosterEmail"><input type="hidden" value="'+rosterlist.first_name+'" id="registration_team_invites_attributes_'+key+'_person_attributes_first_name" class="rosterFnameClass" name="registration[team_invites_attributes]['+key+'][person_attributes][first_name]" ng-model="IndReg.rosterFname"><input type="hidden" value="'+rosterlist.last_name+'" id="registration_team_invites_attributes_'+key+'_person_attributes_last_name" class="rosterLnameClass" name="registration[team_invites_attributes]['+key+'][person_attributes][last_name]" ng-model="IndReg.rosterLname"><input type="hidden" id="registration_team_invites_attributes_'+key+'_person_attributes_delete" class="rosterDeleteClass" value="1"></label></div><div style="position: absolute;right:0px;top:10px;"><img class="DeleteRoster" uniqueId="'+key+'" src="img/delete.png" style="width:25px;cursor:pointer;"></div></div>';
						}
					});
					
				}else{
					
					angular.forEach(allRosters, function (rosterlist, key){
						if(rosterlist.email){	
							rosterfieldlists = rosterfieldlists + '<div style="position:relative;"><div style="width:90%;"><label class="item item-input LabelClassRoster"><input type="text" class="rosterEmailClass" value="'+rosterlist.email+'" placeholder="rosteremail" id="registration_team_invites_attributes_'+key+'_person_attributes_emails_attributes_'+key+'_email_address" placeholder="Roster Email" name="registration[team_invites_attributes]['+key+'][person_attributes][emails_attributes]['+key+'][email_address]" ng-model="IndReg.rosterEmail"><input type="hidden" value="'+rosterlist.first_name+'" id="registration_team_invites_attributes_'+key+'_person_attributes_first_name" class="rosterFnameClass" name="registration[team_invites_attributes]['+key+'][person_attributes][first_name]" ng-model="IndReg.rosterFname"><input type="hidden" value="'+rosterlist.last_name+'" id="registration_team_invites_attributes_'+key+'_person_attributes_last_name" class="rosterLnameClass" name="registration[team_invites_attributes]['+key+'][person_attributes][last_name]" ng-model="IndReg.rosterLname"><input type="hidden" id="registration_team_invites_attributes_'+key+'_person_attributes_delete" class="rosterDeleteClass" value="1"></label></div><div style="position: absolute;right:0px;top:10px;"><img class="DeleteRoster" uniqueId="'+key+'" src="img/delete.png" style="width:25px;cursor:pointer;"></div></div>';
						}
					});
				}
				$(".AddMoreRosterSection").html(rosterfieldlists);
			}/*else{
				var totalFieldsDisplay = 2;
				var rosterfieldlists = '';
				for(var key=0;key<totalFieldsDisplay;key++){
					
					rosterfieldlists = rosterfieldlists + '<div style="position:relative;"><div style="width:90%;"><label class="item item-input"><input type="text" class="rosterEmailClass" placeholder="rosteremail" id="registration_team_invites_attributes_'+key+'_person_attributes_emails_attributes_'+key+'_email_address" name="registration[team_invites_attributes]['+key+'][person_attributes][emails_attributes]['+key+'][email_address]" ng-model="IndReg.rosterEmail"></label><div style="width:98%;"><label class="item item-input" style="float:left;width:48%"><input type="text" placeholder="rosterfname" class="rosterFnameClass" id="registration_team_invites_attributes_'+key+'_person_attributes_first_name" name="registration[team_invites_attributes]['+key+'][person_attributes][first_name]" ng-model="IndReg.rosterFname"></label><label class="item item-input" style="float:right;width:48%;margin-right:2px;"><input type="text" class="rosterLnameClass" placeholder="rosterlname" id="registration_team_invites_attributes_'+key+'_person_attributes_last_name" name="registration[team_invites_attributes]['+key+'][person_attributes][last_name]" ng-model="IndReg.rosterLname"></label></div><div style="clear:both;heigh:10px;"></div></div><div style="position: absolute;right:0px;top:10px;"><input type="hidden" id="registration_team_invites_attributes_'+key+'_person_attributes_delete" class="rosterDeleteClass" value="1"><img class="DeleteRosterFirst" uniqueId="'+key+'" src="img/delete.png" style="width:25px;cursor:pointer;"></div></div>';
				}
				$(".AddMoreRosterSection").html(rosterfieldlists);
			}*/
			
			
			//This code is required to build the Coach/Captin details
			if((data.registration_details.team_details.details) && data.registration_details.team_details.details.team_coordinators.address){
				$scope.totalCoachCountdata = data.registration_details.team_details.details.team_coordinators.details.length;
				var coachfieldlists = '';
				if(SaveEditIdValue){
					
					if(data.registration_details.team_details.details.team_coordinators.details.length > 0 && data.registration_details.team_details.details.team_coordinators.details[0].address && data.registration_details.team_details.details.team_coordinators.details[0].role){
						var allcoridatore = data.registration_details.team_details.details.team_coordinators.details;
						angular.forEach(allcoridatore, function (cordinatelist, key){
							coachfieldlists = coachfieldlists + '<div><label class="item item-input"><input type="hidden" id="registration_team_coordinators_attributes_'+key+'_team_coordinator_id" value="'+cordinatelist.team_coordinator_id+'"><input type="hidden" id="registration_team_coordinators_attributes_'+key+'_person_id" value="'+cordinatelist.person_id+'"><input type="hidden" id="registration_team_coordinators_attributes_'+key+'_person_email_id" value="'+cordinatelist.person_email_id+'"><input type="text" class="CoachClass" id="registration_team_coordinators_attributes_'+key+'_person_attributes_emails_attributes_'+key+'_address" name="registration[team_coordinators_attributes]['+key+'][person_attributes][emails_attributes]['+key+'][address]" placeholder="Email Address" value="'+cordinatelist.address+'"></label><label class="item item-input"><input type="text" class="CoachRole" id="registration_team_coordinators_attributes_'+key+'_role" name="registration[team_coordinators_attributes]['+key+'][role]" placeholder="Role" value="'+cordinatelist.role+'"></label></div>';
						});
					}else{
						coachfieldlists = '<div><label class="item item-input"><input type="text" class="CoachClass" id="registration_team_coordinators_attributes_0_person_attributes_emails_attributes_0_address" name="registration[team_coordinators_attributes][0][person_attributes][emails_attributes][0][address]" placeholder="Email Address" value="'+data.registration_details.team_details.details.team_coordinators.address+'"></label><label class="item item-input"><input type="text" class="CoachRole" id="registration_founder_role" name="registration[founder_role]" placeholder="Role" value="'+data.registration_details.team_details.details.team_coordinators.founder_role+'"></label></div>';
					}
				}else{
					coachfieldlists = '<div><label class="item item-input"><input type="text" class="CoachClass" id="registration_team_coordinators_attributes_0_person_attributes_emails_attributes_0_address" name="registration[team_coordinators_attributes][0][person_attributes][emails_attributes][0][address]" placeholder="Email Address" value="'+data.registration_details.team_details.details.team_coordinators.address+'"></label><label class="item item-input"><input type="text" class="CoachRole" id="registration_founder_role" name="registration[founder_role]" placeholder="Role" value="'+data.registration_details.team_details.details.team_coordinators.founder_role+'"></label></div>';
				}
				
				$(".AddMoreCoachSection").html(coachfieldlists);
				
			}
			
			if(teamcustomfieldlists.length > 0){
				$(".DisplayTeamCustom").show();
				$(".AllTeamCustomList").html(teamcustomfieldlists);
			}
			
			$(".AllCustomList").html(customfieldlists);
			if(data.registration_details.non_participation.valid == false){
				$(".displayCustomIndi").show();
			}else if(data.registration_details.non_participation.valid == true && customfieldlists.length > 0){ //IF team present and custom fields present then display the list
				$(".displayCustomIndi").show();
			}else{
				$(".displayCustomIndi").hide();
			}
			
			
			if(data.registration_details.emergency_contact_person.first_name){
				$("#emgFirstName").val(data.registration_details.emergency_contact_person.first_name);
			}
			if(data.registration_details.emergency_contact_person.last_name){
				$("#emgLastName").val(data.registration_details.emergency_contact_person.last_name);
			}
			if(data.registration_details.emergency_contact_person.address){
				$("#emgEmail").val(data.registration_details.emergency_contact_person.address);
			}
			if(data.registration_details.emergency_contact_person.phone){
				$("#emgPhone").val(data.registration_details.emergency_contact_person.phone);
			}
			
			if(data.registration_details.show_emergency_contact){
				$(".EmergContact").show();
			}else{
				$(".EmergContact").hide();
			}
			
			$scope.totalData = data;
			$scope.registrationDetails = AllRegDetails;
			$scope.AllPaymentOptions = PaymentOptions;
			
//			console.log($scope.AllPaymentOptions);
			
	//		$scope.AllPaymentOptions = $filter('orderBy')($scope.AllPaymentOptions, '-counterpay');
			
			$scope.AllWhomRegister = WhomRegister;
			$scope.skilllists = skilllists;
			$scope.divisionists = divisionists;
			$scope.shirtsizelists = shirtsizelists;
			$scope.shortsizelists = shortsizelists;
			$scope.customlists = customlists;

			$scope.displayCustomFieldsStatus = displayCustomFields; //This variable require to display the custom fields and other Additional infos
			
			$scope.waitlistoption = waitlistPaymentOption;
			$scope.waitlistpayment = waitlistPaymentPrice;
			
			window.localStorage["SelectRegisterOption"] = 'customer';
			$scope.selectRegister();
			
			$("#content-loader").hide();
	
	}
	
	
	
	
	$scope.init = function () {
		
		
	if(window.localStorage.getItem("EditCartId")) { //Condition require to get the Edit ID and Details
		$(".DisplayLoaderBIG").show(); //This is the loder before loading all registration Edit data
		var result = EditIndividualRegFactory.editIndividualReg($base64.encode(orgId),$base64.encode(auth_token),window.localStorage.getItem("EditCartId"));
		
		
		result.success(function(data) {
			if(data.registration_details.registration_id){
				$(".Editid").val(window.localStorage.getItem("EditCartId"));
				window.localStorage["SaveEditCardId"] = $(".Editid").val();
			}else{
				$(".Editid").val('');
				window.localStorage["SaveEditCardId"] = '';
				localStorage.removeItem("SaveEditCardId");
			}
			window.localStorage["EditCartId"] = '';
			localStorage.removeItem("EditCartId");
								

			assignEditValue(data);
			var CustomerSelf = 1;
			$timeout(function() {
				$("#reg_price").text();
				
				if(data.registration_details.registration_id){
					$(".register_id").val(data.registration_details.registration_id);
				}
				
				$(".DisplayEventName").html(data.registration_details.registration_product_details.activity);
				$(".DisplayEventType").html(data.registration_details.registration_product_details.human_team+":");
				$(".DisplayEventPrice").html("$"+data.registration_details.registration_product_details.price);
				
				if(data.registration_details.payment_options.selected_payment_type) {
					
					var payopt = data.registration_details.payment_options.selected_payment_type;
					if(payopt == "waitlist" && data.registration_details.payment_options.waitlist.waitlist_open){
						
						$(".DisplayPaymentOptions").hide();
						$(".DisplayWaitlistPayment").show();
						waitlistPaymentOption = data.registration_details.payment_options.waitlist.payment_type;
						waitlistPaymentPrice = data.registration_details.payment_options.waitlist.waitlist_fee;
						
					}else{
						$(".DisplayPaymentOptions").show();
						$(".DisplayWaitlistPayment").hide();
						
						$('#payment_option option[value="'+data.registration_details.payment_options.selected_payment_type+'"]').prop('selected', true);
						$("#payment_option_val").val(data.registration_details.payment_options.selected_payment_type);
						
						if(parseInt(payopt)){
							$("#payfulldiv").hide();
							$("#payplandiv").show();
							$scope.plandepositeamnt = $scope.registrationDetails[payopt].price;
							if($scope.registrationDetails[payopt].due_one){
								$scope.paymentdues = $scope.registrationDetails[payopt].due_one;
							}
						}else{
							$("#payfulldiv").show();
							$("#payplandiv").hide();
							$scope.onlinepaymentdue = $scope.registrationDetails[payopt].price;
						}
					}
					
				}
				if(data.registration_details.is_team){ //Condition for showing the team details
					if(!data.registration_details.non_participation.non_participation_details.participating) {
						$('#registration_participating_roster option[value="No"]').prop('selected', true);
					}else if(data.registration_details.non_participation.non_participation_details.participating) {
						$('#registration_participating_roster option[value="Yes"]').prop('selected', true);
					}
					
					if(data.registration_details.team_details.details.team_name){
						$("#teamName").val(data.registration_details.team_details.details.team_name);
					}
					
					angular.forEach(data.registration_details.team_details.details.team_custom_fields, function (customlist, key){
						if(customlist.show_field){
							
							if(customlist.type == "select"){
								
								if(customlist.selected_value){
									$('#registration_custom_field_data_'+customlist.field_name.replace(/ /g, "_")+' option[value="'+customlist.selected_value+'"]').prop('selected', true);
								}
							}else if(customlist.type == "multiselect"){
								if(customlist.selected_value){
									var AllDayField = customlist.selected_value.split(",");
									for(var i=0;i<AllDayField.length;i++){
										$("#registration_custom_field_data_"+customlist.field_name.replace(/ /g, '_')+"_"+AllDayField[i].trim()).attr('checked','checked');
									}
								}
							}else if(customlist.type == "radio_buttons"){
								if(customlist.selected_value){
									//$("#registration_custom_field_data_How_many_years_experience_do_you_hae__1").attr('checked','checked');
									$("#registration_custom_field_data_"+customlist.field_name.replace(/ /g, '_')+"_"+customlist.selected_value.replace(/(<|>)/g, '_')).attr('checked','checked');
								}
							}
						}
					});
				}			
				if(data.registration_details.emergency_contact_person.id) {
					$("#emergency_contact_id").val(data.registration_details.emergency_contact_person.id);
					$("#emgFirstName").val(data.registration_details.emergency_contact_person.first_name);
					$("#emgLastName").val(data.registration_details.emergency_contact_person.last_name);
					$("#emgEmail").val(data.registration_details.emergency_contact_person.address);
					$("#emgPhone").val(data.registration_details.emergency_contact_person.phone);
					$(".emerEmailHiddenID").val(data.registration_details.emergency_contact_person.person_email_id);
					$(".emerHiddenID").val(data.registration_details.emergency_contact_person.id);
				}
				if(data.registration_details.register_for.selected_registration_target_person_id) {
					
					$('#register_option > option').each(function() {
						if(parseInt(data.registration_details.register_for.selected_registration_target_person_id) == parseInt($(this).val())){
							CustomerSelf = 2;
						}
					});
					
					if(CustomerSelf == 2){
						$('#register_option option[value="'+data.registration_details.register_for.selected_registration_target_person_id+'"]').prop('selected', true);
					}else{
						$('#register_option option[value="customer"]').prop('selected', true);
					}
					$("#register_for_id").val(data.registration_details.register_for.selected_registration_target_person_id);
					$("#firstName").val(data.registration_details.registration_target_person_details.first_name);
					$("#lastName").val(data.registration_details.registration_target_person_details.last_name);
					$("#email").val(data.registration_details.registration_target_person_details.emails[0].address);
					$(".emailHiddenID").val(data.registration_details.registration_target_person_details.emails[0].id);
					$(".personID").val(data.registration_details.registration_target_person_details.id);
					$("#phone").val(data.registration_details.registration_target_person_details.phone);
					var birthdate = data.registration_details.registration_target_person_details.birthdate;
					//var dob = EditChangeDateFormat.editformatDate(birthdate);
					$(".Displaydob").hide();
					$("#birthDay").val(birthdate);
					$("#street").val(data.registration_details.registration_target_person_details.address);
					$("#city").val(data.registration_details.registration_target_person_details.city);
					$("#state").val(data.registration_details.registration_target_person_details.state);
					$("#zip").val(data.registration_details.registration_target_person_details.zip);
					$('#gender option[value="'+data.registration_details.registration_target_person_details.gender+'"]').prop('selected', true);
					
					if(CustomerSelf == 2){
						$("#firstName").prop("disabled", false);
						$("#lastName").prop("disabled", false);
						$("#email").prop("disabled", false);
						$("#birthDay").prop("disabled", false);
						$("#gender").prop("disabled", false);
					}else{
						$("#firstName").prop("disabled", true);
						$("#lastName").prop("disabled", true);
						$("#email").prop("disabled", true);
						$("#birthDay").prop("disabled", true);
						$("#gender").prop("disabled", true);
					}
					
				}
				if(data.registration_details.skill_level.selected) {
					$('#registration_skill_level option[value="'+data.registration_details.skill_level.selected.trim()+'"]').prop('selected', true);
					$("#registration_skill_level").val(data.registration_details.skill_level.selected.trim());
				}
				if(data.registration_details.division.selected) {
					$('#registration_division option[value="'+data.registration_details.division.selected.trim()+'"]').prop('selected', true);
					$("#registration_division").val(data.registration_details.division.selected.trim());
				}
				if(data.registration_details.shirt_size.selected) {
					$('#registration_shirt_size option[value="'+data.registration_details.shirt_size.selected.trim()+'"]').prop('selected', true);
					$("#selected_shirtsize").val(data.registration_details.shirt_size.selected.trim());
				}
				if(data.registration_details.short_size.selected) {
					$('#registration_short_size option[value="'+data.registration_details.short_size.selected.trim()+'"]').prop('selected', true);
					$("#selected_shortsize").val(data.registration_details.short_size.selected.trim());
				}
				
				angular.forEach(data.registration_details.custom_fields, function (customlist, key){
					if(customlist.show_field){
						
						if(customlist.type == "select"){
							
							if(customlist.selected_value){
								$('#registration_custom_field_data_'+customlist.field_name.replace(/ /g, "_")+' option[value="'+customlist.selected_value+'"]').prop('selected', true);
							}
						}else if(customlist.type == "multiselect"){
							if(customlist.selected_value){
								var AllDayField = customlist.selected_value.split(",");
								for(var i=0;i<AllDayField.length;i++){
									$("#registration_custom_field_data_"+customlist.field_name.replace(/ /g, '_')+"_"+AllDayField[i].trim()).attr('checked','checked');
								}
							}
						}else if(customlist.type == "radio_buttons"){
							if(customlist.selected_value){
								//$("#registration_custom_field_data_How_many_years_experience_do_you_hae__1").attr('checked','checked');
								$("#registration_custom_field_data_"+customlist.field_name.replace(/ /g, '_')+"_"+customlist.selected_value.replace(/(<|>)/g, '_')).attr('checked','checked');
							}
						}
					}
				});
				
				if(data.registration_details.is_team && data.registration_details.non_participation.valid && data.registration_details.non_participation.non_participation_details.participating){
					$(".nameDetails").show();
					$(".AddressCls").show();
					$(".AddInfos").show();
					if(data.registration_details.show_emergency_contact){
						$(".EmergContact").show();
					}
					$(".displayCustomIndi").show();
				}else if(data.registration_details.is_team && data.registration_details.non_participation.valid && !data.registration_details.non_participation.non_participation_details.participating){
					$(".nameDetails").hide();
					$(".AddressCls").hide();
					$(".AddInfos").hide();
					$(".EmergContact").hide();
					$(".displayCustomIndi").hide();
				}
				
				
				if(data.registration_details.comment != 'null'){
					$(".AddComment").val(data.registration_details.comment);
				}
				
				var IsHaveWaiver = data.registration_details.is_waiver_required;
				if(IsHaveWaiver){
					$(".ContinueCls").show();
					$(".AddToCls").hide();
				}else{
					$(".ContinueCls").hide();
					$(".AddToCls").show();
				}
				
				$(".DisplayLoaderBIG").hide();
			}, 2000);
			
		});
		result.error(function(data) {
			console.log(data);
		});
		
	}else{ //Condition require to add the details
		$(".DisplayLoaderBIG").show();
		var result = IndividualRegFactory.individualreg($base64.encode(orgId),$base64.encode(auth_token),RegistrationProdId);
		result.success(function(data) {
			/* require to clear the save edit cart id details */
				$(".Editid").val('');
				window.localStorage["SaveEditCardId"] = '';
				localStorage.removeItem("SaveEditCardId");
				window.localStorage["EditCartId"] = '';
				localStorage.removeItem("EditCartId");
				
			assignEditValue(data);
			
			/* Code is required to display the button according to the waiver present starts here*/
			var IsHaveWaiver = data.registration_details.is_waiver_required;
			if(IsHaveWaiver){
				$(".ContinueCls").show();
				$(".AddToCls").hide();
			}else{
				$(".ContinueCls").hide();
				$(".AddToCls").show();
			}
			/* Code is required to display the button according to the waiver present ends here*/
			
			$(".DisplayLoaderBIG").hide();
		});
		result.error(function(data) {
			console.log(data);
		});
	}
		
		
		
		if(RegdRec.getTotRec()) {
			console.log(RegdRec.getTotRec());
		}
		//if(UserInfoFactory.getUserId()) {
//			var selectedUid = UserInfoFactory.getUserId();
//			$('#participant_option option[value="'+selectedUid+'"]').prop('selected', 'selected');
//		} else {
//			var selectedUid = LoggedInUserId;
//			$('#participant_option option[value="'+selectedUid+'"]').prop('selected', 'selected');
//		}
//		$scope.is_accept = TnCAcceptFactory.getAccept();
//		$scope.InfName = UserInfoFactory.getName();
//		$scope.InfEmail = UserInfoFactory.getMail();
//		$scope.InfContact = UserInfoFactory.getContact();
//		$scope.is_accept = TnCAcceptFactory.getAccept();
		
		if($scope.is_accept == 1) {
			$("#beforeAccept").hide();
			$("#afterAccept").show();
			if(window.localStorage.getItem("conf") == 1 || window.localStorage.getItem("conf") == 2) {
				$("#Inf").html("You have agreed to the terms and conditions.");
			} else if(window.localStorage.getItem("conf") == 3) {
				$("#Inf").html("A waiver request email will be sent to:<br>"+$scope.InfName+"</br>"+$scope.InfEmail+"</br>"+$scope.InfContact+".");
			} else if(window.localStorage.getItem("conf") == 4) {
				$("#Inf").html("A waiver request email will be sent to "+$scope.InfName+" ("+$scope.InfEmail+") upon receipt of payment.");
			}
			$("#tc_img").show();
			$scope.isDisabled = false;
		} else {
			$("#tc_img").hide();
			$("#beforeAccept").show();
			$("#afterAccept").hide();
			//$("#street").val($scope.LoggedInUser.street);
			//$("#city").val($scope.LoggedInUser.city);
			//$("#state").val($scope.LoggedInUser.state);
			//$("#zip").val($scope.LoggedInUser.zip);
			//$scope.isDisabled = true;
		}
		/*Factory for set userId and age*/
			var participantId = $("#participant_option option:selected").val();
			var age = calculateAgeService.ageCal($("#participant_option option:selected").attr("dob"));
			var name = ""; var email = "";
			TnCFactory.setAge(age);
			TnCFactory.setId(participantId);
			TnCFactory.setName(name);
			TnCFactory.setEmail(email);
		/*End of Factory for set userId and age*/
			
			$("#login_user_info").show();
			$("#exist_new_user").hide();
			/*var id = $stateParams.programId;
			var data = jQuery.parseJSON(AllPrograms);
			$scope.records = data.records[id];
			for (var i in $scope.records.reg_opt) {
				if(data.records[id].reg_opt[i].type == "Individuals") {
					$scope.regdetail = $scope.records.reg_opt[i];
				}
			}*/
			
			var data1 = jQuery.parseJSON(UserLists);
			var UserListsArr = [];
			for (var i in data1.records) {
				UserListsArr.push(data1.records[i]);
			}
			$scope.UserLists = UserListsArr;
			//console.log($scope.UserLists);
			
			
			/*var payopt = $("#payment_option option:selected").val();
			if(payopt == "online") {
				$("#payfulldiv").show();
				$("#payplandiv").hide();
			} else if(payopt == "plan"){
				$("#payfulldiv").hide();
				$("#payplandiv").show();
			}*/
		$("#content-loader").hide();
	};	
	
	$scope.HidePlaceHolder = function(){
		$(".Displaydob").hide();
	};
	$scope.selectRoster = function(){
		var rosterOpt = $("#registration_participating_roster").val();
		if(rosterOpt == 'Yes'){
			$(".nameDetails").show();
			$(".AddressCls").show();
			$(".AddInfos").show();
			if(data.registration_details.show_emergency_contact){
				$(".EmergContact").show();
			}
			$(".displayCustomIndi").show();
			
			var LoggedInUserDetail = $scope.totalData;
		
			var birthdateAcl = LoggedInUserDetail.registration_details.registration_target_person_details.birthdate;
			birthdateAcl = birthdateAcl.split("-");
			var birthYear = birthdateAcl[0];
			var birthMon  = birthdateAcl[1];
			var birthDay  = birthdateAcl[2];
			$(".Displaydob").hide();
		
			$("#firstName").val(LoggedInUserDetail.registration_details.registration_target_person_details.first_name);
			$("#lastName").val(LoggedInUserDetail.registration_details.registration_target_person_details.last_name);
			$("#gender").val(LoggedInUserDetail.registration_details.registration_target_person_details.gender);
			//$("#birthDay").val(birthDay+"/"+birthMon+"/"+birthYear);
			$("#birthDay").val(LoggedInUserDetail.registration_details.registration_target_person_details.birthdate);
			$("#email").val(LoggedInUserDetail.registration_details.registration_target_person_details.emails[0].address);
			
			$("#firstName").prop("disabled", true);
			$("#lastName").prop("disabled", true);
			$("#gender").prop("disabled", true);
			$("#birthDay").prop("disabled", true);
			$("#email").prop("disabled", true);
			
			$("#phone").val(LoggedInUserDetail.registration_details.registration_target_person_details.phone);
			$("#street").val(LoggedInUserDetail.registration_details.registration_target_person_details.address);
			$("#city").val(LoggedInUserDetail.registration_details.registration_target_person_details.city);
			$("#state").val(LoggedInUserDetail.registration_details.registration_target_person_details.state);
			$("#zip").val(LoggedInUserDetail.registration_details.registration_target_person_details.zip);
			
		}else if(rosterOpt == 'No'){
			$(".nameDetails").hide();
			$(".AddressCls").hide();
			$(".AddInfos").hide();
			$(".EmergContact").hide();
			$(".displayCustomIndi").hide();
			
			$("#firstName").val('');
			$("#lastName").val('');
			$("#gender").val('');
			$("#birthDay").val('');
			$("#email").val('');
			$("#phone").val('');
			$("#street").val('');
			$("#city").val('');
			$("#state").val('');
			$("#zip").val('');
			
			$("#firstName").prop("disabled", false);
			$("#lastName").prop("disabled", false);
			$("#gender").prop("disabled", false);
			$("#birthDay").prop("disabled", false);
			$("#email").prop("disabled", false);
			
			$("#emgFirstName").val('');
			$("#emgLastName").val('');
			$("#emgEmail").val('');
			$("#emgPhone").val('');
			
		}
	};

	$scope.selectRegister = function() {
		var regopt = $("#register_option").val();
		
		if(window.localStorage.getItem("SelectRegisterOption")){
			regopt = window.localStorage.getItem("SelectRegisterOption");
		}else{
			regopt = regopt;
		}
		
		var selectedArr = $scope.AllWhomRegister[regopt];
		if(regopt == ''){
			$("#firstName").val('');
			$("#lastName").val('');
			$("#gender").val('');
			$("#birthDay").val('');
			$("#email").val('');
			$("#phone").val('');
			$("#street").val('');
			$("#city").val('');
			$("#state").val('');
			$("#zip").val('');
			
			$("#firstName").prop("disabled", false);
			$("#lastName").prop("disabled", false);
			$("#gender").prop("disabled", false);
			$("#birthDay").prop("disabled", false);
			$("#email").prop("disabled", false);
			
			$("#emgFirstName").val('');
			$("#emgLastName").val('');
			$("#emgEmail").val('');
			$("#emgPhone").val('');
			
			$(".Displaydob").show();
			
		}else if(regopt == 'customer'){
			var LoggedInUserDetail = $scope.totalData;
		
			var birthdateAcl = LoggedInUserDetail.registration_details.registration_target_person_details.birthdate;
			birthdateAcl = birthdateAcl.split("-");
			var birthYear = birthdateAcl[0];
			var birthMon  = birthdateAcl[1];
			var birthDay  = birthdateAcl[2];
			$(".Displaydob").hide();
		
			$("#firstName").val(LoggedInUserDetail.registration_details.registration_target_person_details.first_name);
			$("#lastName").val(LoggedInUserDetail.registration_details.registration_target_person_details.last_name);
			$("#gender").val(LoggedInUserDetail.registration_details.registration_target_person_details.gender);
			//$("#birthDay").val(birthYear+"-"+birthMon+"-"+birthDay);
			$("#birthDay").val(LoggedInUserDetail.registration_details.registration_target_person_details.birthdate);
			$("#email").val(LoggedInUserDetail.registration_details.registration_target_person_details.emails[0].address);
			
			$("#firstName").prop("disabled", true);
			$("#lastName").prop("disabled", true);
			$("#gender").prop("disabled", true);
			$("#birthDay").prop("disabled", true);
			$("#email").prop("disabled", true);
			
			$("#phone").val(LoggedInUserDetail.registration_details.registration_target_person_details.phone);
			if(LoggedInUserDetail.registration_details.registration_target_person_details.address == 'null'){
				$("#street").val('');
			}else{
				$("#street").val(LoggedInUserDetail.registration_details.registration_target_person_details.address);
			}
			if(LoggedInUserDetail.registration_details.registration_target_person_details.city == 'null'){
				$("#city").val('');
			}else{
				$("#city").val(LoggedInUserDetail.registration_details.registration_target_person_details.city);
			}
			if(LoggedInUserDetail.registration_details.registration_target_person_details.state == 'null'){
				$("#state").val('');
			}else{
				$("#state").val(LoggedInUserDetail.registration_details.registration_target_person_details.state);
			}
			if(LoggedInUserDetail.registration_details.registration_target_person_details.zip == 'null'){
				$("#zip").val('');
			}else{
				$("#zip").val(LoggedInUserDetail.registration_details.registration_target_person_details.zip);
			}
		
		}else{
			$("#firstName").val(selectedArr.sor_rtp_other_first_name);
			$("#lastName").val(selectedArr.sor_rtp_other_last_name);
			$("#gender").val(selectedArr.sor_rtp_other_gender);
			$(".Displaydob").hide();
			//$("#birthDay").val(selectedArr.sor_rtp_other_birthdate_3i+ "/" + selectedArr.sor_rtp_other_birthdate_2i+ "/" +selectedArr.sor_rtp_other_birthdate_1i);
			if(selectedArr.sor_rtp_other_birthdate_2i != '11' && selectedArr.sor_rtp_other_birthdate_2i != '12'){
				var MonthDisplay = "0"+selectedArr.sor_rtp_other_birthdate_2i;
			}else{
				var MonthDisplay = selectedArr.sor_rtp_other_birthdate_2i;
			}
			
			if(selectedArr.sor_rtp_other_birthdate_3i >= 1 && selectedArr.sor_rtp_other_birthdate_3i <= 9){
				var DayDisplay = "0"+selectedArr.sor_rtp_other_birthdate_3i;
			}else{
				var DayDisplay = selectedArr.sor_rtp_other_birthdate_3i;
			}
			$("#birthDay").val(selectedArr.sor_rtp_other_birthdate_1i+ "-" + MonthDisplay+ "-" +DayDisplay);
			//$("#birthDay").val(selectedArr.sor_rtp_other_birthdate_1i+ "-" + selectedArr.sor_rtp_other_birthdate_2i+ "-" +selectedArr.sor_rtp_other_birthdate_3i);
			$("#email").val(selectedArr.sor_rtp_email_address);
			$("#phone").val(selectedArr.sor_rtp_phone);
			$("#street").val(selectedArr.sor_rtp_address);
			$("#city").val(selectedArr.sor_rtp_city);
			$("#state").val(selectedArr.sor_rtp_state);
			$("#zip").val(selectedArr.sor_rtp_zip);
			
			$("#firstName").prop("disabled", false);
			$("#lastName").prop("disabled", false);
			$("#gender").prop("disabled", false);
			$("#birthDay").prop("disabled", false);
			$("#email").prop("disabled", false);
			
			$("#emgFirstName").val(selectedArr.sor_ecp_first_name);
			$("#emgLastName").val(selectedArr.sor_ecp_last_name);
			$("#emgEmail").val(selectedArr.sor_ecp_emails_attributes_0_email_address);
			$("#emgPhone").val(selectedArr.sor_ecp_phone);
			
		}
		window.localStorage["SelectRegisterOption"] = '';
		localStorage.removeItem("SelectRegisterOption");
	}
	
	$scope.selectPayOpt = function() {
		var payopt = $("#payment_option option:selected").val();
	
		//console.log('AllRegDetails',$scope.registrationDetails);
		//console.log('PaymentOptions',$scope.AllPaymentOptions);
		if(payopt == ''){
			$("#payfulldiv").hide();
			$("#payplandiv").hide();
		}else{
			if(parseInt(payopt)){
				$("#payfulldiv").hide();
				$("#payplandiv").show();
				$scope.plandepositeamnt = $scope.registrationDetails[payopt].price;
				if($scope.registrationDetails[payopt].due_one){
					$scope.paymentdues = $scope.registrationDetails[payopt].due_one;
				}
			}else{
				$("#payfulldiv").show();
				$("#payplandiv").hide();
				$scope.onlinepaymentdue = $scope.registrationDetails[payopt].price;
			}
		}
	}
	
	$scope.myGoBack = function() {
		//$("#content-loader").show();
		//$window.history.back();
		$window.location.href = window.localStorage.getItem("RegdPrevPage");
        //$window.location.href = '#/registration_option';
	};
	$scope.goToUserInf = function(id) {
		//$("#content-loader").show();
		window.localStorage['RegdPrevPage'] = window.location.hash;
		$window.location.href = '#/individual_regd/'+id;
	}
	/*$scope.paymentFormat = function() {
		var payopt = $("#payment_option option:selected").val();
		if(payopt == "online") {
			$("#payfulldiv").show();
			$("#payplandiv").hide();
		} else if(payopt == "plan"){
			$("#payfulldiv").hide();
			$("#payplandiv").show();
		}
	}*/
	//$scope.participantInf = function() {
//		$("#tc_img").hide();
//		$("#beforeAccept").show();
//		$("#afterAccept").hide();
//		$scope.isDisabled = true;
//	/*Factory for set userId and age*/
//		var participantId = $("#participant_option option:selected").val();
//		var dob = $("#participant_option option:selected").attr("dob");
//		var name = ""; var email = "";
//		if((participantId != LoggedInUserId) && participantId != 0) 
//		{
//			name = $("#participant_option option:selected").text();
//			email = $("#participant_option option:selected").attr("email");
//		}
//		TnCFactory.setName(name);
//		TnCFactory.setEmail(email);
//		var age = "";
//		if(dob != "") {
//			age = calculateAgeService.ageCal(dob);
//		}
//		TnCFactory.setAge(age);
//		TnCFactory.setId(participantId);
//	/*End Factory for set userId and age*/
//		if(participantId == LoggedInUserId) {
//			$("#login_user_info").show();
//			$("#exist_new_user").hide();
//			$("#street").val($scope.LoggedInUser.street);
//			$("#city").val($scope.LoggedInUser.city);
//			$("#state").val($scope.LoggedInUser.state);
//			$("#zip").val($scope.LoggedInUser.zip);
//		} else if(participantId == 0) {
//			$("#login_user_info").hide();
//			$("#exist_new_user").show();
//			$("#firstName").val('');
//			$("#lastName").val('');
//			$("#birthDay").val('');
//			$('#gender').val('');
//			$("#email").val('');
//			$("#phone").val('');
//			$("#street").val('');
//			$("#city").val('');
//			$("#state").val('');
//			$("#zip").val('');
//		} else {
//			$("#login_user_info").hide();
//			$("#exist_new_user").show();
//			var data2 = jQuery.parseJSON(UserLists);
//			var ext_user_rec = data2.records[participantId];
//			$scope.IndReg.firstName = ext_user_rec.firstname;
//			$scope.IndReg.lastName = ext_user_rec.lastname;
//			$scope.IndReg.birthDay = ext_user_rec.DOB;
//			$scope.IndReg.gender = ext_user_rec.Gender;
//			$scope.IndReg.email = ext_user_rec.email;
//			$scope.IndReg.phone = ext_user_rec.phone;
//			$scope.IndReg.street = ext_user_rec.street;
//			$scope.IndReg.city = ext_user_rec.city;
//			$scope.IndReg.state = ext_user_rec.state;
//			$scope.IndReg.zip = ext_user_rec.zip;
//		}
//	}
	
	$scope.AddMoreRoster = function(){
	
		var totalCount = $(".totalRosterCount").val();
		var NewRosterCnt = totalCount;
		
		var MoreRoster = '<label class="item item-input"><input type="text" class="rosterEmailClass" placeholder="rosteremail" id="registration_team_invites_attributes_'+NewRosterCnt+'_person_attributes_emails_attributes_'+NewRosterCnt+'_email_address" name="registration[team_invites_attributes]['+NewRosterCnt+'][person_attributes][emails_attributes]['+NewRosterCnt+'][email_address]" ng-model="IndReg.rosterEmail"></label><div style="width:98%;"><label class="item item-input" style="float:left;width:48%"><input type="text" placeholder="rosterfname" class="rosterFnameClass" id="registration_team_invites_attributes_'+NewRosterCnt+'_person_attributes_first_name" name="registration[team_invites_attributes]['+NewRosterCnt+'][person_attributes][first_name]" ng-model="IndReg.rosterFname"></label><label class="item item-input" style="float:right;width:48%;margin-right:2px;"><input type="text" class="rosterLnameClass" placeholder="rosterlname" id="registration_team_invites_attributes_'+NewRosterCnt+'_person_attributes_last_name" name="registration[team_invites_attributes]['+NewRosterCnt+'][person_attributes][last_name]" ng-model="IndReg.rosterLname"></label></div><div style="clear:both;heigh:10px;"></div>';
		
		$(".AddMoreRosterSection").append(MoreRoster);
		$(".totalRosterCount").val(NewRosterCnt);
		
	};
	
	$scope.AddMoreCoach = function(){
	
		var totalCount = $(".totalCoachCountdata").val();
		var NewCoachCnt = totalCount;
		var MoreCoach = '<div><label class="item item-input"><input type="text" class="CoachClass" id="registration_team_coordinators_attributes_'+NewCoachCnt+'_person_attributes_emails_attributes_'+NewCoachCnt+'_address" name="registration[team_coordinators_attributes]['+NewCoachCnt+'][person_attributes][emails_attributes]['+NewCoachCnt+'][address]" placeholder="Email Address" value=""></label><label class="item item-input"><input type="text" class="CoachRole" id="registration_team_coordinators_attributes_'+NewCoachCnt+'_role" name="registration[team_coordinators_attributes]['+NewCoachCnt+'][role]" placeholder="Role" value=""></label></div>';
		$(".AddMoreCoachSection").append(MoreCoach);
		$(".totalCoachCountdata").val(NewCoachCnt);
		
	};
	
	//Delete the roster functionality
	$(document).on('click', '.DeleteRoster', function(){
		var ValueofDel = $(this).parent().prev().children().children(".rosterDeleteClass").val();
		if(ValueofDel == '1'){
			var uniqueId = $(this).attr("uniqueId");
			$("#registration_team_invites_attributes_"+uniqueId+"_person_attributes_delete").val('2');
			$(this).parent().parent().hide();
		}
	});
	
	$(document).on('click', '.DeleteRosterFirst', function(){
		var ValueofDel = $(this).prev(".rosterDeleteClass").val();
		if(ValueofDel == '1'){
			var uniqueId = $(this).attr("uniqueId");
			$("#registration_team_invites_attributes_"+uniqueId+"_person_attributes_delete").val('2');
			$(this).parent().parent().hide();
		}
	});
	
	$scope.IndReg = {};
	$scope.submitIndReg = function() {
		//console.log($scope.IndReg);return false;
		//$("#content-loader").show();
		//$window.location.href = '#/cart';
		if($('#waiver-content').is(':visible')){
			var confirmPopup = $ionicPopup.confirm({
			   title: '<div style="text-align:center;">Please review and agree to terms and conditions.</div>'
			});
			confirmPopup.then(function(res) {
				if(res){
					$scope.goTermsConditions();
				}else{
					return false;
				}
			});
			
			return false;
		}
		
		var SubmitStatus = false;
		
		if($('#registration_participating_roster').is(':visible')){
			var rosterOptValid = $("#registration_participating_roster").val();
		}
		
		if($('#payment_option').is(':visible')){ //This is the condition for the other payment options
			var PaymentOptionVal = $("#payment_option").val();
		}else{//This is the condition for the wait list payment option
			var PaymentOptionVal = $(".paymentPriceAmt").val();
		}
		
		if($('#register_option').is(':visible')){
			var RegisterOptionVal = $("#register_option").val();
		}
		
		var TeamName = $("#teamName").val();
		
		if($('#teamName').is(':visible')){
			TeamName = TeamName.trim();
		}
		
		if($('.nameDetails').is(':visible')){
			var firstName = $("#firstName").val();
			var lastName = $("#lastName").val();
			var gender = $("#gender").val();
			var birthDay = $("#birthDay").val();
			var email = $("#email").val();
			var phone = $("#phone").val();
		}
		
		if($('.AddressCls').is(':visible')){
			var street = $("#street").val();
			var city = $("#city").val();
			var state = $("#state").val();
			var zip = $("#zip").val();
		}
		
		if($('.AddInfos').is(':visible')){
			var position = $("#registration_skill_level").val();
			var division = $("#registration_division").val();
			var shirtSize = $("#registration_shirt_size").val();
			var shortSize = $("#registration_short_size").val();
		}
		
		if($('.EmergContact').is(':visible')){
			var emgFirstName = $("#emgFirstName").val();
			var emgLastName = $("#emgLastName").val();
			var emgEmail = $("#emgEmail").val();
			
			if(emgEmail){
				var reg = /^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,4})$/;
				if(!reg.test(emgEmail)){
					var alertPopup = $ionicPopup.alert({
					   title: '<div style="text-align:center;">Please enter a correct emergency email address</div>'
					});
					return false;
				}
			}
			
			var emgPhone = $("#emgPhone").val();
		}
		
		var validcounter = 0;
		if(PaymentOptionVal == ''){
			SubmitStatus = false;
			var alertPopup = $ionicPopup.alert({
			   title: '<div style="text-align:center;">Please select a payment option.</div>'
		    });
			return false;
		}else if(rosterOptValid == ''){
			SubmitStatus = false;
			var alertPopup = $ionicPopup.alert({
			   title: '<div style="text-align:center;">Please select roster option.</div>'
		    });
			return false;
		}else if(TeamName == ''){
			SubmitStatus = false;
			var alertPopup = $ionicPopup.alert({
			   title: '<div style="text-align:center;">Please enter a team name.</div>' 
		    });
			return false;
		}else if(RegisterOptionVal == ''){
			SubmitStatus = false;
			var alertPopup = $ionicPopup.alert({
			   title: '<div style="text-align:center;">Please select registering for option.</div>'
		    });
			return false;
		}else if(position == ''){
			SubmitStatus = false;
			var alertPopup = $ionicPopup.alert({
			   title: '<div style="text-align:center;">Skill level can\'t be blank.</div>'
		    });
			return false;
		}else if(division == ''){
			SubmitStatus = false;
			var alertPopup = $ionicPopup.alert({
			   title: '<div style="text-align:center;">Division can\'t be blank.</div>'
		    });
			return false;
		}else if(shirtSize == ''){
			SubmitStatus = false;
			var alertPopup = $ionicPopup.alert({
			   title: '<div style="text-align:center;">Shirt size can\'t be blank.</div>'
		    });
			return false;
		}else if(shortSize == ''){
			SubmitStatus = false;
			var alertPopup = $ionicPopup.alert({
			   title: '<div style="text-align:center;">Short size can\'t be blank.</div>'
		    });
			return false;
		}else if(emgFirstName == '' || emgLastName == '' || emgEmail == '' || emgPhone == ''){
			SubmitStatus = false;
			var alertPopup = $ionicPopup.alert({
			   title: '<div style="text-align:center;">Please Enter Emergency Details.</div>'
		    });
			return false;
		}else if($('.TeamClassValidation').is(':visible') && !$('.ClassValidation').is(':visible')){
			teamvalidcounter = $(".TeamClassValidation").length; //Custom fields validation starts here
			if(teamvalidcounter > 0){
				$(".TeamClassValidation").each(function() {
					var validtypecheck = $(this).attr("validfieldtype");
					var fieldName = $(this).attr("customfieldname");
					fieldName = fieldName.replace(/_/g, " ");
					if(validtypecheck == "select"){
						var fieldId = $(this).attr("id");
						var selectval = $("#"+fieldId).val();
						if(selectval == ''){
							var selectedOption = $( "#"+fieldId+" option:selected" ).text();
							var alertPopup1 = $ionicPopup.alert({
							   title: '<div style="text-align:center;">Please select '+selectedOption+'.</div>'
							});
							SubmitStatus = false;
							return false;
						}else{
							SubmitStatus = true;
						}
					}else if(validtypecheck == "multiselect"){
						var fieldName = $(this).attr("customfieldname");
						if($("."+fieldName+":checkbox:checked").length > 0){
						   SubmitStatus = true;
						}else{
						   var alertPopup2 = $ionicPopup.alert({
							   title: '<div style="text-align:center;">Please select at least one '+fieldName.replace(/_/g, " ")+'.</div>'
						   });
						   SubmitStatus = false;
						   return false;
						}
					}else if(validtypecheck == "radio_buttons"){
						var fieldName = $(this).attr("customfieldname");
						if($("."+fieldName+":radio:checked").length > 0){
						   SubmitStatus = true;
						}else{
						   var alertPopup3 = $ionicPopup.alert({
							   title: '<div style="text-align:center;">Please select '+fieldName.replace(/_/g, " ")+'.</div>'
						   });
						   SubmitStatus = false;
						   return false;
						}
					}
				});
			}else{
				SubmitStatus = true;
			}
		}else if($('.ClassValidation').is(':visible') && !$('.TeamClassValidation').is(':visible')){
			validcounter = $(".ClassValidation").length; //Custom fields validation starts here
			if(validcounter > 0){
				$(".ClassValidation").each(function() {
					var validtypecheck = $(this).attr("validfieldtype");
					var fieldName = $(this).attr("customfieldname");
					fieldName = fieldName.replace(/_/g, " ");
					
					if(validtypecheck == "select"){
						var fieldId = $(this).attr("id");
						var selectval = $("#"+fieldId).val();
						if(selectval == ''){
							var selectedOption = $( "#"+fieldId+" option:selected" ).text();
							var alertPopup1 = $ionicPopup.alert({
							   title: '<div style="text-align:center;">Please select '+selectedOption+'.</div>'
							});
							SubmitStatus = false;
							return false;
						}else{
							SubmitStatus = true;
						}
					}else if(validtypecheck == "multiselect"){
						var fieldName = $(this).attr("customfieldname");
						if($("."+fieldName+":checkbox:checked").length > 0){
						   SubmitStatus = true;
						}else{
						   var alertPopup2 = $ionicPopup.alert({
							   title: '<div style="text-align:center;">Please select at least one '+fieldName.replace(/_/g, " ")+'.</div>'
						   });
						   SubmitStatus = false;
						   return false;
						}
					}else if(validtypecheck == "radio_buttons"){
						var fieldName = $(this).attr("customfieldname");
						if($("."+fieldName+":radio:checked").length > 0){
						   SubmitStatus = true;
						}else{
						   var alertPopup3 = $ionicPopup.alert({
							   title: '<div style="text-align:center;">Please select '+fieldName.replace(/_/g, " ")+'.</div>'
						   });
						   SubmitStatus = false;
						   return false;
						}
					}
				});
			}else{
				SubmitStatus = true;
			}
		}else if($('.TeamClassValidation').is(':visible') && $('.ClassValidation').is(':visible')){
			
			var ValidateCounterTeam = 0
			
			teamvalidcounter = $(".TeamClassValidation").length; //Custom fields validation starts here
			validcounter = $(".ClassValidation").length; //Custom fields validation starts here
			
			if(teamvalidcounter > 0 && teamvalidcounter != ValidateCounterTeam){
				$(".TeamClassValidation").each(function() {
					var validtypecheck = $(this).attr("validfieldtype");
					var fieldName = $(this).attr("customfieldname");
					fieldName = fieldName.replace(/_/g, " ");
					if(validtypecheck == "select"){
						var fieldId = $(this).attr("id");
						var selectval = $("#"+fieldId).val();
						if(selectval == ''){
							var selectedOption = $( "#"+fieldId+" option:selected" ).text();
							var alertPopup1 = $ionicPopup.alert({
							   title: '<div style="text-align:center;">Please select '+selectedOption+'.</div>'
							});
							SubmitStatus = false;
							return false;
						}else{
							//SubmitStatus = true;
							ValidateCounterTeam ++;
						}
					}else if(validtypecheck == "multiselect"){
						var fieldName = $(this).attr("customfieldname");
						if($("."+fieldName+":checkbox:checked").length > 0){
						   //SubmitStatus = true;
						   ValidateCounterTeam ++;
						}else{
						   var alertPopup2 = $ionicPopup.alert({
							   title: '<div style="text-align:center;">Please select at least one '+fieldName.replace(/_/g, " ")+'.</div>'
						   });
						   SubmitStatus = false;
						   return false;
						}
					}else if(validtypecheck == "radio_buttons"){
						var fieldName = $(this).attr("customfieldname");
						if($("."+fieldName+":radio:checked").length > 0){
						   //SubmitStatus = true;
						   ValidateCounterTeam ++;
						}else{
						   var alertPopup3 = $ionicPopup.alert({
							   title: '<div style="text-align:center;">Please select '+fieldName.replace(/_/g, " ")+'.</div>'
						   });
						   SubmitStatus = false;
						   return false;
						}
					}
				});
			}
			if(validcounter > 0 && (ValidateCounterTeam == teamvalidcounter)){
				$(".ClassValidation").each(function() {
					var validtypecheck = $(this).attr("validfieldtype");
					var fieldName = $(this).attr("customfieldname");
					fieldName = fieldName.replace(/_/g, " ");
					
					if(validtypecheck == "select"){
						var fieldId = $(this).attr("id");
						var selectval = $("#"+fieldId).val();
						if(selectval == ''){
							var selectedOption = $( "#"+fieldId+" option:selected" ).text();
							var alertPopup1 = $ionicPopup.alert({
							   title: '<div style="text-align:center;">Please select '+selectedOption+'.</div>'
							});
							SubmitStatus = false;
							return false;
						}else{
							SubmitStatus = true;
						}
					}else if(validtypecheck == "multiselect"){
						var fieldName = $(this).attr("customfieldname");
						if($("."+fieldName+":checkbox:checked").length > 0){
						   SubmitStatus = true;
						}else{
						   var alertPopup2 = $ionicPopup.alert({
							   title: '<div style="text-align:center;">Please select at least one '+fieldName.replace(/_/g, " ")+'.</div>'
						   });
						   SubmitStatus = false;
						   return false;
						}
					}else if(validtypecheck == "radio_buttons"){
						var fieldName = $(this).attr("customfieldname");
						if($("."+fieldName+":radio:checked").length > 0){
						   SubmitStatus = true;
						}else{
						   var alertPopup3 = $ionicPopup.alert({
							   title: '<div style="text-align:center;">Please select '+fieldName.replace(/_/g, " ")+'.</div>'
						   });
						   SubmitStatus = false;
						   return false;
						}
					}
				});
			}
		}else{
			SubmitStatus = true;
		}
		if(SubmitStatus == true){
			
			/* Validation for the Roster Email starts here */
			RosterValidation = true;
			$(".rosterEmailClass").each(function(){
												 
				if($(this).val()) {
					var Email_Address = $(this).val();
				} else {
					var Email_Address = "";
				}
				if($(this).next(".rosterFnameClass").val()) {
					var fname = $(this).next(".rosterFnameClass").val();
				}else if($(this).parent().next().children().children(".rosterFnameClass").val()) {
					var fname = $(this).parent().next().children().children(".rosterFnameClass").val();
				} else {
					var fname = "";
				}
				if($(this).next().next(".rosterLnameClass").val()) {
					var lname = $(this).next().next(".rosterLnameClass").val();
				}else if($(this).parent().next().children().next().children(".rosterLnameClass").val()) {
					var lname = $(this).parent().next().children().children(".rosterLnameClass").val();
				} else {
					var lname = "";
				}
				if(Email_Address && fname == "" && lname == "") {
					RosterValidation = false;
				}
			 });
			
			if(!RosterValidation){
				var alertPopup = $ionicPopup.alert({
				   title: '<div style="text-align:center;">Please enter Roster member first name or last name</div>'
			    });
					
				$(".AddToCartBtn").show();
				$(".RegistrationLoader").hide();
					
			    return false;			
			}			
			
			var isTeamSts = $(".isTeamSts").val();
			var validSts = $(".validSts").val();
			var RosterVal = $("#registration_participating_roster").val();
			var TeamName = $("#teamName").val();
			if($('#teamName').is(':visible')){
				TeamName = TeamName.trim();
			}

			//var PaymentOptionVal = $("#payment_option").val();
			
			if($('#payment_option').is(':visible')){ //This is the condition for the other payment options
				var PaymentOptionVal = $("#payment_option").val()
			}else{ //this is the condition for the Waitlist condition
				var PaymentOptionVal = $(".paymentPriceAmt").val();
			}
			
			var RegisterOptionVal = $("#register_option").val();
			
			if(RegisterOptionVal == 'customer'){
				var TargetSelf = true;
			}else{
				var TargetSelf = false;
			}

			var firstName = $("#firstName").val();
			var lastName = $("#lastName").val();
			var gender = $("#gender").val();
			
			var birthDay = $("#birthDay").val();
          
			//if(birthDay){
			//	birthday = birthDay.split("/");
			//	birthDay = birthday[2].trim()+"-"+birthday[1].trim()+"-"+birthday[0].trim();
			//}
            
			var email = $("#email").val();
			var emailID = $(".emailHiddenID").val();
			var personID = $(".personID").val();
			var phone = $("#phone").val();
			var street = $("#street").val();
			var city = $("#city").val();
			var state = $("#state").val();
			var zip = $("#zip").val();
			
			
			var position = $("#registration_skill_level").val();
			var division = $("#registration_division").val();
			var shirtSize = $("#registration_shirt_size").val();
			var shortSize = $("#registration_short_size").val();
			
			
			var emgFirstName = $("#emgFirstName").val();
			var emgLastName = $("#emgLastName").val();
			var emgEmail = $("#emgEmail").val();
			var emgPhone = $("#emgPhone").val();
			var emerEmailHiddenID = $(".emerEmailHiddenID").val();
			var emerHiddenID = $(".emerHiddenID").val();
			
			var register_id = $(".register_id").val();
			
			var AddlComment = encodeURI($(".AddComment").val());
			if(isTeamSts=='false' && validSts=='false') //Submitting for the Individual Condition
			{
				var SaveEditIdValue = window.localStorage.getItem("SaveEditCardId");
				
				if(parseInt(PaymentOptionVal)){
					var CustomFieldsArr = '{"registration":{"registration_product_id":"'+RegistrationProdId+'","payment_option_id":"'+PaymentOptionVal+'","target_self":"'+TargetSelf+'",';
				}else{
					var CustomFieldsArr = '{"registration":{"registration_product_id":"'+RegistrationProdId+'","payment_type":"'+PaymentOptionVal+'","target_self":"'+TargetSelf+'",';
				}
				
				if(RegisterOptionVal == 'customer'){
					if(emailID && personID){
						var CustomFieldsArr = CustomFieldsArr + '"registration_target_person_attributes":{"emails_attributes":{"0":{"address":"'+email+'","id":"'+emailID+'"}},"first_name":"'+firstName+'","last_name":"'+lastName+'","gender":"'+gender+'","birthdate":"'+birthDay+'","address":"'+street+'","city":"'+city+'","state":"'+state+'","zip":"'+zip+'","phone":"'+phone+'","id":"'+personID+'"},';
					}else{
						var CustomFieldsArr = CustomFieldsArr + '"registration_target_person_attributes":{"emails_attributes":{"0":{"address":"'+email+'"}},"first_name":"'+firstName+'","last_name":"'+lastName+'","gender":"'+gender+'","birthdate":"'+birthDay+'","address":"'+street+'","city":"'+city+'","state":"'+state+'","zip":"'+zip+'","phone":"'+phone+'"},';
					}
				}else{
					if($("#birthDay").val()){
						var birthDayFalse = $("#birthDay").val();
						//birthDayFalse = birthDayFalse.split("/");
						birthDayFalse = birthDayFalse.split("-");
						if(emailID && personID){
							var CustomFieldsArr = CustomFieldsArr + '"registration_target_person_attributes":{"email_address":"'+email+'","email_id":"'+emailID+'","other_first_name":"'+firstName+'","other_last_name":"'+lastName+'","other_gender":"'+gender+'","other_birthdate(1i)":"'+birthDayFalse[0]+'","other_birthdate(2i)":"'+birthDayFalse[1]+'","other_birthdate(3i)":"'+birthDayFalse[2]+'","address":"'+street+'","city":"'+city+'","state":"'+state+'","zip":"'+zip+'","phone":"'+phone+'","id":"'+personID+'"},';
						}else{
							var CustomFieldsArr = CustomFieldsArr + '"registration_target_person_attributes":{"email_address":"'+email+'","other_first_name":"'+firstName+'","other_last_name":"'+lastName+'","other_gender":"'+gender+'","other_birthdate(1i)":"'+birthDayFalse[0]+'","other_birthdate(2i)":"'+birthDayFalse[1]+'","other_birthdate(3i)":"'+birthDayFalse[2]+'","address":"'+street+'","city":"'+city+'","state":"'+state+'","zip":"'+zip+'","phone":"'+phone+'"},';
						}
					}
				}
	
				if(position){
					CustomFieldsArr = CustomFieldsArr + '"skill_level":"'+position+'",';
				}
				if(division){
					CustomFieldsArr = CustomFieldsArr + '"division":"'+division+'",';
				}
				if(shirtSize){
					CustomFieldsArr = CustomFieldsArr + '"shirt_size":"'+shirtSize+'",';
				}
				if(shortSize){
					CustomFieldsArr = CustomFieldsArr + '"short_size":"'+shortSize+'",';
				}
				
				getDataCounter = $(".getDataClass").length;
				if(getDataCounter > 0){ //This condition is required to get the values for the Custom Field Types
					var IfdataPresent = 0;
					var CustomFieldsArrtemp = '';
					$(".getDataClass").each(function() {
						var validtypecheck = $(this).attr("validfieldtype");
						var fieldNameId = $(this).attr("customfieldname");
						var fieldNameDis = fieldNameId.replace(/_/g, " ");
						if(validtypecheck == "select"){
							var fieldId = $(this).attr("id");
							var selectval = $("#"+fieldId).val();
							if(selectval){
								CustomFieldsArrtemp += '"'+fieldNameDis+'":"'+selectval+'",';
								IfdataPresent++;
							}
						}else if(validtypecheck == "multiselect"){
							if($("."+fieldNameId+":checkbox:checked").length > 0){
								CustomFieldsArrtemp += '"'+fieldNameDis+'":{';
								$.each($("."+fieldNameId+":checkbox:checked"), function(){
								   CustomFieldsArrtemp += '"'+$(this).val()+'":"'+$(this).val()+'",';
								   IfdataPresent++;
								});
								CustomFieldsArrtemp = CustomFieldsArrtemp.substr(0, (CustomFieldsArrtemp.length)-1)
								CustomFieldsArrtemp = CustomFieldsArrtemp+'},';
							}
						}else if(validtypecheck == "radio_buttons"){
							if($("."+fieldNameId+":radio:checked").length > 0){
								var radioval = $("."+fieldNameId+":checked").val();
								CustomFieldsArrtemp += '"'+fieldNameDis+'":"'+radioval+'",';
								IfdataPresent++;
							}
						}else if(validtypecheck == "text_field"){
							var fieldId = $(this).attr("id");
							var selecttextval = $("#"+fieldId).val();
							if(selecttextval){
								CustomFieldsArrtemp += '"'+fieldNameDis+'":"'+selecttextval+'",';
								IfdataPresent++;
							}
						}else if(validtypecheck == "text_area"){
							var fieldId = $(this).attr("id");
							var selectareaval = $("#"+fieldId).val();
							if(selectareaval){
								CustomFieldsArrtemp += '"'+fieldNameDis+'":"'+selectareaval+'",';
								IfdataPresent++;
							}
						}
					});
					if(IfdataPresent > 0){
						var CustomFieldsArrstart = '"custom_field_data":{';
					}
					if(getDataCounter > 0 && IfdataPresent > 0){
						CustomFieldsArrtemp = CustomFieldsArrtemp.substr(0, (CustomFieldsArrtemp.length)-1);
						CustomFieldsArrtemp = CustomFieldsArrstart+CustomFieldsArrtemp+'},';
						CustomFieldsArr = CustomFieldsArr+CustomFieldsArrtemp;
					}
				}
				
				if($('.EmergContact').is(':visible')){
					if(SaveEditIdValue){
						CustomFieldsArr = CustomFieldsArr + '"emergency_contact_person_attributes":{"first_name":"'+emgFirstName+'","last_name":"'+emgLastName+'","phone":"'+emgPhone+'","emails_attributes":{"0":{"email_address":"'+emgEmail+'","id":"'+emerEmailHiddenID+'"}},"id":"'+emerHiddenID+'"},';
					}else{
						CustomFieldsArr = CustomFieldsArr + '"emergency_contact_person_attributes":{"first_name":"'+emgFirstName+'","last_name":"'+emgLastName+'","phone":"'+emgPhone+'","emails_attributes":{"0":{"email_address":"'+emgEmail+'"}}},';
					}
				}
				
				if(SaveEditIdValue){
					CustomFieldsArr = CustomFieldsArr + '"comment":"'+AddlComment+'"},"team_invite_id":"","preselected_registration_target_person":"'+RegisterOptionVal+'","custom_form_reply":{"extra_field_data":{"Your_Name_":"","Additional_Info_To_Share_With_Us_":""}},"commit":"Continue","_":"","id":"'+register_id+'"}';
				}else{
					CustomFieldsArr = CustomFieldsArr + '"comment":"'+AddlComment+'"},"team_invite_id":"","preselected_registration_target_person":"'+RegisterOptionVal+'","custom_form_reply":{"extra_field_data":{"Your_Name_":"","Additional_Info_To_Share_With_Us_":""}},"commit":"Continue","_":""}';
				}
				
				
				//CustomFieldsArr = CustomFieldsArr.substr(0, (CustomFieldsArr.length)-1);
				//CustomFieldsArr = CustomFieldsArr+'}}';
		    }
			
			else if(isTeamSts=='true' && validSts=='true') //This is the condition for the Team registration
			{
				var SaveEditIdValue = window.localStorage.getItem("SaveEditCardId");
				if(RosterVal == "No"){
					if(parseInt(PaymentOptionVal)){
						var CustomFieldsArr = '{"registration":{"registration_product_id":"'+RegistrationProdId+'","payment_option_id":"'+PaymentOptionVal+'","participating":"false","requested_team_name":"'+TeamName+'",';
					}else{
						var CustomFieldsArr = '{"registration":{"registration_product_id":"'+RegistrationProdId+'","payment_type":"'+PaymentOptionVal+'","participating":"false","requested_team_name":"'+TeamName+'",';
					}
				}else if(RosterVal == "Yes"){
					if(parseInt(PaymentOptionVal)){
						var CustomFieldsArr = '{"registration":{"registration_product_id":"'+RegistrationProdId+'","payment_option_id":"'+PaymentOptionVal+'","participating":"true","requested_team_name":"'+TeamName+'",';
					}else{
						var CustomFieldsArr = '{"registration":{"registration_product_id":"'+RegistrationProdId+'","payment_type":"'+PaymentOptionVal+'","participating":"true","requested_team_name":"'+TeamName+'",';
					}
				}	
					getTeamDataCounter = $(".getTeamDataClass").length;
					if(getTeamDataCounter > 0){ //This condition is required to get the values for the Custom Field Types
						CustomFieldsArr += '"custom_field_data":{';
						$(".getTeamDataClass").each(function() {
							var validtypecheck = $(this).attr("validfieldtype");
							var fieldNameId = $(this).attr("customfieldname");
							var fieldNameDis = fieldNameId.replace(/_/g, " ");
							if(validtypecheck == "select"){
								var fieldId = $(this).attr("id");
								var selectval = $("#"+fieldId).val();
								if(selectval){
									CustomFieldsArr += '"'+fieldNameDis+'":"'+selectval+'",';
								}
							}else if(validtypecheck == "multiselect"){
								if($("."+fieldNameId+":checkbox:checked").length > 0){
									CustomFieldsArr += '"'+fieldNameDis+'":{';
									$.each($("."+fieldNameId+":checkbox:checked"), function(){
									   CustomFieldsArr += '"'+$(this).val()+'":"'+$(this).val()+'",';
									});
									CustomFieldsArr = CustomFieldsArr.substr(0, (CustomFieldsArr.length)-1)
									CustomFieldsArr = CustomFieldsArr+'},';
								}
							}else if(validtypecheck == "radio_buttons"){
								if($("."+fieldNameId+":radio:checked").length > 0){
									var radioval = $("."+fieldNameId+":checked").val();
									CustomFieldsArr += '"'+fieldNameDis+'":"'+radioval+'",';
								}
							}else if(validtypecheck == "text_field"){
								var fieldId = $(this).attr("id");
								var selecttextval = $("#"+fieldId).val();
								if(selecttextval){
									CustomFieldsArr += '"'+fieldNameDis+'":"'+selecttextval+'",';
								}
							}else if(validtypecheck == "text_area"){
								var fieldId = $(this).attr("id");
								var selectareaval = $("#"+fieldId).val();
								if(selectareaval){
									CustomFieldsArr += '"'+fieldNameDis+'":"'+selectareaval+'",';
								}
							}
						});
					}
					
					
					getDataCounter = $(".getDataClass").length;
					if(getDataCounter > 0){ //This condition is required to get the values for the Custom Field Types
						$(".getDataClass").each(function() {
							var validtypecheck = $(this).attr("validfieldtype");
							var fieldNameId = $(this).attr("customfieldname");
							var fieldNameDis = fieldNameId.replace(/_/g, " ");
							if(validtypecheck == "select"){
								var fieldId = $(this).attr("id");
								var selectval = $("#"+fieldId).val();
								if(selectval){
									CustomFieldsArr += '"'+fieldNameDis+'":"'+selectval+'",';
								}
							}else if(validtypecheck == "multiselect"){
								if($("."+fieldNameId+":checkbox:checked").length > 0){
									CustomFieldsArr += '"'+fieldNameDis+'":{';
									$.each($("."+fieldNameId+":checkbox:checked"), function(){
									   CustomFieldsArr += '"'+$(this).val()+'":"'+$(this).val()+'",';
									});
									CustomFieldsArr = CustomFieldsArr.substr(0, (CustomFieldsArr.length)-1)
									CustomFieldsArr = CustomFieldsArr+'},';
								}
							}else if(validtypecheck == "radio_buttons"){
								if($("."+fieldNameId+":radio:checked").length > 0){
									var radioval = $("."+fieldNameId+":checked").val();
									CustomFieldsArr += '"'+fieldNameDis+'":"'+radioval+'",';
								}
							}else if(validtypecheck == "text_field"){
								var fieldId = $(this).attr("id");
								var selecttextval = $("#"+fieldId).val();
								if(selecttextval){
									CustomFieldsArr += '"'+fieldNameDis+'":"'+selecttextval+'",';
								}
							}else if(validtypecheck == "text_area"){
								var fieldId = $(this).attr("id");
								var selectareaval = $("#"+fieldId).val();
								if(selectareaval){
									CustomFieldsArr += '"'+fieldNameDis+'":"'+selectareaval+'",';
								}
							}
						});
					}
					if(getTeamDataCounter > 0 || getDataCounter > 0){
						CustomFieldsArr = CustomFieldsArr.substr(0, (CustomFieldsArr.length)-1);
						CustomFieldsArr = CustomFieldsArr+'},';
					}
					
					var Alldataregtarget = $scope.totalData;
					
					if(Alldataregtarget.registration_details.registration_target_person_details.label)
					{
						if(SaveEditIdValue){ //This condition is required to pass the data for the Edit condition
							CustomFieldsArr = CustomFieldsArr + '"registration_target_person_attributes":{"emails_attributes":{"0":{"address":"'+Alldataregtarget.registration_details.registration_target_person_details.emails[0].address+'","id":"'+Alldataregtarget.registration_details.registration_target_person_details.emails[0].id+'"}},"first_name":"'+Alldataregtarget.registration_details.registration_target_person_details.first_name+'","last_name":"'+Alldataregtarget.registration_details.registration_target_person_details.last_name+'","gender":"'+Alldataregtarget.registration_details.registration_target_person_details.gender+'","birthdate":"'+Alldataregtarget.registration_details.registration_target_person_details.birthdate+'","address":"'+Alldataregtarget.registration_details.registration_target_person_details.address+'","city":"'+Alldataregtarget.registration_details.registration_target_person_details.city+'","state":"'+Alldataregtarget.registration_details.registration_target_person_details.state+'","zip":"'+Alldataregtarget.registration_details.registration_target_person_details.zip+'","phone":"'+Alldataregtarget.registration_details.registration_target_person_details.phone+'","id":"'+Alldataregtarget.registration_details.registration_target_person_details.id+'"},';
						}else{ //This condition is required for the add condition
							CustomFieldsArr = CustomFieldsArr + '"registration_target_person_attributes":{"emails_attributes":{"0":{"address":"'+Alldataregtarget.registration_details.registration_target_person_details.emails[0].address+'"}},"first_name":"'+Alldataregtarget.registration_details.registration_target_person_details.first_name+'","last_name":"'+Alldataregtarget.registration_details.registration_target_person_details.last_name+'","gender":"'+Alldataregtarget.registration_details.registration_target_person_details.gender+'","birthdate":"'+Alldataregtarget.registration_details.registration_target_person_details.birthdate+'","address":"'+Alldataregtarget.registration_details.registration_target_person_details.address+'","city":"'+Alldataregtarget.registration_details.registration_target_person_details.city+'","state":"'+Alldataregtarget.registration_details.registration_target_person_details.state+'","zip":"'+Alldataregtarget.registration_details.registration_target_person_details.zip+'","phone":"'+Alldataregtarget.registration_details.registration_target_person_details.phone+'"},';
						}
					}
					else
					{ //This condition is required to pass the value id data are not present
						CustomFieldsArr = CustomFieldsArr + '"registration_target_person_attributes":{"emails_attributes":{"0":{"address":""}},"first_name":"","last_name":"","gender":"","birthdate":"","address":"","city":"","state":"","zip":"","phone":""},';
					}
					if(RosterVal == "Yes"){
						if(position){
							CustomFieldsArr = CustomFieldsArr + '"skill_level":"'+position+'",';
						}
						if(division){
							CustomFieldsArr = CustomFieldsArr + '"division":"'+division+'",';
						}
						if(shirtSize){
							CustomFieldsArr = CustomFieldsArr + '"shirt_size":"'+shirtSize+'",';
						}
						if(shortSize){
							CustomFieldsArr = CustomFieldsArr + '"short_size":"'+shortSize+'",';
						}
					}
					
					
					if($('.EmergContact').is(':visible')){
						if(RosterVal == "Yes"){
							CustomFieldsArr = CustomFieldsArr + '"emergency_contact_person_attributes":{"first_name":"'+emgFirstName+'","last_name":"'+emgLastName+'","phone":"'+emgPhone+'","emails_attributes":{"0":{"email_address":"'+emgEmail+'","id":"'+emerEmailHiddenID+'"}},"id":"'+emerHiddenID+'"},';
						}else if(RosterVal == "No"){ //if Roster Value is NO
							if(Alldataregtarget.registration_details.emergency_contact_person.length > 0) //If Emergency contact details exist
							{
								if(SaveEditIdValue){ //Is that is coming for EDIT
									CustomFieldsArr = CustomFieldsArr + '"emergency_contact_person_attributes":{"first_name":"'+Alldataregtarget.registration_details.emergency_contact_person.first_name+'","last_name":"'+Alldataregtarget.registration_details.emergency_contact_person.last_name+'","phone":"'+Alldataregtarget.registration_details.emergency_contact_person.phone+'","emails_attributes":{"0":{"email_address":"'+Alldataregtarget.registration_details.emergency_contact_person.address+'","id":"'+Alldataregtarget.registration_details.emergency_contact_person.person_email_id+'"}},"id":"'+Alldataregtarget.registration_details.emergency_contact_person.id+'"},';
								}else{
									CustomFieldsArr = CustomFieldsArr + '"emergency_contact_person_attributes":{"first_name":"'+Alldataregtarget.registration_details.emergency_contact_person.first_name+'","last_name":"'+Alldataregtarget.registration_details.emergency_contact_person.last_name+'","phone":"'+Alldataregtarget.registration_details.emergency_contact_person.phone+'","emails_attributes":{"0":{"email_address":"'+Alldataregtarget.registration_details.emergency_contact_person.address+'"}}},';
								}
							}else{ //If there is no emergency contact details then all will go blank
								CustomFieldsArr = CustomFieldsArr + '"emergency_contact_person_attributes":{"first_name":"","last_name":"","phone":"","emails_attributes":{"0":{"email_address":""}}},';
							}
						}
					}
					
					
					//Added the condition if any roster present or when deleting the record and trying to save
					if(($('.rosterEmailClass').is(':visible') && $(".rosterEmailClass").length > 0) || (!$('.rosterEmailClass').is(':visible') && $(".rosterEmailClass").length > 0))
					{
						CustomFieldsArr = CustomFieldsArr + '"team_invites_attributes":{';
						var inviteCounter = 0;
						$(".rosterEmailClass").each(function(){
							if($(this).val()) {
								var Email_Address = $(this).val();
							} else {
								var Email_Address = "";
							}
							if($(this).next(".rosterFnameClass").val()) {
								var fname = $(this).next(".rosterFnameClass").val();
							}else if($(this).parent().next().children().children(".rosterFnameClass").val()) {
								var fname = $(this).parent().next().children().children(".rosterFnameClass").val();
							} else {
								var fname = "";
							}
							if($(this).next().next(".rosterLnameClass").val()) {

								var lname = $(this).next().next(".rosterLnameClass").val();
							}else if($(this).parent().next().children().next().children(".rosterLnameClass").val()) {
								var lname = $(this).parent().next().children().children(".rosterLnameClass").val();
							} else {
								var lname = "";
							}
							if($(this).next().next().next(".rosterDeleteClass").val()) {
								var DeleteRosterVal = $(this).next().next().next(".rosterDeleteClass").val();
							}else {
								var DeleteRosterVal = "";
							}
							//alert(Email_Address+"**"+fname+"**"+lname);

							/*if(Email_Address && fname == "" && lname == "") {
								var alertPopup = $ionicPopup.alert({
									title: 'Error!',
									cssClass : 'error_msg',
									template: 'Please enter Roster member first name or last name'
								});

								$(".AddToCartBtn").show();
								$(".RegistrationLoader").hide();
								alertPopup.then(function(res) {
									return false;
								});
							}*/
							
							
							if(Email_Address){
								if(DeleteRosterVal && DeleteRosterVal == '2'){
									var DestroyStatus = 'true';
								}else{
									var DestroyStatus = 'false';
								}
								if(SaveEditIdValue){

									var TeamInviteEmailId = $("#registration_team_invites_attributes_"+inviteCounter+"_person_email_id").val();
									var TeamInvitePersonId = $("#registration_team_invites_attributes_"+inviteCounter+"_person_id").val();
									var TeamInviteId = $("#registration_team_invites_attributes_"+inviteCounter+"_team_invite_id").val();
									if(TeamInviteEmailId && TeamInvitePersonId && TeamInviteId){
										CustomFieldsArr = CustomFieldsArr + '"'+inviteCounter+'":{"person_attributes":{"emails_attributes":{"0":{"email_address":"'+Email_Address+'","id":"'+TeamInviteEmailId+'"}},"first_name":"'+fname+'","last_name":"'+lname+'","id":"'+TeamInvitePersonId+'"},"_destroy":"'+DestroyStatus+'","id":"'+TeamInviteId+'"},';
									}else{
										CustomFieldsArr = CustomFieldsArr + '"'+inviteCounter+'":{"person_attributes":{"emails_attributes":{"0":{"email_address":"'+Email_Address+'"}},"first_name":"'+fname+'","last_name":"'+lname+'"},"_destroy":"'+DestroyStatus+'"},';
									}
								}else{
									CustomFieldsArr = CustomFieldsArr + '"'+inviteCounter+'":{"person_attributes":{"emails_attributes":{"0":{"email_address":"'+Email_Address+'"}},"first_name":"'+fname+'","last_name":"'+lname+'"},"_destroy":"'+DestroyStatus+'"},';
								}
								inviteCounter++;
							}
						});
						CustomFieldsArr = CustomFieldsArr.substr(0, (CustomFieldsArr.length)-1);
					}else{
						CustomFieldsArr = CustomFieldsArr.substr(0, (CustomFieldsArr.length)-2);
					}
						
					

					
					if(RosterVal == "No"){
						CustomFieldsArr = CustomFieldsArr + '},"founder_role":"Coach","team_coordinators_attributes":{';
					}else if(RosterVal == "Yes"){
						CustomFieldsArr = CustomFieldsArr + '},"founder_role":"Captain","team_coordinators_attributes":{';
					}
					
					var coachCounter = 0;
					$(".CoachClass").each(function(){
						if($(this).val()) {
							var EmailAddress = $(this).val();
						} else {
							var EmailAddress = "";
						}
						if($(this).parent().next().children(".CoachRole").val()) {
							var CoachRole = $(this).parent().next().children(".CoachRole").val();
						} else {
							var CoachRole = "";
						}
						/*if(EmailAddress == "" && CoachRole == "") {
							var alertPopup = $ionicPopup.alert({
								title: 'Error!',
								cssClass : 'error_msg',
								template: 'Please enter Coach Email and Role'
							});
							alertPopup.then(function(res) {
								$(".AddToCartBtn").show();
								$(".RegistrationLoader").hide();
								return false;
							});
						}*/
						
						if(EmailAddress){
							if(SaveEditIdValue){
								
								var TeamCordinateEmailId = $("#registration_team_coordinators_attributes_"+coachCounter+"_person_email_id").val();
								var TeamCordinatePersonId = $("#registration_team_coordinators_attributes_"+coachCounter+"_person_id").val();
								var TeamCordinateId = $("#registration_team_coordinators_attributes_"+coachCounter+"_team_coordinator_id").val();
								
								if(TeamCordinateEmailId && TeamCordinatePersonId && TeamCordinateId){
									CustomFieldsArr = CustomFieldsArr + '"'+coachCounter+'":{"person_attributes":{"emails_attributes":{"0":{"address":"'+EmailAddress+'","id":"'+TeamCordinateEmailId+'"}},"id":"'+TeamCordinatePersonId+'"},"role":"'+CoachRole+'","_destroy":"false","id":"'+TeamCordinateId+'"},';
								}else{
									CustomFieldsArr = CustomFieldsArr + '"'+coachCounter+'":{"person_attributes":{"emails_attributes":{"0":{"address":"'+EmailAddress+'"}}},"role":"'+CoachRole+'","_destroy":"false"},';
								}
							}else{
								CustomFieldsArr = CustomFieldsArr + '"'+coachCounter+'":{"person_attributes":{"emails_attributes":{"0":{"address":"'+EmailAddress+'"}}},"role":"'+CoachRole+'","_destroy":"false"},';
							}
							coachCounter++;
						}
					});
					CustomFieldsArr = CustomFieldsArr.substr(0, (CustomFieldsArr.length)-1);
					
					if(SaveEditIdValue){
						CustomFieldsArr = CustomFieldsArr + '},"comment":"'+AddlComment+'"},"team_invite_id":"","custom_form_reply":{"extra_field_data":{"Your_Name_":"","Additional_Info_To_Share_With_Us_":""}},"commit":"Continue","_":"","id":"'+SaveEditIdValue+'"}';
					}else{
						CustomFieldsArr = CustomFieldsArr + '},"comment":"'+AddlComment+'"},"team_invite_id":"","custom_form_reply":{"extra_field_data":{"Your_Name_":"","Additional_Info_To_Share_With_Us_":""}},"commit":"Continue","_":""}';
					}
					
			}
			else if(isTeamSts=='true' && validSts=='false') //This is the condition for the Group registration
			{
				var SaveEditIdValue = window.localStorage.getItem("SaveEditCardId");
				if(parseInt(PaymentOptionVal)){
					var CustomFieldsArr = '{"registration":{"registration_product_id":"'+RegistrationProdId+'","payment_option_id":"'+PaymentOptionVal+'","target_self":"'+TargetSelf+'","requested_team_name":"'+TeamName+'",';
				}else{
					var CustomFieldsArr = '{"registration":{"registration_product_id":"'+RegistrationProdId+'","payment_type":"'+PaymentOptionVal+'","target_self":"'+TargetSelf+'","requested_team_name":"'+TeamName+'",';
				}
				
				getTeamDataCounter = $(".getTeamDataClass").length;
					if(getTeamDataCounter > 0){ //This condition is required to get the values for the Custom Field Types
						CustomFieldsArr += '"custom_field_data":{';
						$(".getTeamDataClass").each(function() {
							var validtypecheck = $(this).attr("validfieldtype");
							var fieldNameId = $(this).attr("customfieldname");
							var fieldNameDis = fieldNameId.replace(/_/g, " ");
							if(validtypecheck == "select"){
								var fieldId = $(this).attr("id");
								var selectval = $("#"+fieldId).val();
								CustomFieldsArr += '"'+fieldNameDis+'":"'+selectval+'",';
							}else if(validtypecheck == "multiselect"){
								if($("."+fieldNameId+":checkbox:checked").length > 0){
									CustomFieldsArr += '"'+fieldNameDis+'":{';
									$.each($("."+fieldNameId+":checkbox:checked"), function(){
									   CustomFieldsArr += '"'+$(this).val()+'":"'+$(this).val()+'",';
									});
									CustomFieldsArr = CustomFieldsArr.substr(0, (CustomFieldsArr.length)-1)
									CustomFieldsArr = CustomFieldsArr+'},';
								}
							}else if(validtypecheck == "radio_buttons"){
								if($("."+fieldNameId+":radio:checked").length > 0){
									var radioval = $("."+fieldNameId+":checked").val();
									CustomFieldsArr += '"'+fieldNameDis+'":"'+radioval+'",';
								}
							}else if(validtypecheck == "text_field"){
								var fieldId = $(this).attr("id");
								var selecttextval = $("#"+fieldId).val();
								CustomFieldsArr += '"'+fieldNameDis+'":"'+selecttextval+'",';
							}else if(validtypecheck == "text_area"){
								var fieldId = $(this).attr("id");
								var selectareaval = $("#"+fieldId).val();
								CustomFieldsArr += '"'+fieldNameDis+'":"'+selectareaval+'",';
							}
						});
					}
					
					getDataCounter = $(".getDataClass").length;
					if(getDataCounter > 0){ //This condition is required to get the values for the Custom Field Types
						//CustomFieldsArr += '"custom_field_data":{';
						$(".getDataClass").each(function() {
							var validtypecheck = $(this).attr("validfieldtype");
							var fieldNameId = $(this).attr("customfieldname");
							var fieldNameDis = fieldNameId.replace(/_/g, " ");
							if(validtypecheck == "select"){
								var fieldId = $(this).attr("id");
								var selectval = $("#"+fieldId).val();
								CustomFieldsArr += '"'+fieldNameDis+'":"'+selectval+'",';
							}else if(validtypecheck == "multiselect"){
								if($("."+fieldNameId+":checkbox:checked").length > 0){
									CustomFieldsArr += '"'+fieldNameDis+'":{';
									$.each($("."+fieldNameId+":checkbox:checked"), function(){
									   CustomFieldsArr += '"'+$(this).val()+'":"'+$(this).val()+'",';
									});
									CustomFieldsArr = CustomFieldsArr.substr(0, (CustomFieldsArr.length)-1)
									CustomFieldsArr = CustomFieldsArr+'},';
								}
							}else if(validtypecheck == "radio_buttons"){
								if($("."+fieldNameId+":radio:checked").length > 0){
									var radioval = $("."+fieldNameId+":checked").val();
									CustomFieldsArr += '"'+fieldNameDis+'":"'+radioval+'",';
								}
							}else if(validtypecheck == "text_field"){
								var fieldId = $(this).attr("id");
								var selecttextval = $("#"+fieldId).val();
								CustomFieldsArr += '"'+fieldNameDis+'":"'+selecttextval+'",';
							}else if(validtypecheck == "text_area"){
								var fieldId = $(this).attr("id");
								var selectareaval = $("#"+fieldId).val();
								CustomFieldsArr += '"'+fieldNameDis+'":"'+selectareaval+'",';
							}
						});
					}
					
					if(getTeamDataCounter > 0 || getDataCounter > 0){ //If there custom fields then display them else not
						CustomFieldsArr = CustomFieldsArr.substr(0, (CustomFieldsArr.length)-1);
						CustomFieldsArr = CustomFieldsArr+'},';
					}
				
				if(RegisterOptionVal == 'customer'){
					if(emailID && personID){
						var CustomFieldsArr = CustomFieldsArr + '"registration_target_person_attributes":{"emails_attributes":{"0":{"address":"'+email+'","id":"'+emailID+'"}},"first_name":"'+firstName+'","last_name":"'+lastName+'","gender":"'+gender+'","birthdate":"'+birthDay+'","address":"'+street+'","city":"'+city+'","state":"'+state+'","zip":"'+zip+'","phone":"'+phone+'","id":"'+personID+'"},';
					}else{
						var CustomFieldsArr = CustomFieldsArr + '"registration_target_person_attributes":{"emails_attributes":{"0":{"address":"'+email+'"}},"first_name":"'+firstName+'","last_name":"'+lastName+'","gender":"'+gender+'","birthdate":"'+birthDay+'","address":"'+street+'","city":"'+city+'","state":"'+state+'","zip":"'+zip+'","phone":"'+phone+'"},';
					}
				}else{
					if($("#birthDay").val()){
						var birthDayFalse = $("#birthDay").val();
						//birthDayFalse = birthDayFalse.split("/");
						birthDayFalse = birthDayFalse.split("-");
						if(emailID && personID){
							var CustomFieldsArr = CustomFieldsArr + '"registration_target_person_attributes":{"emails_attributes":{"0":{"id":"'+emailID+'"}},"email_address":"'+email+'","email_id":"'+emailID+'","other_first_name":"'+firstName+'","other_last_name":"'+lastName+'","other_gender":"'+gender+'","other_birthdate(1i)":"'+birthDayFalse[0]+'","other_birthdate(2i)":"'+birthDayFalse[1]+'","other_birthdate(3i)":"'+birthDayFalse[2]+'","address":"'+street+'","city":"'+city+'","state":"'+state+'","zip":"'+zip+'","phone":"'+phone+'","id":"'+personID+'"},';
						}else{
							var CustomFieldsArr = CustomFieldsArr + '"registration_target_person_attributes":{"email_address":"'+email+'","email_id":"","other_first_name":"'+firstName+'","other_last_name":"'+lastName+'","other_gender":"'+gender+'","other_birthdate(1i)":"'+birthDayFalse[0]+'","other_birthdate(2i)":"'+birthDayFalse[1]+'","other_birthdate(3i)":"'+birthDayFalse[2]+'","address":"'+street+'","city":"'+city+'","state":"'+state+'","zip":"'+zip+'","phone":"'+phone+'"},';
						}
					}
				}
	
				if(position){
					CustomFieldsArr = CustomFieldsArr + '"skill_level":"'+position+'",';
				}
				if(division){
					CustomFieldsArr = CustomFieldsArr + '"division":"'+division+'",';
				}
				if(shirtSize){
					CustomFieldsArr = CustomFieldsArr + '"shirt_size":"'+shirtSize+'",';
				}
				if(shortSize){
					CustomFieldsArr = CustomFieldsArr + '"short_size":"'+shortSize+'",';
				}
				
				if($('.EmergContact').is(':visible')){
					if(emerHiddenID && emerEmailHiddenID){
						CustomFieldsArr = CustomFieldsArr + '"emergency_contact_person_attributes":{"first_name":"'+emgFirstName+'","last_name":"'+emgLastName+'","phone":"'+emgPhone+'","emails_attributes":{"0":{"email_address":"'+emgEmail+'","id":"'+emerEmailHiddenID+'"}},"id":"'+emerHiddenID+'"},';
					}else{
						CustomFieldsArr = CustomFieldsArr + '"emergency_contact_person_attributes":{"first_name":"'+emgFirstName+'","last_name":"'+emgLastName+'","phone":"'+emgPhone+'","emails_attributes":{"0":{"email_address":"'+emgEmail+'"}}},';
					}
				}
				
				CustomFieldsArr = CustomFieldsArr + '"team_invites_attributes":{';
				var inviteCounter = 0;
				$(".rosterEmailClass").each(function(){
						if($(this).val()) {
							var Email_Address = $(this).val();
						} else {
							var Email_Address = "";
						}
						if($(this).next(".rosterFnameClass").val()) {
							var fname = $(this).next(".rosterFnameClass").val();
						}else if($(this).parent().next().children().children(".rosterFnameClass").val()) {
							var fname = $(this).parent().next().children().children(".rosterFnameClass").val();
						} else {
							var fname = "";
						}
						if($(this).next(".rosterFnameClass").val()) {
							var lname = $(this).next().next(".rosterLnameClass").val();
						}else if($(this).parent().next().children().next().children(".rosterLnameClass").val()) {
							var lname = $(this).parent().next().children().children(".rosterLnameClass").val();
						} else {
							var lname = "";
						}
						
						/*if(Email_Address == "" && fname == "" && lname == "") {
							var alertPopup = $ionicPopup.alert({
								title: 'Error!',
								cssClass : 'error_msg',
								template: 'Please enter Roster member email'
							});
							alertPopup.then(function(res) {
								$(".AddToCartBtn").show();
								$(".RegistrationLoader").hide();
								return false;
							});
						}*/
					if(Email_Address){
						if(SaveEditIdValue){
							var TeamInviteEmailId = $("#registration_team_invites_attributes_"+inviteCounter+"_person_email_id").val();
							var TeamInvitePersonId = $("#registration_team_invites_attributes_"+inviteCounter+"_person_id").val();
							var TeamInviteId = $("#registration_team_invites_attributes_"+inviteCounter+"_team_invite_id").val();
							
							if(TeamInviteEmailId && TeamInvitePersonId && TeamInviteId){
								CustomFieldsArr = CustomFieldsArr + '"'+inviteCounter+'":{"person_attributes":{"emails_attributes":{"0":{"email_address":"'+Email_Address+'","id":"'+TeamInviteEmailId+'"}},"first_name":"'+fname+'","last_name":"'+lname+'","id":"'+TeamInvitePersonId+'"},"_destroy":"false","id":"'+TeamInviteId+'"},';
							}else{	
								CustomFieldsArr = CustomFieldsArr + '"'+inviteCounter+'":{"person_attributes":{"emails_attributes":{"0":{"email_address":"'+Email_Address+'"}},"first_name":"'+fname+'","last_name":"'+lname+'"},"_destroy":"false"},';
							}
						}else{
							CustomFieldsArr = CustomFieldsArr + '"'+inviteCounter+'":{"person_attributes":{"emails_attributes":{"0":{"email_address":"'+Email_Address+'"}},"first_name":"'+fname+'","last_name":"'+lname+'"},"_destroy":"false"},';
						}
						inviteCounter++;
					}
				});
				
				CustomFieldsArr = CustomFieldsArr.substr(0, (CustomFieldsArr.length)-1);
				
				if(TargetSelf){
					CustomFieldsArr = CustomFieldsArr + '},"founder_role":"Coach","team_coordinators_attributes":{';
				}else if(!TargetSelf){
					CustomFieldsArr = CustomFieldsArr + '},"founder_role":"Captain","team_coordinators_attributes":{';
				}
				
				var coachCounter = 0;
				$(".CoachClass").each(function(){
					if($(this).val()) {
							var EmailAddress = $(this).val();
						} else {
							var EmailAddress = "";
						}
						if($(this).parent().next().children(".CoachRole").val()) {
							var CoachRole = $(this).parent().next().children(".CoachRole").val();

						} else {
							var CoachRole = "";
						}
						
						/*if(EmailAddress == "" && CoachRole == "") {
							var alertPopup = $ionicPopup.alert({
								title: 'Error!',
								cssClass : 'error_msg',
								template: 'Please enter Coach Email and Role'
							});
							alertPopup.then(function(res) {
								$(".AddToCartBtn").show();
								$(".RegistrationLoader").hide();
								return false;
							});
						}*/
					
					if(EmailAddress){
						if(SaveEditIdValue){
							var TeamCordinateEmailId = $("#registration_team_coordinators_attributes_"+coachCounter+"_person_email_id").val();
							var TeamCordinatePersonId = $("#registration_team_coordinators_attributes_"+coachCounter+"_person_id").val();
							var TeamCordinateId = $("#registration_team_coordinators_attributes_"+coachCounter+"_team_coordinator_id").val();
							if(TeamCordinateEmailId && TeamCordinatePersonId && TeamCordinateId){
								CustomFieldsArr = CustomFieldsArr + '"'+coachCounter+'":{"person_attributes":{"emails_attributes":{"0":{"address":"'+EmailAddress+'","id":"'+TeamCordinateEmailId+'"}},"id":"'+TeamCordinatePersonId+'"},"role":"'+CoachRole+'","_destroy":"false","id":"'+TeamCordinateId+'"},';
							}else{
								CustomFieldsArr = CustomFieldsArr + '"'+coachCounter+'":{"person_attributes":{"emails_attributes":{"0":{"address":"'+EmailAddress+'"}}},"role":"'+CoachRole+'","_destroy":"false"},';
							}
						}else{
							CustomFieldsArr = CustomFieldsArr + '"'+coachCounter+'":{"person_attributes":{"emails_attributes":{"0":{"address":"'+EmailAddress+'"}}},"role":"'+CoachRole+'","_destroy":"false"},';
						}
						coachCounter++;
					}
				});
				
				CustomFieldsArr = CustomFieldsArr.substr(0, (CustomFieldsArr.length)-1);
				
				if(SaveEditIdValue){
					CustomFieldsArr = CustomFieldsArr + '},"comment":"'+AddlComment+'"},"team_invite_id":"","custom_form_reply":{"extra_field_data":{"Your_Name_":"","Additional_Info_To_Share_With_Us_":""}},"commit":"Continue","_":"","id":"'+SaveEditIdValue+'"}';
				}else{
					CustomFieldsArr = CustomFieldsArr + '},"comment":"'+AddlComment+'"},"team_invite_id":"","custom_form_reply":{"extra_field_data":{"Your_Name_":"","Additional_Info_To_Share_With_Us_":""}},"commit":"Continue","_":""}';
				}
			}
			
			if(CustomFieldsArr){
				//alert(CustomFieldsArr);
				var obj = JSON.parse(CustomFieldsArr);
				var orgId = window.localStorage.getItem("org_id");
				var auth_token = window.localStorage.getItem("auth_token");
				if(register_id != ''){
					var saveregURL = API_URL+'/api/v1/registrations/'+$base64.encode(auth_token)+'/'+$base64.encode(orgId)+'/update_registration';
				}else{
					var saveregURL = API_URL+'/api/v1/registrations/'+$base64.encode(auth_token)+'/'+$base64.encode(orgId)+'/save_registration';
				}

				$(".AddToCartBtn").hide();
				$(".RegistrationLoader").show();
				
				//alert(JSON.stringify(obj, null, 4));
				
				$.ajax({
				  type: "POST",
				  url: saveregURL,
				  data: obj,
				  success: function(data){
						if(data.status == "success") {
						  $(".AddToCartBtn").show();
						  $(".RegistrationLoader").hide();
						  window.localStorage['WaiverInf'] = JSON.stringify(data);
						  if(data.waiver_details.show_waiver == true) {
      				  	  	  window.localStorage["SaveEditCardId"] = ""; //Require to dsstroy the registration ID
						  	  localStorage.removeItem("SaveEditCardId"); //Require to dsstroy the registration ID
							  //$("#waiver-content").show();
							  $("#backCartId").val(data.id);
							  $("#backCartRegId").val($stateParams.programId);
                       
                              window.localStorage['backCartId'] = data.id;
                              window.localStorage['backCartRegId'] = $stateParams.programId;
                       
                              $window.location.href = "#/terms_conditions";
						  }else{
							  $window.location.href = "#/cart";
						  }
						} else {
							$(".AddToCartBtn").show();
							$(".RegistrationLoader").hide();
							var alertPopup = $ionicPopup.alert({
							 title: 'Error!',
							 cssClass : 'error_msg',
							 template: data.message
						   });
						   alertPopup.then(function(res) {
							 return false;
						   });
						}
				  }
				});
			}
		}
		
		console.log(SubmitStatus);
	}
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.goTermsConditions = function() {
		RegdRec.setTotRec($scope.IndReg);
		window.localStorage['backCartId'] = $("#backCartId").val();
		window.localStorage['backCartRegId'] = $("#backCartRegId").val();
		$window.location.href = "#/terms_conditions";
	}
})

.controller('TermsConditionCtrl', function($scope,$ionicHistory,$stateParams,$timeout,TnCFactory,TnCAcceptFactory,UserInfoFactory,$ionicSideMenuDelegate,$window,$base64,$ionicPopup) {
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	
	var backCartId = window.localStorage.getItem("backCartId");
	var backCartRegId = window.localStorage.getItem("backCartRegId");
		
	$scope.waiverData = {};
	$scope.init = function () {
		$scope.Waiver = JSON.parse(window.localStorage.getItem("WaiverInf"));
		$("#content-loader").hide();
	};
	$scope.myGoBack1 = function() {
		//$window.history.back();
		window.localStorage["EditCartId"] = backCartId; //15500
		window.localStorage['RegdPrevPage'] = window.location.hash;
		$window.location.href = '#/individual/'+backCartRegId; //1950
	};
	$scope.completeTnCProcess = function() {
		var termStatus = true;

		$(".TnC").hide();
		$(".RegistrationLoader").show();
		if($('#waiver_is_guardian').is(':hidden')){
			if($('#waiver_is_guardian').is(":checked") == false){
				var alertPopup = $ionicPopup.alert({
				   title: '<div style="text-align:center;">Please check the parent or legal guardian.</div>'
			   });
			   termStatus = false;
			   $(".TnC").show();
				$(".RegistrationLoader").hide();
			   return false;
			}else{
				termStatus = true;
			}
		}
		
		if($('#waiver_accepted').is(':hidden')){
			if($('#waiver_accepted').is(":checked") == false){
				var alertPopup = $ionicPopup.alert({
				   title: '<div style="text-align:center;">Please agree to terms and conditions.</div>'
			   });
			   termStatus = false;
			   $(".TnC").show();
				$(".RegistrationLoader").hide();
			   return false;
			}else{
				termStatus = true;
			}
		}
		
		
		if(termStatus == true)
		{
			var str = "";
			if($("#waiver_is_guardian").prop("checked") == true) {
				$scope.waiver_is_guardian = 1;
			} else if($("#waiver_is_guardian").prop("checked") == false){
				$scope.waiver_is_guardian = 0;
			}
			if($("#waiver_accepted").prop("checked") == true) {
				$scope.waiver_accepted = 1;
			} else if($("#waiver_accepted").prop("checked") == false){
				$scope.waiver_accepted = 0;
			}
			if($scope.Waiver.waiver_details.waiver_details.must_request_adult_waiver) {
				str = '{"registration":{"waiver_contact_person":{"first_name":"'+$scope.waiverData.firstname+'","last_name":"'+$scope.waiverData.lastname+'","phone_name":"'+$scope.waiverData.phone+'","emails": {"0": {"email_address": '+$scope.waiverData.email+'}}}},"id":"'+$scope.Waiver.id+'"}';
			} else if($scope.Waiver.waiver_details.waiver_details.waiver_requires_guardian) {
				str = '{"registration":{"waiver_accepted":"'+$scope.waiver_accepted+'","waiver_is_guardian":"'+$scope.waiver_is_guardian+'"},"id":"'+$scope.Waiver.id+'"}';
			} else if($scope.Waiver.waiver_details.waiver_details.show_terms_conditions) {
				str = '{"registration":{"waiver_accepted":"'+$scope.waiver_accepted+'"},"id":"'+$scope.Waiver.id+'"}';
			} else {
				str = '{"id":"'+$scope.Waiver.id+'"}';
			}
			console.log(str);
			if(str) {
				var URL = API_URL+'/api/v1/registrations/'+$base64.encode(auth_token)+'/'+$base64.encode(orgId)+'/accept_waiver';
				console.log(URL);
				$.ajax({
					type: "POST",
					url: URL,
					data: JSON.parse(str),
					success: function(data){
						var alertPopup = $ionicPopup.alert({
						   title: '<div style="text-align:center;">'+data.message+'.</div>'
					    });
						alertPopup.then(function(res) {
							$window.location.href = "#/cart";
						});
					},
					error: function(data) {
						$(".TnC").show();
						$(".RegistrationLoader").hide();
						console.log(data);
					}
				});
			}
		}
	}
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
})
/************************************************** Registration ***********************************************************/
/************************************************** Cart ***********************************************************/
.controller('CartCtrl',function($scope,$ionicHistory,$stateParams,$timeout,$ionicSideMenuDelegate,CartListFactory,CartDeleteFactory,CartSaveFactory,CartMoveFactory,$ionicScrollDelegate,$window,$base64,$ionicPopup,$state,EditIndividualRegFactory) {
	$(".chk-btn").hide();
	$("#content-loader").show();
	$scope.myGoBack = function() {
		//$("#content-loader").show();
		$window.history.back();
	};
	
	$scope.cart_typ = '';
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	$scope.buttonDisplay = 1;
	$scope.isItem = true;
	$scope.init = function () {
		//if(window.localStorage.getItem("cartType")){
			//$scope.cart_typ = window.localStorage.getItem("cartType");
		//} else {
			$scope.cart_typ = 'cart_items';
		//}
		// First time select the first tab for the items in the cart section
		if($scope.cart_typ == 'cart_items'){
			$("#cart_items").addClass("active");
			$("#saved_items").removeClass("active");
			$("#incomplete_items").removeClass("active");
			$(".DisplayTabName").show();
			$(".DisplayTabName").text("Items in your cart");
		} else if($scope.cart_typ == 'saved_items') {
			$("#saved_items").addClass("active");
			$("#cart_items").removeClass("active");
			$("#incomplete_items").removeClass("active");
		} else if($scope.cart_typ == 'incomplete_items') {
			$("#incomplete_items").addClass("active");
			$("#cart_items").removeClass("active");
			$("#saved_items").removeClass("active");
		}
		//window.localStorage["cartType"] = $scope.cart_typ;
		var result = CartListFactory.cartList($base64.encode(orgId),$base64.encode(auth_token),$scope.cart_typ);
		$scope.Carts = [];

		result.success(function(data) {
			$scope.CountItemCart = data['cart_items'].length;
			$scope.CountItemSaved = data['saved_items_count'];
			$scope.CountItemIncomplete = data['incomplete_items_count'];

			if(data['cart_items'].length > 0){
				$(".cartItemCountCls").html("("+data['cart_items'].length+")")
			}
			if(data['saved_items_count'] > 0){
				$(".savedItemCountCls").html("("+data['saved_items_count']+")")
			}
			if(data['incomplete_items_count'] > 0){
				$(".incomItemCountCls").html("("+data['incomplete_items_count']+")")
			}
			
			window.localStorage["CartList"] = data;
			if(data['cart_items'] && data['cart_items'].length > 0) {
				$scope.Carts = data['cart_items'];
				$scope.buttonDisplay = 1;
				$scope.isItem = true;
				$(".chkoutbtn").show();
				$(".longchkoutbtn").show();
			}else{
				$(".chkoutbtn").hide();
				$(".longchkoutbtn").hide();
			}
			if(data['saved_items'] && data['saved_items'].length > 0) {
				$scope.Carts = data['saved_items'];
				window.localStorage["TotalSavedLater"] = data['saved_items'].length;
				var cartCount = window.localStorage.getItem("CartItemCount");
				/*if(cartCount > 0){
					$(".chkoutbtn").show();
					$(".longchkoutbtn").show();
				}else{
					$(".chkoutbtn").hide();
					$(".longchkoutbtn").hide();
				}*/
				$scope.buttonDisplay = 2;
				$scope.isItem = true;
			}
			if(data['incomplete_items'] && data['incomplete_items'].length > 0) {
				$scope.Carts = data['incomplete_items'];
				$scope.buttonDisplay = 3;
				$scope.isItem = true;
			}
			if(data['cart_items'] && data['cart_items'].length == 0) {
				$scope.isItem = false;
				$scope.noDataMsg = "There are no items in your cart";
			}
			if(data['saved_items'] && data['saved_items'].length == 0) {
				$scope.isItem = false;
			}

			if(data['incomplete_items'] && data['incomplete_items'].length == 0) {
				$scope.isItem = false;
			}
			$("#content-loader").hide();			
			/*console.log($scope.Carts);*/			
		});
		result.error(function(data) {
			console.log(data);
		});
	};
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.openCheckout = function() {
		window.localStorage["BackPlaceOrder"] = window.location.hash;
		$window.location.href = '#/place_order';
	};
	$scope.display_cart = function(cart_type) {
        $("#content-loader").show();
		$ionicScrollDelegate.$getByHandle('small').scrollTop(true);
		//window.localStorage["cartType"] = cart_type;
		$scope.Carts = [];
		if(cart_type == 'cart_items'){
			$("#cart_items").addClass("active");
			$("#saved_items").removeClass("active");
			$("#incomplete_items").removeClass("active");
			$(".DisplayTabName").show();
			$(".DisplayTabName").html("Items in your cart");
		} else if(cart_type == 'saved_items') {
			$("#saved_items").addClass("active");
			$("#cart_items").removeClass("active");
			$("#incomplete_items").removeClass("active");
			$(".DisplayTabName").show();
			$(".DisplayTabName").html("Items saved for later");
			$(".longchkoutbtn").hide();
		} else if(cart_type == 'incomplete_items') {
			$("#incomplete_items").addClass("active");
			$("#cart_items").removeClass("active");
			$("#saved_items").removeClass("active");
			$(".DisplayTabName").show();
			$(".DisplayTabName").html("In Progress Registrations");
			$(".longchkoutbtn").hide();
		}
		var result = CartListFactory.cartList($base64.encode(orgId),$base64.encode(auth_token),cart_type);
		result.success(function(data) {
			window.localStorage["CartList"] = data;
			if(data['cart_items'] && data['cart_items'].length > 0) {
				$scope.Carts = data['cart_items'];
				$scope.CountItemCart = data['cart_items'].length;
				$scope.buttonDisplay = 1;
				$scope.isItem = true;
				$(".cartItemCountCls").html("("+data['cart_items'].length+")");
				$(".chkoutbtn").show();
				$(".longchkoutbtn").show();
			}else{
				$(".chkoutbtn").hide();
				$(".longchkoutbtn").hide();
			}
			if(data['saved_items'] && data['saved_items'].length > 0) {
				$scope.Carts = data['saved_items'];
				$scope.CountItemSaved = data['saved_items'].length;
				window.localStorage["TotalSavedLater"] = data['saved_items'].length;
				var cartCount = window.localStorage.getItem("CartItemCount");
				if(cartCount > 0){
					$(".chkoutbtn").show();
					//$(".longchkoutbtn").show();
				}else{
					$(".chkoutbtn").hide();
					//$(".longchkoutbtn").hide();
				}
				$(".savedItemCountCls").html("("+data['saved_items'].length+")");
				$scope.buttonDisplay = 2;
				$scope.isItem = true;
			}
			if(data['incomplete_items'] && data['incomplete_items'].length > 0) {
				$scope.Carts = data['incomplete_items'];
				$scope.CountItemIncomplete = data['incomplete_items'].length;
				window.localStorage["TotalIncompleteCount"] = data['incomplete_items'].length;
				$scope.buttonDisplay = 3;
				$(".incomItemCountCls").html("("+data['incomplete_items'].length+")");
				$scope.isItem = true;
			}
			if(data['cart_items'] && data['cart_items'].length == 0) {
				$scope.isItem = false;
				$scope.noDataMsg = "There are no items in your cart";
			}
			if(data['saved_items'] && data['saved_items'].length == 0) {
				$scope.isItem = false;
				$scope.noDataMsg = "There are no items saved for later";
			}

			if(data['incomplete_items'] && data['incomplete_items'].length == 0) {
				$scope.isItem = false;
				$scope.noDataMsg = "There are no incomplete registrations";
			}
			$("#content-loader").hide();
		});
		result.error(function(data) {
			console.log(data);
		});
    };
	$scope.deleteCart = function(regId, deleteType){
		
		var confirmPopup = $ionicPopup.confirm({
		 title: '<div style="text-align:center;">Are you sure?</div>'
	    });
	   confirmPopup.then(function(res) {
		 if(res) {
		   $(".delBtn_"+regId).hide();
			$(".LoaderItem_"+regId).show();
			var result = CartDeleteFactory.cartDelete($base64.encode(orgId),$base64.encode(auth_token),regId);
			result.success(function(data){
				if(data.status == "success"){
				   if(window.localStorage.getItem("CartItemCount") && window.localStorage.getItem("CartItemCount") > 0){
					   
					   if(deleteType == "cartItem"){
						   var cartcount = window.localStorage.getItem("CartItemCount");
						   cartcount = parseInt(cartcount) - 1;
						   window.localStorage["CartItemCount"] = cartcount;
						   $(".cart_count").text(cartcount);
						   $("#DeleteMoveItem_"+regId).fadeOut("500");
						   if(cartcount == 0){
							   $scope.isItem = false;
							   $scope.noDataMsg = "There are no items in your cart";
							   $(".cartItemCountCls").html('');
							   $(".chkoutbtn").hide();
							   $(".longchkoutbtn").hide();
						   }else{
							   $(".cartItemCountCls").html("("+cartcount+")");
							   $(".chkoutbtn").show();
							   $(".longchkoutbtn").show();
						   }
					   }else if(deleteType == "SavedItem"){
						   /* manage The count for the saved item for displaying the No Data Found Message starts here*/
							   var savedItemCount = window.localStorage.getItem("TotalSavedLater");
							   savedItemCount = parseInt(savedItemCount) - 1;
							   window.localStorage["TotalSavedLater"] = savedItemCount;
							   $("#DeleteMoveItem_"+regId).fadeOut("500");
							   if(savedItemCount == 0){
								   $(".savedItemCountCls").html("");
								   $scope.isItem = false;
								   $scope.noDataMsg = "There are no items saved for later";
							   }else{
								   $(".savedItemCountCls").html("("+savedItemCount+")");
							   }
						   /* manage The count for the saved item for displaying the No Data Found Message ends here*/
					   }else if(deleteType == "incomplete"){
						   /* manage The count for the saved item for displaying the No Data Found Message starts here*/
							   var incompleteItemCount = window.localStorage.getItem("TotalIncompleteCount");
							   incompleteItemCount = parseInt(incompleteItemCount) - 1;
							   window.localStorage["TotalIncompleteCount"] = incompleteItemCount;
							   $("#DeleteMoveItem_"+regId).fadeOut("500");
							   if(incompleteItemCount == 0){
								   $(".incomItemCountCls").html("");
								   $scope.isItem = false;
								   $scope.noDataMsg = "There are no incomplete registrations";
							   }else{
								   $(".incomItemCountCls").html("("+incompleteItemCount+")");
							   }
						   /* manage The count for the saved item for displaying the No Data Found Message ends here*/
						   
					   }

				   }
				}
			});
		 }
	   });
	};
	$scope.saveForLater = function(regId){
		var confirmPopup = $ionicPopup.confirm({
		 title: '<div style="text-align:center;">Are you sure?</div>'
	   });
	   confirmPopup.then(function(res) {
		 if(res) {
		   $("#saveLater_"+regId).hide();
			$(".LoaderItem_"+regId).show();
			var result = CartSaveFactory.cartSaveLater($base64.encode(orgId),$base64.encode(auth_token),regId);
			result.success(function(data){
				if(data.status == "success"){
				   if(window.localStorage.getItem("CartItemCount") && window.localStorage.getItem("CartItemCount") > 0){
					   var cartcount = window.localStorage.getItem("CartItemCount");
					   cartcount = parseInt(cartcount) - 1;
					   window.localStorage["CartItemCount"] = cartcount;
					   $(".cart_count").text(cartcount);
					   
					   var savedItemCount = window.localStorage.getItem("TotalSavedLater");
					   if(savedItemCount > 0){
						   savedItemCount = parseInt(savedItemCount) + 1;
					   }else{
						   savedItemCount = 1;
					   }
					   window.localStorage["TotalSavedLater"] = savedItemCount;
					   $("#DeleteMoveItem_"+regId).fadeOut("500");
					   if(cartcount == 0){
						   $(".cartItemCountCls").html("");
						   $(".savedItemCountCls").html("("+savedItemCount+")");
						   $scope.isItem = false;
						   $scope.noDataMsg = "There are no items in your cart";
						   $(".chkoutbtn").hide();
						   $(".longchkoutbtn").hide();
					   }else{
						   $(".cartItemCountCls").html("("+cartcount+")");
						   $(".savedItemCountCls").html("("+savedItemCount+")");
						   $(".chkoutbtn").show();
						   $(".longchkoutbtn").show();
					   }
				   }
				}
			});
			result.error(function(data){
				console.log(data);
			});
		 }
	   });
	};
	$scope.moveToCart = function(regId){
	   var confirmPopup = $ionicPopup.confirm({
		 title: '<div style="text-align:center;">You will be redirected to your cart upon clicking the OK button</div>'
	   });
	   confirmPopup.then(function(res) {
		 if(res) {
		   $("#loaderMove_"+regId).hide();
			$(".LoaderItem_"+regId).show();
			var result = CartMoveFactory.moveToCart($base64.encode(orgId),$base64.encode(auth_token),regId);
			result.success(function(data){
				if(data.status == "success"){
				   if(window.localStorage.getItem("CartItemCount")){
					   var cartcount = window.localStorage.getItem("CartItemCount");
					   if(cartcount > 0){
						   cartcount = parseInt(cartcount) + 1;
					   }else{
						   cartcount = 1;
					   }
					   window.localStorage["CartItemCount"] = cartcount;
					   $(".cart_count").text(cartcount);
					   if(cartcount > 0){
						   $(".chkoutbtn").show();
						   $(".longchkoutbtn").show();
					   }else{
						   $(".chkoutbtn").hide();
						   $(".longchkoutbtn").hide();
					   }				   
					   
					   /* manage The count for the saved item for displaying the No Data Found Message starts here*/
						   var savedItemCount = window.localStorage.getItem("TotalSavedLater");
						   savedItemCount = parseInt(savedItemCount) - 1;
						   window.localStorage["TotalSavedLater"] = savedItemCount;
						   $("#DeleteMoveItem_"+regId).fadeOut("500");
						   if(savedItemCount == 0){
							   $(".savedItemCountCls").html("");
							   $(".cartItemCountCls").html("("+cartcount+")");
							   $scope.isItem = false;
							   $scope.noDataMsg = "There are no items saved for later";
						   }else{
							   $(".savedItemCountCls").html("("+savedItemCount+")");
							   $(".cartItemCountCls").html("("+cartcount+")");
						   }
						   
					   /* manage The count for the saved item for displaying the No Data Found Message ends here*/
					   $scope.display_cart('cart_items')
				   }
				   
				}
			});
		 }
	   });
	};
	$scope.showRegdInf = function(id) {
		$("#showRegLink_"+id).hide();
		$("#hideRegLink_"+id).show();
		$("#RegInfDiv_"+id).slideDown();
	};
	$scope.hideRegdInf = function(id) {
		$("#hideRegLink_"+id).hide();
		$("#showRegLink_"+id).show();
		$("#RegInfDiv_"+id).slideUp();
	};
	$scope.EditRegistration = function(CartId, CartRegId) {
		window.localStorage["EditCartId"] = CartId; //15500
		window.localStorage['RegdPrevPage'] = window.location.hash;
		$window.location.href = '#/individual/'+CartRegId; //1950
	}
})

.controller('PlaceOrderCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,CartListFactory,$base64,CreditCardFactory,$filter,PlaceOrderFactory,$ionicPopup) {
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	$scope.isDisabled = true;
	$scope.init = function () {
		window.localStorage.removeItem('CreditCartCount');
		$(".LoaderOrder").show();
		var result = CartListFactory.cartList($base64.encode(orgId),$base64.encode(auth_token),'cart_items');
		result.success(function(data){
			var DisplayCartItemCount = window.localStorage.getItem("CartItemCount")
			$scope.CartOrderTotal = data.order_total;
			$scope.OnlinePaymentDue = data.online_payment_due;
			$scope.cartItemCountss = DisplayCartItemCount;
			$(".LoaderOrder").hide();
		});
		result.error(function(data) {
			console.log(data);
		});
		
		$scope.isError = false;
		$("#content-loader").hide();
		loadCreditCardInfo();
	};
	function loadCreditCardInfo() {
		$("#payment_loader").show();
		var result = CreditCardFactory.creditCardList($base64.encode(orgId),$base64.encode(auth_token));
		result.success(function(data) {
			if(data.credit_cards.length) {
				window.localStorage['CreditCartCount'] = data.credit_cards.length;
				$scope.activeCreditCard = $filter('filter')(data.credit_cards, {is_active: true},true)[0];
				if($scope.activeCreditCard) {
                       $scope.isError = false;
					   $scope.isDisabled = false;
                       
                } else {
						$scope.isDisabled = true;
						$scope.isError = true;
                }
			} else {
				$scope.isDisabled = true;
				$scope.isError = true;
			}
			$("#payment_loader").hide();
			$("#payment_inf").show();
		});
		result.error(function(data) {
			$("#payment_loader").hide();
			$("#payment_inf").show();
		});
	}
	$scope.openPaymentMethod = function() {
		window.localStorage["prev_hash_paymethod"] = window.location.hash;
		$window.location.href = '#/payment_methods';
	};
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		//$window.history.back();
		$window.location.href = window.localStorage.getItem('BackPlaceOrder');
	};
	$scope.place_order = function(amount){
		$("#loader-span2").show();
		var result = PlaceOrderFactory.placeorder($base64.encode(orgId),$base64.encode(auth_token),amount);
		result.success(function(data){
			console.log(JSON.stringify(data.order,4,null));
			window.localStorage['OrderDetail'] = JSON.stringify(data.order);
			if(data.order.outstanding_balance_amount == 0) {
				window.localStorage['orderType'] = 'past';
			} else {
				window.localStorage['orderType'] = 'awaiting_payment';
			}
			$("#loader-span2").hide();
			window.localStorage['place_order_payment'] = 1;
			$window.location.href = '#/order_detail';
		});
		result.error(function(data) {
			$(".LoaderOrder").hide();
			$("#error_div").show();
			$("#loader-span2").hide();
			$("#payment_error").html(data.message);
			$("#payment_inf").hide();
			loadCreditCardInfo();
		});
	};
	$scope.addCreditCard = function() {
		window.localStorage['BackAddCC'] = window.location.hash;
		$window.location.href = '#/creditcard';
	};
})
.controller('PaymentMethodsCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,CreditCardFactory,$base64,$filter,SaveCreditCardFactory,$ionicScrollDelegate,DeleteCreditCardFactory,$ionicPopup,$filter) {
	$scope.shouldShowDelete = false;
	$scope.shouldShowReorder = false;
	$scope.listCanSwipe = true;
	$("#content-loader").show();
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	$scope.isError = false;
	$scope.init = function () {
		window.localStorage.removeItem('CreditCartCount');
		$scope.PaymentMethods = [];
		var result = CreditCardFactory.creditCardList($base64.encode(orgId),$base64.encode(auth_token));
		result.success(function(data) {
			if(data.credit_cards.length) {
				window.localStorage['CreditCartCount'] = data.credit_cards.length;
				$scope.PaymentMethods = data.credit_cards;
			} else {
				$scope.isError = true;
			}
			$("#content-loader").hide();
		});
		result.error(function(data) {});
	};
	$scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
		$scope.active_cc = $filter('filter')($scope.PaymentMethods, {is_active: true},true)[0];
		if($scope.active_cc) {
			$scope.active_id = $scope.active_cc.id;
		}
		if($scope.active_id) {
			$("#"+$scope.active_id).children().addClass("activecard");
		} else {
			$(".credit-card").each(function() {
				$(this).children().removeClass("activecard");
			});
		}
	});
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		$window.location.href = window.localStorage.getItem('prev_hash_paymethod');
	};
	$scope.selectCard = function(CardId) {
		$scope.cardId = CardId;
		$(".credit-card").each(function() {
			$(this).children().removeClass("activecard");
		});
		$("#"+CardId).children().addClass("activecard");
		var result = SaveCreditCardFactory.saveCreditCard($base64.encode(orgId),$base64.encode(auth_token),CardId);
		result.success(function(data) {
			$ionicScrollDelegate.$getByHandle('small').scrollBottom(true);
		});
		result.error(function(data) {});
	};
	$scope.continuePayment = function() {
		$("#loader-span").show();
		if($filter('filter')($scope.PaymentMethods, {id: $scope.cardId},true)[0]) {
			window.localStorage['ActiveCreditCard'] = JSON.stringify($filter('filter')($scope.PaymentMethods, {id: $scope.cardId},true)[0]);
        } else {
            window.localStorage.removeItem('ActiveCreditCard');
        }
		$window.location.href = window.localStorage.getItem("prev_hash_paymethod");

	};
	$scope.addCreditCard = function() {
		window.localStorage['BackAddCC'] = window.location.hash;
		$window.location.href = '#/creditcard';
	};
    $scope.deleteCard = function(CardId) {
		var confirmPopup = $ionicPopup.confirm({
			title: 'Delete Credit Card',
			cssClass : 'error_msg',
			template: 'Are you sure you want to remove this credit card?'
		});
		confirmPopup.then(function(res) {
			if(res) {
				var result = DeleteCreditCardFactory.removeCreditCard($base64.encode(orgId),$base64.encode(auth_token),CardId);
				result.success(function(data) {
					var alertPopup = $ionicPopup.alert({
						title: 'Succes',
						cssClass : 'error_msg',
						template: data.message
					});
					alertPopup.then(function(res) {
						$scope.init();
					});
				});
				result.error(function(data) {});
			} else {
				return false;
			}
		});
    };
})
.controller('AddCreditcardCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,AddCreditCardFactory,$base64,$ionicPopup,getBillingDetailFactory) {
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	$scope.AddCredit = [];
	$scope.init = function () {
		var result = getBillingDetailFactory.getBillingInfo($base64.encode(orgId),$base64.encode(auth_token));
		result.success(function(data) {
			if(data.is_billing_address == true) {
				$("#street").val(data.address);
				$("#street2").val(data.address2);
				$("#city").val(data.city);
				$("#state").val(data.state);
				$("#zip").val(data.zip);
				$scope.WEPAY_ENVIRONMENT = data.wepay_env;
				$scope.WEPAY_CLIENT_ID = data.wepay_client_id;
				$scope.email = data.email;
			}
			$("#content-loader").hide();
		});
		result.error(function(data) {});
		$("#content-loader").hide();
	};
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		$window.history.back();
	};
	$scope.SaveCreditCard = function() {	
		$("#loader-span").show();
		var valid = 1;
		if(!$("#cardname").val()) {
			var alertPopup = $ionicPopup.alert({
				title: 'Error',
				cssClass : 'error_msg',
				template: "Please enter name on card."
			});
			alertPopup.then(function(res) {
				valid = 0;
				$("#loader-span").hide();
			});
		}  else if(!$("#card_number").val()) {
			var alertPopup = $ionicPopup.alert({
				title: 'Error',
				cssClass : 'error_msg',
				template: "Please enter credit card no."
			});
			alertPopup.then(function(res) {
				valid = 0;
				$("#loader-span").hide();
			});
		} else if(!$("#exp_date").val()) {
			var alertPopup = $ionicPopup.alert({
				title: 'Error',
				cssClass : 'error_msg',
				template: "Please select your expiry date."
			});
			alertPopup.then(function(res) {
				valid = 0;
				$("#loader-span").hide();
			});
		} else if(!$("#cvv").val()) {
			var alertPopup = $ionicPopup.alert({
				title: 'Error',
				cssClass : 'error_msg',
				template: "Please enter cvv."
			});
			alertPopup.then(function(res) {
				valid = 0;
				$("#loader-span").hide();
			});
		} else if(!$("#street").val()) {
			var alertPopup = $ionicPopup.alert({
				title: 'Error',
				cssClass : 'error_msg',
				template: "Please enter street."
			});
			alertPopup.then(function(res) {
				valid = 0;
				$("#loader-span").hide();
			});
		} else if(!$("#city").val()) {
			var alertPopup = $ionicPopup.alert({
				title: 'Error',
				cssClass : 'error_msg',
				template: "Please enter city."
			});
			alertPopup.then(function(res) {
				valid = 0;
				$("#loader-span").hide();
			});
		} else if(!$("#state").val()) {
			var alertPopup = $ionicPopup.alert({
				title: 'Error',
				cssClass : 'error_msg',
				template: "Please enter state."
			});
			alertPopup.then(function(res) {
				valid = 0;
				$("#loader-span").hide();
			});
		} else if(!$("#zip").val()) {
			var alertPopup = $ionicPopup.alert({
				title: 'Error',
				cssClass : 'error_msg',
				template: "Please enter zip."
			});
			alertPopup.then(function(res) {
				valid = 0;
				$("#loader-span").hide();
			});
		}
		if(valid) {
			if(validateCreditCardInfo()) {
				var name = $("#cardname").val();
				var card_no = $("#card_number").val();
				var last4 = $("#last4").val();
				var card_typ = $("#card_type").val();
				var mnth_yr = $('#exp_date').val();
				if(mnth_yr) {
					var exp_mnth = mnth_yr.split('-')[1];
					var exp_yr = mnth_yr.split('-')[0];
				}
				var cvv = $("#cvv").val();
				var street = $("#street").val();
				if($("#street2").val()) {
					var street2 = $("#street2").val();
				} else {
					var street2 = '';
				}
				var city = $("#city").val();
				var state = $("#state").val();
				var zip = $("#zip").val();

				WePay.set_endpoint($scope.WEPAY_ENVIRONMENT);
				var response = WePay.credit_card.create( {
	        		"client_id": $scope.WEPAY_CLIENT_ID,
	        		"user_name": name,
	        		"email": escape($scope.email),
	        		"cc_number": card_no,
	        		"cvv": cvv,
	       			"expiration_month": exp_mnth,
	        		"expiration_year": exp_yr,
	       	 		"address":
	          		{
	            		"address1": street,
	            		"address2": street2,
	            		"city": city,
	            		"state": state,
	            		"country": 'US',
	            		"zip": zip
	          		}
      			}, function(data) {
			        if (data.error) {

			        	var alertPopup = $ionicPopup.alert({
							title: 'Error',
							cssClass : 'error_msg',
							template: data.error_description
						});

						alertPopup.then(function(res) {
							$("#loader-span").hide();
							return false;
						});
			        }
			        else {
			          	$scope.credit_card_id = data.credit_card_id;
			          	var decode = 'credit_card[name_on_card]='+name+'&credit_card[credit_card_id]='+$scope.credit_card_id+'&credit_card[expiration_month]='+exp_mnth+'&credit_card[expiration_year]='+exp_yr+'&credit_card[last4]='+last4+'&credit_card[card_type]='+card_typ+'&address1='+street+'&address2='+street2+'&city='+city+'&state='+state+'&zip='+zip+'&cvv='+cvv;
						var encode = $base64.encode(decode);
						var result = AddCreditCardFactory.addCreditCard($base64.encode(orgId),$base64.encode(auth_token),encode);
						result.success(function(data) {
							$("#loader-span").hide();


							if(window.localStorage.getItem('CreditCartCount') > 0) {
								$window.location.href = '#/payment_methods';
							} else {
								if(window.localStorage.getItem('BackAddCC') == '#/payment_methods') {
									$window.location.href = window.localStorage.getItem('prev_hash_paymethod');
								} else {
									$window.location.href = window.localStorage.getItem('BackAddCC');
								}
							}
						});

						result.error(function(data) {
							var alertPopup = $ionicPopup.alert({
								title: 'Error',
								cssClass : 'error_msg',
								template: data.message
							});

							alertPopup.then(function(res) {
								$("#loader-span").hide();
							});
						});
			        }
			    });
			}
		}
	};
	function validateCreditCardInfo() {
		if($("#card_number").val()) {
			var cleancardno = $('#card_number').val().replace(/[^\d]+/g,'');
			$('#last4').val(cleancardno.substr(-4,4));
			
			if (cleancardno.substr(0,2) == '34' || cleancardno.substr(0,2) == '37') {
				var cardno = /^(?:3[47][0-9]{13})$/;  
				if(cleancardno.match(cardno)) {
					$('#card_type').val('American Express');
					$("#card-icon").html("<img src='img/creditcards/american.png'>");
					return true;
				} else {
					var alertPopup = $ionicPopup.alert({
						title: 'Error',
						cssClass : 'error_msg',
						template: "Invalid credit card no."
					});
					alertPopup.then(function(res) {
						$("#loader-span").hide();
						return false;
					});
				}
			}
			else if (cleancardno.substr(0,1) == '4') {
				var cardno = /^(?:4[0-9]{12}(?:[0-9]{3})?)$/;  
				if(cleancardno.match(cardno)) {
					$('#card_type').val('Visa');
					$("#card-icon").html("<img src='img/creditcards/visa.png'>");
					return true;
				} else {
					var alertPopup = $ionicPopup.alert({
						title: 'Error',
						cssClass : 'error_msg',
						template: "Invalid credit card no."
					});
					alertPopup.then(function(res) {
						$("#loader-span").hide();
						return false;
					});
				}
			}
			else if (cleancardno.substr(0,2) >= '51' && cleancardno.substr(0,2) <= '55') {
				var cardno = /^(?:5[1-5][0-9]{14})$/;  
				if(cleancardno.match(cardno)) {
					$('#card_type').val('MasterCard');
					$("#card-icon").html("<img src='img/creditcards/master.png'>");
					return true;
				} else {
					var alertPopup = $ionicPopup.alert({
						title: 'Error',
						cssClass : 'error_msg',
						template: "Invalid credit card no."
					});
					alertPopup.then(function(res) {
						$("#loader-span").hide();
						return false;
					});
				}
			}
			else if (cleancardno.substr(0,4) == '6011' || cleancardno.substr(0,2) == '65') {
				var cardno = /^(?:6(?:011|5[0-9][0-9])[0-9]{12})$/; 
				if(cleancardno.match(cardno)) {
					$('#card_type').val('Discover Card');
					$("#card-icon").html("<img src='img/creditcards/discover.png'>");
					return true;
				} else {
					var alertPopup = $ionicPopup.alert({
						title: 'Error',
						cssClass : 'error_msg',
						template: "Invalid credit card no."
					});
					alertPopup.then(function(res) {
						$("#loader-span").hide();
						return false;
					});
				}
			}
			else {
				$('#card_type').val('Credit Card');
				var alertPopup = $ionicPopup.alert({
					title: 'Error',
					cssClass : 'error_msg',
					template: "Invalid credit card no."
				});
                alertPopup.then(function(res) {
                 $("#loader-span").hide();
                 return false;
               });
			}
		}
	}
})

/************************************************** Cart ***********************************************************/
/************************************************** News ***********************************************************/
.controller('NewsListCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,$base64,getNewsFactory,$filter) {

	$("#content-loader").hide();
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	var team_id_news = window.localStorage.getItem("team_id_news");
	var activity_id_news = window.localStorage.getItem("activity_id_news");
	$scope.noMoreItemsAvailable = false;
	var page = 0;
	$scope.newslist = [];
	$scope.init = function () {
		$("#error_message").hide();
	};
	$scope.GoBack = function() {
		$window.location.href = '#/team_details';
	};
	$scope.postNews = function() {

		window.localStorage['team_id_news_post'] = team_id_news;
		window.localStorage['activity_id_news_post'] = activity_id_news;
		$window.location.href = '#/post_news';
	};
	$scope.LoadMore = function() {
		page = page+1;
		var result = getNewsFactory.getNews($base64.encode(orgId),$base64.encode(auth_token),team_id_news,activity_id_news,page,PerPage);
		result.success(function(data) {
			/*console.log(data);*/
			if(data.team_news.length == 0) {
				$("#error_message").show();
				$scope.noMoreItemsAvailable = true;
			}
			if(data.team_news.length) {
				if(data.team_news.length < PerPage) {
					$scope.noMoreItemsAvailable = true;
				}
				$scope.$broadcast('scroll.infiniteScrollComplete');
				for(var i in data.team_news) {
					if(data.team_news[i].media) {
						for(var j in data.team_news[i].media) {
							if(data.team_news[i].media[j].thumbnail_url != '') {
								var thumbnail_url = data.team_news[i].media[j].thumbnail_url;
								var parts = thumbnail_url.split('/');
								if(parts[1] == 'assets') {
									data.team_news[i].media[j].thumbnail_url = ImageUrl+data.team_news[i].media[j].thumbnail_url;
								}
							}
							if(data.team_news[i].media[j].url != '') {
								var url = data.team_news[i].media[j].url;
								var parts = url.split('/');
								if(parts[1] == 'assets') {
									data.team_news[i].media[j].url = ImageUrl+data.team_news[i].media[j].url;
								}
							}
						}
					}
					/*console.log(data.team_news[i]);*/
					$scope.newslist.push(data.team_news[i]);
				}
			}
			$("#content-loader").hide();
		});
		result.error(function(data) {
			console.log(data);
			$scope.noMoreItemsAvailable = true;
			$("#content-loader").hide();
		});
	};
	$scope.view_detail = function(id) {
		var news_details = $filter('filter')($scope.newslist, {id: parseInt(id)},true)[0];
		window.localStorage['NewsDetails'] = JSON.stringify(news_details);
		$window.location.href = '#/news_detail';
	}
})

.controller('PostNewsCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,$ionicPopup,$base64) {
	$("#content-loader").hide();	
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	var team_id_news_post = window.localStorage.getItem("team_id_news_post");
	var activity_id_news_post = window.localStorage.getItem("activity_id_news_post");	
	$scope.init = function () {
		$scope.team_id_news_post = team_id_news_post;
		$scope.activity_id_news_post = activity_id_news_post;		
		var SelectedPhotoId = window.localStorage.getItem("SelectedImageId");
		var SelectedPhotoName = window.localStorage.getItem("SelectedImageName");
		var SelectedPhotoThumb = window.localStorage.getItem("SelectedImageThumb");
		var SelectedPhotoUrl = window.localStorage.getItem("SelectedImageUrl");		
		var SelectedAlbumId = window.localStorage.getItem("SelectedAlbumId");
		var SelectedAlbumName = window.localStorage.getItem("SelectedAlbumName");		
		var SelectedPageId = window.localStorage.getItem("SelectedPageId");
		var SelectedPageName = window.localStorage.getItem("SelectedPageName");
		
		var SelectedIndOption = window.localStorage.getItem("IncludeOptionValue");
		
		if(window.localStorage.getItem("PostNewsHeadline")){
			$("#news_item_headline").val(window.localStorage.getItem("PostNewsHeadline"));
		}		
		if(window.localStorage.getItem("PostNewsDetails")){
			$("#news_item_details").val(window.localStorage.getItem("PostNewsDetails"));
		}		
		
		if(SelectedIndOption && SelectedIndOption == 'nonetype'){
			$(".SelectAddLinkOption").hide();
			$(".SelectNewsArticleOption").hide();
			$(".selectDefaultOptiontype").prop('checked', true);
		}else if(SelectedIndOption && SelectedIndOption == 'linktype'){
			$(".SelectAddLinkOption").show();
			$(".SelectNewsArticleOption").hide();
			$(".selectLinkOptiontype").prop('checked', true);
		}else if(SelectedIndOption && SelectedIndOption == 'articletype'){
			$(".SelectAddLinkOption").hide();
			$(".SelectNewsArticleOption").show();
			$(".selectArtOptiontype").prop('checked', true);
		}
		
		if(SelectedPhotoName && SelectedPhotoThumb){
			var DisplayPhotoData = '<div><table width="100%"><tr><td width="40%" style="vertical-align:top;padding:5px;">Photo: '+SelectedPhotoName+'</td><td width="40%" style="vertical-align:top;padding:5px;"><img style="max-width:100%;" src="'+SelectedPhotoThumb+'" border="0"></td><td width="20%" style="vertical-align:top;padding:5px;"><img style="width: 30px;" src="img/delete.png" class="DeletePhoto"></td></tr></table></div>';
			$("#DisplayPhotoDetails").show();
			$("#DisplayPhotoDetails").html(DisplayPhotoData);
		}		
		if(SelectedAlbumId && SelectedAlbumName){
			var DisplayAlbumData = '<div><table width="100%"><tr><td width="40%" style="vertical-align:top;padding:5px;">Album: '+SelectedAlbumName+'</td><td width="20%" style="vertical-align:top;padding:5px;"><img style="width: 30px;" src="img/delete.png" class="DeleteAlbum"></td></tr></table></div>';
			$("#DisplayPhotoDetails").show();
			$("#DisplayPhotoDetails").html(DisplayAlbumData);
		}		
		if(SelectedPageId && SelectedPageName){
			var DisplayLinkData = '<div><table width="100%"><tr><td width="40%" style="vertical-align:top;padding:5px;">'+SelectedPageName+'</td><td width="20%" style="vertical-align:top;padding:5px;"><img style="width: 30px;" src="img/delete.png" class="DeletePage"></td></tr></table></div>';
			$("#DisplayLinkPageDetails").show();
			$("#DisplayLinkPageDetails").html(DisplayLinkData);
		}		
		if(window.localStorage.getItem("NewsArticleDetails")){
			$("#DisplayWriteNewsArti").show();
			$("#news_article_details").val(window.localStorage.getItem("NewsArticleDetails"));
		}		
		if(window.localStorage.getItem("EmailSmsValue")){
			$(".chkEmailSms").prop('checked', true);
		}		
	};	
	$(".chkEmailSms").click(function(){
		if($(this).is(':checked')){
			window.localStorage['EmailSmsValue'] = $(this).val();
		}else{
			window.localStorage['EmailSmsValue'] = "";
		}
	});	
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		//$("#content-loader").show();
		window.localStorage.removeItem("PostNewsHeadline");
		window.localStorage.removeItem("PostNewsDetails");
		window.localStorage.removeItem("SelectedImageId");
		window.localStorage.removeItem("SelectedImageName");
		window.localStorage.removeItem("SelectedImageThumb");
		window.localStorage.removeItem("SelectedImageUrl");
		window.localStorage.removeItem("SelectedAlbumId");
		window.localStorage.removeItem("SelectedAlbumName");
		window.localStorage.removeItem("SelectedPageId");
		window.localStorage.removeItem("SelectedPageName");
		window.localStorage.removeItem("isExternalLink");
		window.localStorage.removeItem("SelectedPagePermalink");
		window.localStorage.removeItem("NewsArticleDetails");
		window.localStorage.removeItem("EmailSmsValue");
		window.localStorage.removeItem("IncludeOptionValue");


		$window.location.href = '#/news_list';
	};
	$scope.selectFeeds = function() {
		//$("#content-loader").show();
		$window.location.href = '#/select_feeds';
	}	
	$("#news_item_headline").keyup(function(){
		window.localStorage['PostNewsHeadline'] = $("#news_item_headline").val();
	});
	
	$("#news_item_details").keyup(function(){
		window.localStorage['PostNewsDetails'] = $("#news_item_details").val();
	});	
	$("#BtnPostNews").click(function(){		
		$(".DisplayLoader").show();
		$(".displayButton").hide();		
		var news_team_id = $("#news_team_id").val();
		var news_team_activity_id = $("#news_team_activity_id").val();
		/*var news_item_headline = window.localStorage.getItem("PostNewsHeadline");
		var news_item_details = window.localStorage.getItem("PostNewsDetails");*/
		var news_item_headline = $("#news_item_headline").val();
		var news_item_details = $("#news_item_details").val();		
		var SelectedPhotoId = window.localStorage.getItem("SelectedImageId");
		var SelectedPhotoName = window.localStorage.getItem("SelectedImageName");
		var SelectedPhotoThumb = window.localStorage.getItem("SelectedImageThumb");
		var SelectedPhotoUrl = window.localStorage.getItem("SelectedImageUrl");		
		var SelectedAlbumId = window.localStorage.getItem("SelectedAlbumId");
		var SelectedAlbumName = window.localStorage.getItem("SelectedAlbumName");		
		var SelectedPageId = window.localStorage.getItem("SelectedPageId");
		var SelectedPageName = window.localStorage.getItem("SelectedPageName");		
		var SelectedEmailSmsValue = window.localStorage.getItem("EmailSmsValue");		
		var Selectedattachment = window.localStorage.getItem("Selectedattachment");
		var SelectedNewsArticleDetails = window.localStorage.getItem("NewsArticleDetails");		
		if(news_item_headline == ''){
			var alertPopup = $ionicPopup.alert({
				title: 'Error',
				cssClass : 'error_msg',
				template: "Please enter headline."
			});
			$(".DisplayLoader").hide();
			$(".displayButton").show();
			return false;
		}else{			
			if(news_item_details){
				var passNewsDetails = news_item_details;
			}else{
				var passNewsDetails = '';
			}			
			if(SelectedPhotoUrl){
				var MediaURL = SelectedPhotoUrl;
			}else{
				var MediaURL = '';
			}			
			if(SelectedAlbumName){
				var AlbumURL = SelectedAlbumName;
			}else{
				var AlbumURL = '';
			}			
			if(SelectedEmailSmsValue){
				var IsMessage = 1;
			}else{
				var IsMessage = 0;
			}			
			if(SelectedPageName){
				if(window.localStorage.getItem("isExternalLink")){
					var MessageLinkArticle = SelectedPageName;
				}else if(window.localStorage.getItem("SelectedPagePermalink")){
					var MessageLinkArticle = "team:"+window.localStorage.getItem("SelectedPagePermalink");
				}else{
					var MessageLinkArticle = SelectedPageId;
				}
				var attachmentValue = Selectedattachment;
			}else{
				var MessageLinkArticle = '';
				var attachmentValue = 'none';
			}
			
			if(SelectedNewsArticleDetails){
				var newsArticleMsg = SelectedNewsArticleDetails;
			}else{
				var newsArticleMsg = '';
			}
			
			if(SelectedPhotoUrl && SelectedPhotoThumb){
				var ServiceAccountId = window.localStorage.getItem("AccountIdData");		
				if(SelectedAlbumName){
					var AlbumIdSelect = window.localStorage.getItem("SelectedAlbumId");
					var resourceId = AlbumIdSelect;
					var resourceType = 'album';
				} else {
					var AlbumIdSelect = window.localStorage.getItem("AlbumIdData");
					var resourceId = SelectedPhotoId;
					var resourceType = 'photo';
				}
				var resourceKey = 'undefined';
				
			}else{
				var ServiceAccountId = '';
				var AlbumIdSelect = '';
				var resourceId = '';
				var resourceKey = '';
				var resourceType = '';
			}						
			var saveNewPost = 'news_item[team_news]=true&news_item[team_id]='+news_team_id+'&news_item[headline]='+news_item_headline+'&news_item[details]='+passNewsDetails+'&news_item[media_url]='+MediaURL+'&news_item[target_url]='+MessageLinkArticle+'&news_item[open_in_new_window]=&news_item[is_as_message]='+IsMessage+'&team_id='+news_team_id+'&target_media[service_account_id]='+ServiceAccountId+'&target_media[resource_id]='+resourceId+'&target_media[resource_type]='+resourceType+'&target_media[album_id]='+AlbumIdSelect+'&target_media[resource_key]='+resourceKey+'&attachment='+attachmentValue+'&new_link_context=team&article_text='+newsArticleMsg+'&refresh_news_page=true';
			console.log(saveNewPost);//return false;
			var URL = API_URL+'/api/v1/news_items/'+$base64.encode(auth_token)+'/'+$base64.encode(orgId)+'/create';
			$.ajax({
				type: "POST",
				url: URL,
				data: saveNewPost,
				success: function(data){console.log(data);
                   window.localStorage['TeamNewsPostIdValue'] = data.news_item_id;
					var alertPopup = $ionicPopup.alert({
						title: 'Success',
						cssClass : 'error_msg',
						template: data.message
					});
					alertPopup.then(function(res) {
						$("#loader-span").hide();
						window.localStorage.removeItem("PostNewsHeadline");
						window.localStorage.removeItem("PostNewsDetails");
						window.localStorage.removeItem("SelectedImageId");
						window.localStorage.removeItem("SelectedImageName");
						window.localStorage.removeItem("SelectedImageThumb");
						window.localStorage.removeItem("SelectedImageUrl");
						window.localStorage.removeItem("SelectedAlbumId");
						window.localStorage.removeItem("SelectedAlbumName");
						window.localStorage.removeItem("SelectedPageId");
						window.localStorage.removeItem("SelectedPageName");
						window.localStorage.removeItem("isExternalLink");
						window.localStorage.removeItem("SelectedPagePermalink");
						window.localStorage.removeItem("NewsArticleDetails");
						window.localStorage.removeItem("EmailSmsValue");
						window.localStorage.removeItem("IncludeOptionValue");
						
						$(".DisplayLoader").hide();
						$(".displayButton").show();
						
						$window.location.href = '#/news_list';
					});
				},
				error: function(data) {
					console.log(data);
					$("#loader-span").hide();
				}
			});
		}
	});	
	
	$(".selectDefaultOptiontype").click(function(){
		$(".SelectAddLinkOption").hide();
		$(".SelectNewsArticleOption").hide();
		window.localStorage['IncludeOptionValue'] = "nonetype";
		
		$("#DisplayLinkPageDetails").hide();
		$("#DisplayLinkPageDetails").html("");
		window.localStorage.removeItem("SelectedPageId");
		window.localStorage.removeItem("SelectedPageName");
		
		$("#DisplayWriteNewsArti").hide();
		$("#news_article_details").val('');
		window.localStorage.removeItem("NewsArticleDetails");
	});
	$(".selectLinkOptiontype").click(function(){
		$(".SelectAddLinkOption").show();
		$(".SelectNewsArticleOption").hide();
		window.localStorage['IncludeOptionValue'] = "linktype";
		
		$("#DisplayWriteNewsArti").hide();
		$("#news_article_details").val('');
		window.localStorage.removeItem("NewsArticleDetails");
	});
	$(".selectArtOptiontype").click(function(){
		$(".SelectAddLinkOption").hide();
		$(".SelectNewsArticleOption").show();
		window.localStorage['IncludeOptionValue'] = "articletype";
		
		$("#DisplayLinkPageDetails").hide();
		$("#DisplayLinkPageDetails").html("");
		window.localStorage.removeItem("SelectedPageId");
		window.localStorage.removeItem("SelectedPageName");
	});
	
	
	$("#upload_option").change(function(){
		var optionSelected = $(this).val();
		if(optionSelected == '1'){
			$("#selectPhotoOption").show();
		}else{
			$("#selectPhotoOption").hide();
		}
	});	
	$("#selectPhotoOption").click(function(){
		$window.location.href = '#/select_photo_account';
	});	
	$("#selectLinkArticle").click(function(){
		$window.location.href = '#/select_link_article_menus';
	});	
	$("#writenewsarticle").click(function(){
		$("#DisplayWriteNewsArti").show();
	});	
	$(document).on('keyup', '#news_article_details', function(){
		window.localStorage['NewsArticleDetails'] = $("#news_article_details").val();
		window.localStorage['Selectedattachment'] = 'article';
	});	
	$(document).on('click', '.DeletePhoto', function(){
		$("#DisplayPhotoDetails").hide();
		$("#DisplayPhotoDetails").html("");
		window.localStorage['SelectedImageId'] = "";
		window.localStorage['SelectedImageName'] = "";
		window.localStorage['SelectedImageThumb'] = "";
		window.localStorage['SelectedImageUrl'] = "";
		localStorage.removeItem("SelectedImageId");
		localStorage.removeItem("SelectedImageName");
		localStorage.removeItem("SelectedImageThumb");
		localStorage.removeItem("SelectedImageUrl");
	});	
	$(document).on('click', '.DeleteAlbum', function(){
		$("#DisplayPhotoDetails").hide();
		$("#DisplayPhotoDetails").html("");
		window.localStorage['SelectedAlbumId'] = "";
		window.localStorage['SelectedAlbumName'] = "";
		localStorage.removeItem("SelectedAlbumId");
		localStorage.removeItem("SelectedAlbumName");
	});	
	$(document).on('click', '.DeletePage', function(){
		$("#DisplayLinkPageDetails").hide();
		$("#DisplayLinkPageDetails").html("");
		window.localStorage['SelectedPageId'] = "";
		window.localStorage['SelectedPageName'] = "";
		localStorage.removeItem("SelectedPageId");
		localStorage.removeItem("SelectedPageName");
	});	
})

.controller('SelectLinkArticleMenusCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,TeamLinkArticleFactory,$base64) {
	$("#content-loader").show();
	$scope.init = function () {
		$("#content-loader").hide();
	};
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		//$("#content-loader").show();
		$window.history.back();
	};	
	$(".LinkToSitePage").click(function(){
		$window.location.href = '#/select_link_article';
	});	
	$(".LinkToTeamPage").click(function(){
		$window.location.href = '#/select_team_pages';
	});	
	$(".LinkToExternal").click(function(){
		$window.location.href = '#/select_external_website';
	});	
})

.controller('SelectTeamExternalWebsiteCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,$ionicPopup) {
	$("#content-loader").show();
	$scope.init = function () { 
		$("#content-loader").hide();
	};
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		$window.history.back();
	};	
	$("#BtnExternalLink").click(function(){
		var externalValue = $("#news_external_link").val();
		if(externalValue == ''){
			var alertPopup = $ionicPopup.alert({
				title: 'Error',
				cssClass : 'error_msg',
				template: "Please enter a link."
			});
		}else{
			window.localStorage['SelectedPageId'] = 1;
			window.localStorage['SelectedPageName'] = externalValue;
			$window.location.href = '#/post_news';
			window.localStorage['Selectedattachment'] = 'link';
			window.localStorage['isExternalLink'] = 1;
		}
	});
	
})

.controller('SelectTeamPagesArticleCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,TeamPageLinkArticleFactory,$base64,$ionicPopup) {
	$("#content-loader").show();
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	var AllTeamPagesLinksdata = [];

	$scope.init = function () { 
		var result = TeamPageLinkArticleFactory.TeamPageLinkArticle($base64.encode(orgId),$base64.encode(auth_token));
		result.success(function(data){
			angular.forEach(data.team_pages.children, function (childfld, key){
				AllTeamPagesLinksdata.push({id:childfld.id, name:childfld.title, permalink:childfld.object.permalink, totalChildren:childfld.children.length});
			});
			$scope.TeamLinksdataMore = AllTeamPagesLinksdata;
			$(".DisplayTeamPageSelectButton").show();
			$("#content-loader").hide();
		});
		
	};
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		//$("#content-loader").show();
		$window.history.back();
	};
	
	//$(document).on('click', '#SelectTeamPageLink', function(){





	$("#SelectTeamPageLink").click(function(){
		if($(".TeamLinksPage:checked").attr("TeamLinksId") == undefined) {
			var alertPopup = $ionicPopup.alert({
				title: 'Error',
				cssClass : 'error_msg',
				template: "Please select a page."
			});
			alertPopup.then(function(res) {
				return false;
			});
		} else {
			window.localStorage['SelectedPageId'] = $(".TeamLinksPage:checked").attr("TeamLinksId");
			window.localStorage['SelectedPageName'] = $(".TeamLinksPage:checked").val();
			window.localStorage['SelectedPagePermalink'] = $(".TeamLinksPage:checked").attr("TeamPermaLinks");
			//var SelectedPageId = window.localStorage.getItem("SelectedPageId");
			//var SelectedPageName = window.localStorage.getItem("SelectedPageName");
			window.localStorage['Selectedattachment'] = 'link';
			$window.location.href = '#/post_news';
		}
	});
	
	$(document).on('click', '.TeamLinksCls', function(){
		var TeamLinkPageIdID = $(this).attr("TeamLinkId");
		window.localStorage['TeamLinkPageIdID'] = TeamLinkPageIdID;
		$window.location.href = '#/select_children_team_page';
	});
	
})
											 
.controller('SelectChildrenTeamPagesArticleCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,TeamPageLinkChildrenArticleFactory,$base64,$ionicPopup) {
	$("#content-loader").show();
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	var TeamLinkPageIdID = window.localStorage.getItem("TeamLinkPageIdID");
	var AllTeamPageChildLinkArticlesdata = [];
	$scope.init = function () { 
		var result = TeamPageLinkChildrenArticleFactory.TeamPageLinkChildrenArticle($base64.encode(orgId),$base64.encode(auth_token), TeamLinkPageIdID);
		result.success(function(data){
			angular.forEach(data.page_childrens.children, function (teamchildfld, key){
				AllTeamPageChildLinkArticlesdata.push({id:teamchildfld.id, name:teamchildfld.title, permalink:teamchildfld.object.permalink, totalChildren:teamchildfld.children.length});
			});
			$scope.ChildTeamLinksdataMore = AllTeamPageChildLinkArticlesdata;
			$(".DisplayTeamChildPageSelectButton").show();
			$("#content-loader").hide();
		});
		
	};
	$scope.TeamLinkPageIdIDToPass = TeamLinkPageIdID;
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		//$("#content-loader").show();
		$window.history.back();
	};
	$(document).off('click').on('click', '#SelectTeamChildPageLink'+TeamLinkPageIdID, function(){
		if($('.ChildTeamLinksPage:checked').attr("ChildTeamLinksId") == undefined) {
			var alertPopup = $ionicPopup.alert({
				title: 'Error',
				cssClass : 'error_msg',
				template: "Please select a page."
			});
			alertPopup.then(function(res) {
				return false;
			});
		} else {
			window.localStorage['SelectedPageId'] = $('.ChildTeamLinksPage:checked').attr("ChildTeamLinksId");
			window.localStorage['SelectedPageName'] = $('.ChildTeamLinksPage:checked').val();
			window.localStorage['SelectedPagePermalink'] = $('.ChildTeamLinksPage:checked').attr("ChildTeamPermaLinksId");		
			$window.location.href = '#/post_news';
		}
	});
	
	$(document).on('click', '.ChildTeamLinksCls', function(){
		var LinkPageIdID = $(this).attr("ChildTeamLinkId");
		window.localStorage['TeamChildLinkPageIdID'] = LinkPageIdID;
		$window.location.href = '#/select_children_team_page2';
	});
})

.controller('SelectChildrenTeamPagesArticle2Ctrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,TeamPageLinkChildrenArticle2Factory,$base64,$ionicPopup) {
	$("#content-loader").show();
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	var TeamChildLinkPageIdID = window.localStorage.getItem("TeamChildLinkPageIdID");
	var AllTeamPageChildLinkArticlesdata2 = [];
	$scope.init = function () { 
		var result = TeamPageLinkChildrenArticle2Factory.TeamPageLinkChildrenArticle2($base64.encode(orgId),$base64.encode(auth_token), TeamChildLinkPageIdID);
		result.success(function(data){
			angular.forEach(data.page_childrens.children, function (teamchild2fld, key){
				AllTeamPageChildLinkArticlesdata2.push({id:teamchild2fld.id, name:teamchild2fld.title, permalink:teamchild2fld.object.permalink, totalChildren:teamchild2fld.children.length});
			});
			$scope.ChildTeamLinksdataMore2 = AllTeamPageChildLinkArticlesdata2;
			$(".DisplayTeamChildPageSelectButton2").show();
			$("#content-loader").hide();
		});
		
	};
	$scope.TeamChildLinkPageIdIDToPass = TeamChildLinkPageIdID;
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		//$("#content-loader").show();
		$window.history.back();
	};
	$(document).off('click').on('click', '#SelectTeamChildPageLink2'+TeamChildLinkPageIdID, function(){
		if($('.ChildTeamLinksPage2:checked').attr("ChildTeamLinksId2") == undefined) {
			var alertPopup = $ionicPopup.alert({
				title: 'Error',
				cssClass : 'error_msg',
				template: "Please select a page."
			});
			alertPopup.then(function(res) {
				return false;
			});
		} else {
			window.localStorage['SelectedPageId'] = $('.ChildTeamLinksPage2:checked').attr("ChildTeamLinksId2");
			window.localStorage['SelectedPageName'] = $('.ChildTeamLinksPage2:checked').val();
			window.localStorage['SelectedPagePermalink'] = $('.ChildTeamLinksPage2:checked').attr("ChildTeamPermaLinksId2");
			$window.location.href = '#/post_news';
		}
	});
	
	$(document).on('click', '.ChildTeamLinksCls2', function(){
		var LinkPageIdID = $(this).attr("ChildTeamLinkId2");
		//window.localStorage['TeamChildLinkPageIdID'] = LinkPageIdID;
		//$window.location.href = '#/select_children_page2';
	});
})

.controller('SelectLinkArticleCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,TeamLinkArticleFactory,$base64,$ionicPopup) {
	$("#content-loader").show();
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	var AllLinkArticlesdata = [];
	$scope.init = function () { 
		var result = TeamLinkArticleFactory.TeamLinkArticle($base64.encode(orgId),$base64.encode(auth_token));
		result.success(function(data){
			angular.forEach(data.site_pages, function (linkfld, key){
				AllLinkArticlesdata.push({id:linkfld[0].id, name:linkfld[0].title, parent_id:linkfld[0].parent_id, is_children:linkfld[0].is_children});
			});
			//console.log(AllAccountsdata);
			$scope.LinksdataMore = AllLinkArticlesdata;
			$(".DisplayPageSelectButton").show();
			$("#content-loader").hide();
		});
		
	};
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		//$("#content-loader").show();
		$window.history.back();
	};
	
	$(document).on('click', '.LinksPage', function(){
		/*window.localStorage['SelectedPageId'] = $(this).attr("LinksId");
		window.localStorage['SelectedPageName'] = $(this).val();*/
	});

	$(document).on('click', '#SelectPageLink', function(){
		if($(".LinksPage:checked").attr("LinksId") == undefined) {
			var alertPopup = $ionicPopup.alert({
				title: 'Error',
				cssClass : 'error_msg',
				template: "Please select a page."
			});
			alertPopup.then(function(res) {
				return false;
			});
		} else {
			window.localStorage['SelectedPageId'] = $(".LinksPage:checked").attr("LinksId");
			window.localStorage['SelectedPageName'] = $(".LinksPage:checked").val();
			var SelectedPageId = window.localStorage.getItem("SelectedPageId");
			var SelectedPageName = window.localStorage.getItem("SelectedPageName");
			window.localStorage['Selectedattachment'] = 'link';
			$window.location.href = '#/post_news';
		}
	});
	
	$(document).on('click', '.LinksCls', function(){
		var LinkPageIdID = $(this).attr("LinkId");
		window.localStorage['LinkPageIdID'] = LinkPageIdID;
		$window.location.href = '#/select_children_page';
	});
	
})

.controller('SelectChildrenPageCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,TeamChildLinkArticleFactory,$base64,$state,$ionicPopup) {
	$("#content-loader").show();
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	var LinkPageIdID = window.localStorage.getItem("LinkPageIdID");
	var AllChildLinkArticlesdata = [];
	$scope.init = function () { 
		var result = TeamChildLinkArticleFactory.TeamChildLinkArticle($base64.encode(orgId),$base64.encode(auth_token),LinkPageIdID);
		result.success(function(data){
			angular.forEach(data.page_childrens, function (pagechldfld, key){
				AllChildLinkArticlesdata.push({id:pagechldfld[0].id, name:pagechldfld[0].title, is_children:pagechldfld[0].is_children});
			});
			$scope.ChildLinksdataMore = AllChildLinkArticlesdata;
			$(".DisplayChildPageSelectButton").show();
			$("#content-loader").hide();
		});
		
	};
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		//$("#content-loader").show();
		$window.history.back();
	};
	
	$scope.LinkPageIdToPass = LinkPageIdID;
	$(document).off('click').on('click', '#SelectChildPageLink'+LinkPageIdID, function(){
		if($(".ChildLinksPage:checked").attr("LinksId") == undefined) {
			var alertPopup = $ionicPopup.alert({
				title: 'Error',
				cssClass : 'error_msg',
				template: "Please select a page."
			});
			alertPopup.then(function(res) {
				return false;
			});
		} else {
			window.localStorage['SelectedPageId'] = $(".ChildLinksPage:checked").attr("LinksId");
			window.localStorage['SelectedPageName'] = $(".ChildLinksPage:checked").val();
			var SelectedPageId = window.localStorage.getItem("SelectedPageId");
			var SelectedPageName = window.localStorage.getItem("SelectedPageName");
			$window.location.href = '#/post_news';
		}
	});	
	$(document).on('click', '.ChildLinksCls', function(){
		var ChildLinkPageIdID = $(this).attr("ChildLinkId");
		window.localStorage['LinkPageIdID'] = ChildLinkPageIdID;
		$window.location.href = '#/select_children_page';
		$state.reload();
	});
})

.controller('SelectPhotoAccountCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,TeamUploadPhotoFactory,$base64) {
    $("#content-loader").show();
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	var AllAccountsdata = [];
	$scope.init = function () { 
		var result = TeamUploadPhotoFactory.TeamUploadPhoto($base64.encode(orgId),$base64.encode(auth_token));
		result.success(function(data){
			angular.forEach(data.photo_accounts, function (accntfld, key){
				AllAccountsdata.push({id:accntfld.name.id, name:accntfld.name.name});
			});
			console.log(AllAccountsdata);
			$scope.AccountsdataMore = AllAccountsdata;
			$("#content-loader").hide();
		});		
	};
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		//$("#content-loader").show();
		$window.history.back();
	};	
	$(document).on('click', '.AccountCls', function(){
		var AccntId = $(this).attr("AccntId");
		window.localStorage['AccountIdData'] = AccntId;
		$window.location.href = '#/select_photo_albums';
	});
})

.controller('SelectPhotoAlbumsCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,TeamUploadPhotoAlbumFactory,$base64,$ionicPopup) {
	$("#content-loader").show();
	var AccountIdData = window.localStorage.getItem("AccountIdData");
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	var AllAlbumsdata = [];
	$scope.init = function () { 
		var result = TeamUploadPhotoAlbumFactory.TeamUploadAlbum($base64.encode(orgId),$base64.encode(auth_token),AccountIdData);
		result.success(function(data){
			console.log(data);
			if(data.albums.length > 0){
				$(".NoAlbumFound").hide();
				angular.forEach(data.albums, function (albumfld, key){
					if(albumfld[0].album_images.thumbnail != '') {
						if(albumfld[0].album_images.thumbnail.indexOf("/assets") > -1) {
							albumfld[0].album_images.thumbnail = ImageUrl+albumfld[0].album_images.thumbnail;
						}
					}
					if(albumfld[0].album_images.url != '') {
						if(albumfld[0].album_images.url.indexOf("/assets") > -1) {
							albumfld[0].album_images.url = ImageUrl+albumfld[0].album_images.url;
						}
					}
					AllAlbumsdata.push({id:albumfld[0].id, name:albumfld[0].name, image_url:albumfld[0].album_images.url, thumbnail_url:albumfld[0].album_images.thumbnail});
				});
				$scope.AlbumsdataMore = AllAlbumsdata;
				$(".DisplayAlbumSelectButton").show();
			}else{
				$(".NoAlbumFound").show();
				$(".DisplayAlbumSelectButton").hide();
				AlbumNoDataDisplay = '<div style="color: #ff0000;font-weight: bold;left: 50%;margin-top: 50px;text-align: center;width: 100%;">No Albums Available.</div>';
				$(".NoAlbumFound").html(AlbumNoDataDisplay);
			}
			$("#content-loader").hide();
		});
		
	};
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		//$("#content-loader").show();
		$window.history.back();
	};
	
	$(document).on('click', '.AlbumCls', function(){
		var AlbumID = $(this).attr("AlbumId");
		window.localStorage['AlbumIdData'] = AlbumID;
		window.localStorage['AccountID'] = window.localStorage.getItem("AccountIdData");
		$window.location.href = '#/select_photos';
	});
	
	$(document).on('click', '.RadioAlbum', function(){
		/*window.localStorage['SelectedAlbumId'] = $(this).attr("AlbumId");
		window.localStorage['SelectedAlbumName'] = $(this).val();*/
		
		/* Deleting data for the photos starts here */
			/*window.localStorage['SelectedImageId'] = "";
			window.localStorage['SelectedImageName'] = "";
			window.localStorage['SelectedImageThumb'] = "";
			window.localStorage['SelectedImageUrl'] = "";
			localStorage.removeItem("SelectedImageId");
			localStorage.removeItem("SelectedImageName");
			localStorage.removeItem("SelectedImageThumb");
			localStorage.removeItem("SelectedImageUrl");*/
			
			/*window.localStorage['SelectedPageId'] = "";
			window.localStorage['SelectedPageName'] = "";
			localStorage.removeItem("SelectedPageId");
			localStorage.removeItem("SelectedPageName");*/
			
		/* Deleting data for the photos ends here */
	});
	
	$(document).on('click', '#SelectSelectAlbum', function(){
		if($(".RadioAlbum:checked").attr("AlbumId") == undefined) {
			var alertPopup = $ionicPopup.alert({
				title: 'Error',
				cssClass : 'error_msg',
				template: "Please select an album."
			});
			alertPopup.then(function(res) {
				return false;
			});
		} else {
			window.localStorage['SelectedAlbumId'] = $(".RadioAlbum:checked").attr("AlbumId");
			window.localStorage['SelectedAlbumName'] = $(".RadioAlbum:checked").val();
			window.localStorage['SelectedImageId'] = "";
			window.localStorage['SelectedImageName'] = "";
			window.localStorage['SelectedImageThumb'] = $(".RadioAlbum:checked").attr("ThumbNailUrl");
			window.localStorage['SelectedImageUrl'] = $(".RadioAlbum:checked").attr("ImgUrl");
			localStorage.removeItem("SelectedImageId");
			localStorage.removeItem("SelectedImageName");
			//localStorage.removeItem("SelectedImageThumb");
			//localStorage.removeItem("SelectedImageUrl");
			var SelectedAlbumId = window.localStorage.getItem("SelectedAlbumId");
			var SelectedAlbumName = window.localStorage.getItem("SelectedAlbumName");
			$window.location.href = '#/post_news';
		}
	});	
})

.controller('SelectPhotosCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,TeamUploadAlbumPhotosFactory,$base64,$ionicPopup) {
	$("#content-loader").show();
	var AccountID = window.localStorage.getItem("AccountID");
	var AlbumIdData = window.localStorage.getItem("AlbumIdData");
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	var AllPhotosdata = [];
	var PhotoTableDisplay = '';
	$scope.init = function () { 
		var result = TeamUploadAlbumPhotosFactory.TeamUploadPhotos($base64.encode(orgId),$base64.encode(auth_token),AccountID,AlbumIdData);
		result.success(function(data){console.log(data);
			if(data.album_photos.length > 0){
				PhotoTableDisplay = '<div class="mainPhotoDiv">';
				angular.forEach(data.album_photos, function (photofld, key){
					if(photofld[0].thumbnail != '') {
						if(photofld[0].thumbnail.indexOf("/assets") > -1) {

							photofld[0].thumbnail = ImageUrl+photofld[0].thumbnail;
						}
					}
					if(photofld[0].url != '') {
						if(photofld[0].url.indexOf("/assets") > -1) {

							photofld[0].url = ImageUrl+photofld[0].url;
						}
					}
					PhotoTableDisplay += '<div class="ChildDiv"><img class="ImgCls" src="'+photofld[0].thumbnail+'" ImgId="'+photofld[0].id+'" ImgName="'+photofld[0].title+'" ImgThumb="'+photofld[0].thumbnail+'" ImgUrl="'+photofld[0].url+'" ></div>';
				});
				PhotoTableDisplay += '<div class="CleatB"></div></div>';
				$(".DisplaySelectButton").show();
			}else{
				$(".DisplaySelectButton").hide();
				PhotoTableDisplay = '<div style="color: #ff0000;font-weight: bold;left: 50%;margin-top: 50px;text-align: center;width: 100%;">No Photos Available.</div>';
			}
			$("#DisplayImages").html(PhotoTableDisplay);
			$("#content-loader").hide();
		});
		result.error(function(data){
			$("#content-loader").hide();
		});
	};
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		//$("#content-loader").show();
		$window.history.back();
	};
	
	$(document).on('click', '.ImgCls', function(){
		$(".ImgCls").css({"border": "1px solid #FFFFFF", "opacity": "1"})
		//$(this).css({"border-color": "green", "opacity": "0.74"});
		$(this).css("border-color", "#FF0000");
		$(this).css("opacity", "0.74");
		$scope.SelectedImageId = $(this).attr("ImgId");
		$scope.SelectedImageName = $(this).attr("ImgName");
		$scope.SelectedImageThumb = $(this).attr("ImgThumb");
		$scope.SelectedImageUrl = $(this).attr("ImgUrl");
		
		
		/* Deleting data for the albums starts here */
			/*window.localStorage['SelectedAlbumId'] = "";
			window.localStorage['SelectedAlbumName'] = "";
			localStorage.removeItem("SelectedAlbumId");
			localStorage.removeItem("SelectedAlbumName");*/
		/* Deleting data for the albums ends here */
		
	});

	$(document).on('click', '#SelectSelectPhoto', function(){
		if($scope.SelectedImageId == undefined) {
			var alertPopup = $ionicPopup.alert({
				title: 'Error',
				cssClass : 'error_msg',
				template: "Please select a photo."
			});
			alertPopup.then(function(res) {
				return false;
			});
		} else {
			window.localStorage['SelectedImageId'] = $scope.SelectedImageId;
			window.localStorage['SelectedImageName'] = $scope.SelectedImageName;
			window.localStorage['SelectedImageThumb'] = $scope.SelectedImageThumb;
			window.localStorage['SelectedImageUrl'] = $scope.SelectedImageUrl;

			window.localStorage['SelectedAlbumId'] = "";
			window.localStorage['SelectedAlbumName'] = "";
			localStorage.removeItem("SelectedAlbumId");
			localStorage.removeItem("SelectedAlbumName");

			var SelectedPhotoId = window.localStorage.getItem("SelectedImageId");
			var SelectedPhotoName = window.localStorage.getItem("SelectedImageName");
			var SelectedPhotoThumb = window.localStorage.getItem("SelectedImageThumb");
			var SelectedPhotoUrl = window.localStorage.getItem("SelectedImageUrl");
			
			$window.location.href = '#/post_news';
		}
	});
})
.controller('NewsDetailCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,$timeout,$ionicSlideBoxDelegate,$ionicModal,$ionicSlideBoxDelegate,$ionicScrollDelegate) {
  	$scope.zoomMin = 1;
  	$scope.showImages = function(index) {
  		$scope.activeSlide = index;
  		$scope.showModal('templates/gallery-zoomview.html');
	};
	$scope.showModal = function(templateUrl) {
	  $ionicModal.fromTemplateUrl(templateUrl, {
	    scope: $scope
	  }).then(function(modal) {
	    $scope.modal = modal;
	    $scope.modal.show();
	  });
	}
	 
	$scope.closeModal = function() {
	  $scope.modal.hide();
	  $scope.modal.remove()
	};
	 
	$scope.updateSlideStatus = function(slide) {
	  var zoomFactor = $ionicScrollDelegate.$getByHandle('scrollHandle' + slide).getScrollPosition().zoom;
	  if (zoomFactor == $scope.zoomMin) {
	    $ionicSlideBoxDelegate.enableSlide(true);
	  } else {
	    $ionicSlideBoxDelegate.enableSlide(false);
	  }
	};
	$scope.init = function () {
		$scope.NewsDetails = JSON.parse(window.localStorage.getItem("NewsDetails"));
		console.log($scope.NewsDetails);
		$("#content-loader").hide();
	};
	$scope.GoBack = function() {
		$("#content-loader").show();
		$window.history.back();
	};
	$scope.nextSlide = function() {
    	$ionicSlideBoxDelegate.next();
  	}
})
.controller('SelectFeedsCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,SelectKeywordsFactory,$base64) {
	$("#content-loader").show();
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	var AllKeywordsSitedata = [];
	var AllKeywordsPresent = '';
	$scope.init = function () { 
		var result = SelectKeywordsFactory.getAllKeywords($base64.encode(orgId),$base64.encode(auth_token));
		result.success(function(data){
		//alert(JSON.stringify(data, null, 4));
		//alert(data.new_keywords.length);
		
			var SelectCheckedKeywordsDataArray = window.localStorage.getItem("SelectedKeywordsDataArray");
			angular.forEach(data.new_keywords, function (keywordfld, key){
				//AllKeywordsSitedata.push({id:keywordfld.id, name:keywordfld.name});
				if(SelectCheckedKeywordsDataArray){
					console.log($.inArray( parseInt(keywordfld.id), JSON.parse(SelectCheckedKeywordsDataArray)));
					if($.inArray( parseInt(keywordfld.id), JSON.parse(SelectCheckedKeywordsDataArray)) >= 0){
						var KeywordChecked = 'checked="checked"';
					}else{
						var KeywordChecked = '';
					}
				}else{
					var KeywordChecked = '';
				}
				
				AllKeywordsPresent = AllKeywordsPresent+'<div class="mt10 mb10 bdr" style="padding: 10px 5px 5px;"><div class="fl nrm-fnt" style="padding-top:5px;">'+keywordfld.name+'</div><div class="fr sche-tog"><label class="toggle toggle-balanced"><input type="checkbox" class="chk-keywords" '+KeywordChecked+' value="'+keywordfld.id+'" keywordName="'+keywordfld.name+'"/><div class="track"><div class="handle"></div></div></label></div><div class="cb"></div></div>';
				
			});
			//console.log(AllKeywordsSitedata);
			$scope.AllKeywordsSitedataMore = AllKeywordsSitedata;
			
			$(".AllKeywords").html(AllKeywordsPresent);
			$("#content-loader").hide();
		});
	};
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		//$("#content-loader").show();
		$window.history.back();
	};	
	$(document).on('click', '.SetKeywordValues', function(){
		sitekeywordscount = $(".chk-keywords").length; //Total keywords count
		var countKeyword = 0;
		var keywords = [];
		if(sitekeywordscount > 0){
		var AllSelectedKeywords = '';
		var AllSelectedKeywordsNames = '';
			$(".chk-keywords").each(function(){
				if($(this).is(':checked')){
					AllSelectedKeywords = AllSelectedKeywords + $(this).val()+',';
					AllSelectedKeywordsNames = AllSelectedKeywordsNames + $(this).attr('keywordName')+', ';
					keywords.push(parseInt($(this).val()));
					countKeyword++;
				}
			});
		AllSelectedKeywords = AllSelectedKeywords.substring(0, (AllSelectedKeywords.length-1));
		AllSelectedKeywordsNames = AllSelectedKeywordsNames.substring(0, (AllSelectedKeywordsNames.length-2));
		}
		
		console.log(keywords); // ['soccer', 'baseball', 'football', 'swimming']
		console.log(keywords);
		if(countKeyword > 0){
			window.localStorage["SelectedKeywordsData"] = AllSelectedKeywords;
			window.localStorage["SelectedKeywordsDataNames"] = AllSelectedKeywordsNames;
			window.localStorage["SelectedKeywordsDataArray"] = JSON.stringify(keywords);
		}else{
			window.localStorage["SelectedKeywordsData"] = '';
			window.localStorage["SelectedKeywordsDataNames"] = '';
			window.localStorage["SelectedKeywordsDataArray"] = '';
		}
		$window.location.href = '#/post_site_news';
	});	
})
/************************************************** News ***********************************************************/
/*************************************** Make payment/orders *************************************************/
.controller('OrderCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,OrderHistoryFactory,$base64,$ionicScrollDelegate,$filter,$timeout) {
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	$scope.order_typ = '';
	//$scope.noMoreItemsAvailable = false;
	$scope.isMessage = false;
	if(window.localStorage.getItem("OrderList")) {
		$scope.noMoreItemsAvailable = true;
		$scope.orders = JSON.parse(window.localStorage.getItem("OrderList"));
		var page = parseInt(window.localStorage.getItem("order_page"));
		$timeout(function() {
			$scope.noMoreItemsAvailable = false;
		}, 200);
	} else {
		$scope.noMoreItemsAvailable = false;
		var page = 0;
		$scope.orders = [];
	}
	$scope.init = function () {
		$("#content-loader").hide();
		if(window.localStorage.getItem("orderType")) {
			$scope.order_typ = window.localStorage.getItem("orderType");
			window.localStorage.removeItem("orderType");
		} else {
			$scope.order_typ = 'awaiting_payment';
		}
		if($scope.order_typ == 'awaiting_payment') {
			$("#awaiting_payment").addClass("active");
			$("#past").removeClass("active");
		} else if($scope.order_typ == 'past') {
			$("#past").addClass("active");
			$("#awaiting_payment").removeClass("active");
		}
		window.localStorage["orderType"] = $scope.order_typ;
	};
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		$window.history.back();
	};
	$scope.showDetail = function() {
		$window.location.href = '#/order_detail';
	};
	$scope.makePayment = function(OrderId) {
		window.localStorage["OrderDetail"] = JSON.stringify($filter('filter')($scope.orders, {business_id: OrderId },true)[0]);
		window.localStorage["order_page"] = page;
		window.localStorage["OrderList"] = JSON.stringify($scope.orders);
		window.localStorage["BackMakePayment"] = window.location.hash;
		$window.location.href = '#/make_payment';
	};
	$scope.changeOrder = function(OrdTyp) {
		$ionicScrollDelegate.$getByHandle('small').scrollTop(true);
		$scope.isMessage = false;
		page = 0;
		$scope.noMoreItemsAvailable = false;
		$scope.orders = [];
		$scope.order_typ = OrdTyp;
		if(OrdTyp == 'awaiting_payment') {
			$("#awaiting_payment").addClass("active");
			$("#past").removeClass("active");
		} else if(OrdTyp == 'past') {
			$("#past").addClass("active");
			$("#awaiting_payment").removeClass("active");
		}
		window.localStorage["orderType"] = OrdTyp;
	};
	$scope.LoadMore = function() {
		page = page+1;
		var order_typ = $scope.order_typ;
		var result = OrderHistoryFactory.orderHistory($base64.encode(orgId),$base64.encode(auth_token),$scope.order_typ,page,PerPage);
		result.success(function(data) {
			if(data[order_typ].length == 0 && $scope.orders.length == 0) {
				$scope.isMessage = true;
			}
			if(data[order_typ].length) {
				if(data[order_typ].length < PerPage) {
					$scope.noMoreItemsAvailable = true;
				}
				$scope.$broadcast('scroll.infiniteScrollComplete');
				for(var i in data[order_typ]) {
					var res = data[order_typ][i].date.split(" ");
					data[order_typ][i].actual_date = new Date(res[0]).getTime();
					data[order_typ][i].date = moment(res[0]).format('MMM DD,YYYY').replace(",", ", ");
					data[order_typ][i].time = res[1];
                       if(data[order_typ][i].outstanding_balance_amount.toString().indexOf(',') === -1) {
                       data[order_typ][i].outstanding_balance_amount = data[order_typ][i].outstanding_balance_amount.toFixed(2);
                       }
					$scope.orders.push(data[order_typ][i]);
				}
			} else {
				$scope.noMoreItemsAvailable = true;
			}
			$("#content-loader").hide();
		});
		result.error(function(data) {
			console.log(data);
		});
	};
	$scope.showDetail = function(OrderId) {
		window.localStorage["OrderDetail"] = JSON.stringify($filter('filter')($scope.orders, {business_id: OrderId },true)[0]);
		window.localStorage["order_page"] = page;
		window.localStorage["OrderList"] = JSON.stringify($scope.orders);
		$window.location.href = "#/order_detail";
	}
})

.controller('OrderDetailCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window) {
	$scope.init = function () {
		$scope.orderDetail = JSON.parse(window.localStorage.getItem("OrderDetail"));
		console.log($scope.orderDetail);
		if(window.localStorage.getItem("orderType")) {
			$scope.orderType = window.localStorage.getItem("orderType");
		}
        /*if($scope.orderDetail.outstanding_balance_amount.toString().indexOf(',') === -1) {
             $scope.orderDetail.outstanding_balance_amount = $scope.orderDetail.outstanding_balance_amount.toFixed(2);
        }*/
        if(window.localStorage.getItem("place_order_payment") == 1) {
        	$("#success_div").show();
        	window.localStorage.removeItem("place_order_payment");
        }
		$("#content-loader").hide();
	};
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		//$window.history.back();
		$window.location.href = '#/orders';
	};
	$scope.makePayment = function() {
		window.localStorage["BackMakePayment"] = window.location.hash;
		$window.location.href = '#/make_payment';
	};
	$scope.showRegdInf = function(id) {
		$("#RegInfDiv_"+id).toggle(300);
	};
})

.controller('MakePaymentCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,CreditCardFactory,$base64,$filter,$ionicPopup,payNowFactory,$filter) {
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	$scope.totAmt = 0;
	$scope.isDisabled = true;
	if($scope.totAmt.toString().indexOf('.') === -1) {
		$scope.totAmt = $scope.totAmt.toFixed(2);
	}
	$scope.isError = false;
	var PriceArr = [];
	$scope.init = function () {
		window.localStorage.removeItem('CreditCartCount');
		$scope.orderDetail = JSON.parse(window.localStorage.getItem("OrderDetail"));
		/*if($scope.orderDetail.outstanding_balance_amount.toString().indexOf(',') === -1) {
			$scope.orderDetail.outstanding_balance_amount = $scope.orderDetail.outstanding_balance_amount.toFixed(2);
		}*/
		if($scope.orderDetail.product_line_items.length) {
			for(var i in $scope.orderDetail.product_line_items) {
				$scope.orderDetail.product_line_items[i].id = 'p'+(parseInt(i)+1);
			}
		}
		$("#content-loader").hide();
		loadCreditCardInfo();
	};
	function loadCreditCardInfo() {
		$("#payment_loader").show();
		var result = CreditCardFactory.creditCardList($base64.encode(orgId),$base64.encode(auth_token));
		result.success(function(data) {
			if(data.credit_cards.length) {
				window.localStorage['CreditCartCount'] = data.credit_cards.length;
				$scope.activeCreditCard = $filter('filter')(data.credit_cards, {is_active: true},true)[0];
				if($scope.activeCreditCard) {
                       $scope.isError = false;
					   $scope.isDisabled = false;
                       
                } else {
						$scope.isDisabled = true;
						$scope.isError = true;
                }
			} else {
				$scope.isDisabled = true;
				$scope.isError = true;
			}
			$("#payment_loader").hide();
			$(".payment_inf").show();
		});
		result.error(function(data) {
			$("#payment_loader").hide();
			$(".payment_inf").show();
		});
	}
	$scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
		if(window.localStorage.getItem("paymentResult")) {
			var parsepayment = JSON.parse(window.localStorage.getItem("paymentResult"));
			for(var i in parsepayment) {
				$("#"+parsepayment[i].id).val(parsepayment[i].value);
				if(parsepayment[i].ischecked) {
					$("#check_"+parsepayment[i].id).prop("checked",true);
					$("#"+parsepayment[i].id).prop("disabled",true);
				}
			}
			$scope.CalculateSum();
			window.localStorage.removeItem("paymentResult");
		}
	});
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		//$window.history.back();
		$window.location.href = window.localStorage.getItem('BackMakePayment');
	};
	$scope.CalculateSum = function() {
		$scope.totAmt = 0;
		$(".payment_amount").each(function() {
			if($(this).val() && $.isNumeric($(this).val()))
			$scope.totAmt = $scope.totAmt + parseFloat($(this).val(), 10);
		});
		if($scope.totAmt.toString().indexOf('.') === -1) {
			$scope.totAmt = $scope.totAmt.toFixed(2);
		}
	}
	$scope.openPaymentMethod = function() {
		var paymentArr = [];
		$(".payment_amount").each(function() {
			var ischecked = false;
			if($("#check_"+$(this).attr("id")).prop("checked") == true) {
				var ischecked = true;
			}
			paymentArr.push({id:$(this).attr("id"),value:$(this).val(),ischecked:ischecked});
		});
		window.localStorage["paymentResult"] = JSON.stringify(paymentArr);
		window.localStorage["prev_hash_paymethod"] = window.location.hash;
		$window.location.href = '#/payment_methods';
	}
	$scope.addCreditCard = function() {
		window.localStorage['BackAddCC'] = window.location.hash;
		$window.location.href = '#/creditcard';
	}
	$scope.checkpayment = function(id,balance) {
		if($("#"+id).prop("checked") == true) {
			$("#"+id).parent().parent().parent().parent().parent().find('.payment_amount').prop("disabled", true);
			$("#"+id).parent().parent().parent().parent().parent().find('.payment_amount').val(balance);
		}else{
			$("#"+id).parent().parent().parent().parent().parent().find('.payment_amount').prop("disabled", false);
			$("#"+id).parent().parent().parent().parent().parent().find('.payment_amount').val('');
		}
		$scope.CalculateSum();
	}
	$scope.paynow = function(orderId) {
		valid = 0;
		//store_price();
		var str;
		var str_final;
		var x = validate_field();
		if(x) {
			$("#loader-span").show();
			$(".payment_amount").each(function() {
				var regId = $(this).attr('id');
				var payval = $(this).val();
				if($(this).prop('disabled')) {
					valid = 1;
					str = 'items['+regId+'][payment_option]=balance&wepay.x=Place Your Order&id='+orderId;
				} else {
					if($(this).val()) {
						if(parseFloat($(this).val()) <= parseFloat($(this).attr('max_val'))) {
							valid = 1;
							str = 'items['+regId+'][payment_option]=custom&items['+regId+'][custom_payment_amount]='+payval+'&wepay.x=Place Your Order&id='+orderId;
						} else {
							valid = 0;
							var alertPopup = $ionicPopup.alert({
								title: 'Error',
								cssClass : 'error_msg',
								template: "Your amount shouldn't be more than $"+$(this).attr('max_val')
							});
							alertPopup.then(function(res) {
								$("#loader-span").hide();
								return false;
							});
						}
					}
				}
				if(str_final){
					str_final += '&'+str;
				}else{
					str_final = str;
				}
			});
			if(str_final && valid) {
				var result = payNowFactory.payNow($base64.encode(orgId),$base64.encode(auth_token),str_final);
				result.success(function(data) {
					var alertPopup = $ionicPopup.alert({
						title: 'Payment Status',
						cssClass : 'error_msg',
						template: data.message
					});
					alertPopup.then(function(res) {
						if(window.localStorage.getItem("OrderList")) {
							window.localStorage.removeItem("OrderList");
							window.localStorage.removeItem("order_page");
						}
						data.order.outstanding_balance_amount = parseFloat(data.order.outstanding_balance_amount)-parseFloat($scope.totAmt);
						if(data.order.outstanding_balance_amount == 0) {
							window.localStorage['orderType'] = 'past';
						} else {
							window.localStorage['orderType'] = 'awaiting_payment';
						}
						var res = data.order.date.split(" ");
						data.order.date = moment(res[0]).format('MMM DD,YYYY').replace(",", ", ");
						window.localStorage['OrderDetail'] = JSON.stringify(data.order);
						$window.location.href = "#/order_detail";
					});
				});
				result.error(function(data) {
					$("#loader-span").hide();
					$("#error_div").show();
					$("#payment_error").html(data.message);
					$("#payment_inf").hide();
					loadCreditCardInfo();
				});
			}
		}
	}
	function validate_field () {
		var x = false;
		var total = $(".payment_amount").length;
		var count = 0;
		$(".payment_amount").each(function() {
			if(($(this).prop('disabled') == false && $(this).val()) || ($(this).prop('disabled') == true)) {
				count++;
			}
		});
		if(count) {
			x = true;
		} else {
			var alertPopup = $ionicPopup.alert({
				title: 'Error',
				cssClass : 'error_msg',
				template: "Please enter price."
			});
		}
		return x;
	}
})
/*************************************** Make payment/orders *************************************************/
/*Team and Team payments*/
.controller('TeamCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,TeamFactory,$base64,$filter) {
	$("#content-loader").show();
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	$scope.isError = false;
	$scope.teams = [];
	$scope.init = function () {
		if(window.localStorage.getItem('TeamList')) {
			$scope.teams = JSON.parse(window.localStorage.getItem('TeamList'));
			$("#content-loader").hide();
		} else {
			var result = TeamFactory.getTeamList($base64.encode(orgId),$base64.encode(auth_token));
			result.success(function(data) {
				if(data.team_infos.length) {
					$scope.teams = data.team_infos;
					$scope.teams.sort(function (a, b) {
						return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
					});
                    for(var i in $scope.teams) {
                        if($scope.teams[i].amount != 'N/A') {
                           $scope.teams[i].amount = parseFloat($scope.teams[i].amount).toFixed(2);
                        }
                    }
					$("#content-loader").hide();
				} else {
					$("#content-loader").hide();
					$scope.isError = true;
					$("#err_msg").show();
				}
			});
			result.error(function(data) {});
		}
	};
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.openDetail = function(teamId) {
		var teamId = parseInt(teamId);
		var teamDetail = $filter('filter')($scope.teams, {id: teamId},true)[0];
		window.localStorage['TeamDetail'] = JSON.stringify(teamDetail);
		window.localStorage['TeamList'] = JSON.stringify($scope.teams);
		$window.location.href = '#/team_details';
	}
	$scope.teamPayment = function(teamId) {
		var teamId = parseInt(teamId);
		var teamDetail = $filter('filter')($scope.teams, {id: teamId},true)[0];
		window.localStorage['TeamDetail'] = JSON.stringify(teamDetail);
		window.localStorage['TeamList'] = JSON.stringify($scope.teams);
		window.localStorage['BackTeamPayment'] = window.location.hash;
		$window.location.href = '#/team_payment';
	}
	$scope.getItemHeight = function(team) {
		// console.log(team);
		if(team.label != 'N/A' && team.amount != 'N/A') {
			var height = '160px';
		} else {
			var height = '90px';
		}
    	return height;
 	};
})
.controller('TeamDetailCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,$base64,nextGameFactory,displayDayService) {
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	$scope.init = function () {
		if(window.localStorage.getItem('TeamDetail')) {
			$scope.team_detail = JSON.parse(window.localStorage.getItem('TeamDetail'));
			$scope.teamId = $scope.team_detail.id;
		}
		if($scope.teamId) {
			$("#load_game").show();
			var result = nextGameFactory.getNextGame($base64.encode(orgId),$base64.encode(auth_token),$scope.teamId);
			result.success(function(data) {
				$("#load_game").hide();
				if(data.upcoming_schedules.length) {
					for(var i in data.upcoming_schedules) {
						if(data.upcoming_schedules[i].date) {
							var date = data.upcoming_schedules[i].date;
							var res = date.split(" ");
							data.upcoming_schedules[i].day = displayDayService.showFullDay(res[0]);
							data.upcoming_schedules[i].date = moment(res[1]).format('MMMM DD');
						}
					}
					$scope.next_games = data.upcoming_schedules;
					$("#next_game_info").show();
				} else {
					$("#load_game").hide();
					$("#no_data").show();
				}
			});
			result.error(function(data) {
				$("#load_game").hide();
				$("#no_data").show();
			});
		}
		$("#content-loader").hide();
	};
	$scope.myGoBack = function() {
		$window.location.href = '#/team';
	};
	$scope.teamPayment = function() {
		window.localStorage['BackTeamPayment'] = window.location.hash;
		$window.location.href = '#/team_payment';
	}
	$scope.scheduleResult = function(teamId) {
        window.localStorage['team_id_schedule'] = teamId;
		$window.location.href = '#/team_schedule';
	}
	$scope.teammembersdetail = function(teamId,teamname) {
		$("#content-loader").show();
        window.localStorage['team_id_details'] = teamId;
		window.localStorage['team_name_details'] = teamname;
		window.localStorage['back_roster'] = window.location.hash;
		$window.location.href = '#/roster';
	}
	$scope.teamstandings = function(teamId,activityId,teamname) {
		$("#content-loader").show();
        window.localStorage['team_id_standing'] = teamId;
		window.localStorage['activity_id_standing'] = activityId;
		window.localStorage['team_name_standing'] = teamname;
		$window.location.href = '#/standing';
	}
	$scope.teamsendmessage = function(teamId,activityId) {
		$("#content-loader").show();
        window.localStorage['team_id_msg'] = teamId;
		window.localStorage['activity_id_msg'] = activityId;
		$window.location.href = '#/send_message';
	}
	$scope.teamNews = function(teamId,activityId) {
		$("#content-loader").show();
        window.localStorage['team_id_news'] = teamId;
		window.localStorage['activity_id_news'] = activityId;
		$window.location.href = '#/news_list';
	}
	$scope.teamphotos = function() {
		$("#content-loader").show();
		$window.location.href = '#/photos';
	}
})
.controller('TeamPaymentCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,TeamFactory,$base64,$filter,CreditCardFactory,$ionicPopup,PayTeamAmountFactory) {
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	$scope.isDisabled = true;
	$scope.init = function () {
		window.localStorage.removeItem('CreditCartCount');
		$scope.team_detail = JSON.parse(window.localStorage.getItem('TeamDetail'));
		$("#payment_loader").show();
		loadCreditCardInfo();
		if(window.localStorage.getItem("TeamPaymentResult")) {
			$timeout(function() {
					var parsepayment = JSON.parse(window.localStorage.getItem("TeamPaymentResult"));
					console.log(parsepayment[0]);
					$("#"+parsepayment[0].id).val(parsepayment[0].value);
					if(parsepayment[0].ischecked) {
						$("#check_"+parsepayment[0].id).prop("checked",true);
						$("#"+parsepayment[0].id).prop("disabled",true);
					}
					window.localStorage.removeItem("TeamPaymentResult");
					$("#content-loader").hide();
			}, 1000);
		} else {
			$("#content-loader").hide();
		}
	};
	function loadCreditCardInfo() {
		$("#payment_loader").show();
		var result = CreditCardFactory.creditCardList($base64.encode(orgId),$base64.encode(auth_token));
		result.success(function(data) {
			if(data.credit_cards.length) {
				window.localStorage['CreditCartCount'] = data.credit_cards.length;
				$scope.activeCreditCard = $filter('filter')(data.credit_cards, {is_active: true},true)[0];
				if($scope.activeCreditCard) {
                       $scope.isError = false;
					   $scope.isDisabled = false;                      
                } else {
						$scope.isDisabled = true;
						$scope.isError = true;
                }
			} else {
				$scope.isDisabled = true;
				$scope.isError = true;
			}
			$("#payment_loader").hide();
			$("#payment_inf").show();
		});
		result.error(function(data) {
			$("#payment_loader").hide();
			$("#payment_inf").show();
		});
	}
	$scope.myGoBack = function() {
		//$window.history.back();
		$window.location.href = window.localStorage.getItem("BackTeamPayment");

	};
	$scope.checkpayment = function(team_id,amount) {
		if($("#check_"+team_id).prop("checked") == true) {
			$("#"+team_id).prop("disabled", true);
			$("#"+team_id).val(parseFloat(amount));
		} else {
			$("#"+team_id).prop("disabled", false);
			$("#"+team_id).val('');
		}
	};
	$scope.addCreditCard = function() {
		window.localStorage['BackAddCC'] = window.location.hash;
		$window.location.href = '#/creditcard';
	};
	$scope.openPaymentMethod = function(team_id) {
		var ischecked = false;
		var paymentArr = [];
		if($("#check_"+team_id).prop("checked") == true) {
			var ischecked = true;
		}
		paymentArr.push({id:team_id,value:$("#"+team_id).val(),ischecked:ischecked});
		window.localStorage["TeamPaymentResult"] = JSON.stringify(paymentArr);
		window.localStorage["prev_hash_paymethod"] = window.location.hash;
		$window.location.href = '#/payment_methods';
	}
	$scope.paynow = function(teamId) {
		var remaining_amount = 0;
		$("#loader-span").show();
		var str;
		var payval = $("#"+teamId).val();
		if($("#"+teamId).prop('disabled') == false && !$("#"+teamId).val()) {
			var alertPopup = $ionicPopup.alert({
				title: 'Error',
				cssClass : 'error_msg',
				template: "Please enter price."
			});
			alertPopup.then(function(res) {
				$("#loader-span").hide();
				return false;
			});
		}
		if($("#"+teamId).prop('disabled')) {
			str = 'payment_option=balance&wepay.x=Place Your Order&controller=teams&action=pay&activity='+$scope.team_detail.activity_permalink+'&id='+teamId;	
		} else {
			if($("#"+teamId).val()) {
				if(parseFloat($("#"+teamId).val()) <= parseFloat($("#"+teamId).attr('max_val'))) {
					remaining_amount = parseFloat($("#"+teamId).attr('max_val'))-parseFloat($("#"+teamId).val());
					str = 'payment_option=custom&custom_payment_amount='+payval+'&wepay.x=Place Your Order&activity='+$scope.team_detail.activity_permalink+'&id='+teamId;
				} else {
					var alertPopup = $ionicPopup.alert({
						title: 'Error',
						cssClass : 'error_msg',
						template: "Your amount shouldn't be more than $"+$("#"+teamId).attr('max_val')
					});
					alertPopup.then(function(res) {
						$("#loader-span").hide();
						return false;
					});
				}
			}
		}
		if(str) {
			var result = PayTeamAmountFactory.paynow($base64.encode(orgId),$base64.encode(auth_token),str);
			result.success(function(data) {
				if(remaining_amount) {
					var suc_msg = "Thank you for paying $"+parseFloat($("#"+teamId).val()).toFixed(2);
				} else {
					var suc_msg = data.message;
				}
				var alertPopup = $ionicPopup.alert({
					title: 'Payment Status',
					cssClass : 'error_msg',
					template: suc_msg
				});
				alertPopup.then(function(res) {
					if(window.localStorage.getItem('TeamList')) {
						window.localStorage.removeItem('TeamList');
					}
					if(data.team.amount != 'N/A') {
                        data.team.amount = parseFloat(data.team.amount).toFixed(2);
                    }
                    window.localStorage['TeamDetail'] = JSON.stringify(data.team);
                    $("#loader-span").hide();
                    $window.location.href = '#/team_details';
				});
			});
			result.error(function(data) {
				$("#loader-span").hide();
				$("#error_div").show();
				$("#payment_error").html(data.message);
				$("#payment_inf").hide();
				loadCreditCardInfo();
			});
		}
	};
})
.controller('TeamScheduleCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,TeamFactory,$base64,$filter,$ionicPopup,teamScheduleFactory,displayDayService,$ionicScrollDelegate,$ionicPosition,$location) {
	$("#content-loader").hide();
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
    var teamId = window.localStorage.getItem("team_id_schedule");

	var recent_page = 0;
	var upcoming_page = 0;
	var today = 0;
    //window.localStorage.removeItem("team_id_schedule");
	$scope.init = function () {
		$("#today_btn").hide();
		$scope.event_type = '';
		$scope.schedules = [];
		$scope.noMoreUpcomingEvent = false;
		$scope.noMoreRecentEvent = false;
	};
	$scope.LoadUpcoming = function() {
		$scope.event_type = 'upcoming';
		if(!$scope.noMoreUpcomingEvent) {
			loadSchedule();
		}
	};
	$scope.doRefresh = function() {
		if(!$scope.noMoreRecentEvent) {
			$scope.event_type = 'completed';
			loadSchedule();
		} else {
			$scope.$broadcast('scroll.refreshComplete');
		}
	};
	$scope.myGoBack = function() {
		$window.location.href = '#/team_details';
	};
	//Load more schedules
	function loadSchedule() {
		if($scope.event_type == 'upcoming') {
			var arr_typ = 'upcoming_schedules';
			upcoming_page = upcoming_page+1;
			var page = upcoming_page;
		} else if($scope.event_type == 'completed') {
			var arr_typ = 'completed_events';
			recent_page = recent_page+1;
			var page = recent_page;
		}
		$timeout(function() {
			var result = teamScheduleFactory.getSchedules($base64.encode(orgId),$base64.encode(auth_token),teamId,$scope.event_type,page,PerPage);
			result.success(function(data) {
				if(data[arr_typ].length < PerPage) {
					if($scope.event_type == 'upcoming') {
						$scope.noMoreUpcomingEvent = true;
					} else if($scope.event_type == 'completed') {
						$scope.noMoreRecentEvent = true;
						$scope.$broadcast('scroll.refreshComplete');
					}	
				} else {
					if($scope.event_type == 'completed') {
						$scope.$broadcast('scroll.refreshComplete');
					}
				}
				if((data[arr_typ] && data[arr_typ].length>0)) {
					$scope.$broadcast('scroll.infiniteScrollComplete');
						for (var i in data[arr_typ]) {
							if(i==0 && page == 1 && $scope.event_type == 'upcoming') {
								today = data[arr_typ][i].id;console.log(today);
							}
							if($scope.event_type == 'completed' && data[arr_typ][i].home_score != null && data[arr_typ][i].visiting_score != null) {
								var home_score_arr = [];
								var visit_score_arr = [];
								var result = [];
								if(data[arr_typ][i].home_score.indexOf(',') === -1) {
									home_score_arr[0] = data[arr_typ][i].home_score;
								} else {
									home_score_arr = data[arr_typ][i].home_score.split(",");
								}
								if(data[arr_typ][i].visiting_score.indexOf(',') === -1) {
									visit_score_arr[0] = data[arr_typ][i].visiting_score;
								} else {
									visit_score_arr = data[arr_typ][i].visiting_score.split(",");
								}
								for(var j in home_score_arr) {
									result.push({homeScore:parseInt(home_score_arr[j]),visitScore:parseInt(visit_score_arr[j])});
								}
								data[arr_typ][i].score = result;
							}
							data[arr_typ][i].event_type = $scope.event_type;
							if(data[arr_typ][i].date != "NA") {
								var day_date = data[arr_typ][i].date;
								var res = day_date.split(" ");
								data[arr_typ][i].actual_date = new Date(res[1]).getTime();
								data[arr_typ][i].day = displayDayService.showFullDay(res[0]);
								data[arr_typ][i].date = moment(res[1]).format('MMMM DD,YYYY').replace(",", ", ");
							} else {
								data[arr_typ][i].actual_date = "";
								data[arr_typ][i].day = "";
								data[arr_typ][i].date = "";
							}
							if($scope.event_type == 'upcoming') {
								$("#today_btn").show();
								$scope.schedules.push(data[arr_typ][i]);
							} else if($scope.event_type == 'completed') {
								$scope.schedules.unshift(data[arr_typ][i]);
							}
						}
				} else {
					if(page = 1 && data[arr_typ].length == 0 && $scope.event_type == 'upcoming') {
						$scope.noMoreUpcomingEvent = true;
						$("#error_content").show();
						$("#error_content").html("There are currently no upcoming events in your calendar.");
						$("#today_btn").hide();
						//$scope.doRefresh();
					}
					if(page = 1 && data[arr_typ].length == 0 && $scope.event_type == 'completed' && $scope.schedules.length==0) {
						$scope.noMoreUpcomingEvent = true;
						$scope.noMoreRecentEvent == true
						$("#error_content").show();
						$("#error_content").html("There are currently no events in your calendar. ");
					}
					if($scope.event_type == 'upcoming') {
						$scope.noMoreUpcomingEvent = true;
					} else if($scope.event_type == 'completed') {
						$scope.noMoreRecentEvent = true;
						$scope.$broadcast('scroll.refreshComplete');
					}
				}
			});
			result.error(function(data) {});
		},1000);
	}
    $scope.goToday = function() {
       $timeout(function (){
           $location.hash(today);
           $ionicScrollDelegate.anchorScroll(true);
       })
	};
	$scope.showLocation = function(location) {
        window.localStorage["prev_hash"] = window.location.hash;
        $("#content-loader").show();
        $window.location.href = "#/google_map/"+location;
    };
})
/*End of Team and Team payments*/
.controller('SendMessageCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,$base64,sendMsgFactory,$ionicPopup) {
									   
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	var teamId = window.localStorage.getItem("team_id_msg");
	var activityId = window.localStorage.getItem("activity_id_msg");									   
	
	$scope.init = function () {
		$("#content-loader").hide();
	};
	
	$("#BtnSndMsg").click(function(){
		$("#loader-span3").show();
		var Subject = $("#msgSubject").val();
		var Message = $("#msgText").val();
		var msgCordinate = $("#msgCordinate").val();
		var msgRoster = $("#msgRoster").val();
		
		if(Subject == ''){
			var alertPopup = $ionicPopup.alert({
				title: 'Error',
				cssClass : 'error_msg',
				template: "Please enter subject to send."
			});
			$("#loader-span3").hide();
			return false;
		}else if(Message == ''){
			var alertPopup = $ionicPopup.alert({
				title: 'Error',
				cssClass : 'error_msg',
				template: "Please enter message to send."
			});
			$("#loader-span3").hide();
			return false;
		}else if( !$('#msgCordinate').is(":checked") && !$('#msgRoster').is(":checked")){
			var alertPopup = $ionicPopup.alert({
				title: 'Error',
				cssClass : 'error_msg',
				template: "Please check atleast one send message to option."
			});
			$("#loader-span3").hide();
			return false;
		}
		
		if($('#msgCordinate').is(":checked")){
			var cordinateChk = '1';
		}else{
			var cordinateChk = '0';
		}
		
		if($('#msgRoster').is(":checked")){
			var rosterChk = '1';
		}else{
			var rosterChk = '0';
		}

		var result = sendMsgFactory.SendMsg($base64.encode(orgId),$base64.encode(auth_token),teamId,activityId,Subject,Message,cordinateChk,rosterChk);
		result.success(function(data){console.log(data);
			var alertPopup = $ionicPopup.alert({
				title: 'Success',
				cssClass : 'error_msg',
				template: data.message
			});
			alertPopup.then(function(res) {
				$("#loader-span3").hide();
				$window.location.href = '#/team_details';
			});
		});		
	});
	$scope.myGoBack = function() {
		$window.history.back();
	};
})
.controller('StandingCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,$base64,getTeamStandingFactory) {
	$("#content-loader").show();
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	var teamId = window.localStorage.getItem("team_id_standing");
	var activityId = window.localStorage.getItem("activity_id_standing");
	var teamName = window.localStorage.getItem("team_name_standing");
	$scope.init = function () {
		var DisplayTeamStanding = '';
		var result = getTeamStandingFactory.getTeamStand($base64.encode(orgId),$base64.encode(auth_token),teamId,activityId);
		result.success(function(data){
			if(data.team_standings.length > 0){
				DisplayTeamStanding = '<table id="teamStand"><tbody><tr><th>Team</th><th>W</th><th>L</th><th>T</th><th>%</th></tr>';
				
				angular.forEach(data.team_standings, function (datefld, key){
					DisplayTeamStanding += '<tr><td style="color:black;">'+datefld.name+'</td><td>'+datefld.standings[0][0].score+'</td><td>'+datefld.standings[1][0].score+'</td><td>'+datefld.standings[2][0].score+'</td><td>'+datefld.standings[3][0].score.toFixed(3)+'</td></tr>';
				});
				
				DisplayTeamStanding += '</tbody></table>';
				
				$("#PutTeamStandings").html(DisplayTeamStanding);
				$("#content-loader").hide();
			}
		});
	};
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		//$("#content-loader").show();
		$window.history.back();
	};
})
.controller('RosterCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,getTeamMemberFactory,$base64) {


	$("#content-loader").show();
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	var teamId = window.localStorage.getItem("team_id_details");
	var teamName = window.localStorage.getItem("team_name_details");
	$scope.init = function() {

		$("#load_coordinate").show();
		$("#load_roster").show();
		var result = getTeamMemberFactory.getTeamMem($base64.encode(orgId),$base64.encode(auth_token),teamId);
		result.success(function(data){
			//alert(JSON.stringify(data, null, 4));
			//alert(data.coordinators.length);
			//alert(data.rosters.length);
			
			if(data.coordinators.length > 0){
				$scope.Coordinators = data.coordinators;
				$("#load_coordinate").hide();
			}else{
				$("#no_coordinate").show();
				$("#load_coordinate").hide();
			}
			
			if(data.rosters.length > 0){
				$scope.rosters = data.rosters;
				$("#load_roster").hide();
			}else{
				$("#no_rosters").show();
				$("#load_roster").hide();
			}
			$scope.TeamName = teamName;
			
			$scope.may_add_coordinator = data.may_add_coordinator;
			$scope.may_add_to_roster = data.may_add_to_roster;
			
		});

			/*var CoordinatorArr = [];
			for (var i in data1.records) {
				CoordinatorArr.push(data1.records[i]);
			}
			$scope.Coordinators = CoordinatorArr;console.log($scope.Coordinators);
			
			var PlayerArr = [];
			for (var i in data2.records) {
				PlayerArr.push(data2.records[i]);
			}
			$scope.Players = PlayerArr;console.log($scope.Players);*/

		$("#content-loader").hide();	

	};
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.GoBack = function() {
		$("#content-loader").show();
		//$window.history.back();
		window.location.href = window.localStorage.getItem('back_roster');
	};
	$scope.addCoordinator = function(){
		$("#content-loader").show();
		$window.location.href = '#/add_coordinator';
	};
	$scope.addPlayer = function(){
		$("#content-loader").show();
		$window.location.href = '#/add_player';
	};
})
.controller('AddCoordinatorCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,$ionicPopup,$base64) {
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	$scope.team_details = JSON.parse(window.localStorage.getItem('TeamDetail'));
	$scope.team_id = $scope.team_details.id;
	$scope.activity_id = $scope.team_details.activity_id;
	console.log($scope.team_details);
	$scope.init = function () {
		$("#content-loader").hide();
	};
	$scope.GoBack = function() {
		$("#content-loader").show();
		$window.history.back();
	};
	$scope.save_coordinator = function() {
		$("#loader-span3").show();
		var phone = "";
		var role = "";
		var first_name = $("#first_name").val();
		var last_name = $("#last_name").val();
		var email = $("#email").val();
		if($("#phone").val()) {
			var phone = $("#phone").val();
		}
		if($("#role").val()) {
			var role = $("#role").val();
		}
		var is_allow = 0;
		if($("#is_allow").prop("checked")) {
			var is_allow = 1;
		}
		var str = '{"id":"'+$scope.team_id+'","activity":"'+$scope.activity_id+'","team":{"team_coordinators_attributes":{"0":{"person_attributes":{"emails_attributes":{"0":{"address":"'+email+'"}},"first_name":"'+first_name+'","last_name":"'+last_name+'","phone":"'+phone+'"},"role":"'+role+'","is_primary_contact":"1","is_roster_manager":"'+is_allow+'"}}}}';
		console.log(str);
		console.log(JSON.parse(str));
		var URL = API_URL+'/api/v1/teams/'+$base64.encode(auth_token)+'/'+$base64.encode(orgId)+'/add_coordinator';
		console.log(URL);
		if(str) {
			$.ajax({
				type: "POST",
				url: URL,
				data: JSON.parse(str),
				success: function(data){
					var alertPopup = $ionicPopup.alert({
						title: 'Success',
						cssClass : 'error_msg',
						template: 'Coordinator added successfully.'
					});
					alertPopup.then(function(res) {
						$("#loader-span3").hide();
						$window.location.href = '#/roster';
					});
				},
				error: function(data) {
					var alertPopup = $ionicPopup.alert({
						title: 'Error',
						cssClass : 'error_msg',
						template: data.message
					});
					alertPopup.then(function(res) {
						$("#loader-span3").hide();
					});
				}
			});
		}
	}
})
.controller('AddPlayerCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,$ionicPopup,$base64) {
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	$scope.team_details = JSON.parse(window.localStorage.getItem('TeamDetail'));
	$scope.team_id = $scope.team_details.id;
	$scope.activity_id = $scope.team_details.activity_id;
	console.log($scope.team_details);
	$scope.init = function () {
		$("#content-loader").hide();
	};
	$scope.GoBack = function() {
		$("#content-loader").show();
		$window.history.back();
	};
	$scope.save_roster = function() {
		$("#loader-span3").show();
		var first_name = "";
		var last_name = "";
		if($("#first_name").val()) {
			var first_name = $("#first_name").val();
		}
		if($("#last_name").val()) {
			var last_name = $("#last_name").val();
		}
		var email = $("#email").val();
		var str = '{"team":{"team_invites_attributes":{"0":{"person_attributes":{"emails_attributes":{"0":{"address":"'+email+'"}},"first_name":"'+first_name+'","last_name":"'+last_name+'"}}}},"id":"'+$scope.team_id+'","activity":"'+$scope.activity_id+'"}';
		console.log(str);
		console.log(JSON.parse(str));
		var URL = API_URL+'/api/v1/teams/'+$base64.encode(auth_token)+'/'+$base64.encode(orgId)+'/add_roster';
		console.log(URL);
		if(str) {
			$.ajax({
				type: "POST",
				url: URL,
				data: JSON.parse(str),
				success: function(data){
					var alertPopup = $ionicPopup.alert({
						title: 'Success',
						cssClass : 'error_msg',
						template: 'Player added successfully.'
					});
					alertPopup.then(function(res) {
						$("#loader-span3").hide();
						$window.location.href = '#/roster';
					});
				},
				error: function(data) {
					var alertPopup = $ionicPopup.alert({
						title: 'Error',
						cssClass : 'error_msg',
						template: data.message
					});
					alertPopup.then(function(res) {
						$("#loader-span3").hide();
					});
				}
			});
		}
	}
})
.controller('PhotosCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,$base64,getPhotosFactory) {
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	$scope.init = function () {
		$scope.photos = [];
		$scope.team_detail = JSON.parse(window.localStorage.getItem('TeamDetail'));
		var result = getPhotosFactory.getPhotos($base64.encode(orgId),$base64.encode(auth_token),$scope.team_detail.id,$scope.team_detail.activity_id);
		result.success(function(data){
			if(data.team_photos.length) {
				for(var i in data.team_photos) {
					if(data.team_photos[i].media.length) {
						for(var j in data.team_photos[i].media) {
							if(data.team_photos[i].media[j].thumbnail_url != '') {
								var thumbnail_url = data.team_photos[i].media[j].thumbnail_url;
								var parts = thumbnail_url.split('/');
								if(parts[1] == 'assets') {
									data.team_photos[i].media[j].thumbnail_url = ImageUrl+data.team_photos[i].media[j].thumbnail_url;
								}
							}
							if(data.team_photos[i].media[j].url) {
								var url = data.team_photos[i].media[j].url;
								var parts = url.split('/');
								if(parts[1] == 'assets') {
									data.team_photos[i].media[j].url = ImageUrl+data.team_photos[i].media[j].url;
								}
							}
							data.team_photos[i].media[j].src = data.team_photos[i].media[j].url;
							data.team_photos[i].media[j].thumb = data.team_photos[i].media[j].thumbnail_url;
							data.team_photos[i].media[j].sub = data.team_photos[i].media[j].description;
						}
					}
				}
				$scope.photos = data.team_photos;
				console.log($scope.photos);
			} else {
				$("#error").show();
			}
			$("#content-loader").hide();
		});
		result.error(function(data){
			$("#content-loader").hide();
		});
	};
	$scope.GoBack = function() {
		$("#content-loader").show();
		$window.history.back();
	};
})
.controller('MonthsCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,$base64,MonthCalendarFactory,displayDayService,$filter,eventDetailFactory,$ionicScrollDelegate,$state) {
	$scope.countEventArr='';
	$scope.mainEventArr='';
	$scope.showCurrentDate = false;
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	
	$scope.init = function () {
		//alert(11);
		$("#content-loader").show();
		
		if(window.localStorage.getItem("is_manage_filter") && window.localStorage.getItem("is_manage_filter") != '0') {
			if(window.localStorage.getItem("manage_filter_id") != 'all'){
				var AllActivityids = JSON.parse(window.localStorage.getItem("manage_filter_id"));
			}else{
				var AllActivityids = window.localStorage.getItem("manage_filter_id");
			}
		}else{
			var AllActivityids = 'all';
		}
		
		var DayVisited = window.localStorage.getItem("DayVisited"); //get the localstorage value for day visited
		
		if(DayVisited){
			var resdata = DayVisited.split("##");
			var MonthValue = resdata[1];
			var YearValue = resdata[0];
		}else{
			var dateNow = new Date();
			var DateValue = dateNow.getDate(); //17
			var DayValue = dateNow.getDay(); //4 THU
			var YearValue = dateNow.getFullYear(); //2015
			var MonthValue = dateNow.getMonth(); //11	
			MonthValue = MonthValue + 1;
			
			var TodayDateVisit = YearValue+"##"+MonthValue+"##"+DateValue;
			
		}
		
		var mainArrMonth = new Array();
		
		var result = MonthCalendarFactory.monthcalendar($base64.encode(orgId),$base64.encode(auth_token), MonthValue, YearValue, AllActivityids);
		
		var countEventArr = new Array();
		var mainEventArr = new Array();
		var counterArr = 0;
		result.success(function(data){
			//alert(JSON.stringify(data, null, 4));
			if(data.status == 'success'){
				angular.forEach(data.activity_events, function (datefld, key){
					if(datefld.date){
						var day_date = datefld.date;
						var res = day_date.split(" ");
						var ActualDate = new Date(res[1]).getTime();
						var ActualDay = displayDayService.showFullDay(res[0]);
						var OriDate = moment(res[1]).format('MMMM DD,YYYY').replace(",", ", ");
					}
					var dateNow = new Date(OriDate);
					
					var DateV = dateNow.getDate();
					var month = dateNow.getMonth();
					var Year = dateNow.getFullYear(); //2015
					
					Year = Year.toString();
					Year = "20"+Year.substr(Year.length -2);
					
					//alert(dateNow);alert(DateV);alert(month);alert(Year);
					
					countEventArr[Year+"##"+parseInt(month+1)+"##"+DateV] = datefld.id;
					if(!$.isArray(mainEventArr[Year+"##"+parseInt(month+1)+"##"+DateV])){
						mainEventArr[Year+"##"+parseInt(month+1)+"##"+DateV] = [];
						counterArr = 0;
					}else{
						counterArr = counterArr;
					}
					//alert(counterArr);
					//alert(mainEventArr[Year+"##"+parseInt(month+1)+"##"+DateV].length);
					var ccCounter = mainEventArr[Year+"##"+parseInt(month+1)+"##"+DateV].length;
					mainEventArr[Year+"##"+parseInt(month+1)+"##"+DateV][ccCounter] = datefld;
					counterArr++;
				});
				console.log(countEventArr);
				console.log(mainEventArr);
				
				$scope.countEventArr = countEventArr;
				$scope.mainEventArr = mainEventArr;
				
				if(MonthValue != '10' && MonthValue != '11' && MonthValue != '12'){
					MonthValue = '0'+MonthValue;
				}
				
				var DateFormatPass = YearValue+"-"+MonthValue;
				displayCalendar(DateFormatPass);
				if(DayVisited){ //This condition require to the saved date field
					DisplayBackMonthValue(DayVisited);
				}else{ //This condition require to display the events for current date
					window.localStorage["TodayButtonDateVisit"] = TodayDateVisit;
					DisplayBackMonthValue(TodayDateVisit);
				}
			}
		});
		result.error(function(data) {});
		
	};
/*	var ua = navigator.userAgent,
    event = (ua.match(/iPad/i)) ? "touchstart" : "click";*/
	
	$(document).on('click', '.NextClass', function(){
		$("#content-loader").show();
		$scope.showCurrentDate = false;		
		window.localStorage["DayVisited"] = ""; //Require to dsstroy the day visited value
    	localStorage.removeItem("DayVisited");
		
		$("#norecordmonth").hide();
		$("#norecordmonth").html("");
		
		$scope.calendarevents = '';
		var NextMonthClickAttr = $(this).attr("NextMonthClick");
		var NextYearClickAttr = $(this).attr("NextYearClick");
		var countEventArr = new Array();
		var mainEventArr = new Array();
		if(window.localStorage.getItem("is_manage_filter") && window.localStorage.getItem("is_manage_filter") != '0') {
			if(window.localStorage.getItem("manage_filter_id") != 'all'){
				var AllActivityids = JSON.parse(window.localStorage.getItem("manage_filter_id"));
			}else{
				var AllActivityids = window.localStorage.getItem("manage_filter_id");
			}
		}else{
			var AllActivityids = 'all';
		}
		
		var result = MonthCalendarFactory.monthcalendar($base64.encode(orgId),$base64.encode(auth_token), NextMonthClickAttr, NextYearClickAttr, AllActivityids);
		result.success(function(data){
			//alert(JSON.stringify(data, null, 4));
			if(data.status == 'success'){
				if(data.activity_events){
					angular.forEach(data.activity_events, function (datefld, key){
						if(datefld.date){
							var day_date = datefld.date;
							var res = day_date.split(" ");
							var ActualDate = new Date(res[1]).getTime();
							var ActualDay = displayDayService.showFullDay(res[0]);
							var OriDate = moment(res[1]).format('MMMM DD,YYYY').replace(",", ", ");
						}
						var dateNow = new Date(OriDate);
						
						var DateV = dateNow.getDate();
						var month = dateNow.getMonth();
						var Year = dateNow.getFullYear(); //2015
						
						Year = Year.toString();
						Year = "20"+Year.substr(Year.length -2);

						countEventArr[Year+"##"+parseInt(month+1)+"##"+DateV] = datefld.id;
						
						if(!$.isArray(mainEventArr[Year+"##"+parseInt(month+1)+"##"+DateV])){
							mainEventArr[Year+"##"+parseInt(month+1)+"##"+DateV] = [];
							counterArr = 0;
						}else{
							counterArr = counterArr;
						}
						
						var ccCounter = mainEventArr[Year+"##"+parseInt(month+1)+"##"+DateV].length;
						
						mainEventArr[Year+"##"+parseInt(month+1)+"##"+DateV][ccCounter] = datefld;
						counterArr++;
					});
				}
				
				$scope.countEventArr = countEventArr;
				$scope.mainEventArr = mainEventArr;
				
				//console.log(countEventArr);
				console.log(mainEventArr);
				
				var DateFormatPassNext = NextYearClickAttr+"-"+NextMonthClickAttr;
				displayCalendar(DateFormatPassNext);
				
				var dateCurNow = new Date();
				var DateValueCur = dateCurNow.getDate(); //17
				var DayValueCur = dateCurNow.getDay(); //4 THU
				var YearValueCur = dateCurNow.getFullYear(); //2015
				var MonthValueCur = dateCurNow.getMonth(); //11	
				MonthValueCur = MonthValueCur + 1;
				MonthValueCurPass = MonthValueCur;
				
				if(MonthValueCur != '10' && MonthValueCur != '11' && MonthValueCur != '12'){
					MonthValueCur = '0'+MonthValueCur;
				}
				
				if(NextYearClickAttr == YearValueCur && NextMonthClickAttr == MonthValueCur){ //This condition require to display the curent event
					DisplayBackMonthValue(NextYearClickAttr+"##"+MonthValueCurPass+"##"+DateValueCur);
				}
			}
		});
		result.error(function(data) {});				
	});
	
	$(document).on('click', '.PrevClass', function(){
		$("#content-loader").show();
		$scope.showCurrentDate = false;
		
		window.localStorage["DayVisited"] = ""; //Require to dsstroy the day visited value
    	localStorage.removeItem("DayVisited");
		
		$("#norecordmonth").hide();
		$("#norecordmonth").html("");
		
		$scope.calendarevents = '';
		var PrevMonthClickAttr = $(this).attr("PrevMonthClick");
		var PrevYearClickAttr = $(this).attr("PrevYearClick");
		var countEventArr = new Array();
		var mainEventArr = new Array();
		if(window.localStorage.getItem("is_manage_filter") && window.localStorage.getItem("is_manage_filter") != '0') {
			if(window.localStorage.getItem("manage_filter_id") != 'all'){
				var AllActivityids = JSON.parse(window.localStorage.getItem("manage_filter_id"));
			}else{
				var AllActivityids = window.localStorage.getItem("manage_filter_id");
			}
		}else{
			var AllActivityids = 'all';
		}
		
		var result = MonthCalendarFactory.monthcalendar($base64.encode(orgId),$base64.encode(auth_token), PrevMonthClickAttr, PrevYearClickAttr, AllActivityids);
		result.success(function(data){
			//alert(JSON.stringify(data, null, 4));
			if(data.status == 'success'){
				if(data.activity_events){
					angular.forEach(data.activity_events, function (datefld, key){
						if(datefld.date){
							var day_date = datefld.date;
							var res = day_date.split(" ");
							var ActualDate = new Date(res[1]).getTime();
							var ActualDay = displayDayService.showFullDay(res[0]);
							var OriDate = moment(res[1]).format('MMMM DD,YYYY').replace(",", ", ");
						}
						var dateNow = new Date(OriDate);
						
						var DateV = dateNow.getDate();
						var month = dateNow.getMonth();
						var Year = dateNow.getFullYear(); //2015
						
						Year = Year.toString();
						Year = "20"+Year.substr(Year.length -2);
						
						countEventArr[Year+"##"+parseInt(month+1)+"##"+DateV] = datefld.id;
						
						if(!$.isArray(mainEventArr[Year+"##"+parseInt(month+1)+"##"+DateV])){
							mainEventArr[Year+"##"+parseInt(month+1)+"##"+DateV] = [];
							counterArr = 0;
						}else{
							counterArr = counterArr;
						}
						
						var ccCounter = mainEventArr[Year+"##"+parseInt(month+1)+"##"+DateV].length;
						
						mainEventArr[Year+"##"+parseInt(month+1)+"##"+DateV][ccCounter] = datefld;
						counterArr++;
					});
				}
				
				$scope.countEventArr = countEventArr;
				$scope.mainEventArr = mainEventArr;
				
				//console.log(countEventArr);
				//console.log(mainEventArr);
				
				var DateFormatPassPrev = PrevYearClickAttr+"-"+PrevMonthClickAttr;
				displayCalendar(DateFormatPassPrev);
				
				var dateCurNow = new Date();
				var DateValueCur = dateCurNow.getDate(); //17
				var DayValueCur = dateCurNow.getDay(); //4 THU
				var YearValueCur = dateCurNow.getFullYear(); //2015
				var MonthValueCur = dateCurNow.getMonth(); //11	
				MonthValueCur = MonthValueCur + 1;
				MonthValueCurPass = MonthValueCur;				
				if(MonthValueCur != '10' && MonthValueCur != '11' && MonthValueCur != '12'){
					MonthValueCur = '0'+MonthValueCur;
				}				
				if(PrevYearClickAttr == YearValueCur && PrevMonthClickAttr == MonthValueCur){//This condition require to display the curent event
					DisplayBackMonthValue(PrevYearClickAttr+"##"+MonthValueCurPass+"##"+DateValueCur); //   "2016##2##10"
				}				
			}
		});
		result.error(function(data) {});
	
	});	
	$(document).on('click', '.clickToDetails', function(e){
		$("#content-loader").show();
		$scope.showCurrentDate = false;
		var dayToVisit = $(this).attr("daytodisplay");console.log(dayToVisit);                  
        $("#norecordmonth").hide();
        $("#norecordmonth").html("");                
		window.localStorage["DayVisited"] = dayToVisit; //Set the value for visited date in local storage

		$scope.$apply(function() {
			$scope.calendarevents = [];
			console.log($scope.mainEventArr[dayToVisit]);
			for(var j=0;j<$scope.mainEventArr[dayToVisit].length;j++){
				var day_date = $scope.mainEventArr[dayToVisit][j].date;
				var res = day_date.split(" ");
				$scope.mainEventArr[dayToVisit][j].actual_date = new Date(res[1]).getTime();
				$scope.mainEventArr[dayToVisit][j].day = displayDayService.showFullDay(res[0]);
				$scope.mainEventArr[dayToVisit][j].dateVal = moment(res[1]).format('MMMM DD,YYYY').replace(",", ", ");
				
				$scope.calendarevents.push($scope.mainEventArr[dayToVisit][j]);
				console.log($scope.mainEventArr[dayToVisit][j]);
			}
			$scope.calendarevents.reverse();
			$ionicScrollDelegate.$getByHandle('small').scrollTop();
			//$scope.$broadcast('scroll.refreshComplete');
			$("#content-loader").hide();
			//console.log($scope.calendarevents);
		});
	});

	function DisplayBackMonthValue(dayToVisit){
		$("#content-loader").show();
		window.localStorage["DayVisited"] = dayToVisit; //Set the value for visited date in local storage
		$scope.calendarevents = [];
            
		if($scope.mainEventArr[dayToVisit] && $scope.mainEventArr[dayToVisit].length > 0){
            $("#norecordmonth").hide();
			for(var j=0;j<$scope.mainEventArr[dayToVisit].length;j++){
				var day_date = $scope.mainEventArr[dayToVisit][j].date;
				var res = day_date.split(" ");
				$scope.mainEventArr[dayToVisit][j].actual_date = new Date(res[1]).getTime();
				$scope.mainEventArr[dayToVisit][j].day = displayDayService.showFullDay(res[0]);
				$scope.mainEventArr[dayToVisit][j].dateVal = moment(res[1]).format('MMMM DD,YYYY').replace(",", ", ");
				
				$scope.calendarevents.push($scope.mainEventArr[dayToVisit][j]);
			}
			$scope.calendarevents.reverse();
			$ionicScrollDelegate.$getByHandle('small').scrollTop();
		}else{ //This is the condition require to display the no data found text
			$scope.showCurrentDate = true;
			var res = dayToVisit.split("##");
			var cur_dt = res[0]+'/'+res[1]+'/'+res[2];
			$scope.cur_date = moment(cur_dt).format('MMMM DD,YYYY').replace(",", ", ");
			var dt = moment(cur_dt, "YYYY-MM-DD HH:mm:ss");
			$scope.cur_day = dt.format('dddd');
			$("#norecordmonth").show();
			$("#norecordmonth").html("There are no events scheduled for today");
		}
		$("#content-loader").hide();
	}
	
	function displayCalendar(DateFormatPass)
	{
		//alert(DateFormatPass);
		var htmlContent ="";
		var FebNumberOfDays ="";
		var counter = 1;
		//alert(DateFormatPass);
		DateFormatPass = DateFormatPass+"-10"; //This is the condition where we are solving the timezone issue for getting the system time for first time
		var dateNow = new Date(DateFormatPass);
		var month = dateNow.getMonth();
		var Year = dateNow.getFullYear(); //2015
		//alert(dateNow);alert(month);alert(Year);
		if(month == '11'){
			var NextMonthClick = 1;
			var NextYearClick = Year + 1;
		}else{
			var NextMonthClick = month + 2;
			var NextYearClick = Year;
		}
		
		if(month == '0'){
			var PrevMonthClick = 12;
			var PrevYearClick = Year - 1;
		}else{
			var PrevMonthClick = month - 1;
			PrevMonthClick = PrevMonthClick + 1;
			var PrevYearClick = Year;
		}
		
		
		if(NextMonthClick != '10' && NextMonthClick != '11' && NextMonthClick != '12'){
			NextMonthClick = "0"+NextMonthClick;
		}
		if(PrevMonthClick != '10' && PrevMonthClick != '11' && PrevMonthClick != '12'){
			PrevMonthClick = "0"+PrevMonthClick;
		}
		
		var nextMonth = month+1; //+1; //Used to match up the current month with the correct start date.
		var prevMonth = month -1;
		var day = dateNow.getDate();
		var year = dateNow.getFullYear();
		
		//alert(nextMonth+"^^"+prevMonth+"^^"+day+"^^"+year);
	
		//Determing if February (28,or 29)  
		if(month == 1){
			if((year%100!=0) && (year%4==0) || (year%400==0)){
				FebNumberOfDays = 29;
			}else{
				FebNumberOfDays = 28;
			}
		}
	
		// names of months and week days.
		var monthNames = ["January","February","March","April","May","June","July","August","September","October","November", "December"];
		var dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thrusday","Friday", "Saturday"];
		var dayPerMonth = ["31", ""+FebNumberOfDays+"","31","30","31","30","31","31","30","31","30","31"]
	
		// days in previous month and next one , and day of week.
		//var nextDate = new Date(nextMonth +' 1 ,'+year);
		var nextDate = new Date(monthNames[month] +' 1 ,'+year);
		//alert(nextDate);
		var weekdays= nextDate.getDay();
		var weekdays2 = weekdays
		var numOfDays = dayPerMonth[month];
	//alert(DateFormatPass);alert(month);alert(weekdays);
		// this leave a white space for days of pervious month.
		while (weekdays>0){
			htmlContent += "<td class='monthPre'></td>";
			// used in next loop.
			weekdays--;
		}
		
		while (counter <= numOfDays){
		// When to start new line.
		if (weekdays2 > 6){
			weekdays2 = 0;
			htmlContent += "</tr><tr>";
		}
		
		// if counter is current day.
		// highlight current day using the CSS defined in header.
		//alert(year+"##"+parseInt(month+1)+"##"+counter);
		if($scope.countEventArr[year+"##"+parseInt(month+1)+"##"+counter]){
			htmlContent +="<td style='cursor:pointer;text-decoration:underline;color:#FF0000;' class='monthNow clickToDetails' daytodisplay='"+year+"##"+parseInt(month+1)+"##"+counter+"'>"+counter+"</td>";
		}else{
			//alert("THERE");
			htmlContent +="<td class='monthNow'>"+counter+"</td>";
		}
		
		/*if(counter == day){
			htmlContent +="<td style='cursor:pointer;' class='dayNow'>"+counter+"</td>";
		}else{
			htmlContent +="<td style='cursor:pointer;' class='monthNow'>"+counter+"</td>";    
		}*/
		weekdays2++;
		counter++;
	}
	
	// building the calendar html body.
	var calendarBody = "<table class='calendar' style='width: 90%;margin:15px auto;'><tr class='monthNow'><th ><span><img class='PrevClass navIcon' PrevMonthClick='"+PrevMonthClick+"' PrevYearClick='"+PrevYearClick+"' src='img/prev_mon.png'></span></th><th colspan='5'>"+monthNames[month]+" "+ year +"</th><th><span><img class='NextClass navIcon' NextMonthClick='"+NextMonthClick+"' NextYearClick='"+NextYearClick+"' src='img/next_mon.png'></span></th></tr>";
	calendarBody +="<tr class='dayNames'><td>S</td><td>M</td><td>T</td><td>W</td><td>T</td><td>F</td><td>S</td></tr>";
	calendarBody += "<tr>";
	calendarBody += htmlContent;
	calendarBody += "</tr></table>";
	
	// set the content of div .
	$("#content-loader").hide();
	$("#calendar").html(calendarBody);
	
	}
	
	$scope.goTodayCalendar = function(){
		window.localStorage["DayVisited"] = ""; //Require to dsstroy the day visited value
    	localStorage.removeItem("DayVisited");
		$window.location.href = "#/months"; 
		$state.reload();
	};
	
	$scope.goEventDetail = function(id) {
		window.localStorage["prev_hash_month"] = window.location.hash;
		var id = parseInt(id);
        var AllEvent = $scope.calendarevents;
        var object_by_id = $filter('filter')(AllEvent, {id: id },true)[0];
		window.localStorage["ManageEventDetail"] = JSON.stringify(object_by_id);
        $window.location.href = "#/manage_event_detail";  
    };
	
	$scope.showLocation = function(location) {
        window.localStorage["prev_hash"] = window.location.hash;
        $("#content-loader").show();
        $window.location.href = "#/google_map/"+location;
    };
	
	$scope.goToListMonth = function(linkParam){
		window.localStorage["DayVisited"] = ""; //Require to dsstroy the day visited value
    	localStorage.removeItem("DayVisited");
		if(linkParam == 'listvalue'){
			$window.location.href = "#/manage_schedule_list";
		}
	};
	
	$scope.myGoBack = function() {
		window.localStorage["DayVisited"] = ""; //Require to dsstroy the day visited value
    	localStorage.removeItem("DayVisited");
		$window.location.href = window.localStorage.getItem("prev_page_month_calendar");
	};
	
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	
	$scope.createEventMonth = function() {
        $("#content-loader").show();
        $window.location.href = '#/create_event/new';
    };
})

.controller('NewLocationCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,$base64) {
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	var location_name = "";
	var location_address = "";
	var location_phone = "";
	var location_info = "";
	$scope.NewLocation = {};
	$scope.init = function() {
		if(window.localStorage.getItem('EventFormData')) {
			$scope.previousRecord = JSON.parse(window.localStorage.getItem('EventFormData'));
		}
		$("#content-loader").hide();
	};
	$scope.GoBack = function() {
		$("#content-loader").show();
		$window.history.back();
	};
	$scope.save_location = function() {
		$("#loader-span2").show();
		if($scope.NewLocation.name) {
			location_name = $scope.NewLocation.name;
		}
		if($scope.NewLocation.address) {
			location_address = $scope.NewLocation.address;
		}
		if($scope.NewLocation.phone) {
			location_phone = $scope.NewLocation.phone;
		}
		if($scope.NewLocation.info) {
			location_info = $scope.NewLocation.info;
		}
		var str = '{"context":"event","location":{"name":"'+location_name+'","address":"'+location_address+'","phone":"'+location_phone+'","description":"'+location_info+'"}}';
		var URL = API_URL+'/api/v1/schedules/event/'+$base64.encode(auth_token)+'/'+$base64.encode(orgId)+'/create_location';
		if(str) {
			$.ajax({
				type: "POST",
				url: URL,
				data: JSON.parse(str),
				success: function(data){
					console.log(data);
					if($scope.previousRecord) {
						$scope.previousRecord[0].location_id = data.location_id;
						window.localStorage['EventFormData'] = JSON.stringify($scope.previousRecord);
					}
					$("#loader-span2").hide();
					$window.history.back();
				},
				error: function(data) {
					console.log(data);
					$("#loader-span2").hide();
					$window.history.back();
				}
			});
		}		
	}
})

.controller('NewVenueCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,$base64,$stateParams) {
	var location_id = $stateParams.locationId;
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	var venue_name = "";
	var venue_abbr = "";
	var venue_info = "";
	$scope.NewVenue = {};
	$scope.init = function() {
		if(window.localStorage.getItem("Location_Name")) {
			$scope.location_name = window.localStorage.getItem("Location_Name");console.log($scope.location_name);
			window.localStorage.removeItem("Location_Name")
		}
		if(window.localStorage.getItem('EventFormData')) {
			$scope.previousRecord = JSON.parse(window.localStorage.getItem('EventFormData'));
		}
		$("#content-loader").hide();
	};
	$scope.GoBack = function() {
		$("#content-loader").show();
		$window.history.back();
	};
	$scope.save_venue = function() {
		$("#loader-span").show();
		if($scope.NewVenue.name) {
			venue_name = $scope.NewVenue.name;
		}
		if($scope.NewVenue.abbr) {
			venue_abbr = $scope.NewVenue.abbr;
		}
		if($scope.NewVenue.info) {
			venue_info = $scope.NewVenue.info;
		}
		var str = '{"context":"event","location_id":"'+location_id+'","venues":{"0":{"location_id":"'+location_id+'","name":"'+venue_name+'","abbreviation":"'+venue_abbr+'","description":"'+venue_info+'"}}}';
		var URL = API_URL+'/api/v1/schedules/event/'+$base64.encode(auth_token)+'/'+$base64.encode(orgId)+'/create_venue';
		if(str) {
			$.ajax({
				type: "POST",
				url: URL,
				data: JSON.parse(str),
				success: function(data){
					console.log(data);
					if($scope.previousRecord) {
						$scope.previousRecord[0].venue_id = data.venue_id;
						window.localStorage['EventFormData'] = JSON.stringify($scope.previousRecord);
					}
					$("#loader-span").hide();
					$window.history.back();
				},
				error: function(data) {
					console.log(data);
					$("#loader-span").hide();
					$window.history.back();
				}
			});
		}
	}
})
/**Manage Schedule Section**/
.controller('ManageActivityFilterCtrl', function($scope,$ionicHistory,$timeout,$compile,$timeout,$ionicSideMenuDelegate,$window,$q,MyScheduleFactory,$base64,ActivityListFactory,activitiesFactory,displayDayService,RememberScheduleFactory,ManageActivityFactory) {
    $scope.isMessage = false;
    var orgId = window.localStorage.getItem("org_id");
    var auth_token = window.localStorage.getItem("auth_token");
	$scope.schedules = [];
	$scope.isFilter = 0;
	if(window.localStorage.getItem("is_manage_filter")) {
		$scope.isFilter = window.localStorage.getItem("is_manage_filter");
	}
	function showButton() {
		if($scope.isFilter == 1) {
			var btn = '<button class="button button-block button-calm" ng-click="SelectAllCal()">Select All Calendars</button>';
		} else {
			var btn = '<button class="button button-block button-assertive" ng-click="DeselectAllCal()">De-select All Calendars</button>';
		}
		var temp = $compile(btn)($scope);
		$("#btn_content").html(temp);
	}
    $scope.init = function () {
		$("#content-loader").show();
		var result = ManageActivityFactory.getActivity($base64.encode(orgId),$base64.encode(auth_token));
		result.success(function(data) {
			var schedulesArr = [];
			for (var i in data.activities) {
				schedulesArr.push(data.activities[i]);
			}
			if(schedulesArr.length == 0) {
				$scope.isMessage = true;
				$("#btn_content").children().attr( "disabled", "disabled" );
			}
			$scope.schedules = schedulesArr;
			if($scope.schedules.length) {
				showButton();
			}
			console.log($scope.schedules);
			$("#content-loader").hide();
		});
		result.error(function(data) {});
    };
	$scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
		var filter_schedules = [];
		if(window.localStorage.getItem("manage_filter_id") && window.localStorage.getItem("manage_filter_id") != 'all') {
			filter_schedules = JSON.parse(window.localStorage.getItem("manage_filter_id"));
			for (var i in filter_schedules) {
				$("input[type=checkbox][value='"+filter_schedules[i]+"']").prop("checked",true);
			}
			if($('input:checkbox:checked').length == $('input:checkbox.chk-schedule').length) {
				var btn = '<button class="button button-block button-assertive" ng-click="DeselectAllCal()">De-select All Calendars</button>';
				var temp = $compile(btn)($scope);
				$("#btn_content").html(temp);
			}
		} else if((window.localStorage.getItem("manage_filter_id") && window.localStorage.getItem("manage_filter_id") == 'all') || !window.localStorage.getItem("manage_filter_id")) {
			$('input:checkbox.chk-schedule').each(function () {
				$(this).prop('checked', 'checked');
			});
			var btn = '<button class="button button-block button-assertive" ng-click="DeselectAllCal()">De-select All Calendars</button>';
			var temp = $compile(btn)($scope);
			$("#btn_content").html(temp);
		}
	});
    $scope.myGoBack = function() {
        $("#content-loader").show();
        $window.history.back();
    };
    $scope.check_schedule = function() {
        var x = 0;
        $('input:checkbox.chk-schedule').each(function () {
            if (this.checked == false) {
                x++;
            }
        });
        if(x>0 || x == $('input:checkbox.chk-schedule').length) {
            var btn = '<button class="button button-block button-calm" ng-click="SelectAllCal()">Select All Calendars</button>';
            var temp = $compile(btn)($scope);
            $("#btn_content").html(temp);
        }
        if(x == 0) {
            var btn = '<button class="button button-block button-assertive" ng-click="DeselectAllCal()">De-select All Calendars</button>';
            var temp = $compile(btn)($scope);
            $("#btn_content").html(temp);
        }
    };
    $scope.DeselectAllCal = function() {
        $('input:checkbox.chk-schedule').each(function () {
            $(this).prop('checked', '');
        });
        var btn = '<button class="button button-block button-calm" ng-click="SelectAllCal()">Select All Calendars</button>';
        var temp = $compile(btn)($scope);
        $("#btn_content").html(temp);
            
    };
    $scope.SelectAllCal = function() {
        $('input:checkbox.chk-schedule').each(function () {
            $(this).prop('checked', 'checked');
        });
        var btn = '<button class="button button-block button-assertive" ng-click="DeselectAllCal()">De-select All Calendars</button>';
        var temp = $compile(btn)($scope);
        $("#btn_content").html(temp);
    };
    $scope.toggleLeft = function() {
        $ionicSideMenuDelegate.toggleLeft();
    };
	$scope.showActivity = function() {
		var filter_res = [];
		var count = 0;
		$('input:checkbox.chk-schedule').each(function () {
			if (this.checked == true) {
				filter_res.push($(this).val());
				count++;
			}
        });
		if(count && (count == $('input:checkbox.chk-schedule').length)) {
			window.localStorage['is_manage_filter'] = 1;
			window.localStorage['manage_filter_id'] = 'all';
		} else if(count && (count != $('input:checkbox.chk-schedule').length)) {
			window.localStorage['is_manage_filter'] = 1;
			window.localStorage['manage_filter_id'] = JSON.stringify(filter_res);
		} else if(!count) {
			window.localStorage['is_manage_filter'] = 1;
			window.localStorage.removeItem("manage_filter_id");
		}
		$window.location.href = '#/manage_schedule_list';
    };
})
.controller('ManageScheduleListCtrl', function($scope,$ionicHistory,$ionicPopover,$timeout,$ionicSideMenuDelegate,$window,$filter,$base64,displayDayService,$ionicScrollDelegate,ManageScheduleFactory,$location,$state,$anchorScroll,ManageActivityFactory,ActivityListFactory) {
	$("#content-loader").hide();
	$("#create_event_btn").hide();
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	var today = 0;
	var recent_page = 0;
	var upcoming_page = 0;
    $scope.noMoreUpcomingEvent = false;
	$scope.noMoreRecentEvent = false;
	var ids = 'all';
	$scope.events = [];
    $scope.init = function () {
    	var result = ManageActivityFactory.getActivity($base64.encode(orgId),$base64.encode(auth_token));
		result.success(function(data) {
			if(data.activities) {
				if(window.localStorage.getItem("is_admin") == 'true') {
    				$("#create_event_btn").show();
    			}
			}
		});
		result.error(function(data) {});
		$("#today_btn").hide();
		$scope.event_type = '';
		if(window.localStorage.getItem("is_manage_filter") == 1) {
			//List of data after filter
			if(window.localStorage.getItem("manage_filter_id") != 'all') {
				if(window.localStorage.getItem("manage_filter_id") == null) {
					$scope.noMoreUpcomingEvent = true;
					$scope.noMoreRecentEvent = true;
					$("#error_content").show();
					$("#error_content").html("There are currently no events in your calendar.");
				} else {
					ids = JSON.parse(window.localStorage.getItem("manage_filter_id"));
				}
			} else if(window.localStorage.getItem("manage_filter_id") == 'all') {
				ids = 'all';
			} else {
				$scope.noMoreUpcomingEvent = true;
				$scope.noMoreRecentEvent = true;
				$("#error_content").show();
				$("#error_content").html("There are currently no upcoming events in your calendar.");
			}
		}
    };
	$scope.LoadUpcoming = function() {
		$scope.event_type = 'upcoming';
		if(!$scope.noMoreUpcomingEvent) {
			$scope.LoadMore();
		}
	};
	$scope.LoadRecent = function() {
		if(!$scope.noMoreRecentEvent) {
			$scope.event_type = 'completed';
			$scope.LoadMore();
		} else {
			$scope.$broadcast('scroll.refreshComplete');
		}
	};
    $scope.toggleLeft = function() {
        $ionicSideMenuDelegate.toggleLeft();
    };
    $scope.createEvent = function() {
        $("#content-loader").show();
        $window.location.href = '#/create_event/new';
    };
    $scope.goEventDetail = function(id) {
		window.localStorage["prev_hash_month"] = window.location.hash;
		var id = parseInt(id);
        var AllEvent = $scope.events;
        var object_by_id = $filter('filter')(AllEvent, {id: id },true)[0];
		window.localStorage["ManageEventDetail"] = JSON.stringify(object_by_id);
        $window.location.href = "#/manage_event_detail";  
    };
	$scope.filterSchedule = function() {
		$window.location.href = "#/manage_activity_filter";
    };
    $scope.showLocation = function(location) {
		if(window.localStorage.getItem("prev_hash")) {
			window.localStorage.removeItem("prev_hash");
		}
        window.localStorage["prev_hash"] = window.location.hash;
        $("#content-loader").show();
        $window.location.href = "#/google_map/"+location;
    };
    $scope.goToday = function() {
	    $location.hash(today);
        $ionicScrollDelegate.anchorScroll(true);
	    $(".overflow-scroll").css("top","20px");
		$(".bar-footer").css("margin-bottom","-1px");
		$ionicScrollDelegate.$getByHandle('side-menu-content').scrollTop(true);
		$("#main-content").parent().parent().css("transform","translate3d(0px, 50px, 0px) scale(1)");
    };  
	$scope.goToListMonth = function(linkParam){
		if(linkParam == 'monthvalue'){
			window.localStorage["prev_page_month_calendar"] = window.location.hash;
			$window.location.href = "#/months";
		}
	};
	
    $scope.LoadMore = function() {
		if($scope.event_type == 'upcoming') {
			upcoming_page = upcoming_page+1;
			var page = upcoming_page;
			var arr_typ = "upcoming_schedules";
		} else if($scope.event_type == 'completed') {
			recent_page = recent_page+1;
			var page = recent_page;
			var arr_typ = "recently_schedules";
		}
		var result = ManageScheduleFactory.scheduleList($base64.encode(orgId),$base64.encode(auth_token),$scope.event_type,ids,PerPage,page);
		result.success(function(data) {//console.log(data);
			if(data.activity_events.length < PerPage) {
				if($scope.event_type == 'upcoming') {
					$scope.noMoreUpcomingEvent = true;
				} else if($scope.event_type == 'completed') {
					$scope.noMoreRecentEvent = true;
					$scope.$broadcast('scroll.refreshComplete');
				}	
			} else {
				if($scope.event_type == 'completed') {
					$scope.$broadcast('scroll.refreshComplete');
				}
			}
			if((data.activity_events && data.activity_events.length>0)) {
				$scope.$broadcast('scroll.infiniteScrollComplete');
					for (var i in data.activity_events) {
						if(i==0 && page == 1 && $scope.event_type == 'upcoming') {
							today = data.activity_events[i].id;
						}
						data.activity_events[i].event_type = $scope.event_type;
						if(data.activity_events[i].date != "NA") {
							var day_date = data.activity_events[i].date;
							var res = day_date.split(" ");
							data.activity_events[i].actual_date = new Date(res[1]).getTime();
							data.activity_events[i].day = displayDayService.showFullDay(res[0]);
							data.activity_events[i].date = moment(res[1]).format('MMMM DD,YYYY').replace(",", ", ");
						} else {
							data.activity_events[i].actual_date = "";
							data.activity_events[i].day = "";
							data.activity_events[i].date = "";
						}
						if($scope.event_type == 'upcoming') {
							$("#today_btn").show();
							$scope.events.push(data.activity_events[i]);
						} else if($scope.event_type == 'completed') {
							$scope.events.unshift(data.activity_events[i]);
						}
					}
			} else {
				if(page = 1 && data.activity_events.length == 0 && $scope.event_type == 'upcoming' && $scope.events.length == 0) {
					$scope.noMoreUpcomingEvent = true;
					$("#today_btn").hide();
					$("#error_content").show();
					$("#error_content").html("There are currently no upcoming events in your calendar.");
					//$scope.LoadRecent();
				}
				if(page = 1 && data.activity_events.length == 0 && $scope.event_type == 'completed' && $scope.events.length==0) {
					$scope.noMoreUpcomingEvent = true;
					$scope.noMoreRecentEvent == true
					$("#error_content").show();
					$("#error_content").html("There are currently no events in your calendar. ");
				}
				if($scope.event_type == 'upcoming') {
					$scope.noMoreUpcomingEvent = true;
				} else if($scope.event_type == 'completed') {
					$scope.noMoreRecentEvent = true;
					$scope.$broadcast('scroll.refreshComplete');
				}
			}
		});
		result.error(function(data) {

		});
	};
})
.controller('ManageEventDetailCtrl', function($scope,$ionicPopover,$timeout,$ionicSideMenuDelegate,$window) {
	if(window.localStorage.getItem("is_admin") == 'true') {
    	$("#edit_event_btn").show();
    } else {
    	$("#edit_event_btn").hide();
    }
    $scope.init = function () {
		$("#score_opt").hide();
		if(window.localStorage.getItem("ManageEventDetail")) {
			$scope.eventDetail = JSON.parse(window.localStorage.getItem("ManageEventDetail"));
			if($scope.eventDetail.home_team != 'TBD' && $scope.eventDetail.visiting_team != 'TBD' && $scope.eventDetail.type != 'Practise') {
				$("#score_opt").show();
			}
		}
		if($scope.eventDetail.full_address != null && $scope.eventDetail.full_address != "") {
			if($scope.eventDetail.full_address.indexOf('-') === -1) {
				$scope.venue = $scope.eventDetail.full_address;
			} else {
				var arr = $scope.eventDetail.full_address.split("-");
				$scope.venue1 = arr[0];
				$scope.venue2 = arr[1];
			}
		}
		$scope.teams = '';
		if($scope.eventDetail.type == "Game" || $scope.eventDetail.type == "Scrimmage" || $scope.eventDetail.type == "Playoff") {
			if($scope.eventDetail.home_team != 'NA') {
				$scope.homeTeam = $scope.eventDetail.home_team;
			} else {
				$scope.homeTeam = 'TBD';
			}
			if($scope.eventDetail.visiting_team != 'NA') {
				$scope.visitingTeam = $scope.eventDetail.visiting_team;
			} else {
				$scope.visitingTeam = 'TBD';
			}
		} else {
			if($scope.eventDetail.home_team != 'TBD' && $scope.eventDetail.visiting_team != 'TBD') {
				$scope.teams = $scope.eventDetail.home_team+', '+$scope.eventDetail.visiting_team;
			} else if($scope.eventDetail.home_team != 'TBD' && $scope.eventDetail.visiting_team == 'TBD') {
				$scope.teams = $scope.eventDetail.home_team;
			} else if($scope.eventDetail.home_team == 'TBD' && $scope.eventDetail.visiting_team != 'TBD') {
				$scope.teams = $scope.eventDetail.visiting_team;
			}
		}
		if($scope.eventDetail.win_scoring == false) {
			var home_score_arr = [];
			var visit_score_arr = [];
			var result = [];
			if($scope.eventDetail.home_score) {
				if($scope.eventDetail.home_score.indexOf(',') === -1) {
					home_score_arr[0] = $scope.eventDetail.home_score;
				} else {
					home_score_arr = $scope.eventDetail.home_score.split(",");
				}
			}
			if($scope.eventDetail.visiting_score) {
				if($scope.eventDetail.visiting_score.indexOf(',') === -1) {
					visit_score_arr[0] = $scope.eventDetail.visiting_score;
				} else {
					visit_score_arr = $scope.eventDetail.visiting_score.split(",");
				}
			}
			for(var i in home_score_arr) {
				result.push({homeScore:parseInt(home_score_arr[i]),visitScore:parseInt(visit_score_arr[i])});
			}
		} else {
			var result = [];
			var tot_home = 0;
			var tot_vis = 0;
			if($scope.eventDetail.home_score) {
				if($scope.eventDetail.home_score.indexOf(',') === -1) {
					tot_home = parseInt($scope.eventDetail.home_score);
				} else {
					arr = $scope.eventDetail.home_score.split(",");
					for(var i in arr) {
						tot_home = tot_home+parseInt(arr[i]);
					}
				}
			}
			if($scope.eventDetail.visiting_score) {
				if($scope.eventDetail.visiting_score.indexOf(',') === -1) {
					tot_vis = parseInt($scope.eventDetail.visiting_score);
				} else {
					arr = $scope.eventDetail.visiting_score.split(",");
					for(var i in arr) {
						tot_vis = tot_vis+parseInt(arr[i]);
					}
				}
			}
			result.push({homeScore:tot_home,visitScore:tot_vis});
		}
		$scope.scoreResults = result;
		$("#content-loader").hide();
	};
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.enter_result = function() {
		$window.location.href = '#/add_result';
	};
	$scope.cancel_postpone = function() {
		$window.location.href = '#/cancel_event';
	};
	$scope.myGoBack = function() {
		$("#content-loader").show();
		$window.location.href = window.localStorage.getItem("prev_hash_month");
	};
    $scope.showLocation = function(location) {
       window.localStorage["prev_hash"] = window.location.hash;
       $("#content-loader").show();
       $window.location.href = "#/google_map/"+location;
    }
    $scope.edit_event = function(event_id) {
    	$("#content-loader").show();
    	$window.location.href = '#/create_event/'+event_id;
    }
})
.controller('NewsCtrl', function($scope,$ionicPopover,$timeout,$ionicSideMenuDelegate,$window,getSiteNewsFactory,$base64,$filter) {
	$("#content-loader").hide();
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	$scope.newslist = [];
	$scope.noMoreItemsAvailable = false;
	var page = 0;
	$scope.init = function () {
		$("#error_message").hide();
	};
	$scope.toggleLeft = function() {
        $ionicSideMenuDelegate.toggleLeft();
    };
	$scope.postSiteNews = function(id) {
		$window.location.href = '#/post_site_news';
	}
    $scope.view_detail = function(id) {
		var news_details = $filter('filter')($scope.newslist, {id: parseInt(id)},true)[0];
		window.localStorage['SiteNewsDetails'] = JSON.stringify(news_details);
		$window.location.href = '#/site_news_detail';
	}
	$scope.LoadMore = function() {
		page = page+1;
		var result = getSiteNewsFactory.getSiteNews($base64.encode(orgId),$base64.encode(auth_token),page,PerPage);
		result.success(function(data) {
			/*console.log(data);*/
			if(data.news_items.length == 0) {
				$("#error_message").show();
				$scope.noMoreItemsAvailable = true;
			}
			if(data.news_items.length) {
				if(data.news_items.length < PerPage) {
					$scope.noMoreItemsAvailable = true;
				}
				$scope.$broadcast('scroll.infiniteScrollComplete');
				for(var i in data.news_items) {
					if(data.news_items[i].media) {
						for(var j in data.news_items[i].media) {
							if(data.news_items[i].media[j].thumbnail_url != '') {
								var thumbnail_url = data.news_items[i].media[j].thumbnail_url;
								var parts = thumbnail_url.split('/');
								if(parts[1] == 'assets') {
									data.news_items[i].media[j].thumbnail_url = ImageUrl+data.news_items[i].media[j].thumbnail_url;
								}
							}
							if(data.news_items[i].media[j].url != '') {
								var url = data.news_items[i].media[j].url;
								var parts = url.split('/');
								if(parts[1] == 'assets') {
									data.news_items[i].media[j].url = ImageUrl+data.news_items[i].media[j].url;
								}
							}
						}
					}
					$scope.newslist.push(data.news_items[i]);
				}
			}
			$("#content-loader").hide();
		});
		result.error(function(data) {
			console.log(data);
			$scope.noMoreItemsAvailable = true;
			$("#content-loader").hide();
		});
	};
})
.controller('PostSiteNewsCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,$ionicPopup,$base64,SelectKeywordsFactory) {
	$("#content-loader").show();
	
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	
	$scope.init = function () {
		
		var SelectedPhotoIdSite = window.localStorage.getItem("SelectedImageIdSite");
		var SelectedPhotoNameSite = window.localStorage.getItem("SelectedImageNameSite");
		var SelectedPhotoThumbSite = window.localStorage.getItem("SelectedImageThumbSite");
		var SelectedPhotoUrlSite = window.localStorage.getItem("SelectedImageUrlSite");
		
		var SelectedAlbumIdSite = window.localStorage.getItem("SelectedAlbumIdSite");
		var SelectedAlbumNameSite = window.localStorage.getItem("SelectedAlbumNameSite");
		
		var SelectedPageIdSite = window.localStorage.getItem("SelectedPageIdSite");
		var SelectedPageNameSite = window.localStorage.getItem("SelectedPageNameSite");
		
		var SelectedKeywordsData = window.localStorage.getItem("SelectedKeywordsData");
		var SelectedKeywordsDataNames = window.localStorage.getItem("SelectedKeywordsDataNames");
		
		var SelectedNewsFeedData = window.localStorage.getItem("IsNewsFeedChecked");
		
		var SelectedFBData = window.localStorage.getItem("IsfacebookValueChecked");
		var SelectedTWData = window.localStorage.getItem("IstwitterValueChecked");
		
		var SelectedIndOption = window.localStorage.getItem("IncludeOptionValue");
		
		if(window.localStorage.getItem("PostNewsHeadlineSite")){
			$("#site_news_item_headline").val(window.localStorage.getItem("PostNewsHeadlineSite"));
		}
		
		if(window.localStorage.getItem("PostNewsDetailsSite")){
			$("#site_news_item_details").val(window.localStorage.getItem("PostNewsDetailsSite"));
		}
		
		if(SelectedKeywordsDataNames){
			$("#DisplayAllSelectedkeywords").show();
			$("#DisplayAllSelectedkeywords").html(SelectedKeywordsDataNames);
		}
		
		if(SelectedIndOption && SelectedIndOption == 'nonetype'){
			$(".SelectAddLinkOption").hide();
			$(".SelectNewsArticleOption").hide();
			$(".selectDefaultOptiontype").prop('checked', true);
		}else if(SelectedIndOption && SelectedIndOption == 'linktype'){
			$(".SelectAddLinkOption").show();
			$(".SelectNewsArticleOption").hide();
			$(".selectLinkOptiontype").prop('checked', true);
		}else if(SelectedIndOption && SelectedIndOption == 'articletype'){
			$(".SelectAddLinkOption").hide();
			$(".SelectNewsArticleOption").show();
			$(".selectArtOptiontype").prop('checked', true);
		}
		
		if(SelectedPhotoNameSite && SelectedPhotoThumbSite){
			var DisplayPhotoData = '<div><table width="100%"><tr><td width="40%" style="vertical-align:top;padding:5px;">Photo: '+SelectedPhotoNameSite+'</td><td width="40%" style="vertical-align:top;padding:5px;"><img style="max-width:100%;" src="'+SelectedPhotoThumbSite+'" border="0"></td><td width="20%" style="vertical-align:top;padding:5px;"><img style="width: 30px;" src="img/delete.png" class="DeletePhotoSite"></td></tr></table></div>';
			$("#DisplayPhotoDetailsSite").show();
			$("#DisplayPhotoDetailsSite").html(DisplayPhotoData);
		}
		
		if(SelectedAlbumIdSite && SelectedAlbumNameSite){
			var DisplayAlbumData = '<div><table width="100%"><tr><td width="40%" style="vertical-align:top;padding:5px;">Album: '+SelectedAlbumNameSite+'</td><td width="20%" style="vertical-align:top;padding:5px;"><img style="width: 30px;" src="img/delete.png" class="DeleteAlbumSite"></td></tr></table></div>';
			$("#DisplayPhotoDetailsSite").show();
			$("#DisplayPhotoDetailsSite").html(DisplayAlbumData);
		}
		
		if(SelectedPageIdSite && SelectedPageNameSite){
			var DisplayLinkData = '<div><table width="100%"><tr><td width="40%" style="vertical-align:top;padding:5px;">'+SelectedPageNameSite+'</td><td width="20%" style="vertical-align:top;padding:5px;"><img style="width: 30px;" src="img/delete.png" class="DeletePageSite"></td></tr></table></div>';
			$("#DisplayLinkPageDetailsSite").show();
			$("#DisplayLinkPageDetailsSite").html(DisplayLinkData);
		}
		
		if(window.localStorage.getItem("NewsArticleDetailsSite")){
			$("#DisplayWriteNewsArtiSite").show();
			$("#site_news_article_details").val(window.localStorage.getItem("NewsArticleDetailsSite"));
		}
		
		if(window.localStorage.getItem("EmailSmsValueSite")){
			$(".chkEmailSmsSite").prop('checked', true);
		}
		
		if(SelectedNewsFeedData){
			$(".newsFeedCls").prop('checked', true);
		}else if(SelectedNewsFeedData == 'null'){
			$(".newsFeedCls").prop('checked', true);
		}else if(SelectedNewsFeedData == ''){
			$(".newsFeedCls").prop('checked', false);
		}
		
		var result = SelectKeywordsFactory.getAllKeywords($base64.encode(orgId),$base64.encode(auth_token));
		result.success(function(data){
			
			var IsTwitterConnected = data.social_links[0].twitter_connected;
			var IsFacebookConnected = data.social_links[0].facebook_connected;
			
			if(IsFacebookConnected){
				$(".DisplayFbStatus").show();
				if(SelectedFBData){
					$(".social_FB").prop("checked",true);
				}else if(SelectedFBData == 'null'){
					$(".social_FB").prop("checked",true);
				}else if(SelectedFBData == ''){
					$(".social_FB").prop("checked",false);
				}
			}
			if(IsTwitterConnected){
				$(".DisplayTwStatus").show();
				if(SelectedTWData){
					$(".social_TW").prop("checked",true);
				}else if(SelectedTWData == 'null'){
					$(".social_TW").prop("checked",true);
				}else if(SelectedTWData == ''){
					$(".social_TW").prop("checked",false);
				}
			}
		
			//$(".DisplayTeamPageSelectButtonSite").show();
			$("#content-loader").hide();
		});
	};
	
	$(".newsFeedCls").click(function(){
		if($(this).is(':checked')){
			window.localStorage['IsNewsFeedChecked'] = $(this).val();
		}else{
			window.localStorage['IsNewsFeedChecked'] = "";
		}
	});
	
	$(".social_FB").click(function(){
		if($(this).is(':checked')){
			window.localStorage['IsfacebookValueChecked'] = $(this).val();
		}else{
			window.localStorage['IsfacebookValueChecked'] = "";
		}
	});
	
	$(".social_TW").click(function(){
		if($(this).is(':checked')){
			window.localStorage['IstwitterValueChecked'] = $(this).val();
		}else{
			window.localStorage['IstwitterValueChecked'] = "";
		}
	});
	
	$(".chkEmailSmsSite").click(function(){
		if($(this).is(':checked')){
			window.localStorage['EmailSmsValueSite'] = $(this).val();
		}else{
			window.localStorage['EmailSmsValueSite'] = "";
		}
	});
	
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		//$("#content-loader").show();
		window.localStorage.removeItem("PostNewsHeadlineSite");
		window.localStorage.removeItem("PostNewsDetailsSite");
		window.localStorage.removeItem("SelectedImageIdSite");
		window.localStorage.removeItem("SelectedImageNameSite");
		window.localStorage.removeItem("SelectedImageThumbSite");
		window.localStorage.removeItem("SelectedImageUrlSite");
		window.localStorage.removeItem("SelectedAlbumIdSite");
		window.localStorage.removeItem("SelectedAlbumNameSite");
		window.localStorage.removeItem("SelectedPageIdSite");
		window.localStorage.removeItem("SelectedPageNameSite");
		window.localStorage.removeItem("isExternalLinkSite");
		window.localStorage.removeItem("SelectedPagePermalinkSite");
		window.localStorage.removeItem("NewsArticleDetailsSite");
		window.localStorage.removeItem("EmailSmsValueSite");
		window.localStorage.removeItem("SelectedKeywordsData");
		window.localStorage.removeItem("IsfacebookValueChecked");
		window.localStorage.removeItem("IstwitterValueChecked");
		window.localStorage.removeItem("IsNewsFeedChecked");
		window.localStorage.removeItem("SelectedKeywordsDataArray");
		window.localStorage.removeItem("IncludeOptionValue");

		$window.location.href = '#/news';
	};
	$scope.selectFeeds = function() {
		$window.location.href = '#/select_feeds';
	}
	
	
	$("#site_news_item_headline").keyup(function(){
		window.localStorage['PostNewsHeadlineSite'] = $("#site_news_item_headline").val();
	});
	
	$("#site_news_item_details").keyup(function(){
		window.localStorage['PostNewsDetailsSite'] = $("#site_news_item_details").val();
	});
	
	$("#SiteBtnPostNews").click(function(){
		
		$(".DisplayLoader").show();
		$(".displayButton").hide();
		
		/*var news_item_headline = window.localStorage.getItem("PostNewsHeadline");
		var news_item_details = window.localStorage.getItem("PostNewsDetails");*/
		var news_item_headline = $("#site_news_item_headline").val();
		var news_item_details = $("#site_news_item_details").val();
		
		var SelectedPhotoId = window.localStorage.getItem("SelectedImageIdSite");
		var SelectedPhotoName = window.localStorage.getItem("SelectedImageNameSite");
		var SelectedPhotoThumb = window.localStorage.getItem("SelectedImageThumbSite");
		var SelectedPhotoUrl = window.localStorage.getItem("SelectedImageUrlSite");
		
		var SelectedAlbumId = window.localStorage.getItem("SelectedAlbumIdSite");
		var SelectedAlbumName = window.localStorage.getItem("SelectedAlbumNameSite");
		
		var SelectedPageId = window.localStorage.getItem("SelectedPageIdSite");
		var SelectedPageName = window.localStorage.getItem("SelectedPageNameSite");
		
		var SelectedEmailSmsValue = $(".chkEmailSmsSite").val();
		
		var Selectedattachment = window.localStorage.getItem("SelectedattachmentSite");

		var SelectedNewsArticleDetails = $("#site_news_article_details").val();
		
		var SelectedKeywordsData = window.localStorage.getItem("SelectedKeywordsData");
		
		var SelectedNewsFeedValueData = $(".newsFeedCls").val();
		
		if($('.DisplayFbStatus').is(":visible") && $('.social_FB').is(":checked")){
			var FbValueData = '&news_item[facebook]=1';
		}else{
			var FbValueData = '';
		}
		
		if($('.DisplayTwStatus').is(":visible") && $('.social_TW').is(":checked")){
			var TwValueData = '&news_item[twitter]=1';
		}else{
			var TwValueData = '';
		}

		if(news_item_headline == ''){
			var alertPopup = $ionicPopup.alert({
				title: 'Error',
				cssClass : 'error_msg',
				template: "Please enter headline."
			});
			$(".DisplayLoader").hide();
			$(".displayButton").show();
			return false;
		}else{
			
			if(news_item_details){
				var passNewsDetails = news_item_details;
			}else{
				var passNewsDetails = '';
			}
			
			if(SelectedPhotoUrl){
				var MediaURL = SelectedPhotoUrl;
			}else{
				var MediaURL = '';
			}
			
			if(SelectedAlbumName){
				var AlbumURL = SelectedAlbumName;
			}else{
				var AlbumURL = '';
			}
			
			if($('.chkEmailSmsSite').is(":checked")){
				var IsMessageSMS = 1;
			}else{
				var IsMessageSMS = 0;
			}

			if($('.newsFeedCls').is(":checked")){
				var IsWidgetVal = 1;
			}else{
				var IsWidgetVal = 0;
			}

			if(SelectedPageName){
				if(window.localStorage.getItem("isExternalLink")){
					var MessageLinkArticle = SelectedPageName;
				}else if(window.localStorage.getItem("SelectedPagePermalink")){
					var MessageLinkArticle = "team:"+window.localStorage.getItem("SelectedPagePermalink");
				}else{
					var MessageLinkArticle = SelectedPageId;
				}
				var attachmentValue = Selectedattachment;
			}else{
				var MessageLinkArticle = '';
				if(Selectedattachment){
					var attachmentValue = Selectedattachment;
				}else{
					var attachmentValue = 'none';
				}
			}
			
			if(SelectedNewsArticleDetails){
				var newsArticleMsg = SelectedNewsArticleDetails;
			}else{
				var newsArticleMsg = '';
			}
			
			if(SelectedPhotoUrl && SelectedPhotoThumb){
				var ServiceAccountId = window.localStorage.getItem("AccountIdDataSite");
				if(SelectedAlbumName){
					var AlbumIdSelect = window.localStorage.getItem("SelectedAlbumIdSite");
					var resourceId = AlbumIdSelect;
					var resourceType = 'album';
				} else {
					var AlbumIdSelect = window.localStorage.getItem("AlbumIdDataSite");
					var resourceId = SelectedPhotoId;
					var resourceType = 'photo';
				}
				var resourceKey = 'undefined';
				
			}else{
				var ServiceAccountId = '';
				var AlbumIdSelect = '';
				var resourceId = '';
				var resourceKey = '';
				var resourceType = '';
			}
			
			if(SelectedKeywordsData){
				var KeywordValues = SelectedKeywordsData;
			}else{
				var KeywordValues = '';
			}
			
			var saveNewPost = 'news_item[headline]='+news_item_headline+'&news_item[details]='+passNewsDetails+'&news_item[media_url]='+MediaURL+'&news_item[target_url]='+MessageLinkArticle+'&news_item[open_in_new_window]=&news_item[widget]='+IsWidgetVal+TwValueData+FbValueData+'&news_item[is_as_message]='+IsMessageSMS+'&news_item[news_item_keyword_ids]='+KeywordValues+'&target_media[service_account_id]='+ServiceAccountId+'&target_media[resource_id]='+resourceId+'&target_media[resource_type]='+resourceType+'&target_media[album_id]='+AlbumIdSelect+'&target_media[resource_key]='+resourceKey+'&attachment='+attachmentValue+'&new_link_context=organization&article_text='+newsArticleMsg+'&refresh_news_page=false';
			console.log(saveNewPost);//return false;
			var URL = API_URL+'/api/v1/news_items/'+$base64.encode(auth_token)+'/'+$base64.encode(orgId)+'/create';
			$.ajax({
				type: "POST",
				url: URL,
				data: saveNewPost,
				success: function(data){console.log(data);
                    window.localStorage['TeamNewsPostIdValue'] = data.news_item_id;
					var alertPopup = $ionicPopup.alert({
						title: 'Success',
						cssClass : 'error_msg',
						template: data.message
					});
					alertPopup.then(function(res) {
						$("#loader-span").hide();
						
						
						window.localStorage.removeItem("PostNewsHeadlineSite");
						window.localStorage.removeItem("PostNewsDetailsSite");
						window.localStorage.removeItem("SelectedImageIdSite");
						window.localStorage.removeItem("SelectedImageNameSite");
						window.localStorage.removeItem("SelectedImageThumbSite");
						window.localStorage.removeItem("SelectedImageUrlSite");
						window.localStorage.removeItem("SelectedAlbumIdSite");
						window.localStorage.removeItem("SelectedAlbumNameSite");
						window.localStorage.removeItem("SelectedPageIdSite");
						window.localStorage.removeItem("SelectedPageNameSite");
						window.localStorage.removeItem("isExternalLinkSite");
						window.localStorage.removeItem("SelectedPagePermalinkSite");
						window.localStorage.removeItem("NewsArticleDetailsSite");
						window.localStorage.removeItem("EmailSmsValueSite");
						window.localStorage.removeItem("SelectedKeywordsData");
						window.localStorage.removeItem("IsfacebookValueChecked");
						window.localStorage.removeItem("IstwitterValueChecked");
						window.localStorage.removeItem("IsNewsFeedChecked");
						window.localStorage.removeItem("SelectedKeywordsDataArray");
						window.localStorage.removeItem("IncludeOptionValue");
						
						$(".DisplayLoader").hide();
						$(".displayButton").show();
						
						$window.location.href = '#/news';
					});
				},
				error: function(data) {
					console.log(data);
					$("#loader-span").hide();
				}
			});
		}
	});
	
	$(".selectDefaultOptiontype").click(function(){
		$(".SelectAddLinkOption").hide();
		$(".SelectNewsArticleOption").hide();
		window.localStorage['IncludeOptionValue'] = "nonetype";
		
		$("#DisplayLinkPageDetailsSite").hide();
		$("#DisplayLinkPageDetailsSite").html("");
		window.localStorage.removeItem("SelectedPageIdSite");
		window.localStorage.removeItem("SelectedPageNameSite");
		
		$("#DisplayWriteNewsArtiSite").hide();
		$("#site_news_article_details").val('');
		window.localStorage.removeItem("NewsArticleDetailsSite");
	});
	$(".selectLinkOptiontype").click(function(){
		$(".SelectAddLinkOption").show();
		$(".SelectNewsArticleOption").hide();
		window.localStorage['IncludeOptionValue'] = "linktype";
		
		$("#DisplayWriteNewsArtiSite").hide();
		$("#site_news_article_details").val('');
		window.localStorage.removeItem("NewsArticleDetailsSite");
	});
	$(".selectArtOptiontype").click(function(){
		$(".SelectAddLinkOption").hide();
		$(".SelectNewsArticleOption").show();
		window.localStorage['IncludeOptionValue'] = "articletype";
		
		$("#DisplayLinkPageDetailsSite").hide();
		$("#DisplayLinkPageDetailsSite").html("");
		window.localStorage.removeItem("SelectedPageIdSite");
		window.localStorage.removeItem("SelectedPageNameSite");
	});
	
	$("#selectPhotoOptionSite").click(function(){
		$window.location.href = '#/select_photo_account_site';
	});
	
	$("#selectLinkArticleSite").click(function(){
		$window.location.href = '#/select_link_article_menus_site';
	});
	
	$("#writenewsarticlesite").click(function(){
		$("#DisplayWriteNewsArtiSite").show();
	});
	
	$(document).on('keyup', '#site_news_article_details', function(){
		window.localStorage['NewsArticleDetailsSite'] = $("#site_news_article_details").val();
		window.localStorage['SelectedattachmentSite'] = 'article';
	});
	
	$(document).on('click', '.DeletePhotoSite', function(){
		$("#DisplayPhotoDetailsSite").hide();
		$("#DisplayPhotoDetailsSite").html("");
		window.localStorage.removeItem("SelectedImageIdSite");
		window.localStorage.removeItem("SelectedImageNameSite");
		window.localStorage.removeItem("SelectedImageThumbSite");
		window.localStorage.removeItem("SelectedImageUrlSite");
	});
	
	$(document).on('click', '.DeleteAlbumSite', function(){
		$("#DisplayPhotoDetailsSite").hide();
		$("#DisplayPhotoDetailsSite").html("");
		window.localStorage.removeItem("SelectedAlbumIdSite");
		window.localStorage.removeItem("SelectedAlbumNameSite");
	});
	
	$(document).on('click', '.DeletePageSite', function(){
		$("#DisplayLinkPageDetailsSite").hide();
		$("#DisplayLinkPageDetailsSite").html("");
		window.localStorage.removeItem("SelectedPageIdSite");
		window.localStorage.removeItem("SelectedPageNameSite");
	});
	
})

.controller('SelectLinkArticleMenusSiteCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,$base64) {
	$("#content-loader").show();
	$scope.init = function () {
		$("#content-loader").hide();
	};
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		//$("#content-loader").show();
		$window.history.back();
	};
	
	$(".LinkToSitePageSite").click(function(){
		$window.location.href = '#/select_link_article_site';
	});
	
	$(".LinkToTeamPageSite").click(function(){
		$window.location.href = '#/select_team_pages_site';
	});
	
	$(".LinkToExternalSite").click(function(){
		$window.location.href = '#/select_external_website_site';
	});
	
})

.controller('SelectTeamExternalWebsiteSiteCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,$ionicPopup) {
	$("#content-loader").show();
	$scope.init = function () { 
		$("#content-loader").hide();
	};
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		$window.history.back();
	};
	
	$("#BtnExternalLinkSite").click(function(){
		var externalValue = $("#site_news_external_link").val();
		if(externalValue == ''){
			var alertPopup = $ionicPopup.alert({
				title: 'Error',
				cssClass : 'error_msg',
				template: "Please enter a link."
			});
		}else{
			window.localStorage['SelectedPageIdSite'] = 1;
			window.localStorage['SelectedPageNameSite'] = externalValue;
			window.localStorage['SelectedattachmentSite'] = 'link';
			window.localStorage['isExternalLinkSite'] = 1;
			$window.location.href = '#/post_site_news';
		}
	});
	
})

.controller('SelectTeamPagesArticleSiteCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,TeamPageLinkArticleSiteFactory,$base64,$ionicPopup) {
	$("#content-loader").show();
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	var AllTeamPagesLinksdataSite = [];

	$scope.init = function () { 
		var result = TeamPageLinkArticleSiteFactory.TeamPageLinkArticleSite($base64.encode(orgId),$base64.encode(auth_token));
		result.success(function(data){
			angular.forEach(data.team_pages.children, function (childfld, key){
				AllTeamPagesLinksdataSite.push({id:childfld.id, name:childfld.title, permalink:childfld.object.permalink, totalChildren:childfld.children.length});
			});
			$scope.TeamLinksdataMoreSite = AllTeamPagesLinksdataSite;
			$(".DisplayTeamPageSelectButtonSite").show();
			$("#content-loader").hide();
		});
		
	};
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		//$("#content-loader").show();
		$window.history.back();
	};







	//$(document).on('click', '#SelectTeamPageLinkSite', function(){
	$("#SelectTeamPageLinkSite").click(function(){
		if($(".TeamLinksPageSite:checked").attr("TeamLinksIdSite") == undefined) {
			var alertPopup = $ionicPopup.alert({
				title: 'Error',
				cssClass : 'error_msg',
				template: "Please select a page."
			});
			alertPopup.then(function(res) {
				return false;
			});
		} else {
			window.localStorage['SelectedPageIdSite'] = $(".TeamLinksPageSite:checked").attr("TeamLinksIdSite");
			window.localStorage['SelectedPageNameSite'] = $(".TeamLinksPageSite:checked").val();
			window.localStorage['SelectedPagePermalinkSite'] = $(".TeamLinksPageSite:checked").attr("TeamPermaLinksSite");
			//var SelectedPageId = window.localStorage.getItem("SelectedPageId");
			//var SelectedPageName = window.localStorage.getItem("SelectedPageName");
			window.localStorage['SelectedattachmentSite'] = 'link';
			$window.location.href = '#/post_site_news';
		}
	});
	
	$(document).on('click', '.TeamLinksClsSite', function(){
		var TeamLinkPageIdID = $(this).attr("TeamLinkIdSite");
		window.localStorage['TeamLinkPageIdIDSite'] = TeamLinkPageIdID;
		$window.location.href = '#/select_children_team_page_site';
	});
	
})
.controller('SelectChildrenTeamPagesArticleSiteCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,TeamPageLinkChildrenArticleSiteFactory,$base64,$ionicPopup) {
	$("#content-loader").show();
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	var TeamLinkPageIdID = window.localStorage.getItem("TeamLinkPageIdIDSite");
	var AllTeamPageChildLinkArticlesdataSite = [];
	$scope.init = function () { 
		var result = TeamPageLinkChildrenArticleSiteFactory.TeamPageLinkChildrenArticleSite($base64.encode(orgId),$base64.encode(auth_token), TeamLinkPageIdID);
		result.success(function(data){
			angular.forEach(data.page_childrens.children, function (teamchildfld, key){
				AllTeamPageChildLinkArticlesdataSite.push({id:teamchildfld.id, name:teamchildfld.title, permalink:teamchildfld.object.permalink, totalChildren:teamchildfld.children.length});
			});
			$scope.ChildTeamLinksdataMoreSite = AllTeamPageChildLinkArticlesdataSite;
			$(".DisplayTeamChildPageSelectButtonSite").show();
			$("#content-loader").hide();
		});
		
	};
	$scope.TeamLinkPageIdIDToPass = TeamLinkPageIdID;
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		//$("#content-loader").show();
		$window.history.back();
	};
	






	$(document).off('click').on('click', '#SelectTeamChildPageLinkSite'+TeamLinkPageIdID, function(){	
	//$("#SelectTeamChildPageLinkSite").click(function(){
		if($('.ChildTeamLinksPageSite:checked').attr("ChildTeamLinksIdSite") == undefined) {
			var alertPopup = $ionicPopup.alert({
				title: 'Error',
				cssClass : 'error_msg',
				template: "Please select a page."
			});
			alertPopup.then(function(res) {
				return false;
			});
		} else {
			window.localStorage['SelectedPageIdSite'] = $('.ChildTeamLinksPageSite:checked').attr("ChildTeamLinksIdSite");
			window.localStorage['SelectedPageNameSite'] = $('.ChildTeamLinksPageSite:checked').val();
			window.localStorage['SelectedPagePermalinkSite'] = $('.ChildTeamLinksPageSite:checked').attr("ChildTeamPermaLinksIdSite");
			$window.location.href = '#/post_site_news';
		}
	});
	
	$(document).on('click', '.ChildTeamLinksClsSite', function(){
		var LinkPageIdID = $(this).attr("ChildTeamLinkIdSite");
		window.localStorage['TeamChildLinkPageIdIDSite'] = LinkPageIdID;
		$window.location.href = '#/select_children_team_page2_site';
	});
})

.controller('SelectChildrenTeamPagesArticle2SiteCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,TeamPageLinkChildrenArticle2SiteFactory,$base64,$ionicPopup) {
	$("#content-loader").show();
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	var TeamChildLinkPageIdID = window.localStorage.getItem("TeamChildLinkPageIdIDSite");
	var AllTeamPageChildLinkArticlesdata2Site = [];
	$scope.init = function () { 
		var result = TeamPageLinkChildrenArticle2SiteFactory.TeamPageLinkChildrenArticleSite2($base64.encode(orgId),$base64.encode(auth_token), TeamChildLinkPageIdID);
		result.success(function(data){
			angular.forEach(data.page_childrens.children, function (teamchild2fld, key){
				AllTeamPageChildLinkArticlesdata2Site.push({id:teamchild2fld.id, name:teamchild2fld.title, permalink:teamchild2fld.object.permalink, totalChildren:teamchild2fld.children.length});
			});
			$scope.ChildTeamLinksdataMore2Site = AllTeamPageChildLinkArticlesdata2Site;
			$(".DisplayTeamChildPageSelectButton2Site").show();
			$("#content-loader").hide();
		});
		
	};
	$scope.TeamChildLinkPageIdIDToPass = TeamChildLinkPageIdID;
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		//$("#content-loader").show();
		$window.history.back();
	};
	






	$(document).off('click').on('click', '#SelectTeamChildPageLink2Site'+TeamChildLinkPageIdID, function(){
	//$("#SelectTeamChildPageLink2Site").click(function(){
		if($('.ChildTeamLinksPage2Site:checked').attr("ChildTeamLinksId2Site") == undefined) {
			var alertPopup = $ionicPopup.alert({
				title: 'Error',
				cssClass : 'error_msg',
				template: "Please select a page."
			});
			alertPopup.then(function(res) {
				return false;
			});
		} else {
			window.localStorage['SelectedPageIdSite'] = $('.ChildTeamLinksPage2Site:checked').attr("ChildTeamLinksId2Site");
			window.localStorage['SelectedPageNameSite'] = $('.ChildTeamLinksPage2Site:checked').val();
			window.localStorage['SelectedPagePermalinkSite'] = $('.ChildTeamLinksPage2Site:checked').attr("ChildTeamPermaLinksId2Site");
			$window.location.href = '#/post_site_news';
		}
	});
	
	$(document).on('click', '.ChildTeamLinksCls2Site', function(){
		var LinkPageIdID = $(this).attr("ChildTeamLinkId2Site");
		//window.localStorage['TeamChildLinkPageIdID'] = LinkPageIdID;
		//$window.location.href = '#/select_children_page2';
	});
})

.controller('SelectLinkArticleSiteCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,TeamLinkArticleSiteFactory,$base64,$ionicPopup) {
	$("#content-loader").show();
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	var AllLinkArticlesdataSite = [];
	$scope.init = function () { 
		var result = TeamLinkArticleSiteFactory.TeamLinkArticleSite($base64.encode(orgId),$base64.encode(auth_token));
		result.success(function(data){
			angular.forEach(data.site_pages, function (linkfld, key){
				AllLinkArticlesdataSite.push({id:linkfld[0].id, name:linkfld[0].title, parent_id:linkfld[0].parent_id, is_children:linkfld[0].is_children});
			});
			$scope.LinksdataMoreSite = AllLinkArticlesdataSite;
			$(".DisplayPageSelectButtonSite").show();
			$("#content-loader").hide();
		});
		
	};
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		//$("#content-loader").show();
		$window.history.back();
	};
	
	$(document).on('click', '.LinksPageSite', function(){
		/*window.localStorage['SelectedPageId'] = $(this).attr("LinksId");
		window.localStorage['SelectedPageName'] = $(this).val();*/
	});

	//$(document).on('click', '#SelectPageLinkSite', function(){
	$("#SelectPageLinkSite").click(function(){
		if($(".LinksPageSite:checked").attr("LinksIdSite") == undefined) {
			var alertPopup = $ionicPopup.alert({
				title: 'Error',
				cssClass : 'error_msg',
				template: "Please select a page."
			});
			alertPopup.then(function(res) {
				return false;
			});
		} else {
			window.localStorage['SelectedPageIdSite'] = $(".LinksPageSite:checked").attr("LinksIdSite");
			window.localStorage['SelectedPageNameSite'] = $(".LinksPageSite:checked").val();
			//var SelectedPageId = window.localStorage.getItem("SelectedPageId");
			//var SelectedPageName = window.localStorage.getItem("SelectedPageName");
			window.localStorage['SelectedattachmentSite'] = 'link';
			$window.location.href = '#/post_site_news';
		}
	});
	
	$(document).on('click', '.LinksClsSite', function(){
		var LinkPageIdID = $(this).attr("LinkIdSite");
		window.localStorage['LinkPageIdIDSite'] = LinkPageIdID;
		$window.location.href = '#/select_children_page_site';
	});
	
})

.controller('SelectChildrenPageSiteCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,TeamChildLinkArticleSiteFactory,$base64,$state,$ionicPopup) {
	$("#content-loader").show();
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	var LinkPageIdID = window.localStorage.getItem("LinkPageIdIDSite");
	var AllChildLinkArticlesdataSite = [];
	$scope.init = function () { 
		var result = TeamChildLinkArticleSiteFactory.TeamChildLinkArticleSite($base64.encode(orgId),$base64.encode(auth_token),LinkPageIdID);
		result.success(function(data){
			angular.forEach(data.page_childrens, function (pagechldfld, key){
				AllChildLinkArticlesdataSite.push({id:pagechldfld[0].id, name:pagechldfld[0].title, is_children:pagechldfld[0].is_children});
			});
			$scope.ChildLinksdataMoreSite = AllChildLinkArticlesdataSite;
			$(".DisplayChildPageSelectButtonSite").show();
			$("#content-loader").hide();
		});
		
	};
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		//$("#content-loader").show();
		$window.history.back();
	};
	
	$scope.LinkPageIdToPass = LinkPageIdID;

	$(document).off('click').on('click', '#SelectChildPageLinkSite'+LinkPageIdID, function(){






		if($(".ChildLinksPageSite:checked").attr("LinksIdSite") == undefined) {
			var alertPopup = $ionicPopup.alert({
				title: 'Error',
				cssClass : 'error_msg',
				template: "Please select a page."
			});
			alertPopup.then(function(res) {
				return false;
			});
		} else {
			window.localStorage['SelectedPageIdSite'] = $(".ChildLinksPageSite:checked").attr("LinksIdSite");
			window.localStorage['SelectedPageNameSite'] = $(".ChildLinksPageSite:checked").val();
			//var SelectedPageId = window.localStorage.getItem("SelectedPageId");
			//var SelectedPageName = window.localStorage.getItem("SelectedPageName");
			$window.location.href = '#/post_site_news';
		}
	});
	
	$(document).on('click', '.ChildLinksClsSite', function(){
		var ChildLinkPageIdID = $(this).attr("ChildLinkIdSite");
		window.localStorage['LinkPageIdIDSite'] = ChildLinkPageIdID;
		$window.location.href = '#/select_children_page_site';
		$state.reload();
	});
})

.controller('SelectPhotoAccountSiteCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,TeamUploadPhotoSiteFactory,$base64) {
    $("#content-loader").show();
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	var AllAccountsSitedata = [];
	$scope.init = function () { 
		var result = TeamUploadPhotoSiteFactory.TeamUploadPhotoSite($base64.encode(orgId),$base64.encode(auth_token));
		result.success(function(data){
			angular.forEach(data.photo_accounts, function (accntfld, key){
				AllAccountsSitedata.push({id:accntfld.name.id, name:accntfld.name.name});
			});
			console.log(AllAccountsSitedata);
			$scope.AccountsdatasiteMore = AllAccountsSitedata;
			$("#content-loader").hide();
		});
	};
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		//$("#content-loader").show();
		//$window.history.back();
		$window.location.href = '#/post_site_news';
	};
	
	$(document).on('click', '.AccountClsSite', function(){
		var AccntId = $(this).attr("AccntIdSite");
		window.localStorage['AccountIdDataSite'] = AccntId;
		$window.location.href = '#/select_photo_albums_site';
	});
})

.controller('SelectPhotoAlbumsSiteCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,TeamUploadPhotoAlbumSiteFactory,$base64,$ionicPopup) {
	$("#content-loader").show();
	var AccountIdDataSite = window.localStorage.getItem("AccountIdDataSite");
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	var AllAlbumsSitedata = [];
	$scope.init = function () { 
		var result = TeamUploadPhotoAlbumSiteFactory.TeamUploadAlbumSite($base64.encode(orgId),$base64.encode(auth_token),AccountIdDataSite);
		result.success(function(data){
			console.log(data);
			if(data.albums.length > 0){
				$(".NoAlbumFoundSite").hide();
				angular.forEach(data.albums, function (albumfld, key){
					if(albumfld[0].album_images.thumbnail != '') {
						if(albumfld[0].album_images.thumbnail.indexOf("&frasl;assets") > -1) {
							albumfld[0].album_images.thumbnail = ImageUrl+albumfld[0].album_images.thumbnail;
						}
					}
					if(albumfld[0].album_images.url != '') {
						if(albumfld[0].album_images.url.indexOf("&frasl;assets") > -1) {
							albumfld[0].album_images.url = ImageUrl+albumfld[0].album_images.url;
						}
					}
					AllAlbumsSitedata.push({id:albumfld[0].id, name:albumfld[0].name, image_url:albumfld[0].album_images.url, thumbnail_url:albumfld[0].album_images.thumbnail});
				});
				$scope.AlbumsdataSiteMore = AllAlbumsSitedata;
				$(".DisplayAlbumSelectButtonSite").show();
			}else{
				$(".NoAlbumFoundSite").show();
				$(".DisplayAlbumSelectButtonSite").hide();
				AlbumNoDataDisplay = '<div style="color: #ff0000;font-weight: bold;left: 50%;margin-top: 50px;text-align: center;width: 100%;">No Albums Available.</div>';
				$(".NoAlbumFoundSite").html(AlbumNoDataDisplay);
			}
			$("#content-loader").hide();
		});
		
		result.error(function(data){
			$("#content-loader").hide();
			$(".NoAlbumFoundSite").show();
			$(".DisplayAlbumSelectButtonSite").hide();
			AlbumNoDataDisplay = '<div style="color: #ff0000;font-weight: bold;left: 50%;margin-top: 50px;text-align: center;width: 100%;">No Albums Available.</div>';
			$(".NoAlbumFoundSite").html(AlbumNoDataDisplay);
		});
		
		
	};
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		window.localStorage.removeItem("SelectedAlbumIdSite");
		window.localStorage.removeItem("SelectedAlbumNameSite");
		$window.location.href = '#/select_photo_account_site';
	};
	
	$(document).on('click', '.AlbumClsSite', function(){
		var AlbumID = $(this).attr("AlbumIdSite");
		window.localStorage['AlbumIdDataSite'] = AlbumID;
		window.localStorage['AccountIDSite'] = window.localStorage.getItem("AccountIdDataSite");
		//alert(window.localStorage.getItem("AccountIdDataSite"));
		$window.location.href = '#/select_photos_site';
	});
	
	$(document).on('click', '.RadioAlbumSite', function(){
		/*window.localStorage['SelectedAlbumId'] = $(this).attr("AlbumId");
		window.localStorage['SelectedAlbumName'] = $(this).val();*/
		
		/* Deleting data for the photos starts here */
			/*window.localStorage['SelectedImageId'] = "";
			window.localStorage['SelectedImageName'] = "";
			window.localStorage['SelectedImageThumb'] = "";
			window.localStorage['SelectedImageUrl'] = "";
			localStorage.removeItem("SelectedImageId");
			localStorage.removeItem("SelectedImageName");
			localStorage.removeItem("SelectedImageThumb");
			localStorage.removeItem("SelectedImageUrl");*/
			
			/*window.localStorage['SelectedPageId'] = "";
			window.localStorage['SelectedPageName'] = "";
			localStorage.removeItem("SelectedPageId");
			localStorage.removeItem("SelectedPageName");*/
			
		/* Deleting data for the photos ends here */
	});
	
	//$(document).on('click', '#SelectSelectAlbumSite', function(){
	$("#SelectSelectAlbumSite").click(function(){
		if($(".RadioAlbumSite:checked").attr("AlbumIdSite") == undefined) {
			var alertPopup = $ionicPopup.alert({
				title: 'Error',
				cssClass : 'error_msg',
				template: "Please select an album."
			});
			alertPopup.then(function(res) {
				return false;
			});
		} else {
			window.localStorage['SelectedAlbumIdSite'] = $(".RadioAlbumSite:checked").attr("AlbumIdSite");
			window.localStorage['SelectedAlbumNameSite'] = $(".RadioAlbumSite:checked").val();
			window.localStorage['SelectedImageIdSite'] = "";
			window.localStorage['SelectedImageNameSite'] = "";
			window.localStorage['SelectedImageThumbSite'] = $(".RadioAlbumSite:checked").attr("ThumbNailUrlSite");
			window.localStorage['SelectedImageUrlSite'] = $(".RadioAlbumSite:checked").attr("ImgUrlSite");
			localStorage.removeItem("SelectedImageIdSite");
			localStorage.removeItem("SelectedImageNameSite");
			//var SelectedAlbumId = window.localStorage.getItem("SelectedAlbumId");
			//var SelectedAlbumName = window.localStorage.getItem("SelectedAlbumName");
			$window.location.href = '#/post_site_news';
		}
	});
	
})

.controller('SelectPhotosSiteCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,TeamUploadAlbumPhotosSiteFactory,$base64,$ionicPopup) {
	$("#content-loader").show();
	var AccountID = window.localStorage.getItem("AccountIDSite");
	var AlbumIdData = window.localStorage.getItem("AlbumIdDataSite");
	
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	var AllPhotosdataSite = [];
	var PhotoTableDisplay = '';
	$scope.init = function () { 
		var result = TeamUploadAlbumPhotosSiteFactory.TeamUploadPhotosSite($base64.encode(orgId),$base64.encode(auth_token),AccountID,AlbumIdData);
		result.success(function(data){
			if(data.album_photos.length > 0){
				PhotoTableDisplay = '<div class="mainPhotoDiv">';
				angular.forEach(data.album_photos, function (photofld, key){
					if(photofld[0].thumbnail != '') {
						if(photofld[0].thumbnail.indexOf("/assets") > -1) {
							photofld[0].thumbnail = ImageUrl+photofld[0].thumbnail;
						}else{
							photofld[0].thumbnail = photofld[0].thumbnail;
						}
					}
					if(photofld[0].url != '') {
						if(photofld[0].url.indexOf("/assets") > -1) {
							photofld[0].url = ImageUrl+photofld[0].url;
						}else{
							photofld[0].url = photofld[0].url;
						}
					}
					
					PhotoTableDisplay += '<div class="ChildDiv"><img class="ImgClsSite" src="'+photofld[0].thumbnail+'" ImgIdSite="'+photofld[0].id+'" ImgNameSite="'+photofld[0].title+'" ImgThumbSite="'+photofld[0].thumbnail+'" ImgUrlSite="'+photofld[0].url+'" ></div>';
				});
				PhotoTableDisplay += '<div class="CleatB"></div></div>';
				$(".DisplaySelectButtonSite").show();
			}else{
				$(".DisplaySelectButtonSite").hide();
				PhotoTableDisplay = '<div style="color: #ff0000;font-weight: bold;left: 50%;margin-top: 50px;text-align: center;width: 100%;">No Photos Available.</div>';
			}
			$("#DisplayImagesSite").html(PhotoTableDisplay);
			$("#content-loader").hide();
		});
		result.error(function(data){
			$("#content-loader").hide();
		});
	};
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		window.localStorage.removeItem("SelectedImageIdSite");
		window.localStorage.removeItem("SelectedImageNameSite");
		window.localStorage.removeItem("SelectedImageThumbSite");
		window.localStorage.removeItem("SelectedImageUrlSite");
		$window.location.href = '#/select_photo_albums_site';
	};
	
	$(document).on('click', '.ImgClsSite', function(){
		$(".ImgClsSite").css({"border": "1px solid #FFFFFF", "opacity": "1"})
		$(this).css("border-color", "#FF0000");
		$(this).css("opacity", "0.74");
		$scope.SelectedImageId = $(this).attr("ImgIdSite");
		$scope.SelectedImageName = $(this).attr("ImgNameSite");
		$scope.SelectedImageThumb = $(this).attr("ImgThumbSite");
		$scope.SelectedImageUrl = $(this).attr("ImgUrlSite");
	});

	//$(document).on('click', '#SelectSelectPhotoSite', function(){
	$("#SelectSelectPhotoSite").click(function(){
		if($scope.SelectedImageId == undefined) {
			var alertPopup = $ionicPopup.alert({
				title: 'Error',
				cssClass : 'error_msg',
				template: "Please select a photo."
			});
			alertPopup.then(function(res) {
				return false;
			});
		} else {
			window.localStorage['SelectedImageIdSite'] = $scope.SelectedImageId;
			window.localStorage['SelectedImageNameSite'] = $scope.SelectedImageName;
			window.localStorage['SelectedImageThumbSite'] = $scope.SelectedImageThumb;
			window.localStorage['SelectedImageUrlSite'] = $scope.SelectedImageUrl;

			window.localStorage['SelectedAlbumIdSite'] = "";
			window.localStorage['SelectedAlbumNameSite'] = "";
			localStorage.removeItem("SelectedAlbumIdSite");
			localStorage.removeItem("SelectedAlbumNameSite");

			var SelectedPhotoId = window.localStorage.getItem("SelectedImageIdSite");
			var SelectedPhotoName = window.localStorage.getItem("SelectedImageNameSite");
			var SelectedPhotoThumb = window.localStorage.getItem("SelectedImageThumbSite");
			var SelectedPhotoUrl = window.localStorage.getItem("SelectedImageUrlSite");
			
			$window.location.href = '#/post_site_news';
		}
	});
})

.controller('SiteNewsDetailCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,$timeout,$ionicSlideBoxDelegate,$ionicModal,$ionicSlideBoxDelegate,$ionicScrollDelegate,getPushNewsFactory,$base64) {
    var orgId = window.localStorage.getItem("org_id");
    var auth_token = window.localStorage.getItem("auth_token");
  	$scope.zoomMin = 1;
  	$scope.showImages = function(index) {
  		$scope.activeSlide = index;
  		$scope.showModal('templates/gallery-zoomview.html');
	};
	$scope.showModal = function(templateUrl) {
	  $ionicModal.fromTemplateUrl(templateUrl, {
	    scope: $scope
	  }).then(function(modal) {
	    $scope.modal = modal;
	    $scope.modal.show();
	  });
	}
	 
	$scope.closeModal = function() {
	  $scope.modal.hide();
	  //$scope.modal.remove()
	};
	 
	$scope.updateSlideStatus = function(slide) {
	  var zoomFactor = $ionicScrollDelegate.$getByHandle('scrollHandle' + slide).getScrollPosition().zoom;
	  if (zoomFactor == $scope.zoomMin) {
	    $ionicSlideBoxDelegate.enableSlide(true);
	  } else {
	    $ionicSlideBoxDelegate.enableSlide(false);
	  }
	};
	$scope.init = function () {
            if(window.localStorage.getItem("is_push_notify")) {
            var push_news_id = window.localStorage.getItem("push_news_id");
            //alert(push_news_id);
            var result = getPushNewsFactory.getPushNews($base64.encode(orgId),$base64.encode(auth_token),push_news_id);
            result.success(function(data) {
                //console.log(data);
                //alert(JSON.stringify(data, null, 4));
                if(data.news_items.media) {
                    for(var i in data.news_items.media) {
                       if(data.news_items.media[i].thumbnail != '') {
                          if(data.news_items.media[i].thumbnail.indexOf("/assets") > -1) {
                                data.news_items.media[i].thumbnail = ImageUrl+data.news_items.media[i].thumbnail;
                           }
                       }
                       if(data.news_items.media[i].url != '') {
                          if(data.news_items.media[i].url.indexOf("/assets") > -1) {
                                data.news_items.media[i].url = ImageUrl+data.news_items.media[i].url;
                           }
                        }
                    }
                }
                $scope.NewsDetails = data.news_items;
                $("#content-loader").hide();
            });
            result.error(function(data) {
                 console.log(data);
                $("#content-loader").hide();
            });
            window.localStorage.removeItem("is_push_notify");
        } else {
            $scope.NewsDetails = JSON.parse(window.localStorage.getItem("SiteNewsDetails"));
            $("#content-loader").hide();
        }
		console.log($scope.NewsDetails);
	};
	$scope.GoBack = function() {
		$("#content-loader").show();
		$window.history.back();
	};
	$scope.nextSlide = function() {
    	$ionicSlideBoxDelegate.next();
  	}
})
.controller('ReminderCtrl', function($scope,$ionicPopover,$timeout,$ionicSideMenuDelegate,$window,$stateParams,getRemindersFactory,$base64,$ionicPopup,$state,$filter,$compile,$timeout) {
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	$scope.notifications = [];
	$scope.init = function() {
		var selected_chk_count = 0;
		var result = getRemindersFactory.getReminders($base64.encode(orgId),$base64.encode(auth_token));
		result.success(function(data){
			$scope.notifications = data.notifications;
			for(var i in $scope.notifications) {
				var ids = i.replace("_push_notification", "");
				if($scope.notifications[i] == true) {
					if(i != 'instant_msg_push_notification') {
						selected_chk_count++;
					}
					$("#"+ids).prop("checked",true);
				}
			}
			if(selected_chk_count == ($('input:checkbox.chk-setting').length)) {
				var btn = '<button class="button button-block button-assertive" ng-click="disable_all()">Disable All</button>';
			} else {
				var btn = '<button class="button button-block button-calm" ng-click="enable_all()">Enable All</button>';
			}
			
			var temp = $compile(btn)($scope);
			$("#btn_content").html(temp);
			$("#btn_content").show();
			$("#btn-loader").hide();
			$("#setting-loader").hide();
			$(".black-menu-fixed").hide();
			$("#content-loader").hide();
                       
            $(".DisplayData").show();
                       
		})
		result.error(function(data){
			$("#setting-loader").hide();
			$(".black-menu-fixed").hide();
			$("#content-loader").hide();
		})
	
		$scope.orgTitleReminder = window.localStorage.getItem("org_name_reminder");
	}
	$scope.disable_all = function() {
		$('input:checkbox.chk-setting').each(function () {
            $(this).prop('checked', '');
        });
        var btn = '<button class="button button-block button-calm" ng-click="enable_all()">Enable All</button>';
        var temp = $compile(btn)($scope);
        $("#btn_content").html(temp);
        $scope.save_reminder();
	}
	$scope.enable_all = function() {
		$('input:checkbox.chk-setting').each(function () {
            $(this).prop('checked', 'checked');
        });
        var btn = '<button class="button button-block button-assertive" ng-click="disable_all()">Disable All</button>';
        var temp = $compile(btn)($scope);
        $("#btn_content").html(temp);
        $scope.save_reminder();
	}
           
	$scope.save_reminder = function() {
		//$("#content-loader").show();
            var x = 0;
            $('input:checkbox.chk-setting').each(function () {
               if (this.checked == false) {
                   x++;
               }
            });
            if(x>0 || x == $('input:checkbox.chk-setting').length) {
            var btn = '<button class="button button-block button-calm" ng-click="enable_all()">Enable All</button>';
            var temp = $compile(btn)($scope);
            $("#btn_content").html(temp);
            }
            if(x == 0) {
            var btn = '<button class="button button-block button-assertive" ng-click="disable_all()">Disable All</button>';
            var temp = $compile(btn)($scope);
            $("#btn_content").html(temp);
            }
            
		var one_hour_in_advance = 0;
		var two_hours_in_advance = 0;
		var one_day_in_advance = 0;
		var two_days_in_advance = 0;
		var one_week_in_advance = 0;
		var event_rpc = 0;
		var instant_msg = 0;
		var team_news = 0;
		var org_news = 0;
		if($("#one_hour_in_advance").prop('checked')) {
			one_hour_in_advance = 1;
		}
		if($("#two_hours_in_advance").prop('checked')) {
			two_hours_in_advance = 1;
		}
		if($("#one_day_in_advance").prop('checked')) {
			one_day_in_advance = 1;
		}
		if($("#two_days_in_advance").prop('checked')) {
			two_days_in_advance = 1;
		}
		if($("#one_week_in_advance").prop('checked')) {
			one_week_in_advance = 1;
		}
		if($("#event_rpc").prop('checked')) {
			event_rpc = 1;
		}
		if($("#instant_msg").prop('checked')) {
			instant_msg = 1;
		}
		if($("#team_news").prop('checked')) {
			team_news = 1;
		}
		if($("#org_news").prop('checked')) {
			org_news = 1;
		}
		var str = '{"notification_profile":{"one_hour_in_advance_push_notification":"'+one_hour_in_advance+'","two_hours_in_advance_push_notification":"'+two_hours_in_advance+'","one_day_in_advance_push_notification":"'+one_day_in_advance+'","two_days_in_advance_push_notification":"'+two_days_in_advance+'","one_week_in_advance_push_notification":"'+one_week_in_advance+'","event_rpc_push_notification":"'+event_rpc+'","team_news_push_notification":"'+team_news+'","org_news_push_notification":"'+org_news+'"}}';
        //alert(str);

		var URL = API_URL+'/api/v1/account/'+$base64.encode(auth_token)+'/'+$base64.encode(orgId)+'/update_notifications';
		//alert(URL);
		if(str) {			
			$.ajax({
				type: "POST",
				url: URL,
				data: JSON.parse(str),
				success: function(data){
					//$state.reload();
				},
				error: function(data) {
					//$("#content-loader").hide();
				}
			});
		}
	}
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
})