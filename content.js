let iframejs;
let iframe;
let season;
let episode;
let totalepisodes;
let httml = '<div id="nextvideo"><div class="divone"></div><div class="divtwo"></div></div>';
css="<style type=\"text/css\">\
#nextvideo{\
	top: 150px;\
    right: 50px;\
    z-index: 13;\
    width: 150px;\
    height: 150px;\
    cursor: pointer;\
    position: absolute;\
	opacity: 0.5;\
}\
#nextvideo:hover{\
	opacity:1;\
}\
#nextvideo .divone{\
	height: 74px;\
	position: absolute;\
	top: 30px;\
	left: 62px;z-index: 2;\
	border-style: solid;\
	border-width: 47px;\
	border-color: transparent transparent transparent #202020;\
}\
#nextvideo .divtwo{\
	width: 150px;\
	height: 150px;\
	position: absolute;\
	top: 0;\
	z-index: 1;\
	border-radius: 300px;\
	background: grey;\
}</style>"
function loudinfo(){
	let data = document.querySelector(".video-player-section .row .video-player-container iframe").contentDocument.body.innerHTML;
    iframejs = JSON.parse(data.substring(data.indexOf("var show = ")+11,data.indexOf("var user")-6));
	iframe = document.querySelector(".video-player-section .row .video-player-container iframe").contentWindow.document;
	console.log(iframe);
	showready();
	
	
}
function showready(){
	setTimeout(()=>{
		if(iframejs && iframe){
			season = iframejs.seasons.find(e => e.episodes.find(j => j.lastExperienceKey === null));
			episode = season.episodes.find(e => e.lastExperienceKey === null);
			totalepisodes = parseInt(season.episodes[season.episodes.length-1].episodeId);
			nextattheend();
		}
		else{showready();}
	},500);
}
function loop(){
	//could not get the variable of the iframe show
	if(iframejs != null && iframe.querySelectorAll("#nextvideo").length == 0
	&& season!=null
	&& (iframe.querySelector("video").duration/60)-(iframe.querySelector("video").currentTime/60)<2.5
	&& totalepisodes>parseInt(episode.episodeId)){
		iframe.querySelector("video").insertAdjacentHTML('beforebegin', httml);
		iframe.querySelector("#nextvideo").onclick = function() { next();}
		iframe.head.querySelector("style").insertAdjacentHTML('beforebegin', css);
	}
	setTimeout(()=>{loop();},500)
}
function next(){
	if(totalepisodes>parseInt(episode.episodeId)){
		iframejs = null;
		let nextepisode = season.episodes[season.episodes.indexOf(episode)+1]
		document.querySelector(".video-player-section .row .video-player-container iframe").src =
		"/player/"+nextepisode.languages.english.alpha.simulcast.experienceId+"/?bdub=0&qid=";
		setTimeout(()=>{
			document.querySelector(".video-player-section .row .video-player-container iframe").contentWindow.addEventListener('DOMContentLoaded', ()=>{
			loudinfo(); nextattheend();
			},false);
			},2000)
	}
}
function nextattheend(){
	iframe.querySelector("video").addEventListener('ended',myHandler,false);
		function myHandler(e) {
			console.log("next");
		   next();
	}
}
document.querySelector(".video-player-section .row .video-player-container iframe").contentWindow.addEventListener('DOMContentLoaded', ()=>{
	loudinfo();
	loop();
}, false);
	