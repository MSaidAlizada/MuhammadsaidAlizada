---
layout: post
title: "Finding an Account Takeover Vulnerability (CVSS 9.8)"
pinned: True
---
This write-up describes my first bug bounty report, which ended up being classified as critical severity (CVSS 9.8). I found this bug on a international telecom provider's web app within the login functionality.
<div style="text-align: center;">
    <img src="{{ site.url }}/assets/FindAccountTakeover/result.jpeg" alt="" style="width: 500px;"/>
</div>
When I first started testing the app I focused on understanding how it identifies users and I found out it was done through using JSON Web Tokens which were stored in a cookie once logged in. The JWT contained lots of user information but but the key parameter used across the application as the unique identifier was an encrypted document ID number.

Once I understood the identification mechanism, I began testing different functionality and analyzing the requests. The login request in particular stood out:
```
POST /apigw/mcrosrvc/cf/v4/login/ HTTP/2
Host: selfcare.vulnerable-site.com
Accept: application/json, text/plain, */*
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br
Content-Type: application/json
Version: 3.26
Channel: WEB
Lang: ENGLISH
Client-Secret: 1111
Client-Key: 1111
Client-Id: Nf1PgHpJGh
Sessionkey: 23408e817eb1b65bae50b77db948e96770c584f62bb68a499507591cdf03efd
Jwe-Journey-Instance: 123
Content-Length: 166
Origin: https://selfcare.vulnerable-site.com
Referer: https://selfcare.vulnerable-site.com/en/consumer/login
Sec-Fetch-Dest: empty
Sec-Fetch-Mode: cors
Sec-Fetch-Site: same-origin
Te: trailers
{"username":"attackerAccount","email":null,"password":"attackedPassword","isToEncrypt":true,"language":"EN","isOfflineAccess":false}
```
On the frontend, there are two fields: one for email/username and another for the password. The frontend logic decides whether the user entered an email or a username, then fills the corresponding parameter in the request while setting the other to null.

This caught my attention, because I wanted to see how the backend handled mixed credentials. After testing several combinations, I discovered a critical issue:
- If an attacker provides their own username and password but supplies the victim’s email, the server generates a JWT containing information from both accounts.
- Crucially, the encrypted document ID inside the JWT is taken from the victim.
- This means the attacker can now use this JWT to interact with the application as if they were the victim.

With this JWT, I was able to:
- Extract personal information from the victim’s account.
- Change the victim’s email address.
- Reset the password and take over the entire account.

This vulnerability demonstrated how small flaws in credential handling can escalate into a full account takeover. With just a crafted login request, an attacker could impersonate any user, access sensitive data, and completely compromise accounts. Eventhough it was marked as a duplicate, as my first bug bounty submission this was a huge learning experience and motivated me to continue hunting.