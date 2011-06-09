/*
  A short (minifed) chunk of code to provide a cross-browser domready event
  The technique is nabbed from: https://github.com/dperini/ContentLoaded/
*/
function contentLoaded(a,b){var c=!1,d=!0,e=a.document,f=e.documentElement,g=e.addEventListener?"addEventListener":"attachEvent",h=e.addEventListener?"removeEventListener":"detachEvent",i=e.addEventListener?"":"on",j=function(d){if(d.type!="readystatechange"||e.readyState=="complete")(d.type=="load"?a:e)[h](i+d.type,j,!1),!c&&(c=!0)&&b.call(a,d.type||d)},k=function(){try{f.doScroll("left")}catch(a){setTimeout(k,50);return}j("poll")};if(e.readyState=="complete")b.call(a,"lazy");else{if(e.createEventObject&&f.doScroll){try{d=!a.frameElement}catch(l){}d&&k()}e[g](i+"DOMContentLoaded",j,!1),e[g](i+"readystatechange",j,!1),a[g](i+"load",j,!1)}}


/*
  The main Navigation object
  Its purpose is to initialise showing/hiding third level nested navigation
  and creating a selectbox version of the navigation for mobile devices
*/

Navigation = (function() {

  return {
    // A helper method to find direct descendents of a specific node type
    findChildrenByTag: function(children, tag) {
      var matches = [];
      for (var i = 0, ii = children.length; i < ii; i++) {
        if (children[i].nodeName == tag) matches.push(children[i]);
      }
      return matches;
    },
    // Used to hide sub-sub-navigation children
    hideChildren: function(li) {
      li.className = li.className.replace(/\sopen/, ' closed');
      var a = getElementByClassName(li.childNodes, 'more');
      if (a) a.innerHTML = 'More';
      return false;
    },
    // Used to show sub-sub-navigation children
    showChildren: function(li) {
      li.className = li.className.replace(/\sclosed/, ' open');
      var a = getElementByClassName(li.childNodes, 'more');
      if (a) a.innerHTML = 'Less';
      return false;
    },
    // The main initialisation method, this is called on contentLoaded
    init: function() {
      // For browser widths of less than 480, we build a mobile version 
      // of the navigation,
      if (document.body.offsetWidth < 480) buildMobileNavigation();
      // otherwise we build our nested nav
      else buildNestedNav();
    }

  }
  // getElementByClassName helper method
  // This returns a single element from a list of provided nodes
  // It is worth noting, that standard getElementsByClassName functionality
  // is not what we need here
  function getElementByClassName(elements, className) {
    var re = new RegExp('(\\s|^)'+className+'(\\s|$)');
    for (var i = 0, ii = elements.length; i < ii; i++) {
      if (re.test(elements[i].className)) return elements[i];
    }
  }
  // A recursive method used contruct a json representation of a UL
  // We use it to store the main UL navigation structure
  function buildList(targets) {
    var list = [];
    for (var i = 0, ii = targets.length; i < ii; i++) {
      if (targets[i].getElementsByTagName) {
        var a = Navigation.findChildrenByTag(targets[i].childNodes, 'A');
        if (!!a.length) {
          list.push({ text: a[0].innerHTML, link: a[0].href, element: targets[i], children: buildList(targets[i].childNodes) });
        } else {
          list = buildList(targets[i].childNodes);
        }
      }
    }
    return list;
  }

  // A recursive method used to contruct the markup for select box, built from
  // a nested javascript object structure (created from Navigation.buildList)
  function buildSelect(list, prefix) {
    var prefix = prefix || '',
        html = '';
    for (var i = 0, ii = list.length; i < ii; i++) {
      html += '<option value="'+list[i].link+'">'+prefix+list[i].text+'</option>';
      // if (!!list[i].children) html += buildSelect(list[i].children, '—'+prefix);
      if (!!list[i].children) html += buildSelect(list[i].children, '&mdash;'+prefix);      
    }
    return html;
  }

  // Build and inject a selectbox version of the navigation for mobile devices
  function buildMobileNavigation() {
    var allDivs = document.getElementsByTagName('div'),
        header = getElementByClassName(allDivs, 'header'),
        breadcrumbs = document.getElementById('breadcrumbs'),
        // This is designed to work with our standard templates & the
        // override, so if .nav doesn't exist, then we look for #menu instead
        nav = getElementByClassName(allDivs, 'nav') || document.getElementById('menu'),
        ul = nav.getElementsByTagName('ul')[0];

    // If no nav was found, then bail out of the rest of this method
    if (!nav) return;

    // Build up the select box
    var html = '<select onchange="document.location.href = options[selectedIndex].value;">',
        list = buildList(ul.childNodes);
    html += buildSelect(list);
    html += '</select>';

    // Create a wrapping paragraph for the select box
    var node = document.createElement('div');
    node.setAttribute('class', 'mobile-nav');
    node.setAttribute('role', 'navigation');
    node.innerHTML = '<p>Navigation:</p>'+html;
    // Either inject the selectbox directly into .header (for the templates),
    if (!!header) header.appendChild(node);
    // or override the breadcrumbs (for the override)
    else if (breadcrumbs) breadcrumbs.innerHTML = node.innerHTML;
  }

  // Show or hide the sub navigation
  function toggleNav(e) {
    // Bind the click event for IE
    var e = e || window.event,
        target = e.target || e.srcElement;
    // We're using event delegation here, so only run this method if the 
    // target has a class of 'more'
    if (!(/more/).test(target.className)) return;
    // If the navigation is closed, then open it,
    if ((/\sclosed/).test(target.parentNode.className)) Navigation.showChildren(target.parentNode);
    // and vice-versa
    else Navigation.hideChildren(target.parentNode);
    // Prevent the default link action
    e.preventDefault();
    return false;
  }

  function buildNestedNav() {
    var nav = getElementByClassName(document.getElementsByTagName('div'), 'nav') || document.getElementById('menu');
    // If the nav doesn't exist, then return
    if (!nav) return;
    // We use event delegation to handle the click events, so the click
    // event is bound directly onto the nav container
    nav.onclick = toggleNav;

    var ul = Navigation.findChildrenByTag(nav.childNodes, 'UL')[0],
        list = buildList(ul.childNodes);

    for (var i = 0, ii = list.length; i < ii; i++) {
      for (var j = 0, jj = list[i].children.length; j < jj; j++) {
        if (!!list[i].children[j].children.length) {
          initNestedNav(list[i].children[j].element);
        }
      }
    }
  }
  // Injects all the extra elements required by the nested show/hide nav
  function initNestedNav(li) {
    li.className += ' closed';
    var ul = Navigation.findChildrenByTag(li.childNodes, 'UL')[0] || li.firstChild,
        a = document.createElement('a'),
        text = document.createTextNode('More');

    a.setAttribute('class', 'more');
    a.setAttribute('className', 'more');
    a.setAttribute('href', '#');
    a.appendChild(text);
    li.insertBefore(a, ul);
  }

})();

contentLoaded(this, Navigation.init);