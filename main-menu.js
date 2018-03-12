Menu.screens['main-menu'] = (function() {

    function initialize() {
        document.getElementById('new-game').addEventListener(
            'click',
            function() { Menu.screens['breakout'].rebuildGame(); Menu.showScreen('breakout'); }
        );

        document.getElementById('credits-page').addEventListener(
            'click',
            function() { Menu.showScreen('credits');}
        );
        document.getElementById('high-scores-page').addEventListener(
            'click',
            function() { Menu.showScreen('high-scores'); });

        document.getElementById('resume-page').addEventListener(
            'click',
            function() { Menu.showScreen('breakout');}
        )
    }

    function run() {
    }

    return {
        initialize : initialize,
        run : run
    };
}());
