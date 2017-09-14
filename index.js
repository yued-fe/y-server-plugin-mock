'use strict';
require('colors');

const path = require('path');
const url = require('url');

const getMockData = require('./lib/getMockData.js');

const noop = function (d) { return d };

/**
 * 数据模拟插件
 * @param {Object} options 配置
 * @param {Boolean} options.mockEnable 模拟开关
 * @param {String} options.mockDir 模拟数据目录
 * @param {Function} options.mockAdapter 模拟数据处理器
 * @param {Array} options.mockPaths 需要数据模拟的路径
 * @return {Function} 插件安装方法
 */
module.exports = function (options) {
  if (!options || !options.mockDir) {
    throw new Error('[y-server-plugin-mock]'.red, '"mockDir"配置错误');
  }

  const mockEnable = options.mockEnable;
  const mockDir = options.mockDir;
  const mockAdapter = typeof options.mockAdapter === 'function' ? options.mockAdapter : noop;
  const mockPaths = options.mockPaths;

  /**
   * 插件安装方法
   * @param {Object} app Express实例
   */
  return function (app) {
    if (!mockEnable) {
      return;
    }

    app.use(function (req, res, next) {
      // 提供 mock 方法，完善模拟数据
      res.mock = function (data) {
        if (res.$mocked) {
          return Promise.resolve(data);
        }
        res.$mocked = true;
        return Promise.resolve(mockAdapter(data, req, res));
      };

      // 提供 getMockData 方法，为指定后端请求路径时获取模拟数据
      res.getMockData = function (mockPath) {
        // 对 mockPath = "/foo?bar=1" 这种情况作特别处理，在 req 中加上 $query = { bar: 1 }
        const mockPathObj = url.parse(mockPath, true);
        mockPath = mockPathObj.pathname;
        req.$query = mockPathObj.query;

        return getMockData(path.join(mockDir, mockPath), req, res).then(res.mock);
      };

      // 提供 sendMock 方法，为直接返回模拟数据
      res.sendMock = function () {
        return res.getMockData(req.path).then(function (data) {
          res.send(data);
        });
      };

      next();
    });

    if (Array.isArray(mockPaths)) {
      mockPaths.forEach(function (mockPath) {
        app.all(mockPath, function (req, res, next) {
          res.sendMock().catch(next);
        });
      });
    }
  };
};
