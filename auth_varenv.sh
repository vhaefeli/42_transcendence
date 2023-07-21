#!/bin/sh

if [ -z "$1" ] || [ -z "$2" ]; then
	echo "syntax: auth_varend.sh username password"
else
	username=$1
	password=$2
	data=$(curl -s -X POST localhost:3000/auth/login \
		-H 'Content-Type: application/json' \
		-d '{"username": '\"$username\"', "password": "passwd"}')
	token=$(echo $data | cut -d"\"" -f4)
	if [ $(echo $data | grep "Unauthorized" | wc -l) -gt 0 ]; then
		echo "Server returned: 401 Unauthorized"
	else
		export JWT_TOKEN=$token
		echo "saved JWT TOKEN $token"
	fi
fi
