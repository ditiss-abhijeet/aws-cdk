#!/bin/bash
sudo su
yum update -y

yum install nginx -y
systemctl start nginx
systemctl enable nginx

chmod 2775 /usr/share/nginx/html
find /usr/share/nginx/html -type d -exec chmod 2775 {} \;
find /usr/share/nginx/html -type f -exec chmod 0664 {} \;

echo "<hMy test  web app using AWS CDK1></h1>" > /usr/share/nginx/html/index.html