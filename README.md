# ImageBoss Web

## Features
* Detect/request WebP images.
* Detect Retina Displays (High Density) and loads images properly.
* Automatically requests images with appropriate sizes based on your HTML/CSS definitions.
* Requests a low-resolution version of your image while loads the high resolution one in the background.
* Lazy load images.


## Setup
Add this snippet right before the `</body>` tag (at the end of your document).
```html
<script type="text/javascript">
    window.ImageBoss = {
        authorisedHosts: ['www.your-authorised-host.com'],
        // defaults
        devMode: false,
        animation: true,
        webp: true,
        lazyload: true,
        lazyloadDistance: 1.0,
        dpr: true,
        webp: true
    };
</script>
<script src="//cdn.jsdelivr.net/gh/imageboss/imageboss-web@2.0.11/dist/imageboss.min.js" type="text/javascript"></script>
```

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

## Usage
## <img data-imageboss-src="" [attrs] />
You can use this library with the `<img />` tags.
## <div data-imageboss-bg-src="" [attrs] />
For background images use the property `data-imageboss-bg-src=""` instead. If you are defining your background on your CSS just remove the propery ´background-image´ from your CSS and use the html property `data-imageboss-bg-src=""` instead.

## [attrs]
### data-imageboss-low-res
When this option is enabled we will first deliver a blurred, low resolution version of your image while the high resolution one loads in background.
```html
<img
    data-imageboss-src="https://mysite.com/image.jpg"
    data-imageboss-operation="cover"
    data-imageboss-cover-mode="face"
    data-imageboss-options="grayscale:true,blur:2"
    data-imageboss-low-res="enabled"
/>
```
### data-imageboss-operation
It supports any of the operations available on: https://imageboss.me/docs
```html
<img
    data-imageboss-src="https://mysite.com/image.jpg"
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
    data-imageboss-src="https://mysite.com/image.jpg"
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
    data-imageboss-src="https://mysite.com/image.jpg"
    data-imageboss-operation="cover"
    data-imageboss-height="500"
/>
```

### data-imageboss-cover-mode
For more options: https://imageboss.me/docs/operations/cover
```html
<img
    data-imageboss-src="https://mysite.com/image.jpg"
    data-imageboss-operation="cover"
    data-imageboss-cover-mode="face"
/>
```
### data-imageboss-options
Options can be any of those available for the operation you are trying to achieve. More information at: https://imageboss.me/docs
```html
<img
    data-imageboss-src="https://mysite.com/image.jpg"
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
### data-imageboss-animation
This is enabled by default for all elements. In case you don't want to animate your element while loading.
```html
<img
    ...
    data-imageboss-animation="false"
/>
```
