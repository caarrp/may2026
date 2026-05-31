//for user interface

window.addEventListener('DOMContentLoaded', () => {
    const webgl = new webGL_canvas();


   //if go button is pressed, send input to widget -> calculator
    const button = document.getElementById('go-button');
    const input = document.getElementById('input-eqn');
    
    //GO BUTTON
    button.addEventListener('click', () => {
        const equation = input.value;
        console.log("\tfrom user: equation: ", equation);


	input.value= "";
        //sends to calculator through webgl
        if (webgl && webgl.calculator) {
	    //webgl.input = equation;

            webgl.calculator.set_function(equation);
	    console.log("in user: calling update_graph...");
            webgl.update_graph();

	    const lowButtonContainer = document.getElementById('low-button-container');
	    if (webgl.calculator.is_valid) {
	    lowButtonContainer.style.display = 'flex';
	    }

        }
    });

        const themeButton = document.getElementById('light-dark-button');
	let is_dark = webgl.dark || false ;
	let themeLink = document.getElementById('theme-stylesheet');

	//LIGHT ? DARK BUTTON
	themeButton.addEventListener('click', () => {
	    is_dark = !is_dark;
	    
	    if (is_dark) {
		themeLink.href = 'static/css/style_dark.css';
		themeButton.textContent = 'dark';
		console.log('\tdark.css');
	    } else {
		themeLink.href = 'static/css/style_light.css';
		themeButton.textContent = 'light';
		console.log('\tlight.css');
	    }

	    webgl.dark = is_dark;
	});

	if (is_dark){
		themeLink.href = 'static/css/style_dark.css';
		themeButton.textContent = 'light';
		console.log('\tdark.css');
	}


	//for isometric/perspective button

	const isoButton = document.getElementById("view-button");
	let is_iso = webgl.iso;

	//ISOMETRIC ? PERSPECTIVE BUTTON
	isoButton.addEventListener('click', () => {
	    is_iso = !is_iso;

	    if (!is_iso) {

		isoButton.textContent = 'perspective';
		console.log('\tset perspective');
	    } else {

		isoButton.textContent = 'isometric';
		console.log('\tset isometric');
	    }
	    webgl.iso = is_iso;
	    webgl.render();

	});
});


function showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = "block";
    }
}
