$(function() {
  var newsbanner = $('#newsbanner'),
      wrapper = $('#banner-wrapper'),
      firstBanner = $('.banner', wrapper).first(),
      bannerHeight = firstBanner.height(),
      links = $('ol a', newsbanner);

  links.click(function() {
    var index = $(links).index(this);
    $(this).parent().addClass('selected').siblings().removeClass('selected');
    wrapper.animate({ marginTop: bannerHeight * -index }, 750);

    return false;
  }).first().parent().addClass('selected');

});