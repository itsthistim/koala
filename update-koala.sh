#!/bin/bash
cd /root/koala
git pull
npm i
service koala stop
service koala start
