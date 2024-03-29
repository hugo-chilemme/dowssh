const routers = require('./router.json');


global.Navigate = (name, data = {}) => {
    document.querySelector('.navbar').classList.remove('hide');
    document.querySelectorAll('section').forEach(element => {
        if (element.getAttribute('page-name') === name) {
            return element.classList.remove('hide');
        }
        element.classList.add('hide');
    });

    localStorage.setItem('page-selection', JSON.stringify({
        page: name,
        data,
    }));

    if (routers[name].hideHeader) {
        document.querySelector('.navbar').classList.add('hide');
    }


    const myEvent = new CustomEvent('onshow', {detail: data});
    document.querySelector(`section[page-name="${name}"]`).dispatchEvent(myEvent);

    if (!data) return;
    if (typeof data === 'object') {
        data = JSON.stringify(data);
    }
    document.querySelector(`section[page-name="${name}"]`).setAttribute('data', data);

}
Navigate('dashboard');