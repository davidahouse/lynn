# @davidahouse/lynn

[![npm (scoped)](https://img.shields.io/npm/v/@davidahouse/lynn.svg)](https://www.npmjs.com/package/davidahouse/lynn)
[![npm bundle size (minified)](https://img.shields.io/bundlephobia/min/@davidahouse/lynn.svg)](https://www.npmjs.com/package/davidahouse/lynn)

## Install

```
$ npm install --save lynn
```

## Usage

```
const LynnRunner = require('lynn')

const request = {
  'options': {
    'protocol': 'http:',
    'method': 'GET',
    'host': '${this.HOST}',
    'port': '${this.PORT}',
    'path': '/query',
  },
}

const environment = {
  'HOST': 'somehost.domain.com',
  'PORT': 80
}

const runner = new LynnRunner(request, environment)
runner.execute(function(result) {
  // result contains statusCode, headers, data and possibly error
}

```