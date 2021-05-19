import React from 'react';

function ForgotPassword() {

return (
    <>
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

export default ForgotPassword;
