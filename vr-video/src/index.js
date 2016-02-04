import App from './App';

const app = new App();
window.onresize = app.onResize.bind(app);
window.onkeyup = app.onKeyUp.bind(app);
window.onmousedown = app.onMouseDown.bind(app);
window.ontouchend = app.onMouseDown.bind(app);
