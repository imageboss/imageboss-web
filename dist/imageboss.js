"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _wrapRegExp(re, groups) { _wrapRegExp = function _wrapRegExp(re, groups) { return new BabelRegExp(re, undefined, groups); }; var _RegExp = _wrapNativeSuper(RegExp); var _super = RegExp.prototype; var _groups = new WeakMap(); function BabelRegExp(re, flags, groups) { var _this = _RegExp.call(this, re, flags); _groups.set(_this, groups || _groups.get(re)); return _this; } _inherits(BabelRegExp, _RegExp); BabelRegExp.prototype.exec = function (str) { var result = _super.exec.call(this, str); if (result) result.groups = buildGroups(result, this); return result; }; BabelRegExp.prototype[Symbol.replace] = function (str, substitution) { if (typeof substitution === "string") { var groups = _groups.get(this); return _super[Symbol.replace].call(this, str, substitution.replace(/\$<([^>]+)>/g, function (_, name) { return "$" + groups[name]; })); } else if (typeof substitution === "function") { var _this = this; return _super[Symbol.replace].call(this, str, function () { var args = []; args.push.apply(args, arguments); if (typeof args[args.length - 1] !== "object") { args.push(buildGroups(args, _this)); } return substitution.apply(this, args); }); } else { return _super[Symbol.replace].call(this, str, substitution); } }; function buildGroups(result, re) { var g = _groups.get(re); return Object.keys(g).reduce(function (groups, name) { groups[name] = result[g[name]]; return groups; }, Object.create(null)); } return _wrapRegExp.apply(this, arguments); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

