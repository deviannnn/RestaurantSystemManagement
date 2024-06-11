module.exports = function generateVerificationEmail(newUser, link) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    color: #333;
                    line-height: 1.6;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background: #fff;
                    padding: 20px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                }
                .header {
                    text-align: center;
                    background: #70c1b3;
                    padding: 10px 0;
                    color: #fff;
                    border-radius: 5px 5px 0 0;
                }
                .content {
                    padding: 20px;
                }
                .button {
                    display: inline-block;
                    padding: 10px 20px;
                    font-size: 16px;
                    color: #fff;
                    background-color: #70c1b3;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 20px 0;
                    text-align: center;
                }
                .footer {
                    text-align: center;
                    margin-top: 20px;
                    font-size: 12px;
                    color: #777;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to Restaurant System</h1>
                </div>
                <div class="content">
                    <h2>Hello, ${newUser.fullName}!</h2>
                    <p>We have created a working account for you.</p>
                    <p><strong>Username:</strong> ${newUser.email}</p>
                    <p><strong>Password:</strong> ${newUser.phone}</p>
                    <p>Please click the link below to activate your account:</p>
                    <a href="${link}" class="button">Activate Account</a>
                    <p>If you did not login this account, please ignore this email.</p>
                    <p>Best regards,<br>Restaurant System Team</p>
                </div>
                <div class="footer">
                    <p>© ${new Date().getFullYear()} Restaurant System. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `;
};