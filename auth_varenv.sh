#!/bin/sh

if [ -z "$1" ] || [ -z "$2" ]; then
	echo "syntax: auth_varend.sh username password"
else
	username=$1
	password=$2
	data=$(curl -s -X POST localhost:3000/auth/login \
		-H 'Content-Type: application/json' \
		-d '{"username": '\"$username\"', "password": '\"$password\"'}')
	tfa_enabled=$(echo $data | grep "\":true,\"" | wc -l)
	token=$(echo $data | cut -d"\"" -f6)

	if [ $(echo $data | grep "Unauthorized" | wc -l) -gt 0 ]; then
		echo "Server returned: 401 Unauthorized"
	else
		if [ $tfa_enabled -eq 0 ]; then
			export JWT_TOKEN=$token
			echo "saved JWT_TOKEN $token"
		else
			echo 2fa needed, code has been sent to your email
			export TFA_UUID=$token
			echo "saved TFA_UUID $token"
			echo "enter your code:"
			read
			data=$(curl -s -X POST localhost:3000/auth/2fa/login \
				-H 'Content-Type: application/json' \
				-d '{"tfa_request_uuid":"'$TFA_UUID'","code":"'$REPLY'"}')
			if [ $(echo $data | grep "message" | wc -l) -gt 0 ]; then
				echo $data
			else
				token=$(echo $data | cut -d"\"" -f4)
				export JWT_TOKEN=$token
				echo "saved JWT_TOKEN $token"
			fi
		fi
	fi
fi
