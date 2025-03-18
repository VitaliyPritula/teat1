/**
 * Params:
 * data-type: book | book_button | search | indiebound | list | featured
 * data-affiliate-id: number
 * data-sku: number
 * data-list-slug: hash
 * data-target-elements: selector
 * data-include-branding: true | false
 * data-full-info: true | false
 */
(function (script) {
  var affiliateId = script.dataset.affiliateId;
  var sku = script.dataset.sku;
  var type = script.dataset.type;
  var listSlug = script.dataset.listSlug;
  var includeBranding = script.dataset.includeBranding == 'true' ? true : false;
  var targetElements = script.dataset.targetElements;
  var sourceUrl = new URL(script.src);

  function makeWidget(node) {
    node.setAttribute('width', '100%');
    var viewPortWidth = node.clientWidth;

    var frame = document.createElement('iframe');
    frame.setAttribute('scrolling', 'no');
    frame.style.border = 'none';

    var displayHeight = 0;
    var displayWidth = 0;

    if (type == 'book') {
      var maxWidth = 450;
      var minWidth = 150;
      var maxHeight = 420;
      var minHeight = 268;

      displayHeight = minHeight;
      displayWidth = viewPortWidth;

      if (displayWidth > maxWidth) {
        displayWidth = maxWidth;
      } else if (displayWidth < maxWidth) {
        displayWidth = minWidth;
        displayHeight = maxHeight;
      }

      if (typeof ResizeObserver !== 'undefined') {
        var obs = new ResizeObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.contentRect.width >= maxWidth) {
              displayWidth = maxWidth;
              displayHeight = minHeight;
            } else if (entry.contentRect.width < maxWidth) {
              displayWidth = minWidth;
              displayHeight = maxHeight;
            }

            if (frame.getAttribute('width') != displayWidth) frame.setAttribute('width', displayWidth);
            if (frame.getAttribute('height') != displayHeight) frame.setAttribute('height', displayHeight);
          });
        });
        obs.observe(node);
      }

      frame.setAttribute('src', sourceUrl.origin + '/widgets/book/' + type + '/' + affiliateId + '/' + sku);
      frame.style.border = '1px solid #e1e1e3';
      frame.style.backgroundColor = '#FFF';
    } else if (type == 'featured') {
      displayHeight = 520;
      displayWidth = 225;

      var messageListener = function (event) {
        if (event.data.height) {
          displayHeight = event.data.height + 5;
          frame.setAttribute('height', displayHeight);
        }
      };

      if (script.dataset.fullInfo != 'true') {
        displayHeight = 365;
        frame.onload = function () {
          frame.contentWindow.postMessage('truncated', '*');
          frame.contentWindow.addEventListener('message', messageListener, false);
        };
      } else {
        frame.onload = function () {
          frame.contentWindow.addEventListener('message', messageListener, false);
        };
      }

      if (typeof ResizeObserver !== 'undefined') {
        var obs = new ResizeObserver(function (entries) {
          entries.forEach(function (entry) {
            if (script.dataset.fullInfo != 'true') {
              displayHeight = 405;
            }
            if (frame.getAttribute('width') != displayWidth) frame.setAttribute('width', displayWidth);
            if (frame.getAttribute('height') != displayHeight) frame.setAttribute('height', displayHeight);
          });
        });
        obs.observe(node);
      }

      frame.setAttribute('width', displayWidth);
      frame.setAttribute('height', displayHeight);
      frame.setAttribute('src', sourceUrl.origin + '/widgets/book/book_featured/' + affiliateId + '/' + sku);
    } else if (type == 'book_button') {
      node.style.textAlign = 'center';
      node.style.margin = '0 auto';

      displayHeight = 70;
      displayWidth = 250;

      frame.setAttribute('src', sourceUrl.origin + '/widgets/book/' + type + '/' + affiliateId + '/' + sku);
    } else if (type == 'search') {
      displayHeight = 52;
      if (includeBranding) {
        displayHeight = 80;
      }
      displayWidth = viewPortWidth;

      if (viewPortWidth < 220) displayWidth = 220;
      if (viewPortWidth > 375) displayWidth = 375;

      frame.setAttribute('src', sourceUrl.origin + '/widgets/search/' + affiliateId);
    } else if (type == 'indiebound') {
      displayHeight = 47;
      if (includeBranding) {
        displayHeight = 80;
      }

      displayWidth = 190;

      frame.setAttribute('src', sourceUrl.origin + '/widgets/indiebound/' + affiliateId);
    } else if (type == 'list') {
      var maxHeight = 440;
      var minHeight = 420;

      displayHeight = minHeight;
      displayWidth = viewPortWidth;

      if (displayWidth >= 700) {
        displayHeight = minHeight;
      } else if (displayWidth < 400) {
        if (displayWidth < 300) displayWidth = 300;
        displayHeight = maxHeight;
      } else {
        displayHeight = maxHeight;
      }

      if (typeof ResizeObserver !== 'undefined') {
        var obs = new ResizeObserver(function (entries) {
          entries.forEach(function (entry) {
            displayWidth = entry.contentRect.width;
            if (entry.contentRect.width >= 700) {
              displayHeight = minHeight;
            } else if (entry.contentRect.width < 400) {
              if (entry.contentRect.width < 300) displayWidth = 300;
              displayHeight = maxHeight;
            } else {
              displayHeight = maxHeight;
            }

            frame.setAttribute('width', displayWidth);
            frame.setAttribute('height', displayHeight);
            obs.unobserve(node);
          });
        });
        obs.observe(node);
      }

      frame.setAttribute('src', sourceUrl.origin + '/widgets/list/' + listSlug);
    }

    frame.setAttribute('width', displayWidth);
    frame.setAttribute('height', displayHeight);

    node.style.textAlign = 'center';
    node.style.margin = '0 auto';
    node.appendChild(frame);
  }

  function renderWidgetToTargetElements() {
    // Added support for loading widget to target elements by providing
    // data-target-element attribute in script tag
    // data-target-element can be any selector like id, class etc.
    // ex: data-target-element='.class-name, #elementID'
    var targetNodes = document.querySelectorAll(targetElements);
    if (targetNodes.length > 0) {
      targetNodes.forEach(function (targetNode) {
        var node = document.createElement('div');
        targetNode.append(node);
        makeWidget(node);
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (targetElements) {
      renderWidgetToTargetElements();
    } else {
      var node = document.createElement('div');
      script.after(node);
      makeWidget(node);
    }
  });
})(document.currentScript);
