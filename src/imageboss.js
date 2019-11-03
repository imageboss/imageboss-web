/* Copyright © 2019 ImageBoss. All rights reserved. */
(function (){
    const ImageBoss = window.ImageBoss;
    const serviceHost = 'img.imageboss.me';
    const serviceUrl = `https://${serviceHost}`;
    const localOptions = {
        propKey: 'imageboss',
        imgPropKey: 'imageboss-src',
        bgPropKey: 'imageboss-bg-src',
        dprSupport: window.devicePixelRatio,
        devMode: isEnabled('devMode', false),
        dprEnabled: isEnabled('dprEnabled', true),
        webpEnabled: isEnabled('webpEnabled', true),
        blurEnabled: isEnabled('blurEnabled', true),
    };

    function isEnabled(prop, fallback) {
        return ImageBoss[prop] !== undefined ? ImageBoss[prop] : fallback;
    }

    function getUrl(src, { operation, coverMode, width, height, options }) {

        let template = '/:operation/:options/';

        if (operation === 'cover') {
            template = '/:operation::cover_mode/:widthx:height/:options/';
        } else if (operation === 'width') {
            template = '/:operation/:width/:options/';
        } else if (operation === 'height') {
            template = '/:operation/:height/:options/';
        }

        const finalUrl = template
            .replace(':operation', operation || '')
            .replace(':cover_mode', coverMode || '')
            .replace(':width', width || '')
            .replace(':height', height || '')
            .replace(':options', options || '')
            .replace(/\/\//g, '/')
            .replace(/:\//g, '/')

        return serviceUrl + finalUrl + src;
    }

    function isImg(element) {
        return !!element.getAttribute(`${localOptions.propKey}-src`);
    }

    function isBg(element) {
        return !!element.getAttribute(`${localOptions.propKey}-bg-src`);
    }

    function buildSrc(src) {
        if (src && !src.match(/^https?:\/\//)) {
            src = `${window.location.origin}/${src}`
        }
        return src;
    }

    function setBlur(element, blur) {
        if (localOptions.blurEnabled) {
            element.style['-webkit-filter'] = `blur(${blur}px)`;
            element.style['-moz-filter'] = `blur(${blur}px)`;
            element.style['-o-filter'] = `blur(${blur}px)`;
            element.style['-ms-filter'] = `blur(${blur}px)`;
            element.style['filter'] = `blur(${blur}px)`;
        }
    }

    function setImage(element, url) {
        if (isImg(element)) {
            element.setAttribute('src', url);
        } else if (isBg(element)) {
            element.style.backgroundImage = `url('${url}')`;
        }
    }

    function isVisible(img) {
        return (img.getBoundingClientRect().top <= window.innerHeight && img.getBoundingClientRect().bottom >= 0) && getComputedStyle(img).display !== "none"
    }

    function isFullyLoaded(img) {
        return img && getAttribute(img, 'loaded');
    }

    function getAttribute(img, attr) {
        return img.getAttribute(`${localOptions.propKey}-${attr}`);
    }

    function setAttribute(img, attr, val) {
        return img.getAttribute(`${localOptions.propKey}-${attr}`, val);
    }

    function lookup(nodeList) {
        Array
            .from(nodeList)
            .filter(img => {
                if (!img.getAttribute) {
                    return false;
                }

                const originalSrc = img.getAttribute('src') || window.getComputedStyle(img).getPropertyValue('background-image');
                const src = buildSrc(img.getAttribute(localOptions.imgPropKey) || img.getAttribute(localOptions.bgPropKey));
                const matchPattern = RegExp(ImageBoss.authorisedHosts.join('|'));

                return src && !isFullyLoaded(img) && src.match(matchPattern);
            })
            .forEach(img => {
                const src       = buildSrc(img.getAttribute(localOptions.imgPropKey) || img.getAttribute(localOptions.bgPropKey));
                const operation = img.getAttribute(`${localOptions.propKey}-operation`) || 'width';
                const coverMode = img.getAttribute(`${localOptions.propKey}-cover-mode`);
                const lowRes    = !!img.getAttribute(`${localOptions.propKey}-low-res`);
                const width     = img.getAttribute('width') || img.clientWidth;
                const height    = img.getAttribute('height') || img.clientHeight;
                const options   = (img.getAttribute(`${localOptions.propKey}-options`) || '').split(',');

                if (localOptions.devMode) {
                    return setImage(img, src);
                }

                if (localOptions.webpEnabled && localOptions.webpSupport) {
                    options.push('format:webp');
                }

                if (localOptions.dprEnabled && localOptions.dprSupport > 1) {
                    options.push('dpr:2');
                }

                const newUrl = getUrl(src, {
                    operation,
                    coverMode,
                    width,
                    height,
                    options: options
                        .filter(opts => !isBg(img) && !opts.match(/dpr/) || opts)
                        .filter(opts => opts).join(','),
                });

                if (!lowRes) {
                    return setImage(img, newUrl);
                }

                // low res only down here
                if (!getAttribute(img, 'low-res-loaded')) {
                    options.push('quality:50');
                    options.push('blur:20');

                    const lowResUrl = getUrl(src, {
                        operation,
                        coverMode: coverMode,
                        width: Math.round(width * 0.4),
                        height: Math.round(height * 0.4),
                        options: options
                            .filter(opts => !opts.match(/dpr/))
                            .filter(opts => opts).join(','),
                    });

                    setImage(img, lowResUrl);

                    if (isBg(img)) {
                        img.style.backgroundSize = `${width}px`;
                    }

                    setBlur(img, 10);

                    img.style['transition'] = 'filter 1s';
                    setAttribute(img, 'low-res-loaded', true);
                }

                if (isVisible(img) && !getAttribute(img, 'loading')) {
                    setAttribute(img, 'loading', true);

                    const image = new Image();
                    image.src = newUrl;
                    image.addEventListener('load', function() {
                        setAttribute(img, 'loaded', true);
                        setBlur(img, 0);
                        setImage(img, newUrl);
                    });
                }
            });
    };

    (function webpDetection(callback, enabled) {
        if (!enabled) {
            return callback(false);
        }

        var img = new Image();
        img.src = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
        img.onload = callback.bind(this, true);
        img.onerror = callback.bind(this, false);
    })(function(webSupport) {
        localOptions.webpSupport = webSupport;
        const defaultSelector = `[${localOptions.imgPropKey}],[${localOptions.bgPropKey}]`;

        lookup(document.querySelectorAll(defaultSelector));

        new MutationObserver(function(mutationsList) {
            for (let mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    lookup(mutation.addedNodes);
                }
            }
        }).observe(
            document.querySelector('body'),
            { attributes: true, childList: true, subtree: true }
        );

        document.addEventListener("scroll", () => lookup(document.querySelectorAll(defaultSelector)));
        window.addEventListener("resize", () => lookup(document.querySelectorAll(defaultSelector)));
        window.addEventListener("orientationchange", () => lookup(document.querySelectorAll(defaultSelector)));
    }, localOptions.webpEnabled);
})();