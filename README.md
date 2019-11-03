# ImageBoss Web

## Setup
Add this snippet right before the `</body>` tag (at the end of your document).
```html
<script type="text/javascript">
    window.ImageBoss = {
        authorisedHosts: ['www.your-authorised-host.com'],
        devMode: false,
        blurEnabled: true,
        lowResolutionFirstEnabled: true,
        webpEnabled: true,
    };
</script>
<script src="//cdn.jsdelivr.net/gh/imageboss/imageboss-web/dist/imageboss.min.js" type="text/javascript"></script>
```

Replace your `<img />` tags from this (example):
```html
<img src="myimage.jpg" width="150" />
``
to
```html
<img
    src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
    data-imageboss-src="myimage.jpg"
    width="150"
/>
``
* The transparent gif will help you validate your HTML and prevent the browser to load the default image “not found”.

## Usage
## <img data-imageboss-src="" [options] />
## <div data-imageboss-bg-src="" [options] />

## [Options]
### data-imageboss-operation
```html
<img
    data-imageboss-src="https://mysite.com/image.jpg"
    data-imageboss-operation="width"
/>
```
### data-imageboss-cover-mode
```html
<img
    data-imageboss-src="https://mysite.com/image.jpg"
    data-imageboss-operation="cover"
    data-imageboss-cover-mode="face"
/>
```
### data-imageboss-options
```html
<img
    data-imageboss-src="https://mysite.com/image.jpg"
    data-imageboss-operation="cover"
    data-imageboss-cover-mode="face"
    data-imageboss-options="grayscale:true"
/>
```