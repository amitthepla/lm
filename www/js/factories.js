angular.module('starter.factories', [])

.factory('TnCFactory', function(){
	var age;
	var participantId;
	var name;
	var email;
    return {
        setAge: function(value){
            age = value;
        },
        getAge: function(){
            return age;
        },
		setId: function(value){
            participantId = value;
        },
        getId: function(){
            return participantId;
        },
		setName: function(value){
            name = value;
        },
        getName: function(){
            return name;
        },
		setEmail: function(value){
            email = value;
        },
        getEmail: function(){
            return email;
        }
    }               
})

.factory('TnCAcceptFactory', function(){
	var is_accept;
	var config;
    return {
        setAccept: function(value){
            is_accept = value;
        },
        getAccept: function(){
            return is_accept;
        },
		setConf: function(value){
            config = value;
        },
        getConf: function(){
            return config;
        }
    }               
})
.factory('UserInfoFactory', function(){
	var nm;
	var mail;
	var cont;
	var uid;
    return {
        setName: function(value){
            nm = value;
        },
        getName: function(){
            return nm;
        },
		setMail: function(value){
            mail = value;
        },
        getMail: function(){
            return mail;
        },
		setContact: function(value){
            cont = value;
        },
        getContact: function(){
            return cont;
        },
		setUserId: function(value){
            uid = value;
        },
        getUserId: function(){
            return uid;
        }
    }               
})
.factory('RegOptFactory', function(){
	var RegOpt;
	return {
		setOptions : function(arr) {
			RegOpt = arr;
		},
		getOptions : function() {
			return RegOpt;
		}
	}
})

.factory('orgIdFactory', function(){
	var orgId;
	return {
		setClubId : function(id) {
			orgId = id;
		},
		getClubId : function() {
			return orgId;
		}
	}
})

.factory('RegdRec', function(){
	var totRec;
	return {
		setTotRec : function(data) {
			totRec = data;
		},
		getTotRec : function() {
			return totRec;
		}
	}
})

.factory('LoginFactory', function($http){
	return {
         userLogin : function(inputData) {
			return $http.post(API_URL+'/api/v1/account/login?email='+inputData.email+'&password='+inputData.password);
		}
	}
})

.factory('LoginFbFactory', function($http){
    return {
         userLoginFb : function(access_token,expiry,userFbRec) {
            return $http.post(API_URL+'/api/v1/account/fb_login?fb[uid]='+userFbRec.id+'&fb[access_token]='+access_token+'&fb[expires]='+expiry+'&fb[email]='+userFbRec.email+'&fb[first_name]='+userFbRec.first_name+'&fb[last_name]='+userFbRec.last_name);
       }
    }
})
/*Schedule Functionality*/
.factory('MyScheduleFactory',function($http){
	return {
		myScheduleRec : function(org_id,auth_token) {
			return $http.post(API_URL+'/api/v1/myschedule/'+auth_token+'/'+org_id);
		}
	}
})
.factory('ActivityListFactory',function($http){
	return {
		activityList : function(org_id,auth_token,event_ids,event_type,per_page,page) {
			return $http.post(API_URL+'/api/v1/myschedule/'+auth_token+'/'+org_id+'?team_ids='+event_ids+'&event_type='+event_type+'&per_page='+per_page+'&page='+page);
		}
	}
})
.factory('activitiesFactory', function(){
	var act;
    var actcase;
    return {
        setActivities : function(res) {
			act = res;
        },
        getActivities : function() {
			return act;
        },
        setCase : function(res) {
			actcase = res;
        },
        getCase : function() {
			return actcase;
        }
    }
})
.factory('eventDetailFactory', function(){
	var evtDet;
	return {
		setEvent : function(res) {
			evtDet = res;
		},
		getEvent : function() {
			return evtDet;
		}
	}
})

.factory('RememberScheduleFactory', function(){
	var schedules;
	return {
		setSchedule : function(list) {
			schedules = list;
		},
		getSchedule : function() {
			return schedules;
		}
	}
})

