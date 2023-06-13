#!/usr/bin/env node

const { Start } = require('../lib/start');

new Start(process.argv.slice(2)[0]).start();