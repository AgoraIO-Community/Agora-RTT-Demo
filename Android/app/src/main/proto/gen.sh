#!/bin/sh

protoc --java_out=$(pwd) -I$(pwd) *.proto