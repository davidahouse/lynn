/* eslint-env mocha */
const expect = require('chai').expect
const LynnRunner = require('../index.js')
const nock = require('nock')

const successResponseBasic = require('../test/mockResponses/200_basic')

const successAPIRequest = {
  'options': {
    'protocol': 'http:',
    'method': 'GET',
    'host': '${this.HOST}',
    'port': '${this.PORT}',
    'path': '/contents',
  },
  'capture': {
    'NAME': '$.data.name',
    'NAMEASARRAY': '[$.data.name]',
    'NOTFOUND': '$.data.notfound',
  },
}

const environment = {
  'HOST': 'localhost',
  'PORT': 8080,
}

/**
 * nockSuccessBasic
 * @return {object} scope
 */
function nockSuccessBasic() {
  nock.cleanAll()
  const scope = nock('http://localhost:8080')
      .get('/contents')
      .reply(200, successResponseBasic)
  return scope
}

describe('Lynn Runner', function() {
  beforeEach(() => {
  })

  it('should retain request after construction', function() {
    const runner = new LynnRunner(successAPIRequest, environment)
    expect(runner.request.options.method).to.equal('GET')
  })

  describe('execute', function() {
    it('should call the callback when finished', function(done) {
      nockSuccessBasic()
      const runner = new LynnRunner(successAPIRequest, environment)
      runner.execute(function(result) {
        expect(result.statusCode).to.equal(200)
        expect(result.endTime).to.not.equal(null)
        done()
      })
    })
  })

  describe('capture', function() {
    it('should capture a value from the result data', function(done) {
      nockSuccessBasic()
      const runner = new LynnRunner(successAPIRequest, environment)
      runner.execute(function(result) {
        expect(result.statusCode).to.equal(200)
        const captured = runner.captured(result)
        expect(captured['NAME']).to.deep.equal('Fred')
        expect(captured['NAMEASARRAY']).to.deep.equal(['Fred'])
        done()
      })
    })

    it('should handle capture paths that are not found', function(done) {
      nockSuccessBasic()
      const runner = new LynnRunner(successAPIRequest, environment)
      runner.execute(function(result) {
        const captured = runner.captured(result)
        expect(Object.prototype.hasOwnProperty.call(captured, 'NOTFOUND')).to.equal(false)
        done()
      })
    })
  })
})
