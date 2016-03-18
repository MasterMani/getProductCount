exports.getSitemap = function(txt){
  var validLines = txt.split("\n").filter(isComment),
    sitemapArr = [];
  validLines.forEach(function(line, idx){
    var siteMapUrl = searchSitemap(line);
    if(siteMapUrl) sitemapArr.push(siteMapUrl);
  });
  return sitemapArr
}

exports.isZipped = function(sitemapUrl){
  if(sitemapUrl.trim().match(/\.gz$/)) return true;
  return false;
}

function isComment(line){
  return line.trim().charAt(0) !== '#'
}

function searchSitemap(line){
  if(line.match(/sitemap/i)){
    return line.match(/(http.*)/)[1]
  }
  return false
}