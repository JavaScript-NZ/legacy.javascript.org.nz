$(document).ready(function() {
	$('a[href^="#"]').click(function(event) {
		var elemId = this.getAttribute('href').slice(1);
		var elem = document.getElementById(elemId);
		if (elem && typeof elem.scrollIntoView == 'function') {
			event.preventDefault();
			elem.scrollIntoView({block: 'start', behavior: 'smooth'});
		}
	});
});
