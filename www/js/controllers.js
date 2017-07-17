angular.module('starter.controllers', ['ngOpenFB','angular.filter','ui.bootstrap.datetimepicker','base64','ngCordova'])

.controller('SideMenuCtrl', function($scope,$window,$ionicSideMenuDelegate,$filter,$state,CartCountFactory,$base64) {
	$scope.init = function() {
		$scope.isVisible = false;
		$scope.isOrg = false;
		if(window.localStorage.getItem("org_id")) {
			var org_id = parseInt(window.localStorage.getItem("org_id"));
			var OrgList = JSON.parse(window.localStorage.getItem("orgList"));
			if(OrgList.length > 1) {
				$scope.isOrg = true;
			}
			var orgDetail = $filter('filter')(OrgList, {org_id: org_id},true)[0];
			$scope.orgTitle = orgDetail.name;
			$scope.isVisible = true;
		}
		
		$scope.cartCountVal = 0;
		//if(window.localStorage.getItem("CartItemCount")){
		//	 $scope.cartCountVal = window.localStorage.getItem("CartItemCount");
		//}else{
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
		//}


	}
	$scope.home = function() {
		$ionicSideMenuDelegate.toggleLeft();
		window.localStorage["is_filter"] = 0;
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
		$ionicSideMenuDelegate.toggleLeft();
		$window.location.href = '#/orders';
	};
	$scope.GoNews = function() {
		$ionicSideMenuDelegate.toggleLeft();
		$window.location.href = '#/news_list';
	};
	$scope.GoTeam = function() {
		$ionicSideMenuDelegate.toggleLeft();
		$window.location.href = ' #/team';
	};
	$scope.GoCart = function() {
		$ionicSideMenuDelegate.toggleLeft();
		$window.location.href = '#/cart';
	};
	$scope.GoManageSchedule = function() {
		$ionicSideMenuDelegate.toggleLeft();
		window.localStorage["is_filter"] = 0;
		$window.location.href = '#/calender';
	};
	$scope.OpenPhotos = function() {
		$ionicSideMenuDelegate.toggleLeft();
		$window.location.href = '#/photos';
	};
})	

