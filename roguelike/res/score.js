function Score()
{
    this.score = 0;
    this.highscrore = 0;
    this.scorelist = new Array();

    this.getScore();
}

Score.prototype.getScore = function()
{
    var self = this;
    var hr = new XMLHttpRequest();
    hr.open("POST", "./serv/getscore.php", true);
    hr.setRequestHeader("Content-type", "application/json");
    hr.onreadystatechange = function () {
        if (hr.readyState == 4 && hr.status == 200) {
            console.log(hr.responseText);
            var data = JSON.parse(hr.responseText);

            for (var i = 0; i < data.length; i++) {
                console.debug(data[i]);
                self.scorelist.push(data[i]);
            }
        }
    }
    hr.send();
}

Score.prototype.setScore = function(name,score)
{
    var self = this;
    self.scorelist.push({ name: name, score: score });
    self.sort();
    var hr = new XMLHttpRequest();
    hr.open("POST", "./serv/setscore.php", true);
    hr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    hr.onreadystatechange = function () {
        if (hr.readyState == 4 && hr.status == 200) {
            var data = JSON.parse(hr.responseText);
        }
    }
    hr.send('p='+name+'&s='+score);
}

Score.prototype.sort = function () {
    var self = this;
    for (var i = 0; i < self.scorelist.length; i++) {
        for (var j = 0; j < self.scorelist.length; j++) {
            if (self.scorelist[i].score > self.scorelist[j].score) {
                var test = self.scorelist[i];
                self.scorelist[i] = self.scorelist[j];
                self.scorelist[j] = test;
            }
        }
    }
}

Score.prototype.getHighscore = function() {
    return this.scorelist[0].score;
}

Score.prototype.getHighest = function() {
    var self = this;
    var scores = [];
    var j = 5;
    if (j > self.scorelist.length) {
        j = self.scorelist.length;
    }
    for (var i = 0; i < j; i++) {
        scores.push(self.scorelist[i]);
    }
    return scores;
}