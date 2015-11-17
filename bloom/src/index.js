import Demo from './demo';

const demo = new Demo();
window.onresize = demo.onResize.bind(demo);
window.onkeyup = demo.onKeyUp.bind(demo);