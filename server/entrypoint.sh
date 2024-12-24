#!/bin/bash

mkdir -p /var/lib/quantum

npm run start &

exec nginx -g 'daemon off;'
