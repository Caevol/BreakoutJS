
var GameGraphics = function(){
    let canvas = document.getElementById('breakout');
    let context = canvas.getContext('2d');

    return {
        canvas : canvas,
        context : context
    }
}();

var Menu = function() {
    let screens = {};
    let activeid = "main-menu";

    function initialize(){
        for(let screen in screens) {
            screens[screen].initialize();
        }

        showScreen("main-menu");
    }

    function showScreen(id){
        let inactive = document.getElementById(activeid);
        inactive.style.display = "none";
        document.getElementById(id).style.display = "block";
        screens[id].run();
        activeid = id;
    }


    return {
        screens: screens,
        initialize: initialize,
        showScreen: showScreen
    };



}();



