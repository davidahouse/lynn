const http = require('http')
const https = require('https')
const jp = require('jsonpath')

/**
* This class represents a high level Web Request
*/
class LynnRunner {
  /**
  * Constructor for the LynnRunner class
  * @param {object} request the lynn request details
  * @param {object} environment the environment data to use for the request
  * @param {bool} verbose to log additional details
  */
  constructor(request, environment) {
    this.request = request
    this.environment = environment

    this.execute = function(callback) {
      // create our http options object
      const options = {
        'protocol': this.envReplace(this.request.options.protocol, environment, 'http:'),
        'host': this.envReplace(this.request.options.host, environment, 'localhost'),
        'port': this.envReplace(this.request.options.port, environment, '80'),
        'method': this.envReplace(this.request.options.method, environment, 'GET'),
        'path': this.envReplace(this.request.options.path, environment, '/'),
        'headers': this.envReplaceHeaders(this.request.options.headers, environment),
        'auth': this.envReplace(this.request.options.auth, environment, null),
        'timeout': this.envReplace(this.request.options.timeout, environment, 30000),
      }

      const hrstart = process.hrtime()
      const protocol = options.protocol == 'http:' ? http : https
      const req = protocol.request(options, (res) => {
        res.setEncoding('utf8')
        let rawData = ''
        res.on('data', (chunk) => {
          rawData += chunk
        })
        res.on('end', () => {
          const hrend = process.hrtime(hrstart)
          const {statusCode} = res
          const headers = res.headers

          try {
            const parsedData = JSON.parse(rawData)
            const result = {
              'options': options,
              'statusCode': statusCode,
              'headers': headers,
              'data': parsedData,
              'error': null,
              'responseTime': hrend[1] / 1000000,
            }
            callback(result)
          } catch (e) {
            const result = {
              'options': options,
              'statusCode': statusCode,
              'headers': headers,
              'data': null,
              'error': e,
              'responseTime': hrend[1] / 1000000,
            }
            callback(result)
          }
        })
      })

      req.on('error', (e) => {
        const result = {
          'options': options,
          'statusCode': null,
          'headers': null,
          'data': null,
          'error': e,
          'responseTime': null,
        }
        callback(result)
      })

      // TODO: post a body here if necessary
      req.end()
    }

    this.envReplace = function(template, environment, defaultValue) {
      if (template == null) {
        return defaultValue
      }

      const replaced = this.replace(template, environment)
      return replaced
    }

    this.replace = function(templateString, templateVars) {
      return new Function('return `'+templateString +'`;').call(templateVars)
    }

    this.envReplaceHeaders = function(headers, environment) {
      const newHeaders = {}
      for (const key in headers) {
        if (headers.hasOwnProperty(key)) {
          const newValue = this.envReplace(headers[key], environment, null)
          if (newValue != null) {
            newHeaders[key] = newValue
          }
        }
      }
      return newHeaders
    }

    this.captured = function(result) {
      if (this.request.capture == null) {
        return {}
      }

      const captured = {}

      for (const key in this.request.capture) {
        if (this.request.capture.hasOwnProperty(key)) {
          const path = this.request.capture[key]
          const found = jp.query(result, path)
          if (found != null) {
            captured[key] = found
          }
        }
      }
      return captured
    }
  }
}

module.exports = LynnRunner