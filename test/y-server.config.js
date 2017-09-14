'use strict';

const path = require('path');

const mockPlugin = require('../index.js');

module.exports = {
  watch: [path.join(__dirname, '../index.js'), path.join(__dirname, './json/**/*.js')],
  plugins: [
    mockPlugin({
      mockEnable: true,
      mockDir: path.join(__dirname, './json'), // 模拟数据根目录
      mockAdapter: require('./json/adapter.js'),
      mockPaths: ['/api/*'],
    }),
    (app) => {
      app.get('/', (req, res, next) => {
        res.mock({}).then(data => res.send(data)).catch(next);
      });
      app.get('/bar', (req, res, next) => {
        res.getMockData('/api/bar?foo=1').then(data => res.send(data)).catch(next);
      });
      app.get('/api/foo', (req, res, next) => {
        res.sendMock().catch(next);
      });
    },
  ],
};
