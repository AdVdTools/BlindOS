var i = 0;

function timedCount() {
    i = i + 1;
    postMessage(5*i);
    setTimeout("timedCount()",5000);
}

timedCount();