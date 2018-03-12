
Menu.screens['high-scores'] = (function() {

    function resetScores(){
        let scores = JSON.parse(localStorage.scores);
        scores = [0, 0, 0, 0, 0];
        localStorage.scores = JSON.stringify(scores);
    }

    function initialize() {
        document.getElementById('back-button-scores').addEventListener(
            'click',
            function() { Menu.showScreen('main-menu'); }
        );
        document.getElementById('reset-scores').addEventListener(
            'click',
            function() { resetScores(); run(); }
        );
    }


    function run() {
        let scores = [0, 0, 0, 0, 0];
        if(localStorage.hasOwnProperty('scores'))
            scores = JSON.parse(localStorage.scores);
        let scoreList = document.getElementById("high-scores-list");

        let str = "High Scores: <br> <ol>";


        for(score in scores){
            str += "<li>" + scores[score] + "</li>";
        }

        str += "</ol>";
        scoreList.innerHTML = str;
    }

    return {
        initialize : initialize,
        run : run
    };
}());
