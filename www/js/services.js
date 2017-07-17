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