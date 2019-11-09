"use strict";

/* Copyright © 2019 ImageBoss. All rights reserved. */
(function () {
  var ImageBoss = window.ImageBoss;
  var serviceHost = 'img.imageboss.me';
  var serviceUrl = "https://".concat(serviceHost);
  var localOptions = {
    propKey: 'imageboss',
    imgPropKey: 'imageboss-src',
    bgPropKey: 'imageboss-bg-src',
    dprSupport: window.devicePixelRatio,
    devMode: isEnabled('devMode', false),
    dprEnabled: isEnabled('dprEnabled', true),
    webpEnabled: isEnabled('webpEnabled', true),
    animationEnabled: isEnabled('animationEnabled', true)
  };

  function isEnabled(prop, fallback) {
    return ImageBoss[prop] !== undefined ? ImageBoss[prop] : fallback;
  }

  function getUrl(src, _ref) {
    var {
      operation,
      coverMode,
      width,
      height,
      options
    } = _ref;
    var template = '/:operation/:options/';

    if (operation === 'cover') {
      template = '/:operation::cover_mode/:widthx:height/:options/';
    } else if (operation === 'width') {
      template = '/:operation/:width/:options/';
    } else if (operation === 'height') {
      template = '/:operation/:height/:options/';
    }

    var finalUrl = template.replace(':operation', operation || '').replace(':cover_mode', coverMode || '').replace(':width', width || '').replace(':height', height || '').replace(':options', options || '').replace(/\/\//g, '/').replace(/:\//g, '/');
    return serviceUrl + finalUrl + src;
  }

  function isImg(element) {
    return !!element.getAttribute("".concat(localOptions.propKey, "-src"));
  }

  function isBg(element) {
    return !!element.getAttribute("".concat(localOptions.propKey, "-bg-src"));
  }

  function buildSrc(src) {
    if (src && !src.match(/^https?:\/\//)) {
      src = "".concat(window.location.origin, "/").concat(src.replace(/^\//, ''));
    }

    return src;
  }

  function setOpacity(element, opacity) {
    if (localOptions.animationEnabled) {
      element.style.opacity = "".concat(opacity);
    }
  }

  function setImage(element, url) {
    if (isImg(element)) {
      element.setAttribute('src', url);
    } else if (isBg(element)) {
      element.style.backgroundImage = "url('".concat(url, "')");
    }
  }

  function isVisible(img) {
    return img.getBoundingClientRect().top <= window.innerHeight + 300 && img.getBoundingClientRect().bottom + 300 >= 0 && getComputedStyle(img).display !== "none";
  }

  function isFullyLoaded(img) {
    return img && getAttribute(img, 'loaded');
  }

  function getAttribute(img, attr) {
    return img.getAttribute("".concat(localOptions.propKey, "-").concat(attr));
  }

  function setAttribute(img, attr, val) {
    return img.setAttribute("".concat(localOptions.propKey, "-").concat(attr), val);
  }

  function waitToBeLoaded(url, callback) {
    var image = new Image();
    image.src = url;
    image.addEventListener('load', callback);
  }

  function yieldValidSize(size) {
    return size && !size.match(/%/) ? size : undefined;
  }

  function lookup(nodeList) {
    Array.from(nodeList).filter(img => {
      if (!img.getAttribute) {
        return false;
      }

      var src = buildSrc(img.getAttribute(localOptions.imgPropKey) || img.getAttribute(localOptions.bgPropKey));
      var matchPattern = RegExp(ImageBoss.authorisedHosts.join('|'));
      return src && !isFullyLoaded(img) && src.match(matchPattern);
    }).forEach(img => {
      var src = buildSrc(img.getAttribute(localOptions.imgPropKey) || img.getAttribute(localOptions.bgPropKey));
      var operation = getAttribute(img, 'operation') || 'width';
      var coverMode = getAttribute(img, 'cover-mode');
      var lowRes = !!getAttribute(img, 'low-res');
      var width = getAttribute(img, 'width') || yieldValidSize(img.getAttribute('width')) || img.clientWidth;
      var height = getAttribute(img, 'height') || yieldValidSize(img.getAttribute('height')) || img.clientHeight;
      var options = (img.getAttribute("".concat(localOptions.propKey, "-options")) || '').split(',');

      if (localOptions.devMode) {
        setAttribute(img, 'loaded', true);
        return setImage(img, src);
      }

      if (localOptions.webpEnabled && localOptions.webpSupport) {
        options.push('format:webp');
      }

      if (localOptions.dprEnabled && localOptions.dprSupport > 1) {
        options.push('dpr:2');
      }

      var newUrl = getUrl(src, {
        operation,
        coverMode,
        width,
        height,
        options: options.filter(opts => !isBg(img) && !opts.match(/dpr/) || opts).filter(opts => opts).join(',')
      });
      setOpacity(img, 0.1);
      img.style['transition'] = 'opacity 1.5s';

      if (isBg(img)) {
        img.style.backgroundSize = "100%";
      }

      if (!lowRes && isVisible(img)) {
        setImage(img, newUrl);
        waitToBeLoaded(newUrl, function () {
          setAttribute(img, 'loaded', true);
          setOpacity(img, 1.0);
        });
        return;
      }

      if (lowRes) {
        if (!getAttribute(img, 'low-res-loaded')) {
          options.push('quality:01');
          var lowResUrl = getUrl(src, {
            operation,
            coverMode: coverMode,
            width: Math.round(width * 0.4),
            height: Math.round(height * 0.4),
            options: options.filter(opts => !opts.match(/dpr/)).filter(opts => opts).join(',')
          });
          setImage(img, lowResUrl);
          setAttribute(img, 'low-res-loaded', true);
        }

        if (isVisible(img) && !getAttribute(img, 'loading')) {
          setAttribute(img, 'loading', true);
          waitToBeLoaded(newUrl, function () {
            setAttribute(img, 'loaded', true);
            setImage(img, newUrl);
            setOpacity(img, 1.0);
          });
        }
      }
    });
  }

  ;

  (function webpDetection(callback, enabled) {
    if (!enabled) {
      return callback(false);
    }

    var img = new Image();
    img.src = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
    img.onload = callback.bind(this, true);
    img.onerror = callback.bind(this, false);
  })(function (webSupport) {
    localOptions.webpSupport = webSupport;
    var defaultSelector = "[".concat(localOptions.imgPropKey, "],[").concat(localOptions.bgPropKey, "]");

    function mutationLookup(target) {
      if (!target) {
        return;
      }

      if (target.length) {
        Array.prototype.forEach.call(target, function (node) {
          if (node.attributes && (node.attributes[localOptions.imgPropKey] || node.attributes[localOptions.bgPropKey]) && !getAttribute(node, 'loaded')) {
            lookup([node]);
          }

          mutationLookup(node.childNodes);
        });
      }

      mutationLookup(target.childNodes);
    }

    var defaultCallback = () => lookup(document.querySelectorAll(defaultSelector)); // call it if its already ready.


    if (document.readyState !== 'loading') {
      defaultCallback();
    } // in case the user do not add the script at the bottom


    window.addEventListener("DOMContentLoaded", defaultCallback);
    window.addEventListener("DOMNodeInserted", e => mutationLookup(e.target));
    window.addEventListener("resize", defaultCallback);
    window.addEventListener("orientationchange", defaultCallback);
    document.addEventListener("scroll", defaultCallback);
  }, localOptions.webpEnabled);
})(window);