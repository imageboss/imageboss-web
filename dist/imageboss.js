"use strict";

/* Copyright © 2019 ImageBoss. All rights reserved. */
(function () {
  var ImageBoss = window.ImageBoss;
  var serviceHost = 'img.imageboss.me';
  var serviceUrl = "https://".concat(serviceHost);
  var localOptions = {
    propKey: 'data-imageboss',
    imgPropKey: 'data-imageboss-src',
    bgPropKey: 'data-imageboss-bg-src',
    dprSupport: window.devicePixelRatio,
    devMode: isEnabled('devMode', false),
    dprEnabled: isEnabled('dprEnabled', true),
    webpEnabled: isEnabled('webpEnabled', true),
    blurEnabled: isEnabled('blurEnabled', true),
    lowResolutionFirstEnabled: isEnabled('lowResolutionFirstEnabled', true)
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
      src = "".concat(window.location.origin, "/").concat(src);
    }

    return src;
  }

  function setBlur(element, blur) {
    if (localOptions.blurEnabled) {
      element.style['-webkit-filter'] = "blur(".concat(blur, "px)");
      element.style['-moz-filter'] = "blur(".concat(blur, "px)");
      element.style['-o-filter'] = "blur(".concat(blur, "px)");
      element.style['-ms-filter'] = "blur(".concat(blur, "px)");
      element.style['filter'] = "blur(".concat(blur, "px)");
    }
  }

  function setImage(element, url) {
    if (isImg(element)) {
      element.setAttribute('src', url);
    } else if (isBg(element)) {
      element.style.backgroundImage = "url('".concat(url, "')");
    }
  }

  function lookup(nodeList) {
    Array.from(nodeList).filter(img => {
      if (!img.getAttribute) {
        return false;
      }

      var src = buildSrc(img.getAttribute(localOptions.imgPropKey) || img.getAttribute(localOptions.bgPropKey));
      var matchPattern = RegExp(ImageBoss.authorisedHosts.join('|'));
      return src && src.match(matchPattern) && !src.match(serviceHost);
    }).forEach(img => {
      var url = img.getAttribute(localOptions.imgPropKey) || img.getAttribute(localOptions.bgPropKey);
      var operation = img.getAttribute("".concat(localOptions.propKey, "-operation")) || 'width';
      var coverMode = img.getAttribute("".concat(localOptions.propKey, "-cover-mode"));
      var width = img.getAttribute('width') || img.clientWidth;
      var height = img.getAttribute('height') || img.clientHeight;
      var options = (img.getAttribute("".concat(localOptions.propKey, "-options")) || '').split(',');

      if (localOptions.devMode) {
        return setImage(img, url);
      }

      if (localOptions.webpEnabled && localOptions.webpSupport) {
        options.push('format:webp');
      }

      if (localOptions.dprEnabled && localOptions.dprSupport > 1) {
        options.push('dpr:2');
      }

      var newUrl = getUrl(url, {
        operation,
        coverMode,
        width,
        height,
        options: options.filter(opts => !isBg(img) && !opts.match(/dpr/) || opts).filter(opts => opts).join(',')
      });

      if (localOptions.lowResolutionFirstEnabled) {
        options.push('quality:50');
        options.push('blur:20');
        var lowResUrl = getUrl(url, {
          operation,
          coverMode: coverMode,
          width: Math.round(width * 0.4),
          height: Math.round(height * 0.4),
          options: options.filter(opts => !opts.match(/dpr/)).filter(opts => opts).join(',')
        });
        setImage(img, lowResUrl);

        if (isBg(img)) {
          img.style.backgroundSize = "".concat(width, "px");
        } else {
          setBlur(img, 10);
        }

        img.style['transition'] = 'filter 1s';
        var image = new Image();
        image.src = newUrl;

        image.onload = function () {
          setBlur(img, 0);
          setImage(img, newUrl);
        };
      } else {
        setImage(img, newUrl);
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
    lookup(document.querySelectorAll("[".concat(localOptions.imgPropKey, "],[").concat(localOptions.bgPropKey, "]")));
    new MutationObserver(function (mutationsList) {
      for (var mutation of mutationsList) {
        if (mutation.type === 'childList') {
          lookup(mutation.addedNodes);
        }
      }
    }).observe(document.querySelector('body'), {
      attributes: true,
      childList: true,
      subtree: true
    });
  }, localOptions.webpEnabled);
})();