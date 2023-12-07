import './style.css';

const params = new URL(document.location).searchParams;

const config = {
	//input in minutes
	duration: (Number(params.get('duration')) || 55) * 1000 * 60,

	//name of the scene used to reset the timer
	brb_scene: params.get('brb_scene') || 'brb',
}


const faviconTag = document.createElement('link');
faviconTag.setAttribute('rel', 'icon');
faviconTag.setAttribute('type', 'image/png');
document.head.appendChild(faviconTag);

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
function updateFavicon(progress = 0) {
	canvas.width = 128;
	canvas.height = 128;

	ctx.lineWidth = canvas.width / 10;
	ctx.lineCap = "round"

	// goal line
	ctx.strokeStyle = "#ff4444";
	ctx.beginPath();
	ctx.moveTo(canvas.width / 2, canvas.height / 2);
	ctx.lineTo(canvas.width / 2, ctx.lineWidth * 2);
	ctx.stroke();

	ctx.strokeStyle = "white";
	// progress line
	ctx.beginPath();
	ctx.moveTo(canvas.width / 2, canvas.height / 2);
	ctx.lineTo(
		canvas.width / 2 + Math.cos(progress * Math.PI * 2 - Math.PI / 2) * canvas.width / 3.5,
		canvas.height / 2 + Math.sin(progress * Math.PI * 2 - Math.PI / 2) * canvas.width / 3.5
	);
	ctx.stroke();


	// outer circle
	ctx.beginPath();
	ctx.arc(
		canvas.width / 2,
		canvas.height / 2,
		canvas.width / 2 - ctx.lineWidth,
		0,
		Math.PI * 2
	);
	ctx.stroke();

	canvas.toBlob((blob => faviconTag.setAttribute('href', URL.createObjectURL(blob))));
}

let lastBreak = Date.now();
let isOnBreak = false;


function updateTimer() {
	if (isOnBreak) return;

	const running_ms = Date.now() - lastBreak;
	const remaining_ms = config.duration - running_ms;

	const hours = Math.max(0, Math.floor(remaining_ms / 1000 / 60 / 60));
	const minutes = Math.max(0, Math.floor(remaining_ms / 1000 / 60) % 60);
	const seconds = Math.max(0, Math.floor(remaining_ms / 1000) % 60);

	document.body.textContent = String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');

	updateFavicon(Math.min(1, running_ms / config.duration));
};

setInterval(updateTimer, 1000);


function checkIfOnBreak(scene_name) {
	if (scene_name === config.brb_scene) {
		isOnBreak = true;
		document.body.textContent = "BRB";
	} else if (isOnBreak) {
		lastBreak = Date.now();
		isOnBreak = false;
	}
	updateTimer();
}

window.addEventListener('obsSceneChanged', (e) => {
	checkIfOnBreak(e.detail.name);
});

checkIfOnBreak(obsstudio.getCurrentScene());