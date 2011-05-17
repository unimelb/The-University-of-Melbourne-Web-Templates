$(function() {

  var newsbanner = $('#newsbanner'),
      wrapper = $('#banner-wrapper'),
      firstBanner = $('.banner', wrapper).first(),
      bannerHeight = firstBanner.height(),
      links = $('ol a', newsbanner);

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