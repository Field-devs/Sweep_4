#!/bin/bash

# Set environment variables
export LANG=C.UTF-8
export LANGUAGE=C.UTF-8
export LC_ALL=C.UTF-8

# Node.js memory settings
export NODE_OPTIONS="--max-old-space-size=4096"

# React Native specific
export REACT_EDITOR=code

# Set max workers for Metro bundler
export REACT_NATIVE_MAX_WORKERS=2