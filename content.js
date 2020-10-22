let iframejs;
let iframe;
let season;
let lastseason;
let episode;
let lastepisode;
let nextepisodeId;
let datahtml;
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
	datahtml = document.querySelector(".video-player-section .row .video-player-container iframe").contentDocument.body.innerHTML;
  iframejs = JSON.parse(datahtml.substring(datahtml.indexOf("var show = ")+11,datahtml.indexOf("var user")-6));
	iframe = document.querySelector(".video-player-section .row .video-player-container iframe").contentWindow.document;
	console.log("loading");
	showready();


}
function showready(){
	setTimeout(()=>{
		console.log("search video");
		console.log("iframejs: "+iframejs);
		console.log("iframe: "+iframe);
		if(iframejs && iframe && (!episode)){
			season = iframejs.seasons.find(e => e.episodes.find(j => j.lastExperienceKey === null));
			lastseason = iframejs.seasons[iframejs.seasons.length-1].seasonId;
			episode = season.episodes.find(e => e.lastExperienceKey === null);
			if(Object.entries(episode.languages.english.alpha)[0][1].experienceId == nextepisodeId || nextepisodeId==null){
				lastepisode = parseInt(season.episodes[season.episodes.length-1].episodeId);
				nextattheend();
			}
			else{
				loudinfo();
			}
		}
		else{showready();}
	},500);
}
function loop(){
		console.log("check time");
	if(iframejs != null && iframe.querySelectorAll("#nextvideo").length == 0
	&& season!=null
	&& (iframe.querySelector("video").duration/60)-(iframe.querySelector("video").currentTime/60)<3.5
	&& (lastepisode>parseInt(episode.episodeId)||lastseason>season.seasonId)){
		iframe.querySelector("video").insertAdjacentHTML('beforebegin', httml);
		iframe.querySelector("#nextvideo").onclick = function() { next();}
		iframe.head.querySelector("style").insertAdjacentHTML('beforebegin', css);
	}
	setTimeout(()=>{loop();},500)
}
function loadnextvideo(){
	setTimeout(()=>{
		if(document.querySelector(".video-player-section .row .video-player-container iframe") != null && document.querySelector(".video-player-section .row .video-player-container iframe").contentDocument.body != null){
			loudinfo(); nextattheend();
		}
		else{loadnextvideo();}
	},5000)
}
function next(){
	console.log("next");
	if(lastepisode>parseInt(episode.episodeId)){
		let nextepisode = season.episodes[season.episodes.indexOf(episode)+1];
			nextepisodeId = Object.entries(nextepisode.languages.english.alpha)[0][1].experienceId;
		nextvideo(Object.entries(nextepisode.languages.english.alpha)[0][1].experienceId);
	}//next season check
	else if (lastseason>season.seasonId){
		let found = false;
		let nextseason = iframejs.seasons.find((e) => {
			return found===true?true: ((e)=>{found = e.seasonId == season.seasonId; return false})(e)
		});
		if(nextseason != null){
			getnextSeason(Object.entries(episode.languages.english.alpha)[0][1].experienceId, nextseason.seasonId, (data)=>{
				if(data){
					let nextepisode = data.seasons.find(e => e.seasonId == nextseason.seasonId).episodes[0];
					nextepisodeId = Object.entries(nextepisode.languages.english.alpha)[0][1].experienceId;
					nextvideo(Object.entries(nextepisode.languages.english.alpha)[0][1].experienceId);
				}
			});
		}
	}
}
function nextvideo(experienceId){
	setwatched(experienceId);
	iframejs = null;
	season = null;
	episode = null;
	document.querySelector(".video-player-section .row .video-player-container iframe").src =
	"/player/"+experienceId+"/?bdub=0&qid=";//array alpha can contain: simulcast or uncut(english means english dubs)
	loadnextvideo();
}
function nextattheend(){
	iframe.querySelector("video").addEventListener('ended',myHandler,false);
		function myHandler(e) {
		   next();
	}
}
//let funimation know you are done watching maybe change currenttime to duration so it will think you watched the full video
function setwatched(experianceId){
	let queryid = datahtml.substring(datahtml.indexOf("var queryid = ")+15,datahtml.indexOf(" || null")-1);
	let token = getFromCookie("src_token");
	data = {pinst_id: localStorage.getItem('pinstId'),
	  checkpoint: Number(Math.round(iframe.querySelector("video").currentTime)),
	  lang: "en",
	  video_id: experianceId,
	  watched: 1,
	  device_id: getFromCookie("PIsession"),
	  query_id: queryid || null,
	  device_type: 'web'}
	let xhttp = new XMLHttpRequest();
	url="https://vst-api.prd.funimationsvc.com/v2/heartbeat/";
	xhttp.open("post", url);
	xhttp.setRequestHeader("Authorization", "Token "+token);
	try{
		xhttp.setRequestHeader("Content-Type", "application/json");
		xhttp.send(JSON.stringify(data));
		xhttp.onreadystatechange = function () {
			if(xhttp.readyState === 4) {
				if(xhttp.responseText == null || xhttp.responseText == ""){
				}
				else{
				}
			}
		};
	}
	catch(err){
		return false;
	}

}
function getnextSeason(episode, newseason, returnfunction){
	let token = getFromCookie("src_token");
	let xhttp = new XMLHttpRequest();
	url="/api/experience/"+episode+"/?season="+newseason;
	xhttp.open("get", url);
	xhttp.setRequestHeader("Authorization", token);
	try{
		xhttp.send();
		xhttp.onreadystatechange = function () {
			if(xhttp.readyState === 4) {
				if(xhttp.responseText == null || xhttp.responseText == ""){
					returnfunction(false);
				}
				else{
					returnfunction(JSON.parse(xhttp.responseText));
				}
			}
		};
	}
	catch(err){
		return false;
	}
}
function getFromCookie(findName){
	let idx = document.cookie.indexOf(findName+"=")
	let end = document.cookie.indexOf(";", idx + 1);
	if (end == -1) end = document.cookie.length;
	return unescape(document.cookie.substring(idx + (findName+"=").length, end));
}

if(document.querySelector(".video-player-section .row .video-player-container iframe")){
	document.querySelector(".video-player-section .row .video-player-container iframe").contentWindow.addEventListener('DOMContentLoaded', ()=>{
		loudinfo();
		loop();

	}, false);
}
