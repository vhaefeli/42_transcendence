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
	export JWT_TOKEN=$token
	echo "saved JWT TOKEN $token"
fi
