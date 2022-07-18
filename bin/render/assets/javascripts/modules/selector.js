console.log('modules/selector.js loaded');

let div = document.getElementById('selector'), x1 = 0, y1 = 0, x2 = 0, y2 = 0;
function reCalc() { //This will restyle the div
    var x3 = Math.min(x1,x2); //Smaller X
    var x4 = Math.max(x1,x2); //Larger X
    var y3 = Math.min(y1,y2); //Smaller Y
    var y4 = Math.max(y1,y2); //Larger Y
    div.style.left = x3 + 'px';
    div.style.top = y3 + 'px';
    div.style.width = x4 - x3 + 'px';
    div.style.height = y4 - y3 + 'px';
    let uuid = doc.querySelector('.connections').getAttribute('active');
    doc.querySelectorAll('.connections #conn-'+uuid+" .item").forEach((e) => {
        if(!e.hasAttribute('not-folder')) {
            if (e.offsetTop > y3 - e.offsetHeight && e.offsetTop < y4)
                e.classList.add('selected');
            else
                e.classList.remove('selected');
        }
    });
    // document.querySelector('.item[uuid="c9892e33ddb4013aa903459584223ac4"]').offsetTop;
}
let pressed = null;
onmousedown = function(e) {
    if(!e.target.closest('.connections')) return;
    pressed = new Date().getTime();
    x1 = e.clientX; //Set the initial X
    y1 = e.clientY; //Set the initial Y
    reCalc();
};
onmousemove = function(e) {
    if(!e.target.closest('.connections')) return;
    if(!pressed) return;
    if(new Date().getTime() - pressed > 200)
        div.hidden = 0; //Unhide the div
    x2 = e.clientX; //Update the current position X
    y2 = e.clientY; //Update the current position Y
    reCalc();
};
onmouseup = function(e) {
    div.hidden = 1; //Hide the div
    pressed = null
};