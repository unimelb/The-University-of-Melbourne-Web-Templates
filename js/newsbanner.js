/*
 * jQuery throttle / debounce - v1.1 - 3/7/2010
 * http://benalman.com/projects/jquery-throttle-debounce-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function(b,c){var $=b.jQuery||b.Cowboy||(b.Cowboy={}),a;$.throttle=a=function(e,f,j,i){var h,d=0;if(typeof f!=="boolean"){i=j;j=f;f=c}function g(){var o=this,m=+new Date()-d,n=arguments;function l(){d=+new Date();j.apply(o,n)}function k(){h=c}if(i&&!h){l()}h&&clearTimeout(h);if(i===c&&m>e){l()}else{if(f!==true){h=setTimeout(i?k:l,i===c?e-m:e)}}}if($.guid){g.guid=j.guid=j.guid||$.guid++}return g};$.debounce=function(d,e,f){return f===c?a(d,e,false):a(d,f,e!==false)}})(this);

/*
  jQuery hotfix
  Addresses a bug in jQuery which causes an error when animating
  negative percentages in IE8
*/
var oldcur = jQuery.fx.prototype.cur;
jQuery.fx.prototype.cur = function() {
  var cur = oldcur.apply(this, arguments);
  return (cur || 1);
}

$(function() {

  var ratio = 0,
      newsbanner = $('#newsbanner'),
      wrapper = $('#banner-wrapper'),
      banners = $('.banner', wrapper),
      links = $('ol a', newsbanner);

  var resizeBanners = function() {
    var bannerHeight = $('#newsbanner .banner img')[0].offsetHeight;
    // The dimensions for all of the banner sub-elements are defined in ems,
    // so we can resize everything in scale by setting the font-size property
    // on #newsbanner (the parent)
    $('#newsbanner').css('font-size', Math.floor(bannerHeight / 1.5) + '%').css('height', bannerHeight);
    // The wrapper overflow sizes need to be set manually to match the image
    $('#banner-clip', newsbanner).css('height', bannerHeight);
    wrapper.css('height', bannerHeight);
  }

  var imageLoad = function() {
    // Calculate the image ratio (1:3, etc)
    ratio = ((this.offsetHeight + 1) / this.offsetWidth) * 100;
    // Resize banners (the first time)
    resizeBanners();
  }

  // Once the image has loaded, we can reference its width and height
  var image = $('#newsbanner .banner img').first();
  // Reset the src to ensure the load event fires
  image.load(imageLoad).attr('src', image.attr('src'));
  // Resize the banners on page resize (throttled to run every 50ms)
  $(window).resize( $.throttle(50, resizeBanners) );

  // Tab-based navigation
  $('> a', banners).focus(function() {
    // store the index of the focused banner
    var index = banners.index(this.parentNode);
    // then activate the click event of the corresponding link
    links.eq(index).click();
  });

  links.click(function(e) {
    // prevent the default link action
    e.preventDefault();
    // store the index of the clicked link
    var index = $(links).index(this);
    // add .selected to the current li, and remove it from all others
    $(this).parent().addClass('selected').siblings().removeClass('selected');
    // use the stored index to animate #banner-wrapper down the correct amount
    wrapper.animate({ marginTop: (-index * ratio) + '%' }, 750);
     // select the first nav item on page load
  }).first().parent().addClass('selected');

});