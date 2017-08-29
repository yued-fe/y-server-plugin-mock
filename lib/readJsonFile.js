'use strict';
require('colors');

const fs = require('fs');

/**
 * 读取JSON文件
 * @param {String} filePath 文件绝对路径
 * @return {Promise}
 */
module.exports = function (filePath) {
  return new Promise(function (resolve, reject) {
    fs.exists(filePath, function (isExists) {
      if (!isExists) {
        console.log('[读取JSON文件]'.red, `文件"${filePath}"不存在`);
        return reject(`文件"${filePath}"不存在`);
      }

      console.log('[读取JSON文件]'.blue, `开始读取"${filePath}"文件`);
      fs.readFile(filePath, 'utf-8', function (err, result) { // 这里不直接用 require 是为了避免缓存
        if (err) {
          console.log('[读取JSON文件]'.red, `读取文件"${filePath}"失败`);
          return reject(`读取文件"${filePath}"失败:\n${err.stack}`);
        }
        try {
          result = JSON.parse(result);
        } catch (ex) {
          console.log('[读取JSON文件]'.red, `文件"${filePath}"非JSON格式`);
          return reject(`文件"${filePath}"非JSON格式, 内容:\n${result}`);
        }
        console.log('[读取JSON文件]'.green, `读取文件"${filePath}"成功`);
        resolve(result);
      });
    });
  });
};
