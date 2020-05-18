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
    matchHosts: isDefined('matchHosts', []),
    source: isDefined('source'),
    bgPropKey: 'data-imageboss-bg-src',
    dprSupport: window.devicePixelRatio > 1,
    lazyload: isDefined('lazyload', true),
    lowRes: isDefined('lowRes', false),
    lowResSize: isDefined('lowResSize', 0.4),
    devMode: isDefined('devMode', false),
    dpr: isDefined('dpr', true),
    webp: isDefined('webp', true),
    animation: isDefined('animation', false)
  };

  function isDefined(prop, fallback) {
    var object = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ImageBoss;
    var normalizedProp = prop.replace(/(-)([a-z])/g, match => "".concat(match[1].toUpperCase()));
    return [null, undefined].indexOf(object[normalizedProp]) == -1 ? object[normalizedProp] : fallback;
  }

  function isEnabled(el, option) {
    var attributeValue = getAttribute(el, option);
    var isAttrDefined = [null, undefined].indexOf(attributeValue) == -1;
    return isAttrDefined ? attributeValue === "true" && attributeValue !== true : isDefined(option, false, localOptions);
  }

  function getUrl(src, _ref) {
    var {
      operation,
      coverMode,
      width,
      height,
      options
    } = _ref;
    var template = '/:source/:operation/:options';

    if (operation === 'cover') {
      template = '/:source/:operation::cover_mode/:widthx:height/:options';
    } else if (operation === 'width') {
      template = '/:source/:operation/:width/:options';
    } else if (operation === 'height') {
      template = '/:source/:operation/:height/:options';
    }

    var finalPath = template.replace(':source', localOptions.source).replace(':operation', operation || '').replace(':cover_mode', coverMode || '').replace(':width', width || '').replace(':height', height || '').replace(':options', options || '').replace(/:\//g, '/');
    finalPath = (finalPath + src.pathname).replace(/\/\//g, '/');
    return serviceUrl + finalPath;
  }

  function isImg(element) {
    return !!getAttribute(element, 'src');
  }

  function isBg(element) {
    return !!getAttribute(element, 'bg-src');
  }

  function buildSrc(src) {
    var parser = document.createElement('a');
    parser.href = src;
    return parser;
  }

  function setOpacity(element, opacity) {
    if (isEnabled(element, 'animation')) {
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
    if (!isEnabled(img, 'lazyload')) {
      return true;
    }

    return getAttribute(img, 'visible');
  }

  function isFullyLoaded(img) {
    return img && getAttribute(img, 'loaded');
  }

  function getAttribute(el, attr) {
    return el.getAttribute("".concat(localOptions.propKey, "-").concat(attr));
  }

  function setAttribute(el, attr, val) {
    return el.setAttribute("".concat(localOptions.propKey, "-").concat(attr), val);
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

  function resolveSize(img, type) {
    var size = getAttribute(img, type) || yieldValidSize(img.getAttribute(type));
    var attr = "client".concat(type.charAt(0).toUpperCase() + type.slice(1));

    if (size) {
      return size;
    } else if (img[attr] > 1) {
      return img[attr];
    }

    return img.parentNode[attr];
  }

  function parseImageOptions(img) {
    return {
      src: buildSrc(getAttribute(img, 'src') || getAttribute(img, 'bg-src')),
      srcset: getAttribute(img, 'srcset'),
      sizes: getAttribute(img, 'sizes'),
      operation: getAttribute(img, 'operation') || 'width',
      coverMode: getAttribute(img, 'cover-mode'),
      width: resolveSize(img, 'width'),
      height: resolveSize(img, 'height'),
      options: parseOptions(getAttribute(img, 'options')),
      lazyload: isEnabled(img, 'lazyload'),
      lowRes: isEnabled(img, 'low-res'),
      dprDisabled: isEnabled(img, 'dpr')
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

    if (!localOptions.devMode && srcset) {
      srcset = srcset.split(',').map(breakpoint => {
        // ... 500w
        var sizew = breakpoint.match(/ (\d+)w$/);

        if (sizew) {
          var options = parseOptions(getAttribute(img, 'options'));

          if (isEnabled(img, 'webp') && localOptions.webpSupport) {
            options.push('format:webp');
          }

          sizew = sizew[1];
          var defaultParams = {
            operation: 'width',
            width: sizew,
            options
          };
          var newUrl = getUrl(src, defaultParams);
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
      width,
      height,
      options
    } = parseImageOptions(img);
    var wrongDimentions = operation === 'width' ? width <= 1 : width <= 1 && height <= 1;

    if (!localOptions.source) {
      console.error('ImageBossError: You need to inform an image source!');
    }

    if (wrongDimentions) {
      console.error('ImageBossError: We couldn\'t to determine de dimensions of your image based on your markup. \
              Make sure you set it using CSS (width:), width="" or imageboss-width="" attribute.', img, operation, width, height);
    }

    if (!localOptions.source || wrongDimentions || localOptions.devMode) {
      setAttribute(img, 'loaded', true);
      return setImage(img, src);
    }

    if (localOptions.webp && localOptions.webpSupport) {
      options.push('format:webp');
    }

    if (localOptions.dprSupport && isEnabled(img, 'dpr')) {
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

    if (isEnabled(img, 'animation')) {
      img.style.transition = 'opacity 0.5s';
    }

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
        options.push('quality:07');
        var lowResUrl = getUrl(src, _objectSpread({}, defaultParams, {
          width: Math.round(width * localOptions.lowResSize),
          height: Math.round(height * localOptions.lowResSize),
          options: options.filter(opts => !opts.match(/dpr/)).join(',')
        }));
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
      var matchPattern = RegExp(localOptions.matchHosts.join('|'));

      if (localOptions.matchHosts.length && src && !src.href.match(matchPattern)) {
        return false;
      }

      return src && !isFullyLoaded(img);
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
    var elements = document.querySelectorAll(defaultSelector);

    function mutationLookup(target) {
      if (!target) {
        return;
      }

      if (target.length) {
        Array.prototype.forEach.call(target, function (node) {
          if (node.attributes && (node.attributes[localOptions.imgPropKey] || node.attributes[localOptions.bgPropKey]) && !isFullyLoaded(node)) {
            lookup([node]);
          }

          mutationLookup(node.childNodes);
        });
      }

      mutationLookup(target.childNodes);
    }

    var defaultCallback = () => lookup(elements);

    var lazyImageObserver; // call it if its already ready.

    if (document.readyState !== 'loading') {
      defaultCallback();
    }

    if ("IntersectionObserver" in window) {
      lazyImageObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            setAttribute(el, 'visible', true);
            mutationLookup([el]);
            lazyImageObserver.unobserve(el);
          }
        });
      });
      [].slice.call(elements).forEach(function (lazyImage) {
        lazyImageObserver.observe(lazyImage);
      });
    } // in case the user do not add the script at the bottom


    window.addEventListener("DOMContentLoaded", defaultCallback);
    window.addEventListener("DOMNodeInserted", function (observer, e) {
      mutationLookup(e.target);
      var elements = document.querySelectorAll("".concat(defaultSelector, ":not([").concat(localOptions.propKey, "-loaded=\"true\"])"));
      [].slice.call(elements).forEach(function (lazyImage) {
        observer.observe(lazyImage);
      });
    }.bind(null, lazyImageObserver));
  }, localOptions.webp);
})(window);