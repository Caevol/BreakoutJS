Menu.screens['credits'] = (function() {


    function initialize() {
        document.getElementById('back-button-credits').addEventListener(
            'click',
            function() { Menu.showScreen('main-menu'); }
        );
    }


    function run() {

    }

    return {
        initialize : initialize,
        run : run
    };
}());
