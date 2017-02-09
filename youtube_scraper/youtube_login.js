var casper = require('casper').create();
var fs = require("fs");
var logName = 'output.txt';
var currentLinks = "";

casper.start('https://accounts.google.com/ServiceLogin?uilel=3&service=youtube&hl=en&passive=true&continue=https%3A%2F%2Fwww.youtube.com%2Fsignin%3Ffeature%3Dsign_in_button%26next%3D%252F%26hl%3Den%26action_handle_signin%3Dtrue%26app%3Ddesktop', function() {
    this.echo(this.getTitle());
});

casper.then(function() {
	this.echo("Inputting username...");
	currentLinks += casper.cli.args[0] + "\n"
	this.sendKeys('input#Email', casper.cli.args[0]);
	this.click('input#next');
});

casper.wait(500, function() {
	this.echo("Filling in password...");
});

casper.then(function() {
	this.sendKeys('input#Passwd', casper.cli.args[1]);
	this.click('input#signIn');
});


function getImages() {
	var scripts = document.querySelectorAll('img[src]');
    return Array.prototype.map.call(scripts, function (e) {
        return e.getAttribute('src');
    });
}

var imagesArray = [];

casper.waitForSelector('#yt-masthead', function() {
	this.echo("Signed in!");
	imagesArray = this.evaluate(getImages);
	var self = this;
	imagesArray.forEach(function (item) {
		if (self.resourceExists(item)) {
			currentLinks += item + "\n"
		} else {
			var message = item + ' not loaded';
			self.echo(message, 'ERROR');
		}
	});
});

casper.thenOpen('https://www.youtube.com/feed/subscriptions', function() {
	this.echo("Checking Subscriptions...");
	imagesArray = this.evaluate(getImages);
	var self = this;
	imagesArray.forEach(function (item) {
		if (self.resourceExists(item)) {
			currentLinks += item + "\n"
		} else {
			var message = item + ' not loaded';
			self.echo(message, 'ERROR');
		}
	});

});

casper.then(function() {
	fs.write(logName, currentLinks, 'w');
	this.echo("done");
});

casper.run();
