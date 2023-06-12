
global.Navigate = (name) => {
    console.log(name);
    console.log(document.querySelectorAll('section'))
    document.querySelectorAll('section').forEach(element => element.classList.add('hide'));
    document.querySelector(`section[page-name="${name}"]`).classList.remove('hide');
    localStorage.setItem('page-selection', name);
}
Navigate(localStorage.getItem('page-selection') || 'dashboard');