#!/usr/bin/env bash

VERSION=`jq -r ".version" package.json`

sudo docker build -t zadam/trilium:$VERSION .