"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* Copyright © 2019 ImageBoss. All rights reserved. */
(function () {
  var ImageBoss = window.ImageBoss;
  var serviceHost = 'img.imageboss.me';
  var serviceUrl = "https://".concat(serviceHost);
  var localOptions = {
    propKey: 'data-imageboss',
    imgPropKey: 'data-imageboss-src',
    bgPropKey: 'data-imageboss-bg-src',
    dprSupport: window.devicePixelRatio > 1,
    lazyLoadDistance: isDefined('lazyLoadDistance', 1.0),
    devMode: isDefined('devMode', false),
    dprEnabled: isDefined('dprEnabled', true),
    webpEnabled: isDefined('webpEnabled', true),
    animationEnabled: isDefined('animationEnabled', true),
    isMobile: window.innerWidth <= 760
  };

  function isDefined(prop, fallback) {
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
    return !!getAttribute(element, 'src');
  }

  function isBg(element) {
    return !!getAttribute(element, 'bg-src');
  }

  function buildSrc(src) {
    if (src && !src.match(/^https?:\/\//)) {
      src = "".concat(window.location.origin, "/").concat(src.replace(/^\//, ''));
    }

    return src;
  }

  function setOpacity(element, opacity) {
    if (localOptions.animationEnabled && getAttribute(element, 'animation') !== "false") {
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
    var leapSize = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    var factor = localOptions.lazyLoadDistance;

    if (localOptions.isMobile) {
      factor += 0.5;
    }

    var distance = leapSize * factor;
    return img.getBoundingClientRect().top <= leapSize + distance && img.getBoundingClientRect().bottom + distance >= 0 && getComputedStyle(img).display !== "none";
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

  function waitToBeLoaded(img, url, callback) {
    var image = new Image();
    image.src = url;
    image.addEventListener('load', callback);
    image.addEventListener('error', () => {
      setAttribute(img, 'loaded', true);
    });
  }

  function yieldValidSize(size) {
    return size && !size.match(/%/) ? size : undefined;
  }

  function resolveWidth(img) {
    var width = getAttribute(img, 'width') || yieldValidSize(img.getAttribute('width'));

    if (!width && img.clientWidth > 1) {
      return img.clientWidth;
    }

    return img.parentNode.clientWidth;
  }

  function parseImageOptions(img) {
    return {
      src: buildSrc(getAttribute(img, 'src') || getAttribute(img, 'bg-src')),
      srcset: getAttribute(img, 'srcset'),
      sizes: getAttribute(img, 'sizes'),
      operation: getAttribute(img, 'operation') || 'width',
      coverMode: getAttribute(img, 'cover-mode'),
      lowRes: !!getAttribute(img, 'low-res'),
      dprDisabled: getAttribute(img, 'dpr') === 'false',
      width: resolveWidth(img),
      height: getAttribute(img, 'height') || yieldValidSize(img.getAttribute('height')) || img.clientHeight,
      options: parseOptions(getAttribute(img, 'options'))
    };
  }

  function parseOptions(options) {
    return (options || '').split(',').filter(opts => opts);
  }

  function handleSrcset(img) {
    var {
      srcset,
      src,
      sizes
    } = parseImageOptions(img);
    var newSrc = src;

    if (!localOptions.devMode && srcset) {
      srcset = srcset.split(',').map(breakpoint => {
        // ... 500w
        var sizew = breakpoint.match(/ (\d+)w$/);

        if (sizew) {
          var options = parseOptions(getAttribute(img, 'options'));

          if (localOptions.webpEnabled && localOptions.webpSupport) {
            options.push('format:webp');
          }

          sizew = sizew[1];
          var defaultParams = {
            operation: 'width',
            width: sizew,
            options
          };
          var newUrl = getUrl(src, defaultParams);
          newSrc = newUrl;
          return "".concat(newUrl, " ").concat(sizew, "w");
        }
      }).join(',');
      img.setAttribute('srcset', srcset);
      img.setAttribute('sizes', sizes);
    }

    return img;
  }

  function handleSrc(img) {
    var {
      src,
      operation,
      coverMode,
      lowRes,
      dprDisabled,
      width,
      height,
      options
    } = parseImageOptions(img);

    if (localOptions.devMode) {
      setAttribute(img, 'loaded', true);
      return setImage(img, src);
    }

    if (width <= 1 && height <= 1) {
      console.error('We couldn\'t to determine de dimensions of your image based on your markup. \
                Make sure you set it using CSS (width:), width="" or imageboss-width="" attribute.', img);
      setAttribute(img, 'loaded', true);
      return setImage(img, src);
    }

    if (localOptions.webpEnabled && localOptions.webpSupport) {
      options.push('format:webp');
    }

    if (localOptions.dprSupport && localOptions.dprEnabled && !dprDisabled) {
      options.push('dpr:2');
    }

    var defaultParams = {
      operation,
      coverMode,
      width,
      height,
      options: options.join(',')
    };
    var newUrl = getUrl(src, defaultParams);
    setOpacity(img, 0.1);
    img.style.transition = 'opacity 1.5s';

    if (isBg(img) && getComputedStyle(img).backgroundSize === "auto") {
      img.style.backgroundSize = "100%";
    }

    if (!lowRes && isVisible(img)) {
      setImage(img, newUrl);
      waitToBeLoaded(img, newUrl, function () {
        setAttribute(img, 'loaded', true);
        setOpacity(img, 1.0);
      });
      return;
    }

    if (lowRes) {
      if (!getAttribute(img, 'low-res-loaded')) {
        options.push('quality:01');
        var lowResUrl = getUrl(src, _objectSpread({
          width: Math.round(width * 0.4),
          height: Math.round(height * 0.4),
          options: options.filter(opts => !opts.match(/dpr/)).join(',')
        }, defaultParams));
        setImage(img, lowResUrl);
        setAttribute(img, 'low-res-loaded', true);
      }

      if (isVisible(img) && !getAttribute(img, 'loading')) {
        setAttribute(img, 'loading', true);
        waitToBeLoaded(img, newUrl, function () {
          setAttribute(img, 'loaded', true);
          setImage(img, newUrl);
          setOpacity(img, 1.0);
        });
      }
    }
  }

  function lookup(nodeList) {
    Array.from(nodeList).filter(img => {
      if (!img.getAttribute) {
        return false;
      }

      var src = buildSrc(getAttribute(img, 'src') || getAttribute(img, 'bg-src'));
      var matchPattern = RegExp(ImageBoss.authorisedHosts.join('|'));
      return src && !isFullyLoaded(img) && src.match(matchPattern);
    }).map(handleSrcset).forEach(handleSrc);
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