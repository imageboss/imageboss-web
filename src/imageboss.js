/* Copyright © 2019 ImageBoss. All rights reserved. */
(function (){
    const ImageBoss = window.ImageBoss;
    const localOptions = {
        propKey: 'data-imageboss',
        imgPropKey: 'data-imageboss-src',
        bgPropKey: 'data-imageboss-bg-src',
        dprSupport: window.devicePixelRatio,
        devMode: isEnabled('devMode', false),
        dprEnabled: isEnabled('dprEnabled', true),
        webpEnabled: isEnabled('webpEnabled', true),
        blurEnabled: isEnabled('blurEnabled', true),
        lowResolutionFirstEnabled: isEnabled('lowResolutionFirstEnabled', true),
    };

    function isEnabled(prop, fallback) {
        return ImageBoss[prop] !== undefined ? ImageBoss[prop] : fallback;
    }

    function getUrl(src, { operation, coverMode, width, height, options }) {
        const serviceUrl = 'https://img.imageboss.me';
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
            element.style.background = `url('${url}')`;
        }
    }

    function lookup(nodeList) {
        Array
            .from(nodeList)
            .filter(img => {
                if (!img.getAttribute) {
                    return false;
                }

                const src = img.getAttribute(localOptions.imgPropKey) || img.getAttribute(localOptions.bgPropKey);
                const matchPattern = RegExp(ImageBoss.authorisedHosts.join('|'));
                return src.match(matchPattern);
            })
            .forEach((img) => {
                const url       = img.getAttribute(localOptions.imgPropKey) || img.getAttribute(localOptions.bgPropKey);
                const operation = img.getAttribute(`${localOptions.propKey}-operation`) || 'width';
                const coverMode = img.getAttribute(`${localOptions.propKey}-cover-mode`);
                const width     = img.getAttribute('width') || img.clientWidth;
                const height    = img.getAttribute('height') || img.clientHeight;
                const options   = (img.getAttribute(`${localOptions.propKey}-options`) || '').split(',');

                if (localOptions.devMode) {
                    return setImage(img, url);
                }

                if (localOptions.webpEnabled && localOptions.webpSupport) {
                    options.push('format:webp');
                }

                if (localOptions.dprEnabled && localOptions.dprSupport > 1) {
                    options.push('dpr:2');
                }

                const newUrl = getUrl(url, {
                    operation,
                    coverMode,
                    width,
                    height,
                    options: options
                        .filter(opts => !isBg(img) && !opts.match(/dpr/) || opts)
                        .filter(opts => opts).join(','),
                });

                if (localOptions.lowResolutionFirstEnabled) {
                    options.push('quality:50');
                    options.push('blur:20');

                    const lowResUrl = getUrl(url, {
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

                    img.style['transition'] = 'filter 1s';

                    setBlur(img, 10);

                    const image = new Image();
                    image.src = newUrl;
                    image.onload = function() {
                        setBlur(img, 0);
                        setImage(img, newUrl);
                    }

                } else {
                    setImage(img, newUrl);
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

        lookup(
            document.querySelectorAll(`[${localOptions.imgPropKey}],[${localOptions.bgPropKey}]`)
        );

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
    }, localOptions.webpEnabled);
})();