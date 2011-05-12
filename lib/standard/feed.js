
$.fn.extend({
  displayRSS: function(urls, opts) {      
    if(!opts) {
      opts = {}
    }
    
    var _f = Feedinator(this, urls, opts);    
    google.setOnLoadCallback(_f.init);
    return this;
  }
});


var Feedinator = function(element, urls, opts) {

  var data = [];
  var loadCount = 0;
  var interval;
  
  var template = '<a href="{link}">{title}</a>';
  if (opts.template) {
    template = opts.template;
  }
  
  var dateFormat = 'htt dd mmmm yyyy';
  if (opts.dateFormat) {
    dateFormat = opts.dateFormat;
  }

  var numberOfItems = 5;
  if (opts.numberOfItems) {
    numberOfItems = opts.numberOfItems;
  }

  var listItemClass = '';
  if (opts.listItemClass) {
    listItemClass = opts.listItemClass;
  }
  
  var renderer = function(entry) {
		var html = template.replace(/{link}/, entry.link);
		html = html.replace(/{title}/, entry.title)
    
    var img = entry.description;
    
    try {
      var publishedDate = new Date(Date.parse(entry.publishedDate));
      html = html.replace(/{publishedDate}/, entry.publishedDate);
    } catch(ex) {      
		  html = html.replace(/{publishedDate}/, "");
    }   
    return html; 
  }
  
  
  var load = function() {
    $.each(urls, function(index, url) {      
      var feed = new google.feeds.Feed(url);
      feed.load(function(result) {
        if (!result.error) {
          data = data.concat(result.feed.entries);
          loadCount++;
        }
      });
    });
    interval = setInterval(onLoad, 500);     
  }
  
  var onLoad = function() { 
    if(loadCount == urls.length) {
      clearInterval(interval);
      entries = sortByPublishedDate(numberOfItems);
      display(entries);
      if (opts.onComplete) {
        opts.onComplete();
      }
    }
  }
  
  var display = function(entries) {
		$(element).empty();
		$.each(entries, function(index, entry) {
      appendEntry(entry);
		});		
  }
  
  var appendEntry = function(entry) { 
    var html = renderer(entry);
    
    if (opts.renderer) {
      html = opts.renderer(entry, html);
    }
    
    $(element).append( $('<li>').addClass(listItemClass).append(html) );
  }
  
  var sortByPublishedDate = function(count) {
		data.sort(function(entryA,entryB){
		  return new Date(entryB.publishedDate) - new Date(entryA.publishedDate);
		});	
		return data.slice(0, count);
  }
    
  return {
    init: function() {
      if (typeof urls == "string") {
        urls = [urls]
      }
      load(); 
    }    
  }
}