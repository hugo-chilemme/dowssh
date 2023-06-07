const features = require('../../core/features.json');
const d_loading = document.querySelector('.cfx-loading');
const d_progress = document.querySelector('.cfx-loading-progress span');
const step = 100 / Object.keys(features).length;

for (const [file_name, is_enabled] of Object.entries(features)) {
    d_progress.style.width += step + "%";
    if (!is_enabled) continue;
    console.log(file_name);
    // load the file
}
d_loading.remove();
