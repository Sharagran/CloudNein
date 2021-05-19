import React from 'react';


function Registration() {

	var check = function() {
		if (document.getElementById('password').value === document.getElementById('confirm_password').value) {
		  document.getElementById('confirm_password').style.color = 'green';
		  //document.getElementById('message').innerHTML = 'matching';
		} else {
		  document.getElementById('confirm_password').style.color = 'red';
		  //document.getElementById('message').innerHTML = 'not matching';
		}
	  }

return (
    <>
		<div class="register-form">
			<h1>Registration</h1>
			<form action="/Registration" method="POST">
				<input type="text" name="username" placeholder="Username (6 characters minimum)" minlength="6" required></input>
				<input type="text" name="mail" placeholder="E-Mail" pattern="[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$" required ></input>
				<input id="password"type="password" name="password" placeholder="Password (6 characters minimum)" minlength="6" required ></input>
				<input id="confirm_password" type="password" name="confirm_password" placeholder="Confirm password"  onkeyup={check} minlength="6" required></input>
				<input type="submit" value="Create Account" ></input>
			</form>
        </div>
    </>
    );
}

export default Registration;


