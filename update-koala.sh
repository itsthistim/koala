#!/bin/bash
cd /root/koala
git pull
npm i
systemctl stop koala
systemctl start koala