.controller('LoginCtrl', function($scope,$ionicModal, $timeout, ngFB,$ionicPlatform,$location,$timeout,$window,$ionicPopup,LoginFactory,$http,LoginFbFactory,$cordovaOauth) {
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
				$window.location.href = '#/landing_page/'+orgid;
				//$window.location.href = '#/calender';
			} else {
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
					var result = LoginFactory.userLogin($scope.loginData);
					result.success(function(data) {
								//cordova.plugins.Keyboard.close();
                                window.localStorage["auth_token"] = data.auth_token;
                                window.localStorage["email"] = $scope.loginData.email;
                                window.localStorage["orgList"] = JSON.stringify(data.organizations_list);
                                $window.location.href = '#/landing_page';
								$("#content-loader").show();
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
            var record = LoginFbFactory.userLoginFb(access_token,expires_in,user);
            record.success(function(data) {
               //cordova.plugins.Keyboard.close();
                window.localStorage["is_fb"] = 1;
                window.localStorage["access_token"] = access_token;
                window.localStorage["auth_token"] = data.auth_token;
                window.localStorage["email"] = user.email;
                window.localStorage["orgList"] = JSON.stringify(data.organizations_list);
                $window.location.href = '#/landing_page';
				$("#content-loader").show();
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

.controller('LandCtrl', function ($scope, ngFB,$ionicPopover,$ionicHistory,$timeout,$ionicSideMenuDelegate,$window) {
    $scope.init = function () {
            //cordova.plugins.Keyboard.close();
			if(window.localStorage.getItem("is_fb")) {
				$("#profile_details").show();
			}
			var data = JSON.parse(window.localStorage.getItem("orgList"));
			var clubsArr = [];
            for (var i in data) {
                if(data[i].logo_url != "NA") {
                    data[i]['logo'] = API_URL+data[i].logo_url;
                } else {
                    data[i]['logo'] = "img/icons/9.png";
                }
				clubsArr.push(data[i]);
			}
			$scope.clubs = clubsArr;
			$("#content-loader").hide();
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

.controller('ClubCtrl', function($scope,$ionicPopover,$ionicHistory,$timeout,$ionicSideMenuDelegate,$window,orgIdFactory,CartCountFactory,$stateParams,$filter,$base64) {
	var id = parseInt($stateParams.clubId);
	var data = JSON.parse(window.localStorage.getItem("orgList"));
	var orgDetail = $filter('filter')(data, {org_id: id},true)[0];
	$scope.orgTitle = orgDetail.name;
	$scope.cartCountVal = 0;
	$("#content-loader").hide();
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
		$window.location.href = '#/landing_page';
	};
	$scope.logout = function() {
		window.localStorage.clear();
		$window.location.href = '#/login';
	};
    $scope.openOrder = function() {
         window.localStorage.removeItem("orderType");
         $ionicSideMenuDelegate.toggleLeft();
         $window.location.href = '#/orders';
    }
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
		} else if(window.localStorage.getItem("filter_res") && window.localStorage.getItem("filter_res") == 'all') {
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
.controller('CalenderCtrl', function($scope,$ionicHistory,$ionicPopover,$timeout,$ionicSideMenuDelegate,$window,$filter,eventDetailFactory,activitiesFactory,ActivityListFactory,$base64,displayDayService,$ionicScrollDelegate) {
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
					if(window.localStorage.getItem("BackEvent") == 'upcoming') {
						$("#upcoming_event").addClass("active");
						$("#recent_event").removeClass("active");
						$scope.isToday = true;
						team_ids = 'all';
						event_type = 'upcoming';
						window.localStorage["EventType"] = event_type;
					} else {
						$("#upcoming_event").removeClass("active");
						$("#recent_event").addClass("active");
						$scope.isToday = false;
						team_ids = 'all';
						event_type = 'completed';
						window.localStorage["EventType"] = event_type;
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
                    alert("Error in getting location.");
                    $("#content-loader").hide();
                    $scope.myGoBack();
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

.controller('EventCtrl', function($scope,$ionicPopover,$timeout,$ionicSideMenuDelegate,$window,eventDetailFactory) {
        $scope.init = function () {
		$scope.eventDetail = JSON.parse(eventDetailFactory.getEvent());
		if($scope.eventDetail.full_address != null) {
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
			if($scope.eventDetail.home_team != 'NA' && $scope.eventDetail.visiting_team != 'NA') {
				$scope.teams = $scope.eventDetail.home_team+', '+$scope.eventDetail.visiting_team;
			} else if($scope.eventDetail.home_team != 'NA' && $scope.eventDetail.visiting_team == 'NA') {
				$scope.teams = $scope.eventDetail.home_team;
			} else if($scope.eventDetail.home_team == 'NA' && $scope.eventDetail.visiting_team != 'NA') {
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
						tot_vis = tot_home+parseInt(arr[i]);
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
		//$("#content-loader").show();
		$window.location.href = '#/add_result';
	};
	$scope.cancel_postpone = function() {
		//$("#content-loader").show();
		$window.location.href = '#/cancel_event';
	};
	$scope.myGoBack = function() {
		$("#content-loader").show();
		//$window.history.back();
        $window.location.href = "#/calender";
	};
    $scope.showLocation = function(location) {
       window.localStorage["prev_hash"] = window.location.hash;
       $("#content-loader").show();
       $window.location.href = "#/google_map/"+location;
    }
})	

.controller('CreateEventCtrl', function($scope,$timeout,$ionicSideMenuDelegate,$window) {
	$(function () {
		$("#start_date").datepicker({
			dateFormat: 'dd/mm/yy'
		});
		$("#end_date").datepicker({
			dateFormat: 'dd/mm/yy'
		});
	});
	$('#start_time').timepicker();
	$('#end_time').timepicker();
	$scope.init = function () {
		
	};
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		//$("#content-loader").show();
		$window.history.back();
	};
	$scope.getLocation = function() {
		if($("#location option:selected").val() == 'new') {
			//$("#content-loader").show();
			$window.location.href = '#/new_location';
		}
	};
	$scope.getVenue = function() {
		if($("#venue option:selected").val() == 'new') {
			//$("#content-loader").show();
			$window.location.href = '#/new_venue';
		}
	};
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
.controller('AddResultCtrl', function($scope,$ionicPopover,$compile,$timeout,$ionicSideMenuDelegate,$window) {
	$scope.init = function () {
		
	}
	$scope.scoreDetail = {};
	$scope.addScore = function (e) {
		$('input.res-txt').each(function () {
			if($(this).val() == "") {
				alert("Please enter score");
				return false;
			}
		});
		if(jQuery.isEmptyObject($scope.scoreDetail) == false) {
			var ScoreResult = new Array();
			var rows= $('#score-tbl tbody tr.result-tbl').length;
			for(var i=0;i<rows;i++){
				ScoreResult.push({
					away:$scope.scoreDetail[i]['away'],
					home:$scope.scoreDetail[i]['home']
				});
			}
		}
	}
	$scope.addrow = function () {
		var rows= $('#score-tbl tbody tr.result-tbl').length;
		var newrow = '<tr class="result-tbl"><td class="txtrig"><label class="item item-input res-lab"><input type="text" class="res-txt" maxlength="4" ng-model="scoreDetail['+rows+'].away"></label></td><td class="txtlef" style="position:relative;"><label class="item item-input res-lab"><input type="text" class="res-txt" maxlength="4" ng-model="scoreDetail['+rows+'].home"></label><div class="delete-row" ng-click="delete_row($event)"><img src="img/delete.png" style="width:30px;cursor:pointer;"/></div></td></tr>';
		var temp = $compile(newrow)($scope);
		$("#score-tbl tr.result-tbl:last").after(temp);
	}
	$scope.cancel = function () {
		//$("#content-loader").show();
		$window.location.href = '#/event_detail';
	}
	$scope.done = function () {
		//$("#content-loader").show();
		$window.location.href = '#/display_result';
	}
	$scope.delete_row = function (event) {
		angular.element(event.target).parent().parent().parent().remove();
	}
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};	
	$scope.myGoBack = function() {
		//$("#content-loader").show();
		$window.history.back();
	};
})	
.controller('PostponeEventCtrl', function($scope,$ionicPopover,$filter,$ionicPopup,$timeout,$ionicSideMenuDelegate,$window) {
	$scope.button_value = "Reschedule Event";
	$scope.CanRescPostEve = {};
	$scope.CanRescPostEve.eventAction = 1;
	$scope.CanRescPostEve.start = $filter("date")(Date.now(), 'dd/MM/yyyy HH:mm');
	$scope.init = function () {
		
	}
	$scope.showSelectValue = function() {
		var action = $("#eventAction option:selected").val();
		if(action == 1) {
			$("#newDateTime").show();
			$scope.button_value = "Reschedule Event";
		} else if(action == 2) {
			$("#newDateTime").hide();
			$scope.button_value = "Cancel Event";
		} else if(action == 3) {
			$("#newDateTime").hide();
			$scope.button_value = "Postpone Event";
		}
	};
	$scope.SubmitForm = function() {
		if($scope.CanRescPostEve.eventAction == 1) {
			if(!$scope.CanRescPostEve.start) {
				alert("Please select start date");
				return false;
			}
		}
		var st_dt = $("#start_date").val();
		var en_dt = $("#end_date").val();
		var ms = moment(en_dt).diff(moment(st_dt));
		var d = moment.duration(ms);
		var s = Math.floor(d.asHours()) + moment.utc(ms).format(":mm:ss");
		if(s == '00:00:00'  || s.indexOf('-') == 0) {
			alert("Please select a valid end date");
			return false;
		}
		var recipient = [];
		var socialsite = [];
		$('input:checkbox.recipient').each(function () {
			if(($(this).is(":checked"))){
				recipient.push($(this).val());
			}
		});	
		$('input:checkbox.socialsite').each(function () {
			if(($(this).is(":checked"))){
				socialsite.push($(this).val());
			}
		});
		var action = $("#eventAction option:selected").val();
	};	
	$scope.$watch('CanRescPostEve.startdate', function(unformattedDate){
		$scope.CanRescPostEve.start = $filter('date')(unformattedDate, 'dd/MM/yyyy HH:mm');
	});
	$scope.$watch('CanRescPostEve.enddate', function(unformattedDate){
		$scope.CanRescPostEve.end = $filter('date')(unformattedDate, 'dd/MM/yyyy HH:mm');
	});
	$scope.selectStartDate = function() {
		$scope.tmp = {};
		$scope.tmp.startDate = $scope.CanRescPostEve.startdate;
		
		var startDatePopup = $ionicPopup.show({
			template: '<datetimepicker ng-model="tmp.startDate"></datetimepicker>',
			title: "Start Date",
			scope: $scope,
			buttons: [
			   {text: 'Cancel'},
			   {
					text: '<b>Save</b>',
					type: 'button-positive',
					onTap: function(e) {
						$scope.CanRescPostEve.startdate = $scope.tmp.startDate;
					}
			   }
			]
		});
	}
	$scope.selectEndDate = function() {
		$scope.tmp = {};
		$scope.tmp.endDate = $scope.CanRescPostEve.enddate;
		
		var endDatePopup = $ionicPopup.show({
			template: '<datetimepicker ng-model="tmp.endDate"></datetimepicker>',
			title: "End Date",
			scope: $scope,
			buttons: [
			   {text: 'Cancel'},
			   {
					text: '<b>Save</b>',
					type: 'button-positive',
					onTap: function(e) {
						var st_dt = $("#start_date").val();
						var en_dt = $filter('date')($scope.tmp.endDate, 'dd/MM/yyyy HH:mm');
						var ms = moment(en_dt).diff(moment(st_dt));
						var d = moment.duration(ms);
						var s = Math.floor(d.asHours()) + moment.utc(ms).format(":mm:ss");
						if(s == '00:00:00'  || s.indexOf('-') == 0) {
							alert("Please select a valid end date");
							return false;
						}
						$scope.CanRescPostEve.enddate = $scope.tmp.endDate;
					}
			   }
			]
		});
	}
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		//$("#content-loader").show();
		$window.history.back();
	};
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
		$window.location.href = window.localStorage.getItem("prev_page");
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
		$window.history.back();
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
			}else if(!data.registration_details.non_participation.valid && !data.registration_details.is_team){ //INDIVIDUAL
				$(".registerFor").show();
				$(".DisplayRosterAddForm").hide();
				$(".DisplayCoachAddForm").hide();
				$(".isTeamSts").val(data.registration_details.is_team);
				$(".validSts").val(data.registration_details.non_participation.valid);
			}
			
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
			
			angular.forEach(data.registration_details.register_for.options, function (reglist, key){
				WhomRegister[reglist.value] = reglist;
			});
			
			if(data.registration_details.show_skill_level){
				displayCustomFields = 2;
				angular.forEach(data.registration_details.skill_level.values, function (skillist, key){
					skilllists[skillist.trim()] = skillist.trim();
				});
			}
			
			if(data.registration_details.show_division){
				displayCustomFields = 2;
				angular.forEach(data.registration_details.division.values, function (divisionlist, key){
					divisionists[divisionlist.trim()] = divisionlist.trim();
				});
			}
			
			if(data.registration_details.show_shirt_size){
				displayCustomFields = 2;
				angular.forEach(data.registration_details.shirt_size.values, function (shirtsizelist, key){
					shirtsizelists[shirtsizelist.trim()] = shirtsizelist.trim();
				});
			}
			
			if(data.registration_details.show_short_size){
				displayCustomFields = 2;
				angular.forEach(data.registration_details.short_size.values, function (shortsizelist, key){
					shortsizelists[shortsizelist.trim()] = shortsizelist.trim();
				});
			}
			
			//This condition is requited to display the fields if the registration is not type of is_team=TRUE and valid=TRUE
			if(data.registration_details.is_team && data.registration_details.non_participation.valid && data.registration_details.non_participation.non_participation_details.participating){
				$(".nameDetails").show();
				$(".AddressCls").show();
				$(".AddInfos").show();
				$(".EmergContact").show();
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
							}else{
								var TeamValidationClass = '';
								var TeamValidationFieldType = 'validfieldtype="'+teamcustomlist.type+'"';
							}
							

							if(teamcustomlist.type == "select"){
								teamcustomfieldlists += '<div class="list" style="margin-bottom:0px;"><select id="registration_custom_field_data_'+teamcustomlist.field_name.replace(/ /g, "_")+'" class="item item-input item-select selectlabel getTeamDataClass '+TeamValidationClass+'" customFieldname="'+teamcustomlist.field_name.replace(/ /g, "_")+'" name="registration[custom_field_data]['+teamcustomlist.field_name+']" '+TeamValidationFieldType+'>';
								teamcustomfieldlists += '<option value="">'+teamcustomlist.field_name+'</option>';
								angular.forEach(teamcustomlist.values, function (value, key1){
									teamcustomfieldlists += '<option value="'+value+'">'+value+'</option>';
								});
								teamcustomfieldlists += '</select></div>';
							}else if(teamcustomlist.type == "multiselect"){
								teamcustomfieldlists += '<div class="mt10"><div class="fnt-bld mb10 getTeamDataClass '+TeamValidationClass+'" '+TeamValidationFieldType+' customFieldname="'+teamcustomlist.field_name.replace(/ /g, "_")+'">'+teamcustomlist.field_name+'</div>';
								angular.forEach(teamcustomlist.values, function (value2, key2){
									teamcustomfieldlists += '<div class="mt10 mb10"><div class="fl nrm-fnt">'+WeekArr[value2]+'</div><div class="fr sche-tog"><label class="toggle toggle-balanced"><input id="registration_custom_field_data_'+teamcustomlist.field_name.replace(/ /g, "_")+'_'+value2+'" name="registration[custom_field_data]['+teamcustomlist.field_name+']['+value2+']" type="checkbox" class="chk-day '+teamcustomlist.field_name.replace(/ /g, "_")+'" value="'+value2+'"/><div class="track"><div class="handle"></div></div></label></div><div class="cb"></div></div>';
								});
								teamcustomfieldlists += '</div>';
							}else if(teamcustomlist.type == "radio_buttons"){
								teamcustomfieldlists += '<div class="mt10"><div class="fnt-bld mb10 getTeamDataClass '+TeamValidationClass+'" '+TeamValidationFieldType+' customFieldname="'+teamcustomlist.field_name.replace(/ /g, "_")+'">'+teamcustomlist.field_name+'</div>';
								angular.forEach(teamcustomlist.values, function (value3, key3){
									teamcustomfieldlists += '<div class="mt10 mb10"><div class="fl nrm-fnt"><input type="radio" id="registration_custom_field_data_'+teamcustomlist.field_name.replace(/ /g, "_")+'_'+value3.replace(/(<|>)/g, "_")+'" name="registration[custom_field_data]['+teamcustomlist.field_name+']" class="rad-chk '+teamcustomlist.field_name.replace(/ /g, "_")+'" value="'+value3+'"/> <code>'+value3+'</code></div><div class="cb"></div></div>';
								});
								teamcustomfieldlists += '</div>';
							}else if(teamcustomlist.type == "text_field"){
								teamcustomfieldlists += '<div class="mt10"><div class="fnt-bld mb10 getTeamDataClass">'+teamcustomlist.field_name+'</div><div class="mt10 mb10"><label class="item item-input"><input type="text" placeholder="Textbox" id="registration_custom_field_data_'+teamcustomlist.field_name.replace(/ /g, "_")+'" name="registration[custom_field_data]['+teamcustomlist.field_name+']"></label></div></div>';
							}else if(teamcustomlist.type == "text_area"){
								teamcustomfieldlists += '<div class="mt10"><div class="fnt-bld mb10 getTeamDataClass">'+teamcustomlist.field_name+'</div><div class="mt10 mb10"><label class="item item-input"><textarea id="AddCom" id="registration_custom_field_data_'+teamcustomlist.field_name.replace(/ /g, "_")+'" name="registration[custom_field_data]['+teamcustomlist.field_name+']"></textarea></label></div></div>';
							}else if(teamcustomlist.type == "check_box"){
								teamcustomfieldlists += '<div class="mt10"><div class="fnt-bld mb10 getTeamDataClass">'+teamcustomlist.field_name+'</div>';
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
						}else{
							var ValidationClass = '';
							var ValidationFieldType = 'validfieldtype="'+customlist.type+'"';
						}
						
						customlists[key] = customlist;
						if(customlist.type == "select"){
							customfieldlists += '<div class="list" style="margin-bottom:0px;"><select id="registration_custom_field_data_'+customlist.field_name.replace(/ /g, "_")+'" class="item item-input item-select selectlabel getDataClass '+ValidationClass+'" customFieldname="'+customlist.field_name.replace(/ /g, "_")+'" name="registration[custom_field_data]['+customlist.field_name+']" '+ValidationFieldType+'>';
							customfieldlists += '<option value="">'+customlist.field_name+'</option>';
							angular.forEach(customlist.values, function (value, key1){
								customfieldlists += '<option value="'+value+'">'+value+'</option>';
							});
							customfieldlists += '</select></div>';
						}else if(customlist.type == "multiselect"){
							customfieldlists += '<div class="mt10"><div class="fnt-bld mb10 getDataClass '+ValidationClass+'" '+ValidationFieldType+' customFieldname="'+customlist.field_name.replace(/ /g, "_")+'">'+customlist.field_name+'</div>';
							angular.forEach(customlist.values, function (value2, key2){
								customfieldlists += '<div class="mt10 mb10"><div class="fl nrm-fnt">'+WeekArr[value2]+'</div><div class="fr sche-tog"><label class="toggle toggle-balanced"><input id="registration_custom_field_data_'+customlist.field_name.replace(/ /g, "_")+'_'+value2+'" name="registration[custom_field_data]['+customlist.field_name+']['+value2+']" type="checkbox" class="chk-day '+customlist.field_name.replace(/ /g, "_")+'" value="'+value2+'"/><div class="track"><div class="handle"></div></div></label></div><div class="cb"></div></div>';
							});
							customfieldlists += '</div>';
						}else if(customlist.type == "radio_buttons"){
							customfieldlists += '<div class="mt10"><div class="fnt-bld mb10 getDataClass '+ValidationClass+'" '+ValidationFieldType+' customFieldname="'+customlist.field_name.replace(/ /g, "_")+'">'+customlist.field_name+'</div>';
							angular.forEach(customlist.values, function (value3, key3){
								customfieldlists += '<div class="mt10 mb10"><div class="fl nrm-fnt"><input type="radio" id="registration_custom_field_data_'+customlist.field_name.replace(/ /g, "_")+'_'+value3.replace(/(<|>)/g, "_")+'" name="registration[custom_field_data]['+customlist.field_name+']" class="rad-chk '+customlist.field_name.replace(/ /g, "_")+'" value="'+value3+'"/> <code>'+value3+'</code></div><div class="cb"></div></div>';
							});
							customfieldlists += '</div>';
						}else if(customlist.type == "text_field"){
							customfieldlists += '<div class="mt10"><div class="fnt-bld mb10 getDataClass">'+customlist.field_name+'</div><div class="mt10 mb10"><label class="item item-input"><input type="text" placeholder="Textbox" id="registration_custom_field_data_'+customlist.field_name.replace(/ /g, "_")+'" name="registration[custom_field_data]['+customlist.field_name+']"></label></div></div>';
						}else if(customlist.type == "text_area"){
							customfieldlists += '<div class="mt10"><div class="fnt-bld mb10 getDataClass">'+customlist.field_name+'</div><div class="mt10 mb10"><label class="item item-input"><textarea id="AddCom" id="registration_custom_field_data_'+customlist.field_name.replace(/ /g, "_")+'" name="registration[custom_field_data]['+customlist.field_name+']"></textarea></label></div></div>';
						}else if(customlist.type == "check_box"){
							customfieldlists += '<div class="mt10"><div class="fnt-bld mb10 getDataClass">'+customlist.field_name+'</div>';
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
				//alert(1);
				$scope.totalRosterCount = data.registration_details.team_details.details.team_invites.length;
				var rosterfieldlists = '';
				var allRosters = data.registration_details.team_details.details.team_invites;
				
				if(SaveEditIdValue){
				
					angular.forEach(allRosters, function (rosterlist, key){
						if(rosterlist.email && rosterlist.first_name && rosterlist.last_name){
							rosterfieldlists = rosterfieldlists + '<label class="item item-input"><input type="hidden" id="registration_team_invites_attributes_'+key+'_team_invite_id" value="'+rosterlist.team_invite_id+'"><input type="hidden" id="registration_team_invites_attributes_'+key+'_person_id" value="'+rosterlist.person_id+'"><input type="hidden" id="registration_team_invites_attributes_'+key+'_person_email_id" value="'+rosterlist.person_email_id+'"><input type="text" class="rosterEmailClass" value="'+rosterlist.email+'" placeholder="rosteremail" id="registration_team_invites_attributes_'+key+'_person_attributes_emails_attributes_'+key+'_email_address" placeholder="Roster Email" name="registration[team_invites_attributes]['+key+'][person_attributes][emails_attributes]['+key+'][email_address]" ng-model="IndReg.rosterEmail"><input type="hidden" value="'+rosterlist.first_name+'" id="registration_team_invites_attributes_'+key+'_person_attributes_first_name" class="rosterFnameClass" name="registration[team_invites_attributes]['+key+'][person_attributes][first_name]" ng-model="IndReg.rosterFname"><input type="hidden" value="'+rosterlist.last_name+'" id="registration_team_invites_attributes_'+key+'_person_attributes_last_name" class="rosterLnameClass" name="registration[team_invites_attributes]['+key+'][person_attributes][last_name]" ng-model="IndReg.rosterLname"></label>';
						}
					});
					
				}else{
					
					angular.forEach(allRosters, function (rosterlist, key){
						if(rosterlist.email && rosterlist.first_name && rosterlist.last_name){
							rosterfieldlists = rosterfieldlists + '<label class="item item-input"><input type="text" class="rosterEmailClass" value="'+rosterlist.email+'" placeholder="rosteremail" id="registration_team_invites_attributes_'+key+'_person_attributes_emails_attributes_'+key+'_email_address" placeholder="Roster Email" name="registration[team_invites_attributes]['+key+'][person_attributes][emails_attributes]['+key+'][email_address]" ng-model="IndReg.rosterEmail"><input type="hidden" value="'+rosterlist.first_name+'" id="registration_team_invites_attributes_'+key+'_person_attributes_first_name" class="rosterFnameClass" name="registration[team_invites_attributes]['+key+'][person_attributes][first_name]" ng-model="IndReg.rosterFname"><input type="hidden" value="'+rosterlist.last_name+'" id="registration_team_invites_attributes_'+key+'_person_attributes_last_name" class="rosterLnameClass" name="registration[team_invites_attributes]['+key+'][person_attributes][last_name]" ng-model="IndReg.rosterLname"></label>';
						}
					});
					
				}
				$(".AddMoreRosterSection").html(rosterfieldlists);
			}
			
			
			//This code is required to build the Coach/Captin details
			if((data.registration_details.team_details.details) && data.registration_details.team_details.details.team_coordinators.address){
				$scope.totalCoachCountdata = data.registration_details.team_details.details.team_coordinators.details.length;
				var coachfieldlists = '';
				if(SaveEditIdValue){
					
					if(data.registration_details.team_details.details.team_coordinators.details[0].address && data.registration_details.team_details.details.team_coordinators.details[0].role){
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
			}else{
				$(".displayCustomIndi").hide();
			}
			
			$scope.totalData = data;
			$scope.registrationDetails = AllRegDetails;
			$scope.AllPaymentOptions = PaymentOptions;
			$scope.AllWhomRegister = WhomRegister;
			$scope.skilllists = skilllists;
			$scope.divisionists = divisionists;
			$scope.shirtsizelists = shirtsizelists;
			$scope.shortsizelists = shortsizelists;
			$scope.customlists = customlists;

			$scope.displayCustomFieldsStatus = displayCustomFields; //This variable require to display the custom fields and other Additional infos

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
					$('#payment_option option[value="'+data.registration_details.payment_options.selected_payment_type+'"]').prop('selected', true);
					$("#payment_option_val").val(data.registration_details.payment_options.selected_payment_type);
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
				
				if(data.registration_details.comment != 'null'){
					$(".AddComment").val(data.registration_details.comment);
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
			
			
			var payopt = $("#payment_option option:selected").val();
			if(payopt == "online") {
				$("#payfulldiv").show();
				$("#payplandiv").hide();
			} else if(payopt == "plan"){
				$("#payfulldiv").hide();
				$("#payplandiv").show();
			}
		$("#content-loader").hide();
	};	
	
	$scope.selectRoster = function(){
		var rosterOpt = $("#registration_participating_roster").val();
		if(rosterOpt == 'Yes'){
			$(".nameDetails").show();
			$(".AddressCls").show();
			$(".AddInfos").show();
			$(".EmergContact").show();
			$(".displayCustomIndi").show();
			
			var LoggedInUserDetail = $scope.totalData;
		
			var birthdateAcl = LoggedInUserDetail.registration_details.registration_target_person_details.birthdate;
			birthdateAcl = birthdateAcl.split("-");
			var birthYear = birthdateAcl[0];
			var birthMon  = birthdateAcl[1];
			var birthDay  = birthdateAcl[2];
		
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
		}else if(regopt == 'customer'){
			var LoggedInUserDetail = $scope.totalData;
		
			var birthdateAcl = LoggedInUserDetail.registration_details.registration_target_person_details.birthdate;
			birthdateAcl = birthdateAcl.split("-");
			var birthYear = birthdateAcl[0];
			var birthMon  = birthdateAcl[1];
			var birthDay  = birthdateAcl[2];
		
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
		
		}else{
			$("#firstName").val(selectedArr.sor_rtp_other_first_name);
			$("#lastName").val(selectedArr.sor_rtp_other_last_name);
			$("#gender").val(selectedArr.sor_rtp_other_gender);
			//$("#birthDay").val(selectedArr.sor_rtp_other_birthdate_3i+ "/" + selectedArr.sor_rtp_other_birthdate_2i+ "/" +selectedArr.sor_rtp_other_birthdate_1i);
			$("#birthDay").val(selectedArr.sor_rtp_other_birthdate_1i+ "-" + selectedArr.sor_rtp_other_birthdate_2i+ "-" +selectedArr.sor_rtp_other_birthdate_3i);
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
		
	}
	
	$scope.selectPayOpt = function() {
		var payopt = $("#payment_option option:selected").val();
	
		console.log('AllRegDetails',$scope.registrationDetails);
		console.log('PaymentOptions',$scope.AllPaymentOptions);
		if(payopt == ''){
			$("#payfulldiv").hide();
			$("#payplandiv").hide();
		}else{
			//var n = payopt.indexOf("##");
			//if(n > 0){ //Then it is a plan option
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
		$window.history.back();
	};
	$scope.goToUserInf = function(id) {
		//$("#content-loader").show();
		$window.location.href = '#/individual_regd/'+id;
	}
	$scope.paymentFormat = function() {
		var payopt = $("#payment_option option:selected").val();
		if(payopt == "online") {
			$("#payfulldiv").show();
			$("#payplandiv").hide();
		} else if(payopt == "plan"){
			$("#payfulldiv").hide();
			$("#payplandiv").show();
		}
	}
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
	
	$scope.IndReg = {};
	$scope.submitIndReg = function() {
		//console.log($scope.IndReg);return false;
		//$("#content-loader").show();
		//$window.location.href = '#/cart';
		
		var SubmitStatus = false;
		
		if($('#registration_participating_roster').is(':visible')){
			var rosterOptValid = $("#registration_participating_roster").val();
		}
		
		var PaymentOptionVal = $("#payment_option").val();
		if($('#register_option').is(':visible')){
			var RegisterOptionVal = $("#register_option").val();
		}
		
		var TeamName = $("#teamName").val();
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
			
			var isTeamSts = $(".isTeamSts").val();
			var validSts = $(".validSts").val();
			var RosterVal = $("#registration_participating_roster").val();
			var TeamName = $("#teamName").val();
			var PaymentOptionVal = $("#payment_option").val();
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
				var CustomFieldsArr = '{"registration":{"registration_product_id":"'+RegistrationProdId+'","payment_type":"'+PaymentOptionVal+'","target_self":"'+TargetSelf+'",';
				
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
					CustomFieldsArr += '"custom_field_data":{';
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
					if(getDataCounter > 0){
						CustomFieldsArr = CustomFieldsArr.substr(0, (CustomFieldsArr.length)-1);
						CustomFieldsArr = CustomFieldsArr+'},';
					}
				}

				if(SaveEditIdValue){
					CustomFieldsArr = CustomFieldsArr + '"emergency_contact_person_attributes":{"first_name":"'+emgFirstName+'","last_name":"'+emgLastName+'","phone":"'+emgPhone+'","emails_attributes":{"0":{"email_address":"'+emgEmail+'","id":"'+emerEmailHiddenID+'"}},"id":"'+emerHiddenID+'"},"comment":"'+AddlComment+'"},"team_invite_id":"","preselected_registration_target_person":"'+RegisterOptionVal+'","custom_form_reply":{"extra_field_data":{"Your_Name_":"","Additional_Info_To_Share_With_Us_":""}},"commit":"Continue","_":"","id":"'+register_id+'"}';
				}else{
					CustomFieldsArr = CustomFieldsArr + '"emergency_contact_person_attributes":{"first_name":"'+emgFirstName+'","last_name":"'+emgLastName+'","phone":"'+emgPhone+'","emails_attributes":{"0":{"email_address":"'+emgEmail+'"}}},"comment":"'+AddlComment+'"},"team_invite_id":"","preselected_registration_target_person":"'+RegisterOptionVal+'","custom_form_reply":{"extra_field_data":{"Your_Name_":"","Additional_Info_To_Share_With_Us_":""}},"commit":"Continue","_":""}';
				}
				
				//CustomFieldsArr = CustomFieldsArr.substr(0, (CustomFieldsArr.length)-1);
				//CustomFieldsArr = CustomFieldsArr+'}}';
		    }
			
			else if(isTeamSts=='true' && validSts=='true') //This is the condition for the Team registration
			{
				var SaveEditIdValue = window.localStorage.getItem("SaveEditCardId");
				if(RosterVal == "No"){
					var CustomFieldsArr = '{"registration":{"registration_product_id":"'+RegistrationProdId+'","payment_type":"'+PaymentOptionVal+'","participating":"false","requested_team_name":"'+TeamName+'",';
				}else if(RosterVal == "Yes"){
					var CustomFieldsArr = '{"registration":{"registration_product_id":"'+RegistrationProdId+'","payment_type":"'+PaymentOptionVal+'","participating":"true","requested_team_name":"'+TeamName+'",';
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
						
						if(Email_Address == "" && fname == "" && lname == "") {
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
						}
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
					});
					
					CustomFieldsArr = CustomFieldsArr.substr(0, (CustomFieldsArr.length)-1);
					
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
						if(EmailAddress == "" && CoachRole == "") {
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
						}
						
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
				
				var CustomFieldsArr = '{"registration":{"registration_product_id":"'+RegistrationProdId+'","payment_type":"'+PaymentOptionVal+'","target_self":"'+TargetSelf+'","requested_team_name":"'+TeamName+'",';
				
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
				
				if(emerHiddenID && emerEmailHiddenID){
					CustomFieldsArr = CustomFieldsArr + '"emergency_contact_person_attributes":{"first_name":"'+emgFirstName+'","last_name":"'+emgLastName+'","phone":"'+emgPhone+'","emails_attributes":{"0":{"email_address":"'+emgEmail+'","id":"'+emerEmailHiddenID+'"}},"id":"'+emerHiddenID+'"},';
				}else{
					CustomFieldsArr = CustomFieldsArr + '"emergency_contact_person_attributes":{"first_name":"'+emgFirstName+'","last_name":"'+emgLastName+'","phone":"'+emgPhone+'","emails_attributes":{"0":{"email_address":"'+emgEmail+'"}}},';
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
						
						if(Email_Address == "" && fname == "" && lname == "") {
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
						}
					
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
						
						if(EmailAddress == "" && CoachRole == "") {
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
						}
					
					
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
				});
				
				CustomFieldsArr = CustomFieldsArr.substr(0, (CustomFieldsArr.length)-1);
				
				if(SaveEditIdValue){
					CustomFieldsArr = CustomFieldsArr + '},"comment":"'+AddlComment+'"},"team_invite_id":"","custom_form_reply":{"extra_field_data":{"Your_Name_":"","Additional_Info_To_Share_With_Us_":""}},"commit":"Continue","_":"","id":"'+SaveEditIdValue+'"}';
				}else{
					CustomFieldsArr = CustomFieldsArr + '},"comment":"'+AddlComment+'"},"team_invite_id":"","custom_form_reply":{"extra_field_data":{"Your_Name_":"","Additional_Info_To_Share_With_Us_":""}},"commit":"Continue","_":""}';
				}
			}
			
			if(CustomFieldsArr){
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
							  $("#waiver-content").show();
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
		$window.location.href = "#/terms_conditions";
	}
})

.controller('TermsConditionCtrl', function($scope,$ionicHistory,$stateParams,$timeout,TnCFactory,TnCAcceptFactory,UserInfoFactory,$ionicSideMenuDelegate,$window,$base64,$ionicPopup) {
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	$scope.waiverData = {};
	$scope.init = function () {
		$scope.Waiver = JSON.parse(window.localStorage.getItem("WaiverInf"));
		$("#content-loader").hide();
	};
	$scope.myGoBack = function() {
		$window.history.back();
	};
	$scope.completeTnCProcess = function() {
		var termStatus = true;

		$(".TnC").hide();
		$(".RegistrationLoader").show();
		if($('#waiver_is_guardian').is(':hidden')){
			if($('#waiver_is_guardian').is(":checked") == false){
				var alertPopup = $ionicPopup.alert({
				   title: '<div style="text-align:center;">Please check the parent or legal gurdian.</div>'
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
		if(window.localStorage.getItem("cartType")){
			$scope.cart_typ = window.localStorage.getItem("cartType");
		} else {
			$scope.cart_typ = 'cart_items';
		}
		// First time select the first tab for the items in the cart section
		if($scope.cart_typ == 'cart_items'){
			$("#cart_items").addClass("active");
			$("#saved_items").removeClass("active");
			$("#incomplete_items").removeClass("active");
		} else if($scope.cart_typ == 'saved_items') {
			$("#saved_items").addClass("active");
			$("#cart_items").removeClass("active");
			$("#incomplete_items").removeClass("active");
		} else if($scope.cart_typ == 'incomplete_items') {
			$("#incomplete_items").addClass("active");
			$("#cart_items").removeClass("active");
			$("#saved_items").removeClass("active");
		}
		window.localStorage["cartType"] = $scope.cart_typ;
		var result = CartListFactory.cartList($base64.encode(orgId),$base64.encode(auth_token),$scope.cart_typ);
		$scope.Carts = [];

		result.success(function(data) {
			window.localStorage["CartList"] = data;
			if(data['cart_items'] && data['cart_items'].length > 0) {
				$scope.Carts = data['cart_items'];
				$scope.buttonDisplay = 1;
				$scope.isItem = true;
				$(".chkoutbtn").show();
			}else{
				$(".chkoutbtn").hide();
			}
			if(data['saved_items'] && data['saved_items'].length > 0) {
				$scope.Carts = data['saved_items'];
				window.localStorage["TotalSavedLater"] = data['saved_items'].length;
				var cartCount = window.localStorage.getItem("CartItemCount");
				/*if(cartCount > 0){
					$(".chkoutbtn").show();
				}else{
					$(".chkoutbtn").hide();

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
			}
			if(data['saved_items'] && data['saved_items'].length == 0) {
				$scope.isItem = false;
			}

			if(data['incomplete_items'] && data['incomplete_items'].length == 0) {
				$scope.isItem = false;
			}
			$("#content-loader").hide();
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
		window.localStorage["cartType"] = cart_type;
		$scope.Carts = [];
		if(cart_type == 'cart_items'){
			$("#cart_items").addClass("active");
			$("#saved_items").removeClass("active");
			$("#incomplete_items").removeClass("active");
		} else if(cart_type == 'saved_items') {
			$("#saved_items").addClass("active");
			$("#cart_items").removeClass("active");
			$("#incomplete_items").removeClass("active");
		} else if(cart_type == 'incomplete_items') {
			$("#incomplete_items").addClass("active");
			$("#cart_items").removeClass("active");
			$("#saved_items").removeClass("active");
		}
		var result = CartListFactory.cartList($base64.encode(orgId),$base64.encode(auth_token),cart_type);
		result.success(function(data) {
			window.localStorage["CartList"] = data;
			if(data['cart_items'] && data['cart_items'].length > 0) {
				$scope.Carts = data['cart_items'];
				$scope.buttonDisplay = 1;
				$scope.isItem = true;
				$(".chkoutbtn").show();
			}else{
				$(".chkoutbtn").hide();
			}
			if(data['saved_items'] && data['saved_items'].length > 0) {
				$scope.Carts = data['saved_items'];
				window.localStorage["TotalSavedLater"] = data['saved_items'].length;
				var cartCount = window.localStorage.getItem("CartItemCount");
				if(cartCount > 0){
					$(".chkoutbtn").show();
				}else{
					$(".chkoutbtn").hide();
				}
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
			}
			if(data['saved_items'] && data['saved_items'].length == 0) {
				$scope.isItem = false;
			}

			if(data['incomplete_items'] && data['incomplete_items'].length == 0) {
				$scope.isItem = false;
			}
			$("#content-loader").hide();
		});
		result.error(function(data) {
			console.log(data);
		});
    };
	$scope.deleteCart = function(regId){
		
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
					   var cartcount = window.localStorage.getItem("CartItemCount");
					   cartcount = parseInt(cartcount) - 1;
					   window.localStorage["CartItemCount"] = cartcount;
					   $(".cart_count").text(cartcount);
					   $("#DeleteMoveItem_"+regId).fadeOut("500");
					   if(cartcount == 0){
						   $scope.isItem = false;
						   $(".chkoutbtn").hide();
					   }else{
						   $(".chkoutbtn").show();
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
					   $("#DeleteMoveItem_"+regId).fadeOut("500");
					   if(cartcount == 0){
						   $scope.isItem = false;
						   $(".chkoutbtn").hide();
					   }else{
						   $(".chkoutbtn").show();
					   }
				   }
				}
			});
		 }
	   });
	};
	$scope.moveToCart = function(regId){
	   var confirmPopup = $ionicPopup.confirm({
		 title: '<div style="text-align:center;">Are you sure?</div>'
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
					   cartcount = parseInt(cartcount) + 1;
					   window.localStorage["CartItemCount"] = cartcount;
					   $(".cart_count").text(cartcount);
					   if(cartcount > 0){
						   $(".chkoutbtn").show();
					   }else{
						   $(".chkoutbtn").hide();
					   }				   
					   
					   /* manage The count for the saved item for displaying the No Data Found Message starts here*/
						   var savedItemCount = window.localStorage.getItem("TotalSavedLater");
						   savedItemCount = parseInt(savedItemCount) - 1;
						   window.localStorage["TotalSavedLater"] = savedItemCount;
						   $("#DeleteMoveItem_"+regId).fadeOut("500");
						   if(savedItemCount == 0){
							   $scope.isItem = false;
						   }
					   /* manage The count for the saved item for displaying the No Data Found Message ends here*/
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
			});
			result.error(function(data) {});
		$("#content-loader").hide();
	};
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
			$window.location.href = '#/order_detail';
			/*var alertPopup = $ionicPopup.alert({
				title: 'Place Order Status',
				cssClass : 'error_msg',
				template: data.message
			});
			alertPopup.then(function(res) {
				$("#loader-span2").hide();
				$window.location.href = '#/cart';
			});*/
			$("#loader-span2").hide();
		});
		result.error(function(data) {
			$(".LoaderOrder").hide();
			$("#error_div").show();
			$("#loader-span2").hide();
			$("#payment_error").html(data.message);
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
				var decode = 'credit_card[name_on_card]='+name+'&credit_card[credit_card_id]='+card_no+'&credit_card[expiration_month]='+exp_mnth+'&credit_card[expiration_year]='+exp_yr+'&credit_card[last4]='+last4+'&credit_card[card_type]='+card_typ+'&address1='+street+'&address2='+street2+'&city='+city+'&state='+state+'&zip='+zip+'&cvv='+cvv;
				var encode = $base64.encode(decode);
				var result = AddCreditCardFactory.addCreditCard($base64.encode(orgId),$base64.encode(auth_token),encode);

				result.success(function(data) {
					$("#loader-span").hide();
                    /*var alertPopup = $ionicPopup.alert({
                         title: 'Success',
                         cssClass : 'error_msg',
                         template: data.message
                   });
					alertPopup.then(function(res) {
						$window.location.href = '#/payment_methods';
					});*/
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
				return false;
			}
		}
	}
})

/************************************************** Cart ***********************************************************/
/************************************************** News ***********************************************************/
.controller('NewsListCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window) {
	var data = jQuery.parseJSON(AllNews);
	$scope.init = function () {
		//$timeout(function() {
			var NewsArr = [];
			for (var i in data.records) {
				NewsArr.push(data.records[i]);
			}
			$scope.NewsLists = NewsArr;
			//console.log(NewsArr);
	//}, 1000);
	};
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		//$("#content-loader").show();
		$window.history.back();
	};
	$scope.postNews = function() {
		//$("#content-loader").show();
		$window.location.href = '#/post_news';
	};
})

.controller('NewsDetailCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window) {
	var id = $stateParams.newsId;
	var data = jQuery.parseJSON(AllNews);
	$scope.init = function () {
		//$timeout(function() {	
			$scope.NewsDetail = data.records[id];
	//}, 1000);
	};
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		//$("#content-loader").show();
		$window.history.back();
	};
})

.controller('PostNewsCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window) {
	$scope.init = function () {
		//$timeout(function() {	
			
	//}, 1000);
	};
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		//$("#content-loader").show();
		$window.history.back();
	};
	$scope.selectFeeds = function() {
		//$("#content-loader").show();
		$window.location.href = '#/select_feeds';
	}
})
.controller('SelectFeedsCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window) {
	$scope.init = function () {
		//$timeout(function() {	
			
	//}, 1000);
	};
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		//$("#content-loader").show();
		$window.history.back();
	};
})
/************************************************** News ***********************************************************/
/*************************************** Make payment/orders *************************************************/
.controller('OrderCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,OrderHistoryFactory,$base64,$ionicScrollDelegate,$filter) {
	var page = 0;
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	$scope.orders = [];
	$scope.order_typ = '';
	$scope.noMoreItemsAvailable = false;
	$scope.isMessage = false;
	$scope.init = function () {
		$("#content-loader").hide();
		if(window.localStorage.getItem("orderType")) {
			$scope.order_typ = window.localStorage.getItem("orderType");
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
		$window.location.href = "#/order_detail";
	}
})

.controller('OrderDetailCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window) {
	$scope.init = function () {
		$scope.orderDetail = JSON.parse(window.localStorage.getItem("OrderDetail"));
		if(window.localStorage.getItem("orderType")) {
			$scope.orderType = window.localStorage.getItem("orderType");
		}
		if($scope.orderDetail.outstanding_balance_amount.toString().indexOf(',') === -1) {
			$scope.orderDetail.outstanding_balance_amount = $scope.orderDetail.outstanding_balance_amount.toFixed(2);
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
		$("#showRegLink_"+id).hide();
		$("#hideRegLink_"+id).show();
		$("#RegInfDiv_"+id).slideDown();
	};
	$scope.hideRegdInf = function(id) {
		$("#hideRegLink_"+id).hide();
		$("#showRegLink_"+id).show();
		$("#RegInfDiv_"+id).slideUp();
	};
})

.controller('MakePaymentCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,CreditCardFactory,$base64,$filter,$ionicPopup,payNowFactory) {
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	$scope.totAmt = 0;
	$scope.isDisabled = true;
	if($scope.totAmt.toString().indexOf('.') === -1) {
		$scope.totAmt = $scope.totAmt.toFixed(2);
	}
	$scope.isError = false;
	$scope.init = function () {
		window.localStorage.removeItem('CreditCartCount');
		$scope.orderDetail = JSON.parse(window.localStorage.getItem("OrderDetail"));
		if($scope.orderDetail.outstanding_balance_amount.toString().indexOf(',') === -1) {
			$scope.orderDetail.outstanding_balance_amount = $scope.orderDetail.outstanding_balance_amount.toFixed(2);
		}
		var result = CreditCardFactory.creditCardList($base64.encode(orgId),$base64.encode(auth_token));
		result.success(function(data) {
			if(data.credit_cards.length) {
				window.localStorage['CreditCartCount'] = data.credit_cards.length;
				$scope.activeCreditCard = $filter('filter')(data.credit_cards, {is_active: true},true)[0];
				if($scope.activeCreditCard) {
					   $scope.isError = false;
					   $scope.isDisabled = false;
				} else {
					   $scope.isError = true;
					   $scope.isDisabled = true;
				}
			} else {
				$scope.isError = true;
				$scope.isDisabled = true;
			}
		});	
		$("#content-loader").hide();
	};
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
			$("#"+id).parent().parent().parent().find('.payment_amount').prop("disabled", true);
			$("#"+id).parent().parent().parent().find('.payment_amount').val(balance);
		}else{
			$("#"+id).parent().parent().parent().find('.payment_amount').prop("disabled", false);
			$("#"+id).parent().parent().parent().find('.payment_amount').val('');
		}
		$scope.CalculateSum();
	}
	$scope.paynow = function(orderId) {
		$("#loader-span").show();
		var str;
		var str_final;
		$(".payment_amount").each(function() {
			var regId = $(this).attr('id');
			var payval = $(this).val();
			if($(this).prop('disabled') == false && !$(this).val()) {
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
			if($(this).prop('disabled')) {
				str = 'items['+regId+'][payment_option]=balance&wepay.x=Place Your Order&id='+orderId;
			} else {
				if($(this).val()) {
					if(parseFloat($(this).val()) <= parseFloat($(this).attr('max_val'))) {
						str = 'items['+regId+'][payment_option]=custom&items['+regId+'][custom_payment_amount]='+payval+'&wepay.x=Place Your Order&id='+orderId;
					} else {
						var alertPopup = $ionicPopup.alert({
							title: 'Error',
							cssClass : 'error_msg',
							template: "Your amount shouldn't be more than "+$(this).attr('max_val')
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
		if(str_final) {
			var result = payNowFactory.payNow($base64.encode(orgId),$base64.encode(auth_token),str_final);
			result.success(function(data) {
				var alertPopup = $ionicPopup.alert({
					title: 'Payment Status',
					cssClass : 'error_msg',
					template: data.message
				});
				alertPopup.then(function(res) {
					$window.location.href = '#/orders';
				});
			});
			result.error(function(data) {
				$("#loader-span").hide();
				$("#error_div").show();
				$("#payment_error").html(data.message);
				console.log(data.message);
			});
		}
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
		var result = TeamFactory.getTeamList($base64.encode(orgId),$base64.encode(auth_token));
		result.success(function(data) {
			if(data.team_infos.length) {
				$scope.teams = data.team_infos;
				$("#content-loader").hide();
			} else {
				$scope.isError = true;
			}
		});
		result.error(function(data) {});
	};
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.openDetail = function(teamId) {
		var teamId = parseInt(teamId);
		var teamDetail = $filter('filter')($scope.teams, {id: teamId},true)[0];
		window.localStorage['TeamDetail'] = JSON.stringify(teamDetail);
		$window.location.href = '#/team_details';
	}
	$scope.teamPayment = function(teamId) {
		var teamId = parseInt(teamId);
		var teamDetail = $filter('filter')($scope.teams, {id: teamId},true)[0];
		window.localStorage['TeamDetail'] = JSON.stringify(teamDetail);
		window.localStorage['BackTeamPayment'] = window.location.hash;
		$window.location.href = '#/team_payment';
	}
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
			var result = nextGameFactory.getNextGame($base64.encode(orgId),$base64.encode(auth_token),$scope.teamId);
			result.success(function(data) {
				$scope.next_game = data.upcoming_schedules;
				$("#next_game").show();
				if($scope.next_game.date) {
					var res = $scope.next_game.date.split(" ");
					$scope.day = displayDayService.showFullDay(res[0]);
					$scope.date = moment(res[1]).format('MMMM DD');
				}
			});
			result.error(function(data) {});
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
		$window.location.href = '#/team_schedule/'+teamId;
	}
})
.controller('TeamPaymentCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,TeamFactory,$base64,$filter,CreditCardFactory,$ionicPopup,PayTeamAmountFactory) {
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	$scope.isDisabled = true;
	$scope.init = function () {
		window.localStorage.removeItem('CreditCartCount');
		$scope.team_detail = JSON.parse(window.localStorage.getItem('TeamDetail'));
		var result = CreditCardFactory.creditCardList($base64.encode(orgId),$base64.encode(auth_token));
		result.success(function(data) {
			if(data.credit_cards.length) {
				$scope.activeCreditCard = $filter('filter')(data.credit_cards, {is_active: true},true)[0];
				window.localStorage['CreditCartCount'] = data.credit_cards.length;
				if($scope.activeCreditCard) {
					   $scope.isError = false;  
					   $scope.isDisabled = false;
				} else {
					   $scope.isError = true;
					   $scope.isDisabled = true;
				}
			} else {
				$scope.isError = true;
				$scope.isDisabled = true;
			}
		});	
		$timeout(function() {
			if(window.localStorage.getItem("TeamPaymentResult")) {
				var parsepayment = JSON.parse(window.localStorage.getItem("TeamPaymentResult"));
				console.log(parsepayment[0]);
				$("#"+parsepayment[0].id).val(parsepayment[0].value);
				if(parsepayment[0].ischecked) {
					$("#check_"+parsepayment[0].id).prop("checked",true);
					$("#"+parsepayment[0].id).prop("disabled",true);
				}
				window.localStorage.removeItem("TeamPaymentResult");
			}
			$("#content-loader").hide();
		}, 1000);
	};
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
						$window.location.href = '#/team';

				});
			});
			result.error(function(data) {
				$("#loader-span").hide();
				$("#error_div").show();
				$("#payment_error").html(data.message);
				console.log(data.message);
			});
		}
	};
})
.controller('TeamScheduleCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,TeamFactory,$base64,$filter,$ionicPopup,teamScheduleFactory,displayDayService,$ionicScrollDelegate,$ionicPosition,$location) {
	$("#content-loader").hide();
	var orgId = window.localStorage.getItem("org_id");
	var auth_token = window.localStorage.getItem("auth_token");
	var teamId = $stateParams.teamId;
	var recent_page = 0;
	var upcoming_page = 0;
	var today = 0;
	$scope.init = function () {
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
		//$window.history.back();
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
						$("#loader-top").hide();
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
								$scope.schedules.push(data[arr_typ][i]);
							} else if($scope.event_type == 'completed') {
								$scope.schedules.unshift(data[arr_typ][i]);
								$("#loader-top").hide();
							}
						}
				} else {
					if(page = 1 && data[arr_typ].length == 0 && $scope.event_type == 'upcoming') {
						$scope.noMoreUpcomingEvent = true;
						$scope.doRefresh();
					}
					if($scope.event_type == 'upcoming') {
						$scope.noMoreUpcomingEvent = true;
					} else if($scope.event_type == 'completed') {
						$scope.noMoreRecentEvent = true;
						$scope.$broadcast('scroll.refreshComplete');
						$("#loader-top").hide();
					}
					if(page == 1 && $scope.noMoreUpcomingEvent == true && $scope.noMoreRecentEvent == true) {
						$("#error_content").show();
					}
				}
			});
			result.error(function(data) {});
		},1000);
	}
	$scope.goToday = function() {
		if ($("#"+today).length) {
			$location.hash(today);
			$ionicScrollDelegate.anchorScroll(today);
		}
	};
	$scope.showLocation = function(location) {
        window.localStorage["prev_hash"] = window.location.hash;
        $("#content-loader").show();
        $window.location.href = "#/google_map/"+location;
    };
})
/*End of Team and Team payments*/
.controller('SendMessageCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window) {
	$scope.init = function () {
		//$timeout(function() {
			
	//}, 1000);
	};
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		//$("#content-loader").show();
		$window.history.back();
	};
})
.controller('StandingCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window) {
	$scope.init = function () {
		//$timeout(function() {
			
	//}, 1000);
	};
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		//$("#content-loader").show();
		$window.history.back();
	};
})
.controller('RosterCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window) {
	var data1 = jQuery.parseJSON(AllCoordinators);
	var data2 = jQuery.parseJSON(AllPlayers);
	$scope.init = function () {
		//$timeout(function() {
			var CoordinatorArr = [];
			for (var i in data1.records) {
				CoordinatorArr.push(data1.records[i]);
			}
			$scope.Coordinators = CoordinatorArr;console.log($scope.Coordinators);
			
			var PlayerArr = [];
			for (var i in data2.records) {
				PlayerArr.push(data2.records[i]);
			}
			$scope.Players = PlayerArr;console.log($scope.Players);
	//}, 1000);
	};
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		//$("#content-loader").show();
		$window.history.back();
	};
	$scope.addCoordinator = function(){
		//$("#content-loader").show();
		$window.location.href = '#/add_coordinator';
	};
	$scope.addPlayer = function(){
		//$("#content-loader").show();
		$window.location.href = '#/add_player';
	};
})
.controller('AddCoordinatorCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window) {
	$scope.init = function () {
		//$timeout(function() {
			
	//}, 1000);
	};
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		//$("#content-loader").show();
		$window.history.back();
	};
})
.controller('AddPlayerCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window) {
	$scope.init = function () {
		//$timeout(function() {
			
	//}, 1000);
	};
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		//$("#content-loader").show();
		$window.history.back();
	};
})
.controller('PhotosCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window,$cordovaFileTransfer) {
	/*$scope.init = function () {
		$timeout(function() {
			
		}, 1000);
	};
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		$window.history.back();
	};*/
	$scope.data = 'none';
      $scope.fileUpload = function() {
        console.log('upload function is called');
        var file = document.getElementById('file').files[0]; 
        var filePath =  cordova.file.externalRootDirectory + file.name;
        alert(filePath);
        alert(file.name);
		alert(file.type);
        var fileData = new FileReader();
        fileData.onloadend = function(e){
          $scope.data = e.target.result;
        } 
        fileData.readAsBinaryString(file);
        var options = {
           fileKey: "avatar",
           fileName: file.name,
           chunkedMode: false,
           mimeType: file.type
        }

        $cordovaFileTransfer.upload("https://github.com/anilkumar007/File_Transfer/blob/master/www/img/", $scope.data, options).then(function(result) {
            alert("SUCCESS: " + JSON.stringify(result.response));
        }, function(err) {
            alert("ERROR: " + JSON.stringify(err));
        });
	}
})

.controller('NewLocationCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window) {
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		//$("#content-loader").show();
		$window.history.back();
	};
})

.controller('NewVenueCtrl',function($scope,$stateParams,$timeout,$ionicSideMenuDelegate,$window) {
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.myGoBack = function() {
		//$("#content-loader").show();
		$window.history.back();
	};
})