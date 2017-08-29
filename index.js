'use strict';
require('colors');

const path = require('path');
const url = require('url');

const getMockData = require('./lib/getMockData.js');

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
  const mockAdapter = options.mockAdapter;
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
      res.getMockData = function (mockPath) {
        // 对 mockPath = "/foo?bar=1" 这种情况作特别处理，在 req 中加上 $query = { bar: 1 }
        const mockPathObj = url.parse(mockPath, true);
        mockPath = mockPathObj.pathname;
        req.$query = mockPathObj.query;

        return getMockData(path.join(mockDir, mockPath), req, res).then(function (data) {
          return typeof mockAdapter === 'function' ? mockAdapter(data, req, res) : data;
        });
      };

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
