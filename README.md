<img src="https://img.imageboss.me/boss-images/width/180/dpr:2/emails/logo-2@2x.png" width="180"/>

  - [Main Features](#main-features)
  - [Setup](#setup)
    - [Pre-connect](#pre-connect)
    - [Change your <img /> tags](#change-your-img--tags)
  - [Basic Usage](#basic-usage)
    - [<img data-imageboss-src="" [attrs] />](#img-data-imageboss-src-attrs-)
    - [<div data-imageboss-bg-src="" [attrs] />](#div-data-imageboss-bg-src-attrs-)
  - [Advanced Usage](#advanced-usage)
    - [Lazy Loading](#lazy-loading)
      - [Low Quality Image Placeholder](#low-quality-image-placeholder)
    - [Responsive Images with `srcset`](#responsive-images-with-srcset)
    - [Responsive Images with `picture`](#responsive-images-with-picture)
  - [[attrs]](#attrs)
    - [data-imageboss-source](#data-imageboss-source)
    - [data-imageboss-low-res](#data-imageboss-low-res)
    - [data-imageboss-operation](#data-imageboss-operation)
    - [data-imageboss-width](#data-imageboss-width)
    - [data-imageboss-height](#data-imageboss-height)
    - [data-imageboss-cover-mode](#data-imageboss-cover-mode)
    - [data-imageboss-options](#data-imageboss-options)
    - [data-imageboss-dpr](#data-imageboss-dpr)

## Main Features
* WebP or AVIF when supported by the device.
* Detect Retina Displays (High Density) and loads images properly.
* Automatically requests images with appropriate sizes based on your HTML/CSS definitions.
* Responsive Images with `img srcset` and `picture` elements.
* Background images support.

## Setup
Add this snippet right between your `<head>` tag.
```html
<link rel="preconnect" href="//img.imageboss.me">
<script type="text/javascript">
    window.ImageBoss = {
        source: 'mywebsite-images',
        // defaults
        devMode: false, // if currently your images are private set this to true to disable the library.
        format: 'auto', // use webp or avif when supported
        dpr: false // use dpr for your images when supported
    };
</script>
<script async src="//cdn.jsdelivr.net/gh/imageboss/imageboss-web@5.0.10/dist/imageboss.min.js" type="text/javascript"></script>
```

### Pre-connect
This is optional but can speed up the delivery of your images:
```html
<link rel="preconnect" href="//img.imageboss.me">
```

### Change your <img /> tags
Replace your `<img />` tags from this (example):
```html
<img src="myimage.jpg" width="150" />
```
to
```html
<img
    src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
    data-imageboss-src="myimage.jpg"
    width="150"
/>
```

* The transparent gif will help you validate your HTML and prevent the browser to load the default image “not found”.

## Basic Usage
### <img data-imageboss-src="" [attrs] />
You can use this library with the `<img />` tags.

### <div data-imageboss-bg-src="" [attrs] />
For background images use the property `data-imageboss-bg-src=""` instead. If you are defining your background on your CSS just remove the propery ´background-image´ from your CSS and use the html property `data-imageboss-bg-src=""` instead.

## Advanced Usage
### Lazy Loading
For lazy loading we recomend using it with [lazy-sizes](https://github.com/aFarkas/lazysizes). All you have to do is set `srcPropKey` like this:

```js
window.ImageBoss = {
    srcPropKey: 'data-src',
    srcsetPropKey: 'data-srcset',
    lowsrcPropKey: 'data-lowsrc',
    ...
};
```
And add the `data-imageboss-class="lazyload"` to your images. But feel free to check their docs in detail.

#### Low Quality Image Placeholder
If you are using [lazy-sizes](https://github.com/aFarkas/lazysizes) and want to display a low resolution image while the high one loads in background you can do it by changing the settings a bit:

```js
window.ImageBoss = {
    srcPropKey: 'data-src',
    lowsrcPropKey: 'src',
    lowRes: true
    ...
};
```
Also, make sure to use `data-imageboss-class` instead of just `class`. This way we make sure we add the class only after the initialization.

For more options like animations and customizations on this behavior take a look into the [lazy-sizes docs](https://github.com/aFarkas/lazysizes#lqipblurry-image-placeholderblur-up-image-technique).

### Responsive Images with `srcset`
If you just mention the `sizes` attribute, we will generate the breakpoints automatically for you.

```html
<img
    src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
    data-imageboss-src="/path/to/my/image.jpg"
    sizes="(max-width: 500px) 100vw, 500px"
/>
```

The code above will generate the HTML:

```html
<img
    src="https://img.imageboss.me/mysource/width/500/format:auto/path/to/my/image.jpg"
    sizes="(max-width: 500px) 100vw, 500px"
    srcset="
        https://img.imageboss.me/mysource/width/500/format:auto/path/to/my/image.jpg 500w,
        https://img.imageboss.me/mysource/width/250/format:auto/path/to/my/image.jpg 250w,
        https://img.imageboss.me/mysource/width/125/format:auto/path/to/my/image.jpg 125w,
        https://img.imageboss.me/mysource/width/750/format:auto/path/to/my/image.jpg 750w,
        https://img.imageboss.me/mysource/width/1125/format:auto/path/to/my/image.jpg 1125w,
        https://img.imageboss.me/mysource/width/1688/format:auto/path/to/my/image.jpg 1688w,
        https://img.imageboss.me/mysource/width/2531/format:auto/path/to/my/image.jpg 2531w,
        https://img.imageboss.me/mysource/width/3797/format:auto/path/to/my/image.jpg 3797w
    "
/>
```

If you want to specify the breakpoints yourself you can do it so:

```html
<img
    src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
    data-imageboss-src="/path/to/my/image.jpg"
    data-imageboss-srcset="
        /path/to/my/image.jpg 100px,
        /path/to/my/image.jpg 300px
    "
    sizes="(max-width: 500px) 100vw, 500px"
/>
```

The code above will generate the HTML:

```html
<img
    src="https://img.imageboss.me/mysource/width/500/format:auto/path/to/my/image.jpg"
    sizes="(max-width: 500px) 100vw, 500px"
    srcset="
        https://img.imageboss.me/mysource/width/100/format:auto/path/to/my/image.jpg 500w,
        https://img.imageboss.me/mysource/width/300/format:auto/path/to/my/image.jpg 250w
    "
/>
```

### Responsive Images with `picture`
Similar to the how you would do with `<img srcset ... />`, just follow set the `data-imageboss-srcset` attribute on the `source` tags and the `data-imageboss-src` on the `img` tag.

```html
<picture>
    <source media="(max-width: 1152px)" sizes="(max-width: 800px) 100vw,(max-width: 1152px) 50vw, 896px" data-imageboss-srcset="/path/to/my/image.jpg 512w">
    <source media="(max-width: 800px)" sizes="(max-width: 800px) 100vw,(max-width: 1152px) 50vw, 896px" data-imageboss-srcset="/path/to/my/image.jpg 800w">
    <img
        src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
        data-imageboss-src="/path/to/my/image.jpg"
    />
    </picture>
```


## [attrs]
### data-imageboss-source
In case you need to use a different source then the one mentioned globally.
```html
<img
    data-imageboss-source="my-other-source"
    ...
/>
```

### data-imageboss-low-res
When this option is enabled we will generate an attribute called `data-lowres` with a low resolution image that can be used for LQIP.
```html
<img
    data-imageboss-src="/image.jpg"
    data-imageboss-operation="cover"
    data-imageboss-cover-mode="face"
    data-imageboss-options="grayscale:true,blur:2"
    data-imageboss-low-res="true"
/>
```
### data-imageboss-operation
It supports any of the operations available on: https://imageboss.me/docs
```html
<img
    data-imageboss-src="/image.jpg"
    data-imageboss-operation="width"
/>
```
### data-imageboss-width
It's not necessary but can be helpful when you are displaying images with relative size.
In order to detect the right width of your image we:

* First look at the `data-imageboss-width` attribute,
* Then, we look into the `width` HTML attribute.
* Then, doesn't exist we look into the `img.clientWidth` size.

```html
<img
    data-imageboss-src="/image.jpg"
    data-imageboss-operation="width"
    data-imageboss-width="500"
/>
```

### data-imageboss-height
It's not necessary but can be helpful when you are displaying images with relative size.
In order to detect the right height of your image we:

* First look at the `data-imageboss-height` attribute,
* Then, we look into the `height` HTML attribute.
* Then, doesn't exist we look into the `img.clientHeight` size.

```html
<img
    data-imageboss-src="/image.jpg"
    data-imageboss-operation="cover"
    data-imageboss-height="500"
/>
```

### data-imageboss-cover-mode
For more options: https://imageboss.me/docs/operations/cover
```html
<img
    data-imageboss-src="/image.jpg"
    data-imageboss-operation="cover"
    data-imageboss-cover-mode="face"
/>
```
### data-imageboss-options
Options can be any of those available for the operation you are trying to achieve. More information at: https://imageboss.me/docs
```html
<img
    data-imageboss-src="/image.jpg"
    data-imageboss-operation="cover"
    data-imageboss-cover-mode="face"
    data-imageboss-options="grayscale:true,blur:2"
/>
```

### data-imageboss-dpr
This is enabled by default for all elements. In case you don't want DPR for a specific image.
```html
<img
    ...
    data-imageboss-dpr="false"
/>
```