/* Copyright © 2020 ImageBoss. All rights reserved. */
(function (window) {
  if (!window) {
    return;
  }

  var ImageBoss = window.ImageBoss;
  var serviceHost = 'img.imageboss.me';
  var serviceUrl = "https://".concat(serviceHost);
  var localOptions = {
    propKey: 'data-imageboss',
    imgPropKey: 'data-imageboss-src',
    bgPropKey: 'data-imageboss-bg-src',
    sourcePropKey: 'data-imageboss-srcset',
    srcPropKey: isDefined('srcPropKey', 'src'),
    lowsrcPropKey: isDefined('lowsrcPropKey', 'data-lowsrc'),
    srcsetPropKey: isDefined('srcsetPropKey', 'srcset'),
    matchHosts: isDefined('matchHosts', []),
    source: isDefined('source'),
    dprSupport: window.devicePixelRatio > 1,
    lowRes: isDefined('lowRes', false),
    devMode: isDefined('devMode', false),
    dpr: isDefined('dpr', false),
    webp: isDefined('webp', true)
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
      source,
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

    var finalPath = template.replace(':source', source).replace(':operation', operation || '').replace(':cover_mode', coverMode || '').replace(':width', width || '').replace(':height', height || '').replace(':options', options || '').replace(/:\//g, '/');
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

  function setImage(element, url) {
    if (isImg(element)) {
      element.setAttribute(localOptions.srcPropKey, url);
    } else if (isBg(element)) {
      element.style.backgroundImage = "url('".concat(url, "')");
    }
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
      sizes: img.getAttribute('sizes'),
      operation: getAttribute(img, 'operation') || 'width',
      coverMode: getAttribute(img, 'cover-mode'),
      width: resolveSize(img, 'width'),
      height: resolveSize(img, 'height'),
      source: getAttribute(img, 'source') || localOptions.source,
      options: parseOptions(getAttribute(img, 'options')),
      lowRes: isEnabled(img, 'low-res'),
      dprDisabled: isEnabled(img, 'dpr'),
      class: getAttribute(img, 'class')
    };
  }

  function parseOptions(options) {
    return (options || '').split(',').filter(opts => opts);
  }

  function generateWidths(targetWidth) {
    var MIN_WIDTH = 100;
    var MAX_WIDTH = 5000;
    var widths = [targetWidth];
    var currWidth = targetWidth;

    while (currWidth >= MIN_WIDTH) {
      currWidth -= currWidth * 0.5;
      widths.push(Math.round(currWidth));
    }

    currWidth = targetWidth;

    while (currWidth <= MAX_WIDTH) {
      currWidth *= 1.5;
      widths.push(Math.round(currWidth));
    }

    return widths.filter(w => w < MAX_WIDTH && w >= MIN_WIDTH);
  }

  function handleSrcSet(img, imageParams) {
    var {
      source,
      srcset,
      src,
      sizes,
      operation,
      coverMode,
      width,
      height,
      options
    } = imageParams;
    var breakpoints;

    if (srcset) {
      breakpoints = srcset.split(',').map(line => {
        var {
          width,
          url
        } = line.trim().match(_wrapRegExp(/(.+) ([0-9]+)w/, {
          url: 1,
          width: 2
        })).groups;
        return {
          width,
          url
        };
      });
    } else {
      breakpoints = generateWidths(width).map(function (w) {
        return {
          url: src,
          width: w
        };
      });
    }

    if (sizes) {
      aspectRatio = width / height;
      srcset = breakpoints.map((_ref2) => {
        var {
          url,
          width
        } = _ref2;
        newHeight = width / aspectRatio;
        var defaultParams = {
          source,
          operation,
          coverMode,
          width,
          height: Math.round(newHeight),
          options: options.join(',')
        };
        return "".concat(getUrl(buildSrc(url), defaultParams), " ").concat(width, "w");
      }).join(', ');
      img.setAttribute(localOptions.srcsetPropKey, srcset);
    }

    return img;
  }

  function handleSrc(img, imageParams) {
    var {
      source,
      src,
      operation,
      coverMode,
      lowRes,
      width,
      height,
      options
    } = imageParams;

    if (img.tagName === 'SOURCE') {
      return;
    }

    var wrongDimentions = operation === 'width' ? width <= 2 : width <= 2 && height <= 2;

    if (wrongDimentions) {
      operation = 'cdn';
      console.error('ImageBossError: We couldn\'t to determine de dimensions of your image based on your markup. \
                Make sure you set it using CSS (width:), width="" or imageboss-width="" attribute. Using CDN operation as fallback.', img, operation, width, height);
    }

    if (localOptions.dprSupport && isEnabled(img, 'dpr')) {
      options.push('dpr:2');
    }

    if (isBg(img) && getComputedStyle(img).backgroundSize === "auto") {
      img.style.backgroundSize = "100%";
    }

    var defaultParams = {
      source,
      operation,
      coverMode,
      width,
      height,
      options: options.join(',')
    };

    if (lowRes) {
      var lowResUrl = getUrl(src, _objectSpread({}, defaultParams, {
        width: 10,
        height: 10,
        options: options.filter(opts => !opts.match(/dpr/)).join(',')
      }));
      img.setAttribute(localOptions.lowsrcPropKey, lowResUrl);
    }

    setImage(img, getUrl(src, defaultParams));
    img.classList.add(imageParams.class);
  }

  function lookup(nodeList) {
    Array.from(nodeList).filter(img => {
      if (!img.getAttribute) {
        return false;
      }

      var src = buildSrc(getAttribute(img, 'src') || getAttribute(img, 'srcset') || getAttribute(img, 'bg-src'));
      var matchPattern = RegExp(localOptions.matchHosts.join('|'));

      if (localOptions.matchHosts.length && src && !src.href.match(matchPattern)) {
        return false;
      }

      return src && !isFullyLoaded(img);
    }).forEach(img => {
      var imageParams = parseImageOptions(img);
      var {
        source,
        src,
        operation,
        options
      } = imageParams;

      if (!source) {
        console.error('ImageBossError: You need to inform an image source!');
      }

      if (!source || localOptions.devMode) {
        setAttribute(img, 'loaded', true);
        return setImage(img, src);
      }

      if (localOptions.webp && localOptions.webpSupport) {
        options.push('format:webp');
      }

      handleSrcSet(img, _objectSpread({}, imageParams, {
        options
      }));
      handleSrc(img, _objectSpread({}, imageParams, {
        options,
        operation
      }));
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
    var defaultSelector = "[".concat(localOptions.imgPropKey, "],source[").concat(localOptions.sourcePropKey, "],[").concat(localOptions.bgPropKey, "]");
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

    var defaultCallback = () => lookup(elements); // call it if its already ready.


    if (document.readyState !== 'loading') {
      defaultCallback();
    } // in case the user do not add the script at the bottom


    window.addEventListener("DOMContentLoaded", defaultCallback);
    window.addEventListener("DOMNodeInserted", function (e) {
      mutationLookup(e.target);
    });
  }, localOptions.webp);
})(window);