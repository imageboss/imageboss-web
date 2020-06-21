/* Copyright © 2020 ImageBoss. All rights reserved. */
(function (window) {

    if (!window) {
        return;
    }

    const ImageBoss = window.ImageBoss;
    const serviceHost = 'img.imageboss.me';
    const serviceUrl = `https://${serviceHost}`;
    const localOptions = {
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

    function getUrl(src, { source, operation, coverMode, width, height, options }) {
        let template = '/:source/:operation/:options';

        if (operation === 'cover') {
            template = '/:source/:operation::cover_mode/:widthx:height/:options';
        } else if (operation === 'width') {
            template = '/:source/:operation/:width/:options';
        } else if (operation === 'height') {
            template = '/:source/:operation/:height/:options';
        }

        let finalPath = template
            .replace(':source', source)
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

    function setImage(element, url) {
        if (isImg(element)) {
            element.setAttribute(localOptions.srcPropKey, url);
        } else if (isBg(element)) {
            element.style.backgroundImage = `url('${url}')`;
        }
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
            sizes: img.getAttribute('sizes'),
            operation: getAttribute(img, 'operation') || 'width',
            coverMode: getAttribute(img, 'cover-mode'),
            width: resolveSize(img, 'width'),
            height: resolveSize(img, 'height'),
            source: getAttribute(img, 'source') || localOptions.source,
            options: parseOptions(getAttribute(img, 'options')),
            lowRes: isEnabled(img, 'low-res'),
            dprDisabled: isEnabled(img, 'dpr'),
            class: (getAttribute(img, 'class') || '').split(' ').filter((a) => a)
        };
    }

    function parseOptions(options) {
        return (options || '').split(',').filter(opts => opts);
    }

    function generateWidths(targetWidth) {
        const MIN_WIDTH = 100;
        const MAX_WIDTH = 5000;
        const widths = [targetWidth];

        let currWidth = targetWidth;

        while (currWidth >= MIN_WIDTH) {
            currWidth -= currWidth * 0.5;
            widths.push(Math.round(currWidth));
        }

        currWidth = targetWidth;
        while (currWidth <= MAX_WIDTH) {
            currWidth *= 1.5;
            widths.push(Math.round(currWidth));
        }

        return widths.filter((w) => w < MAX_WIDTH && w >= MIN_WIDTH);
    }

    function handleSrcSet(img, imageParams) {
        let { source, srcset, src, sizes, operation, coverMode,
            width, height, options } = imageParams;
        let breakpoints;

        if (!sizes) {
            return img;
        }

        if (srcset) {
            breakpoints = srcset.split(',').map((line) => {
                const { width, url } = line.trim().match(/(?<url>.+) (?<width>\d+)w/).groups;
                return { width, url };
            });
        } else {
            breakpoints = generateWidths(width).map(function (w) {
                return { url: src, width: w }
            });
        }

        aspectRatio = width / height;
        srcset = breakpoints.map(({ url, width }) => {

            newHeight = width / aspectRatio;

            const defaultParams = {
                source,
                operation, coverMode,
                width, height: Math.round(newHeight),
                options: options.join(','),
            };

            return `${getUrl(buildSrc(url), defaultParams)} ${width}w`;
        }).join(', ');
        img.setAttribute(localOptions.srcsetPropKey, srcset);

        return img;
    }

    function handleSrc(img, imageParams) {
        let { source, src, operation, coverMode, lowRes,
              width, height, options } = imageParams;

        if (img.tagName === 'SOURCE') {
            return;
        }

        const wrongDimentions = operation === 'width' ? width <= 2 : width <= 2 && height <= 2;
        if (wrongDimentions) {
            operation = 'cdn';
            console.error(
                'ImageBossError: We couldn\'t to determine de dimensions of your image based on your markup. \
                Make sure you set it using CSS (width:), width="" or imageboss-width="" attribute. Using CDN operation as fallback.',
                img, operation, width, height
            );
        }

        if (localOptions.dprSupport && isEnabled(img, 'dpr')) {
            options.push('dpr:2');
        }


        if (isBg(img) && getComputedStyle(img).backgroundSize === "auto") {
            img.style.backgroundSize = `100%`;
        }

        const defaultParams = {
            source,
            operation, coverMode,
            width, height,
            options: options.join(','),
        };

        if (lowRes) {
            const lowResUrl = getUrl(src, {
                ...defaultParams,
                width: 10,
                height: 10,
                options: options
                    .filter(opts => !opts.match(/dpr/))
                    .join(','),
            });
            img.setAttribute(localOptions.lowsrcPropKey, lowResUrl);
        }

        setImage(img, getUrl(src, defaultParams));
        imageParams.class.forEach((c) => img.classList.add(c));
    }

    function lookup(nodeList) {
        Array
            .from(nodeList)
            .filter(img => {
                if (!img.getAttribute) {
                    return false;
                }

                const src = buildSrc(getAttribute(img, 'src') || getAttribute(img, 'srcset') || getAttribute(img, 'bg-src'));
                const matchPattern = RegExp(localOptions.matchHosts.join('|'));

                if (localOptions.matchHosts.length && src && !src.href.match(matchPattern)) {
                    return false;
                }

                return src && !isFullyLoaded(img);
            })
            .forEach((img) => {
                const imageParams = parseImageOptions(img);
                let { source, src, operation, options } = imageParams;

                if (!source) {
                    console.error('ImageBossError: You need to inform an image source!')
                }

                if (!source || localOptions.devMode) {
                    setAttribute(img, 'loaded', true);
                    return setImage(img, src);
                }

                if (localOptions.webp && localOptions.webpSupport) {
                    options.push('format:webp');
                }

                handleSrcSet(img, { ...imageParams, options });
                handleSrc(img, { ...imageParams, options, operation });
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
    })(function (webSupport) {
        localOptions.webpSupport = webSupport;
        const defaultSelector = `[${localOptions.imgPropKey}],source[${localOptions.sourcePropKey}],[${localOptions.bgPropKey}]`;
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

        // call it if its already ready.
        if (document.readyState !== 'loading') {
            defaultCallback();
        }

        // in case the user do not add the script at the bottom
        window.addEventListener("DOMContentLoaded", defaultCallback);
        window.addEventListener("DOMNodeInserted", function (e) {
            mutationLookup(e.target);
        });
    }, localOptions.webp);
})(window);
