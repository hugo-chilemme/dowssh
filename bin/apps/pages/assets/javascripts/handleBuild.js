const features = require('../../core/features.json');
const d_loading = document.querySelector('.cfx-loading');
const d_progress = document.querySelector('.cfx-loading-progress span');
const step = 100 / Object.keys(features).length;

for (const [file_name, value] of Object.entries(features)) {
    d_progress.style.width += step + "%";
    if (!value.user_selected) continue;

    fetch(`./assets/javascripts/${file_name}.js`).then(v => {
        v.text().then(txt => {
            eval(txt);
        })
    });
}
d_loading.remove()
