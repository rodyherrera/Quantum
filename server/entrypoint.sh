#!/bin/bash

mkdir -p /var/lib/quantum 

exec "$@" # Execute the original command