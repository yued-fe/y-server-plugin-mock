next(null, {
  originalUrl: req.originalUrl,
  url: req.url,
  query: req.query,
  params: req.params,
  $mockUrl: req.$mockUrl
});
