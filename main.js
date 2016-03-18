var domain = process.argv[2] || "www.insight.com",
  request = require('request'),
  cheerio = require('cheerio'),
  Promise = require('bluebird'),
  _       = require('lodash'),
  zlib = require('zlib'),
  robotsParser = require('./lib/robotsTxtParser');


if(!domain){console.log("Please enter a domain name"); return false;}

var robotsTxt = "http://" + domain + "/robots.txt";

request(robotsTxt, function(err, req, res){
  var sitemaps = robotsParser.getSitemap(res.toString());
  if(sitemaps.length > 0){
    var promises = sitemapFetcher(sitemaps)
    Promise.all(promises).then(fetchProductsFromSitemap).then(function(data){
      var urlsArr = []
      var $ = cheerio.load(data.toString());
      $('loc').each(function(i, e){
        urlsArr.push($(e).text())
      });
      console.log(urlsArr.length)
    })
    
  }
});

function sitemapFetcher(sitemaps){
  var urlsArr = [];
  var promiseList =  sitemaps.map(function(sitemap, idx){
    return new Promise(function(resolve, reject){
      setTimeout(function(){
        (function(sitemap){
          fetcher(sitemap, function(err, res){
            var $ = cheerio.load(res);
            $('loc').each(function(i, e){
              urlsArr.push($(e).text())
            });
            resolve(urlsArr);
          });
        })(sitemap)
      }, 2000 * idx)
    })
    
  });
  return promiseList
}

function fetcher(url, callback){
  var options = {
    uri : url,
    headers : {"User-Agent" : "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36"}
  },
  isGzip = robotsParser.isZipped(url);
  if(!isGzip){
    request(options, function(err, req, res){
      if(err) callback(err);
      callback(null, res);
    });
  }else{
    request(url, {encoding: null}, function(err, req, res){
      if(err) callback(err);
      zlib.gunzip(res, function(err, dezipped) {
          callback(null, dezipped.toString());
        });
    },function(err){
      console.log(err)
    });
  } 
}

function fetchProductsFromSitemap(sitemapUrls){
  return new Promise(function(res){
    var promiseList = _.flatten(sitemapUrls).map(function(sitemapUrl){
      console.log(sitemapUrl)
      return new Promise(function(resolve, reject){
        fetcher(sitemapUrl, function(a,b){
            resolve(b)
        })
      })
    })
    Promise.all(promiseList).then(res)
  })
}