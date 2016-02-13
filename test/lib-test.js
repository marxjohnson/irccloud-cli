import test from 'tape'
import nock from 'nock'
import sinon from 'sinon'
import WebSocket, {Server} from 'ws'
import 'babel-polyfill'
import * as irccloud from '../src/lib'
import log from 'cologger'
//
const wss = new Server({port: 8080});
wss.on('connection', socket => {
  socket.send(JSON.stringify({type: 'header', streamid: 'sacasc'}))
  socket.send(JSON.stringify({type: 'oob_include', url: '/chat/backlog/123'}))
  socket.send(JSON.stringify({type: 'buffer_msg', chan: '#ma19', from: 'yhsiang', msg: 'test'}))
  socket.send(JSON.stringify({type: 'close'}))
  socket.on('message', (message) => {
    wss.close()
  })
})


nock('https://www.irccloud.com')
  .post('/chat/auth-formtoken')
  .times(2)
  .reply(200, {
    _reqid: 0,
    success: true,
    token: 'token' })
  .post('/chat/login')
  .times(2)
  .reply(200, {
    _reqid: 0,
    success: true,
    session: 'session',
    websocket_host: 'localhost',
    websocket_port: 8080, })
  .get('/chat/backlog/123?streamid=sacasc')
  .reply(200, {
    _reqid: 0,
    success: true,
  })

test('irccloud-cli test', t => {
  t.plan(1)
  let mock = sinon.mock(log)
  let success = mock.expects('success').twice()
  irccloud.connect({
    email: 'EMAIL',
    password: 'PASSWORD',
  }).then(() => {
    t.ok(success.verify(), 'success should be called twice')
  })
})
