/* Copyright © 2019 ImageBoss. All rights reserved. */
(function () {
    const ImageBoss = window.ImageBoss;
    const serviceHost = 'img.imageboss.me';
    const serviceUrl = `https://${serviceHost}`;
    const localOptions = {
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

    function isDefined(prop, fallback, object = ImageBoss) {
        const normalizedProp = prop
            .replace(/(-)([a-z])/g, (match) => `${match[1].toUpperCase()}`);
        return [null, undefined].indexOf(object[normalizedProp]) == -1 ? object[normalizedProp] : fallback;
    }

    function isEnabled(el, option) {
        const attributeValue = getAttribute(el, option);
        const isAttrDefined = [null, undefined].indexOf(attributeValue) == -1;
        return isAttrDefined ? attributeValue === "true" && attributeValue !== true : isDefined(option, false, localOptions)
    }

    function getUrl(src, { operation, coverMode, width, height, options }) {
        let template = '/:source/:operation/:options';

        if (operation === 'cover') {
            template = '/:source/:operation::cover_mode/:widthx:height/:options';
        } else if (operation === 'width') {
            template = '/:source/:operation/:width/:options';
        } else if (operation === 'height') {
            template = '/:source/:operation/:height/:options';
        }

        let finalPath = template
            .replace(':source', localOptions.source)
            .replace(':operation', operation || '')
            .replace(':cover_mode', coverMode || '')
            .replace(':width', width || '')
            .replace(':height', height || '')
            .replace(':options', options || '')
            .replace(/:\//g, '/')

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
        const parser = document.createElement('a');
        parser.href = src;
        return parser;
    }

    function setOpacity(element, opacity) {
        if (isEnabled(element, 'animation')) {
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
        if (!isEnabled(img, 'lazyload')) {
            return true;
        }

        return getAttribute(img, 'visible');
    }

    function isFullyLoaded(img) {
        return img && getAttribute(img, 'loaded');
    }

    function getAttribute(el, attr) {
        return el.getAttribute(`${localOptions.propKey}-${attr}`);
    }

    function setAttribute(el, attr, val) {
        return el.setAttribute(`${localOptions.propKey}-${attr}`, val);
    }

    function waitToBeLoaded(img, url, callback) {
        const image = new Image();
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
        let size = getAttribute(img, type) || yieldValidSize(img.getAttribute(type));
        let attr = `client${type.charAt(0).toUpperCase() + type.slice(1)}`;
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
        let { srcset, src, sizes } = parseImageOptions(img);
        if (!localOptions.devMode && srcset) {
            srcset = srcset.split(',').map((breakpoint) => {
                // ... 500w
                let sizew = breakpoint.match(/ (\d+)w$/);

                if (sizew) {
                    const options = parseOptions(getAttribute(img, 'options'));

                    if (isEnabled(img, 'webp') && localOptions.webpSupport) {
                        options.push('format:webp');
                    }

                    sizew = sizew[1];
                    const defaultParams = {
                        operation: 'width',
                        width: sizew,
                        options,
                    };

                    const newUrl = getUrl(src, defaultParams);
                    return `${newUrl} ${sizew}w`;
                }
            }).join(',');

            img.setAttribute('srcset', srcset);
            img.setAttribute('sizes', sizes);
        }

        return img;
    }

    function handleSrc(img) {
        let { src, operation, coverMode, lowRes,
            width, height, options } = parseImageOptions(img);

        const wrongDimentions = operation === 'width' ? width <= 1 : width <= 1 && height <= 1;

        if (!localOptions.source) {
            console.error('ImageBossError: You need to inform an image source!')
        }

        if (wrongDimentions) {
            console.error(
                'ImageBossError: We couldn\'t to determine de dimensions of your image based on your markup. \
              Make sure you set it using CSS (width:), width="" or imageboss-width="" attribute.',
                img, operation, width, height
            );
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

        const defaultParams = {
            operation, coverMode,
            width, height,
            options: options.join(','),
        };

        const newUrl = getUrl(src, defaultParams);

        setOpacity(img, 0.1);

        if (isEnabled(img, 'animation')) {
            img.style.transition = 'opacity 0.5s';
        }

        if (isBg(img) && getComputedStyle(img).backgroundSize === "auto") {
            img.style.backgroundSize = `100%`;
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
                const lowResUrl = getUrl(src, {
                    ...defaultParams,
                    width: Math.round(width * localOptions.lowResSize),
                    height: Math.round(height * localOptions.lowResSize),
                    options: options
                        .filter(opts => !opts.match(/dpr/))
                        .join(','),
                });

                setImage(img, lowResUrl);
                setAttribute(img, 'low-res-loaded', true);
            }

            if (isVisible(img) && !getAttribute(img, 'loading')) {
                setAttribute(img, 'loading', true);
                waitToBeLoaded(img, newUrl, function () {
                    setAttribute(img, 'loaded', true);
                    setImage(img, newUrl);
                    setOpacity(img, 1.0);
                })
            }
        }
    }

    function lookup(nodeList) {
        Array
            .from(nodeList)
            .filter(img => {
                if (!img.getAttribute) {
                    return false;
                }

                const src = buildSrc(getAttribute(img, 'src') || getAttribute(img, 'bg-src'));
                const matchPattern = RegExp(localOptions.matchHosts.join('|'));

                if (localOptions.matchHosts.length && src && !src.href.match(matchPattern)) {
                    return false;
                }

                return src && !isFullyLoaded(img);
            })
            .map(handleSrcset)
            .forEach(handleSrc);
    };

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
        const defaultSelector = `[${localOptions.imgPropKey}],[${localOptions.bgPropKey}]`;
        const elements = document.querySelectorAll(defaultSelector);

        function mutationLookup(target) {
            if (!target) {
                return;
            }

            if (target.length) {
                Array.prototype.forEach.call(target, function (node) {
                    if (
                        node.attributes &&
                        (node.attributes[localOptions.imgPropKey] || node.attributes[localOptions.bgPropKey]) &&
                        !isFullyLoaded(node)
                    ) {
                        lookup([node]);
                    }
                    mutationLookup(node.childNodes);
                })
            }

            mutationLookup(target.childNodes);
        }

        const defaultCallback = () => lookup(elements);
        let lazyImageObserver;
        // call it if its already ready.
        if (document.readyState !== 'loading') {
            defaultCallback();
        }

        if ("IntersectionObserver" in window) {
            lazyImageObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        let el = entry.target;
                        setAttribute(el, 'visible', true);
                        mutationLookup([el]);
                        lazyImageObserver.unobserve(el);
                    }
                });
            });

            [].slice.call(elements).forEach(function (lazyImage) {
                lazyImageObserver.observe(lazyImage);
            });
        }

        // in case the user do not add the script at the bottom
        window.addEventListener("DOMContentLoaded", defaultCallback);
        window.addEventListener("DOMNodeInserted", function (observer, e) {
            mutationLookup(e.target);
            const elements = document.querySelectorAll(`${defaultSelector}:not([${localOptions.propKey}-loaded="true"])`);
            [].slice.call(elements).forEach(function (lazyImage) {
                observer.observe(lazyImage);
            });
        }.bind(null, lazyImageObserver));
    }, localOptions.webp);
})(window);
