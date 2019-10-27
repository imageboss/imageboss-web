(function (){
    const localOptions = {
        propKey: 'data-imageboss',
        imgPropKey: 'data-imageboss-src',
        bgPropKey: 'data-imageboss-bg-src',
        dprSupport: window.devicePixelRatio,
    };

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

    function setImage(element, url) {
        const bg = element.getAttribute(`${localOptions.propKey}-bg-src`);
        const img = element.getAttribute(`${localOptions.propKey}-src`);

        if (img) {
            element.setAttribute('src', url);
        } else if (bg) {
            element.style.background = `url('${url}')`;
        }
    }

    function imageLookup(nodeList) {
        Array
            .from(nodeList)
            .filter(img => {
                if (!img.getAttribute) {
                    return false;
                }

                const src = img.getAttribute(localOptions.imgPropKey) || img.getAttribute(localOptions.bgPropKey);
                const matchPattern = RegExp(window.ImageBoss.authorisedHosts.join('|'));
                return src.match(matchPattern);
            })
            .forEach((img) => {
                const url       = img.getAttribute(localOptions.imgPropKey) || img.getAttribute(localOptions.bgPropKey);
                const operation = img.getAttribute(`${localOptions.propKey}-operation`) || 'cover';
                const coverMode = img.getAttribute(`${localOptions.propKey}-cover-mode`);
                const width     = img.getAttribute('width') || img.clientWidth;
                const height    = img.getAttribute('height') || img.clientHeight;
                const options   = (img.getAttribute(`${localOptions.propKey}-options`) || '').split(',');

                if (window.ImageBoss.devMode) {
                    return setImage(img, url);
                }

                if (localOptions.dprSupport > 1) {
                    options.push('dpr:2');
                }

                if (localOptions.webpSupport) {
                    options.push('format:webp');
                }

                const newUrl = getUrl(url, {
                    operation,
                    coverMode,
                    width,
                    height,
                    options: options.filter(opts => opts).join(','),
                });

                setImage(img, newUrl);
            });
    };

    (function webpDetection(callback) {
        var img = new Image();
        img.src = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
        img.onload = callback.bind(this, true);
        img.onerror = callback.bind(this, false);
    })(function(webSupport) {
        localOptions.webpSupport = webSupport;

        imageLookup(document.querySelectorAll(`[${localOptions.imgPropKey}],[${localOptions.bgPropKey}]`));

        new MutationObserver(function(mutationsList) {
            for (let mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    imageLookup(mutation.addedNodes);
                }
            }
        }).observe(
            document.querySelector('body'),
            { attributes: true, childList: true, subtree: true }
        );
    });
})();