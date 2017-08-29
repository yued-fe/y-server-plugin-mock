'use strict';
require('colors');

const fs = require('fs');
const path = require('path');
const url = require('url');

const readJSONFile = require('./readJsonFile.js');

/**
 * 读取JSON文件
 * @param {String} filePath 文件绝对路径
 * @return {Promise}
 */
module.exports = function (filePath, req, res) {
  filePath = url.parse(filePath).pathname; // 获取不带查询参数的修复路径

  const extname = path.extname(filePath);
  if (extname === '.json') {
    return readJSONFile(filePath);
  }
  if (!extname) {
    if (fs.existsSync(`${filePath}.js`)) {
      filePath += '.js';
    } else if (fs.existsSync(`${filePath}.json`)) {
      return readJSONFile(`${filePath}.json`);
    }
  }

  return new Promise(function (resolve, reject) {
    fs.exists(filePath, function (isExists) {
      if (!isExists) {
        console.log('[获取模拟数据]'.red, `文件"${filePath}"不存在`);
        return reject(`文件"${filePath}"不存在`);
      }

      console.log('[获取模拟数据]'.blue, `开始读取"${filePath}"文件`);
      fs.readFile(filePath, 'utf-8', function (err, result) { // 这里不直接用 require 是为了避免缓存
        if (err) {
          console.log('[获取模拟数据]'.red, `读取文件"${filePath}"失败`);
          return reject(`读取文件"${filePath}"失败:\n${err.stack || err}`);
        }

        try {
          result = new Function('req', 'res', 'next', result);
        } catch (ex) {
          console.log('[获取模拟数据]'.red, `文件"${filePath}"转换为方法失败`);
          return reject(`文件"${filePath}"转换为方法失败, 内容:\n${result}`);
        }
        result(req, res, function (err, result) {
          if (err) {
            console.log('[获取模拟数据]'.red, `执行文件"${filePath}"转换的方法失败`);
            return reject(`执行文件"${filePath}"转换的方法失败:\n${err.stack || err}`);
          }
          console.log('[获取模拟数据]'.green, `执行文件"${filePath}"转换的方法成功`);
          resolve(result);
        });
      });
    });
  });
};
