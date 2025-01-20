#!/bin/bash

# Set environment variables
export LANG=C.UTF-8
export LANGUAGE=C.UTF-8
export LC_ALL=C.UTF-8

# Set ulimit (this will be ignored in the browser environment, which is fine)
true

# Node.js memory settings
export NODE_OPTIONS="--max-old-space-size=4096"

# React Native specific
export REACT_EDITOR=code