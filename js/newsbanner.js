$(function() {

  var newsbanner = $('#newsbanner'),
      wrapper = $('#banner-wrapper'),
      banners = $('.banner', wrapper),
      bannerHeight = banners.first().height(),
      links = $('ol a', newsbanner);

  $('> a', banners).focus(function() {
    // store the index of the focused banner
    var index = banners.index(this.parentNode);
    // then activate the click event of the corresponding link
    links.eq(index).click();
  });

  links.click(function(e) {
    // store the index of the clicked link
    var index = $(links).index(this);
    // add .selected to the current li, and remove it from all others
    $(this).parent().addClass('selected').siblings().removeClass('selected');
    // use the stored index to animate #banner-wrapper down the correct amount
    wrapper.animate({ marginTop: bannerHeight * -index }, 750);
    // prevent the default link action
    e.preventDefault();
     // select the first nav item on page load
  }).first().parent().addClass('selected');

});