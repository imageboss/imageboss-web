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
        blurEnabled: true,
        webpEnabled: true,
    };
</script>
<script src="//cdn.jsdelivr.net/gh/imageboss/imageboss-web@1.0.12/dist/imageboss.min.js" type="text/javascript"></script>
```

Replace your `<img />` tags from this (example):
```html
<img src="myimage.jpg" width="150" />
```
to
```html
<img
    src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
    imageboss-src="myimage.jpg"
    width="150"
/>
```

* The transparent gif will help you validate your HTML and prevent the browser to load the default image “not found”.

## Usage
## <img imageboss-src="" [attrs] />
You can use this library with the `<img />` tags.
## <div imageboss-bg-src="" [attrs] />
For background images use the property `imageboss-bg-src=""` instead. If you are defining your background on your CSS just remove the propery ´background-image´ from your CSS and use the html property `imageboss-bg-src=""` instead.

## [attrs]
### imageboss-low-res
When this option is enabled we will first deliver a blurred, low resolution version of your image while the high resolution one loads in background.
```html
<img
    imageboss-src="https://mysite.com/image.jpg"
    imageboss-operation="cover"
    imageboss-cover-mode="face"
    imageboss-options="grayscale:true,blur:2"
    imageboss-low-res="enabled"
/>
```
### imageboss-operation
It supports any of the operations available on: https://imageboss.me/docs
```html
<img
    imageboss-src="https://mysite.com/image.jpg"
    imageboss-operation="width"
/>
```
### imageboss-cover-mode
For more options: https://imageboss.me/docs/operations/cover
```html
<img
    imageboss-src="https://mysite.com/image.jpg"
    imageboss-operation="cover"
    imageboss-cover-mode="face"
/>
```
### imageboss-options
Options can be any of those available for the operation you are trying to achieve. More information at: https://imageboss.me/docs
```html
<img
    imageboss-src="https://mysite.com/image.jpg"
    imageboss-operation="cover"
    imageboss-cover-mode="face"
    imageboss-options="grayscale:true,blur:2"
/>
```