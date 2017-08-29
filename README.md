# y-server-plugin-mock

y-server-plugin-mock is a [y-server](https://github.com/yued-fe/y-server) plugin to mock data.

## Install

```bash
npm install y-server-plugin-mock
```

## Usage

```javascript
const path = require('path');

const yServer = require('y-server');
const mockPlugin = require('y-server-plugin-mock');

yServer({
  plugins: [
    mockPlugin({
      mockEnable: true,
      mockDir: path.join(__dirname, './json'), // 模拟数据根目录
      mockAdapter: require('./json/adapter.js'),
      mockPaths: ['/api/*'],
    }),
    (app) => {
      app.get('/', (req, res, next) => {
        res.getMockData('/api/foo').then(data => res.send(data)).catch(next);
      });
    },
  ],
});
```

## Notes

* `mockDir` is the base directory of mock data.
* `mockAdapter` is the adapter of mock data.

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
