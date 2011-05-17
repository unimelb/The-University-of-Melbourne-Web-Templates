function contentLoaded(a,b){var c=!1,d=!0,e=a.document,f=e.documentElement,g=e.addEventListener?"addEventListener":"attachEvent",h=e.addEventListener?"removeEventListener":"detachEvent",i=e.addEventListener?"":"on",j=function(d){if(d.type!="readystatechange"||e.readyState=="complete")(d.type=="load"?a:e)[h](i+d.type,j,!1),!c&&(c=!0)&&b.call(a,d.type||d)},k=function(){try{f.doScroll("left")}catch(a){setTimeout(k,50);return}j("poll")};if(e.readyState=="complete")b.call(a,"lazy");else{if(e.createEventObject&&f.doScroll){try{d=!a.frameElement}catch(l){}d&&k()}e[g](i+"DOMContentLoaded",j,!1),e[g](i+"readystatechange",j,!1),a[g](i+"load",j,!1)}}

Navigation = (function() {

  return {

    findChildrenByTag: function(children, tag) {
      var matches = [];
      for (var i = 0, ii = children.length; i < ii; i++) {
        if (children[i].nodeName == tag) matches.push(children[i]);
      }
      return matches;
    },

    hideChildren: function(li) {
      li.className = li.className.replace(/\sopen/, ' closed');
      var a = getElementByClassName(li.childNodes, 'more');
      if (a) a.innerHTML = 'More';
      return false;
    },

    showChildren: function(li) {
      li.className = li.className.replace(/\sclosed/, ' open');
      var a = getElementByClassName(li.childNodes, 'more');
      if (a) a.innerHTML = 'Less';
      return false;
    },

    init: function() {
      // init for widths of less than 480px
      if (document.body.offsetWidth < 480) buildMobileNavigation();
      else buildNestedNav();
    }

  }

  function getElementByClassName(elements, className) {
      var re = new RegExp('(\\s|^)'+className+'(\\s|$)');
      for (var i = 0, ii = elements.length; i < ii; i++) {
        if (re.test(elements[i].className)) return elements[i];
      }
    }

  // Build a json representation of the navigation ul
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

  // Build the markup for a select box from a json representation of a navigation ul
  function buildSelect(list, prefix) {
    var prefix = prefix || '',
        html = '';
    for (var i = 0, ii = list.length; i < ii; i++) {
      html += '<option value="'+list[i].link+'">'+prefix+list[i].text+'</option>';
      if (!!list[i].children) html += buildSelect(list[i].children, '—'+prefix);
    }
    return html;
  }

  // Build and inject a selectbox version of the navigation for mobile
  function buildMobileNavigation() {
    var allDivs = document.getElementsByTagName('div'),
        header = getElementByClassName(allDivs, 'header'),
        breadcrumbs = document.getElementById('breadcrumbs'),
        nav = getElementByClassName(allDivs, 'nav') || document.getElementById('menu'),
        ul = nav.getElementsByTagName('ul')[0];

    if (!nav) return;

    var html = '<select onchange="document.location.href = options[selectedIndex].value;">',
        list = buildList(ul.childNodes);

    html += buildSelect(list);
    html += '</select>';

    var node = document.createElement('div');
    node.setAttribute('class', 'mobile-nav');
    node.innerHTML = '<p>Navigation:</p>'+html;
    if (!!header) header.appendChild(node);
    else if (breadcrumbs) breadcrumbs.innerHTML = node.innerHTML;
  }

  function toggleNav(e) {
    var e = e || window.event,
        target = e.target || e.srcElement;

    if (!(/more/).test(target.className)) return;

    if ((/\sclosed/).test(target.parentNode.className)) Navigation.showChildren(target.parentNode);
    else Navigation.hideChildren(target.parentNode);

    e.preventDefault();
    return false;
  }

  function buildNestedNav() {
    var nav = getElementByClassName(document.getElementsByTagName('div'), 'nav') || document.getElementById('menu');
    if (!nav) return;

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

  function initNestedNav(li) {
    li.className += ' closed';
    var a = document.createElement('a'),
        text = document.createTextNode('More');

    a.setAttribute('class', 'more');
    a.setAttribute('className', 'more');
    a.setAttribute('href', '#');
    a.appendChild(text);
    li.appendChild(a);
  }

})();

contentLoaded(this, Navigation.init);