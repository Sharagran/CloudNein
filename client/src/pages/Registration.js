import React from 'react';

function Registration() {

return (
    <>
		<div class="register-form">
			<h1>Registration</h1>
			<form action="/Registration" method="POST">
				<input type="text" name="username" placeholder="Username (6 characters minimum)" minlength="6" required></input>
				<input type="text" name="mail" placeholder="E-Mail" pattern="[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$" required ></input>
				<input id="password"type="password" name="password" placeholder="Password (6 characters minimum)" minlength="6" required ></input>
				<input id="confirm_password" type="password" name="confirm_password" placeholder="Confirm password" onkeyup='check();' minlength="6" required></input>
				<input type="submit" value="Create Account" ></input>
			</form>
        </div>

		<div class="login-form">
			<h1>Forgot Password</h1>
			<form action="/forgotPassword" method="POST">
                <input type="text" name="email" placeholder="Email" pattern="[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$" required></input>
				<input type="submit" value="Submit"></input>
			</form>
		</div>
    </>
    );
}

export default Registration;