/*Registaration Functionality*/
.factory('ActivityTypeFactory',function($http){
	return {
		activityTypeList : function(org_id,auth_token) {
			return $http.post(API_URL+'/api/v1/registrations/'+auth_token+'/'+org_id+'/get_activity_type');
		}
	}
})
.factory('RegistrationFactory',function($http){
	return {
		getRegistrationRecord : function(org_id,auth_token,activity_type_id) {
			if(window.localStorage.getItem("isRegFilter") == 0) {
				return $http.post(API_URL+'/api/v1/registrations/'+auth_token+'/'+org_id+'/get_registration_details');
			} else {
				return $http.post(API_URL+'/api/v1/registrations/'+auth_token+'/'+org_id+'/get_registration_details?activity_type_id='+activity_type_id);
			}
		}
	}
})
.factory('allRegdFactory', function(){
	var regdata;
	return {
		setRegd : function(res) {
			regdata = res;
		},
		getRegd : function() {
			return regdata;
		}
	}
})

/*Order Functionality*/
.factory('OrderHistoryFactory',function($http){
	return {
		orderHistory : function(org_id,auth_token,order_state,page,per_page) {	
			return $http.post(API_URL+'/api/v1/account/'+auth_token+'/'+org_id+'/order_details?order_state='+order_state+'&page='+page+'&per_page='+per_page);
		}
	}
})
.factory('PayOrderFactory',function($http){
	return {
		payorder : function(org_id,auth_token,payment) {	
			return $http.post(API_URL+'api/v1/account/order/'+auth_token+'/'+org_id+'/pay?'+payment);
		}
	}
})

/*Credit card functionality*/
.factory('CreditCardFactory',function($http){
	return {
		creditCardList : function(org_id,auth_token) {
			return $http.post(API_URL+'/api/v1/get_payment_methods/'+auth_token+'/'+org_id);
		}
	}
})
.factory('CartListFactory',function($http){
	return {
		cartList : function(org_id,auth_token,cart_type){
			console.log(API_URL+'/api/v1/carts/'+auth_token+'/'+org_id+'/get_cart_details?item_type='+cart_type);
			return $http.post(API_URL+'/api/v1/carts/'+auth_token+'/'+org_id+'/get_cart_details?item_type='+cart_type);
		}
	}
})
.factory('CartDeleteFactory',function($http){
	return {
		cartDelete : function(org_id,auth_token,regId){
			//console.log(API_URL+'/api/v1/delete_cart_item/'+auth_token+'/'+org_id+'?registration_id='+regId);
			return $http.post(API_URL+'/api/v1/delete_cart_item/'+auth_token+'/'+org_id+'?registration_id='+regId);
		}
	}
})
.factory('CartSaveFactory',function($http){
	return {
		cartSaveLater : function(org_id,auth_token,regId){
			//console.log(API_URL+'/api/v1/save_for_later/'+auth_token+'/'+org_id+'?registration_id='+regId);
			return $http.post(API_URL+'/api/v1/save_for_later/'+auth_token+'/'+org_id+'?registration_id='+regId);
		}
	}
})
.factory('CartMoveFactory',function($http){
	return {
		moveToCart : function(org_id,auth_token,regId){
			//console.log(API_URL+'/api/v1/move_to_cart/'+auth_token+'/'+org_id+'?registration_id='+regId);
			return $http.post(API_URL+'/api/v1/move_to_cart/'+auth_token+'/'+org_id+'?registration_id='+regId);
		}
	}
})
.factory('CartCountFactory',function($http){
	return {
		countCart : function(org_id,auth_token){
			//console.log(API_URL+'/api/v1/carts/'+auth_token+'/'+org_id+'/total_cart_item');
			return $http.post(API_URL+'/api/v1/carts/'+auth_token+'/'+org_id+'/total_cart_item');
		}
	}
})
.factory('SaveCreditCardFactory',function($http){
	return {
		saveCreditCard : function(org_id,auth_token,card_id) {
			return $http.post(API_URL+'/api/v1/select_payment_method/'+auth_token+'/'+org_id+'?creditcard_id='+card_id);
		}
	}
})
.factory('AddCreditCardFactory',function($http){
	return {
		addCreditCard : function(org_id,auth_token,encode) {
			//console.log(API_URL+'/api/v1/add_credit_card/'+auth_token+'/'+org_id+'?encode_data='+encode);
			return $http.post(API_URL+'/api/v1/add_credit_card/'+auth_token+'/'+org_id+'?encode_data='+encode);
		}
	}
})
.factory('DeleteCreditCardFactory',function($http){
    return {
      removeCreditCard : function(org_id,auth_token,cardId) {
         //console.log(API_URL+'/api/v1/delete_credit_card/'+auth_token+'/'+org_id+'?credit_card_id='+cardId);
         return $http.post(API_URL+'/api/v1/delete_credit_card/'+auth_token+'/'+org_id+'?credit_card_id='+cardId);
      }
    }
 })
