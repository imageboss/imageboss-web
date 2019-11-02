# ImageBoss Web

## Setup
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