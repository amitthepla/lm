angular.module('starter.services', [])

.service('calculateAgeService', function () {
	var age;
	this.ageCal= function(value){
        var dob = new Date(value);
		var today = new Date();
		age = Math.floor((today-dob) / (365.25 * 24 * 60 * 60 * 1000));
		return age;
    };
})

.service('displayDayService', function () {
	this.showFullDay= function(dayToChange){
		switch (dayToChange) {
			case 'Sun':
				return "Sunday";
				break;
			case 'Mon':
				return "Monday";
				break;
			case 'Tue':
				return "Tuesday";
				break;
			case 'Wed':
				return "Wednesday";
				break;
			case 'Thu':
				return "Thursday";
				break;
			case 'Fri':
				return "Friday";
				break;
			case 'Sat':
				return "Saturday";
				break;
		} 
    };
})
.service('changeDateFormat', function () {
	this.formatDate= function(inputDate){
        var date = new Date(inputDate);
		if (!isNaN(date.getTime())) {
			var day = date.getDate().toString();
			var month = (date.getMonth() + 1).toString();
			// Months use 0 index.

			return (month[1] ? month : '0' + month[0]) + '/' +
			   (day[1] ? day : '0' + day[0]) + '/' + 
			   date.getFullYear();
		}
    };
})

.service('EditChangeDateFormat', function () {
	this.editformatDate= function(inputDate){
        var date = new Date(inputDate);
		if (!isNaN(date.getTime())) {
			var day = date.getDate().toString();
			var month = (date.getMonth() + 1).toString();
			// Months use 0 index.

			return (day[1] ? day : '0' + day[0]) + '/' + (month[1] ? month : '0' + month[0]) + '/' + date.getFullYear();
		}
    };
})
.service('EditEventDateFormat', function () {
	this.dateformat= function(inputDate){
        var date = new Date(inputDate);
		if (!isNaN(date.getTime())) {
			var day = date.getDate().toString();
			var month = (date.getMonth() + 1).toString();
			// Months use 0 index.

			return (month[1] ? month : '0' + month[0]) + '/' + (day[1] ? day : '0' + day[0]) + '/' + date.getFullYear();
		}
    };
})
.service('ConvertTimeFormat', function () {
	this.timeformat= function(time){
        var time_part_array = time.split(":");
		var ampm = 'am';
		if (time_part_array[0] >= 12) {
			ampm = 'pm';
		}
		if (time_part_array[0] > 12) {
			time_part_array[0] = time_part_array[0] - 12;
		}
		formatted_time = time_part_array[0] + ':' + time_part_array[1] + ampm;
		return formatted_time;
    };
})
.service('PrefillDateFormat', function () {
	this.PrefillDate= function(inputDate){
        var date = new Date(inputDate);
		if (!isNaN(date.getTime())) {
			var day = date.getDate().toString();
			var month = (date.getMonth() + 1).toString();
			// Months use 0 index.

			return date.getFullYear()+'-'+
			  (month[1] ? month : '0' + month[0])+'-'+(day[1] ? day : '0' + day[0]);
		}
    };
})
.service('PrefillTimeFormat', function () {
	this.PrefillTime= function(time){
		var last2 = time.slice(-2);
		var new_last2 = " "+time.slice(-2);
		var time = time.replace(last2, new_last2);
        var hours = Number(Number(time.match(/(\d+)/)[1]));
		var minutes = Number(time.match(/:(\d+)/)[1]);
		var AMPM = last2;
		if (AMPM == "PM" && hours < 12) hours = hours + 12;
		if (AMPM == "AM" && hours == 12) hours = hours - 12;
		var sHours = hours.toString();
		var sMinutes = minutes.toString();
		if (hours < 10) sHours = "0" + sHours;
		if (minutes < 10) sMinutes = "0" + sMinutes;
		return sHours + ":" + sMinutes;
    };
})