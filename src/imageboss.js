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
        animationEnabled: isEnabled('animationEnabled', true),
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
            src = `${window.location.origin}/${src.replace(/^\//,'')}`;
        }
        return src;
    }

    function setOpacity(element, opacity) {
        if (localOptions.animationEnabled) {
            element.style.opacity = `${opacity}`;
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
        return (img.getBoundingClientRect().top <= (window.innerHeight + 300) &&
               (img.getBoundingClientRect().bottom + 300) >= 0) && getComputedStyle(img).display !== "none"
    }

    function isFullyLoaded(img) {
        return img && getAttribute(img, 'loaded');
    }

    function getAttribute(img, attr) {
        return img.getAttribute(`${localOptions.propKey}-${attr}`);
    }

    function setAttribute(img, attr, val) {
        return img.setAttribute(`${localOptions.propKey}-${attr}`, val);
    }

    function waitToBeLoaded(url, callback) {
        const image = new Image();
        image.src = url;
        image.addEventListener('load', callback);
    }

    function lookup(nodeList) {
        Array
            .from(nodeList)
            .filter(img => {
                if (!img.getAttribute) {
                    return false;
                }

                const src = buildSrc(img.getAttribute(localOptions.imgPropKey) || img.getAttribute(localOptions.bgPropKey));
                const matchPattern = RegExp(ImageBoss.authorisedHosts.join('|'));

                return src && !isFullyLoaded(img) && src.match(matchPattern);
            })
            .forEach(img => {
                const src       = buildSrc(img.getAttribute(localOptions.imgPropKey) || img.getAttribute(localOptions.bgPropKey));
                const operation = getAttribute(img, 'operation') || 'width';
                const coverMode = getAttribute(img, 'cover-mode');
                const lowRes    = !!getAttribute(img, 'low-res');
                const width     = getAttribute(img, 'width') || img.getAttribute('width') || img.clientWidth;
                const height    = getAttribute(img, 'height') || img.getAttribute('height') || img.clientHeight;
                const options   = (img.getAttribute(`${localOptions.propKey}-options`) || '').split(',');

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

                const newUrl = getUrl(src, {
                    operation,
                    coverMode,
                    width,
                    height,
                    options: options
                        .filter(opts => !isBg(img) && !opts.match(/dpr/) || opts)
                        .filter(opts => opts).join(','),
                });

                setOpacity(img, 0.1);
                img.style['transition'] = 'opacity 1.5s';

                if (isBg(img)) {
                    img.style.backgroundSize = `100%`;
                }

                if (!lowRes && isVisible(img)) {
                    setImage(img, newUrl);
                    waitToBeLoaded(newUrl, function() {
                        setAttribute(img, 'loaded', true);
                        setOpacity(img, 1.0);
                    });
                    return;
                }

                if (lowRes) {
                    if (!getAttribute(img, 'low-res-loaded')) {
                        options.push('quality:01');

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
                        setAttribute(img, 'low-res-loaded', true);


                    }

                    if (isVisible(img) && !getAttribute(img, 'loading')) {
                        setAttribute(img, 'loading', true);
                        waitToBeLoaded(newUrl, function() {
                            setAttribute(img, 'loaded', true);
                            setImage(img, newUrl);
                            setOpacity(img, 1.0);
                        })
                    }
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

        function mutationLookup(target) {
            if (!target) {
                return;
            }

            if (target.length) {
                Array.prototype.forEach.call(target, function(node) {
                    if (
                        node.attributes &&
                        (node.attributes[localOptions.imgPropKey] || node.attributes[localOptions.bgPropKey]) &&
                        !getAttribute(node, 'loaded')
                    ) {
                        lookup([node]);
                    }
                    mutationLookup(node.childNodes);
                })
            }

            mutationLookup(target.childNodes);
        }

        const defaultCallback = () => lookup(document.querySelectorAll(defaultSelector));

        // call it if its already ready.
        if (document.readyState !== 'loading') {
            defaultCallback();
        }

        // in case the user do not add the script at the bottom
        window.addEventListener("DOMContentLoaded", defaultCallback);
        window.addEventListener("DOMNodeInserted", (e) => mutationLookup(e.target));
        window.addEventListener("resize", defaultCallback);
        window.addEventListener("orientationchange", defaultCallback);
        document.addEventListener("scroll", defaultCallback);
    }, localOptions.webpEnabled);
})(window);