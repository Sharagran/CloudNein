import React from 'react';

function Login() {

return (
    <>
		<div class="login-form">
			<h1>Login</h1>
			<form action="/login" method="POST">
				<input type="text" name="username" placeholder="Username" required></input>
				<input type="password" name="password" placeholder="Password" required></input>
				<input type="submit" value="Login"></input>
			</form>
		</div>
		<div>
			<button id="register-btn" type="submit" onclick="location.href='Register'">Create Account</button>
			<button id="forgotPassword-btn" type="submit" onclick="location.href='forgotPassword.html'">Forgot Password?</button>
		</div>
    </>
    );
}

export default Login;