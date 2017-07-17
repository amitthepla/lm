//var API_URL = "http://192.168.2.159:3000";
//var API_URL = "http://162.209.4.99:3000";
var API_URL = "http://192.237.170.38";
//var API_URL = "http://166.78.241.142";
var PerPage = 10;

var LoggedInUser = '{"records":{"id":"1","email":"test@andolasoft.com","firstname":"Test","lastname":"User","Gender":"female","DOB":"2\/8\/1991","street":"1375 Broadway, Fl 67","city":"New York","state":"NY","zip":"2344","phone":"212-555-1212"}}';

var UserLists = '{"records":{"2":{"id":"2","email":"carmen@leaguer.org","firstname":"Abner","lastname":"Doubleday","Gender":"female","DOB":"4\/10\/1987","street":"1375 Broadway, Fl 3","city":"New York","state":"NY","zip":"2344","phone":"212-555-1212"},"3":{"id":"3","email":"jj@sportsonrails.com","firstname":"Bill","lastname":"Blass","Gender":"male","DOB":"4\/11\/1988","street":"33 W. Main St.","city":"New York","state":"NY","zip":"34457","phone":"212-555-1254"},"4":{"id":"4","email":"peter@leaguer.org","firstname":"Peter","lastname":"Jones","Gender":"male","DOB":"31\/10\/1989","street":"1375 Broadway, F4 3","city":"New York","state":"NY","zip":"2344","phone":"212-345-1212"}}}';

var RosterEmails = '{"records":{"1":{"email":"bill.bean@gmail.com"},"2":{"email":"david.marsh@mcm.com"},"3":{"email":"wjones@yahoo.com"},"4":{"email":"hsmith@yahoo.com"},"5":{"email":"mlacey@ppc.com"},"6":{"email":"d.leachman@bbuy.com"}}}';

var Captains = '{"records":{"1":{"email":"carmen@leaguer.org","role":"Coach"}}}';

var CartLists = '{"records":{"1":{"name":"2014 Spring Co-ed Volleyball Season","gruop_opt":"Individuals","price":"$100.00","online_deposite":"$50.00","payment_schedule":"","balance_due":"May 1,2014","team_name":"Panthers","partner_name":""},"2":{"name":"2014 Travel Team","gruop_opt":"Individuals","price":"$1000.00","online_deposite":"$50.00","payment_schedule":"$200.00 (May 1), $200 (June 1), $200.00 (July 1), $200.00 (Aug 1)","balance_due":"May 1,2014","team_name":"Panthers","partner_name":""},"3":{"name":"May 15, Co-ed Open Play","gruop_opt":"Early Session - Advanced Court","price":"$15.00","online_deposite":"","payment_schedule":"","balance_due":"","team_name":"","partner_name":"John smith"}}}';

var LaterItemLists = '{"records":{"1":{"name":"2014 Spring Co-ed Volleyball Season","gruop_opt":"Individuals","price":"$100.00","online_deposite":"$50.00","payment_schedule":"","balance_due":"","team_name":"Panthers","partner_name":""}}}';

var IncompleteRegdLists = '{"records":{"1":{"name":"May 15, Co-ed Open Play","gruop_opt":"Early Session - Advanced Court","team_name":"","partner_name":"John smith"}}}';

var AllNews = '{"records":{"1":{"id":"1","heading":"1 event from U5 canceled: Strikers @ Dribblers on 07\/05 5:30AM","details":"The US Youth Soccer Organization (USYS) is a competitive fun soccer program for Children ranging from age 4-18.  USYS is a volunteer run organization focused on providing a rewarding experience for youth and adults alike. ","post_date":"July 3,2014 2.01pm","image":"cricket.jpg"},"2":{"id":"2","heading":"1 event from U5 postponed: Strikers @ Dribblers on 07\/05 5:30AM","details":"The US Youth Soccer Organization (USYS) is a competitive fun soccer program for Children ranging from age 4-18.  USYS is a volunteer run organization focused on providing a rewarding experience for youth and adults alike. ","post_date":"July 1,2014 4.37pm","image":"soccer.jpg"},"3":{"id":"3","heading":"1 event from Spring Beach League canceled: New Game on 07\/03 4:00AM","details":"The US Youth Soccer Organization (USYS) is a competitive fun soccer program for Children ranging from age 4-18.  USYS is a volunteer run organization focused on providing a rewarding experience for youth and adults alike. ","post_date":"July 5,2015 12.40pm","image":"volley.jpg"}}}';

var AllPaymentMethods = '{"records":{"1":{"card":"American Expression","cvv":"3113","address":"Carmen Bellavia","expires":"01\/17"},"2":{"card":"American Expression","cvv":"5672","address":"Carmen Bellavia","expires":"04\/17"}}}';

var AllCoordinators = '{"records":{"1":{"id":"1","firstname":"John","lastname":"Smith","email":"jsmith@xyzabc.com","phone":"435345345","role":"Coach"},"2":{"id":"2","firstname":"Moira","lastname":"Davidson","email":"moira.davidson@timewarndercableabc.com","phone":"8787978978","role":"Assistant Coach"}}}';

var AllPlayers = '{"records":{"1":{"id":"1","firstname":"Carmen","lastname":"Bellavia","email":"carmen.bellavia@timewarndercableabc.com"},"2":{"id":"2","firstname":"Peter","lastname":"Richards","email":"peter.richards@gmail.com"},"3":{"id":"3","firstname":"Amanda","lastname":"Jones","email":"amanda.jones@gmail.com"},"4":{"id":"4","firstname":"Tamara","lastname":"Helmsley","email":"t.helmsleyjones@gmail.com"}}}';



