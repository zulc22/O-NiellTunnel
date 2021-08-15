#!/bin/bash
mv sqldata/.gitignore sqlignore
rm -rf sqldata
mkdir sqldata
mv sqlignore sqldata/.gitignore