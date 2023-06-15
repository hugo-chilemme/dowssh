


const rightclick = document.querySelector('.rightclick');


global.RightClickManager = (object, cursor) => {
    rightclick.innerHTML = "";

    const handleUnitialize = () => {
        rightclick.removeEventListener('click', handleClose);
        rightclick.classList.add('hide');
    }

    const handleClose = event => {
        if (event.target.closest('.rightclick')) return;
        handleUnitialize();
    }
    const dispatch = (func) => {
        func();
        handleUnitialize();
    }

    for (const [key, value] of Object.entries(object)) {

        const item = document.createElement("div");
        item.addEventListener('click', () => dispatch(value.execute));
        item.classList.add('item');
        item.classList.add(value.color || null);

        const p = document.createElement('p');
        p.innerText = key;

        item.appendChild(p);
        rightclick.appendChild(item);

    }

    console.log(cursor);

    rightclick.style.left = (cursor.clientX + 15) + "px";
    rightclick.style.top = (cursor.clientY + 15) + "px";


    rightclick.classList.remove('hide');
    document.addEventListener('click', handleClose)
}