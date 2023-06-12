const features = require('./features.json');
const routers = require('./router.json');

const d_loading = document.querySelector('.cfx-loading');
const d_progress = document.querySelector('.cfx-loading-progress span');
const sections = document.querySelector('#pages-routers');

const step = 100 / (Object.keys(features).length + Object.keys(routers).length);
let progress = 0;

const progressStep = () => {
    progress += step;
    d_progress.style.width = progress + "%";
    
    if (progress >= 100) return d_loading.remove();
}



(async () => {
    for (const [file_name, value] of Object.entries(routers)) {
        progressStep();
    
        fetch(`./pages/${file_name}.html`).then(v => {
            v.text().then(txt => {
                sections.innerHTML += txt;
            })
        })
    }
    
    for (const [file_name, value] of Object.entries(features)) {
        progressStep();
    
        if (!value.user_selected) {
            console.log('- Loaded', file_name)
            continue;
        };
    
        fetch(`./assets/javascripts/${file_name}.js`).then(v => {
            v.text().then(txt => {
                eval(txt);
            })
        });
    }

})()