.factory('payNowFactory',function($http){
	return {
		payNow : function(org_id,auth_token,str_final) {
			//console.log(API_URL+'/api/v1/account/order/'+auth_token+'/'+org_id+'/pay?'+str_final);
			return $http.post(API_URL+'/api/v1/account/order/'+auth_token+'/'+org_id+'/pay?'+str_final);
		}
	}
})
.factory('getBillingDetailFactory',function($http){
	return {
		getBillingInfo : function(org_id,auth_token) {
			//console.log(API_URL+'/api/v1/get_billing_address/'+auth_token+'/'+org_id);
			return $http.post(API_URL+'/api/v1/get_billing_address/'+auth_token+'/'+org_id);
		}
	}
})
/*team and team payment*/
.factory('TeamFactory',function($http){
	return {
		getTeamList : function(org_id,auth_token) {
			return $http.post(API_URL+'/api/v1/teams/'+auth_token+'/'+org_id+'/my_teams');
		}
	}
})
.factory('nextGameFactory',function($http){
	return {
		getNextGame : function(org_id,auth_token,team_id) {
			//console.log(API_URL+'/api/v1/teams/'+auth_token+'/'+org_id+'/get_next_game?team_id='+team_id);
			return $http.post(API_URL+'/api/v1/teams/'+auth_token+'/'+org_id+'/get_next_game?team_id='+team_id);
		}
	}
})
.factory('PayTeamAmountFactory',function($http){
	return {
		paynow : function(org_id,auth_token,str) {
			//console.log(API_URL+'/api/v1/teams/'+auth_token+'/'+org_id+'/pay?'+str);
			return $http.post(API_URL+'/api/v1/teams/'+auth_token+'/'+org_id+'/pay?'+str);
		}
	}
})
.factory('teamScheduleFactory',function($http){
	return {
		getSchedules : function(org_id,auth_token,team_id,event_type,page,per_page) {
			//console.log(API_URL+'/api/v1/teams/'+auth_token+'/'+org_id+'/schedules?team_id='+team_id+'&event_type='+event_type+'&per_page='+per_page+'&page='+page);
			return $http.post(API_URL+'/api/v1/teams/'+auth_token+'/'+org_id+'/schedules?team_id='+team_id+'&event_type='+event_type+'&per_page='+per_page+'&page='+page);
		}
	}
})
/*End*/
.factory('PlaceOrderFactory',function($http){
	return {
		placeorder : function(org_id,auth_token,amount) {
		//console.log(API_URL+'/api/v1/carts/'+auth_token+'/'+org_id+'/pay?online_purchase_payment_amount='+amount+'&wepay.x=Place Your Order');
			return $http.post(API_URL+'/api/v1/carts/'+auth_token+'/'+org_id+'/pay?online_purchase_payment_amount='+amount+'&wepay.x=Place Your Order');
		}
	}
})
/*Individual registration*/
.factory('IndividualRegFactory',function($http){
	return {
		individualreg : function(org_id,auth_token,regproductid) {
			//console.log(API_URL+'/api/v1/registrations/'+auth_token+'/'+org_id+'/get_registration_product_details?registration_product_id='+regproductid);
			return $http.post(API_URL+'/api/v1/registrations/'+auth_token+'/'+org_id+'/get_registration_product_details?registration_product_id='+regproductid);
		}
	}
})
.factory('EditIndividualRegFactory',function($http){
	return {
		editIndividualReg : function(org_id,auth_token,CartId) {
			//console.log(API_URL+'/api/v1/registrations/'+auth_token+'/'+org_id+'/edit_registration?id='+CartId);
			return $http.post(API_URL+'/api/v1/registrations/'+auth_token+'/'+org_id+'/edit_registration?id='+CartId);
		}
	}
})