/* eslint-env mocha */
const expect = require('chai').expect
const LynnRunner = require('../index.js')

const successAPIRequest = {
  'options': {
    'protocol': 'http:',
    'method': 'GET',
    'host': '${this.HOST}',
    'port': '${this.PORT}',
    'path': '/contents/',
  },
}

const environment = {
  'HOST': '192.168.1.25',
  'PORT': 8080,
}

describe('Lynn Runner', function() {
  it('should retain request after construction', function() {
    const runner = new LynnRunner(successAPIRequest, environment)
    expect(runner.request.options.method).to.equal('GET')
  })

  describe('execute', function() {
    it('should call the callback when finished', function() {
      const runner = new LynnRunner(successAPIRequest, environment)
      runner.execute(function(result) {
        expect(result.statusCode).to.equal(200)
      })
    })
  })
})
