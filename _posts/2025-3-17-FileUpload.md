---
layout: post
title: "File upload - Web Sec academy labs"
pinned: True
---
This post will run through the labs on web sec academy by Portswigger related to File upload vulnerabilities.  

### <u>Lab: Remote code execution via web shell upload
In this lab we are able to upload files as our avatar in account page and it has no restriction on what type of files we can add so we can give it some php code to return us the contents of the file we are looking for.
```
<?php echo file_get_contents('/home/carlos/secret'); ?>
```
By uploading the code above and sending a request for it we are able to get the server to execute the code and return the results.

### <u>Lab: Web shell upload via Content-Type restriction bypass
Other times the application may restrict file upload on file types however if this being check the HTTP request this can be bypassed through changing the Content-Type header to something allowed. In this case we change it from text/php to image/jpeg. We can use the same file since we are trying to access the same secret file.

### <u>Lab: Web shell upload via path traversal
Another line of defense is to stop the server from executing any uploaded scripts so as a precaution some only run those that explicity state it in their MIME type. A directory to which user-supplied files are uploaded will likely have much stricter controls than other locations on the filesystem that are assumed to be out of reach for end users. If you can find a way to upload a script to a different directory that's not supposed to contain user-supplied files, the server may execute your script after all. In this lab we try to upload our script to a different directory by changing the supplied file name from "exploit.php" to "../exploit.php" however we see it doesn't change where the file gets uploaded which means the server is probably stripping the path traversal. We can bypass this by obfuscating it through url encoding it to "..%2fexploit.php" which does allow us to store our file in a different directory where we can execute the script.

### <u>Lab: Web shell upload via extension blacklist bypass
Other ways to prevent uploading malicious scripts is through blacklisting certain file types like .php however sometimes lesser known alternatives might not be blacklisted like .php5 or .shtml. However the server may not run our script if it is not configured to do so, however many server allow you to create configuration files for directories that override the general configuration. In this case the lab uses apache which through uploading .htaccess file we can override the configuration.  


So first for this lab we will just upload our previous exploit.php file to capture the request it sends. Once captured we can modify to upload a .htaccess file with the following contents:
```
AddType application/x-httpd-php .smh
```
This tells the server to treath files with .smh extension as php scripts which allows us to bypass the extension blacklist and have our file executed by uploading it as "exploit.smh".

### <u>Lab: Web shell upload via obfuscated file extension
Sometimes applications will require certain file types for the upload however this can be bypassed through obfuscation. There are several methods to get past this like:
- Depending on the algorithm used to parse the filename, the following file may be interpreted as either a PHP file or JPG image: exploit.php.jpg
- Add trailing characters
- URL encoding (or double URL encoding) for dots, forward slashes, and backward slashes
- Add semicolons or URL-encoded null byte characters before the file extension


In this case since it requires us to have a jpg or png file type for the upload we will use a nullbyte after .php to have this file name "exploit.php%00.jpg". Once uploading this we get the result:
```
The file avatars/exploit.php has been uploaded.
```
As we can the obfuscation worked and now the php file is uploaded.

### <u>Lab: Remote code execution via polyglot web shell upload
Instead of implicitly trusting the Content-Type specified in a request, more secure servers try to verify that the contents of the file actually match what is expected. Similarly, certain file types may always contain a specific sequence of bytes in their header or footer. These can be used like a fingerprint or signature to determine whether the contents match the expected type. For example, JPEG files always begin with the bytes FF D8 FF.

This is a much more robust way of validating the file type, but even this isn't foolproof. Using special tools, such as ExifTool, it can be trivial to create a polyglot JPEG file containing malicious code within its metadata. So in this lab we will use exiftool to change the metadata of a png file to include our php script. We can add our php script to the Comment metadata using the following command:
```
exiftool a.png -Comment=" <?php echo file_get_contents('/home/carlos/secret'); ?> "
```
Now renaming a.png to a.php we can upload it and it will bypass the checks since it has image metadata and when we view the response when requesting our avatar we see too many characters mixed and it is not possible to distinguish our file we are trying to get. To fix this we can concatenate a start and end string to our file as such:
```
exiftool a.png -Comment=" <?php echo 'START' . file_get_contents('/home/carlos/secret') . 'END'; ?> "
```