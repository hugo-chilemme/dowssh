const features = require('../../core/features.json');
const d_loading = document.querySelector('.cfx-loading');
const d_progress = document.querySelector('.cfx-loading-progress span');

const step = 100 / Object.keys(features).length;
let progress = 0;

for (const [file_name, value] of Object.entries(features)) {
    progress += step;
    d_progress.style.width = progress + "%";

    if (!value.user_selected) {
        console.log('- Loaded', file_name)
        continue;
    };

    fetch(`./assets/javascripts/${file_name}.js`).then(v => {
        v.text().then(txt => {
            console.log('+ Loaded', file_name)
            eval(txt);
        })
    });

    if (progress === 100) {
        d_loading.remove()
    }
}