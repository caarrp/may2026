//for user interface

window.addEventListener('DOMContentLoaded', () => {
    const webgl = new webGL_canvas();


   //if go button is pressed, send input to widget -> calculator
    const button = document.getElementById('go-button');
    const input = document.getElementById('input-eqn');
    
    button.addEventListener('click', () => {
        const equation = input.value;
        console.log("\tfrom user: equation: ", equation);

	input.value= "";
        //sends to calculator through webgl
        if (webgl && webgl.calculator) {
	    webgl.input = equation;
            webgl.calculator.set_function(equation);
            webgl.update_graph();
        }
    });
});


function showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = "block";
    }
}
