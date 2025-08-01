from datetime import datetime
from settings.config import secret  

# Email designs and content
APP_NAME= "INK ADMIN"


layout_style="""
<style>
        .page {
            background-color: #fbfbfb;
            padding: 20px;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 1px solid #fdd0d0;
            border-radius: 8px;
            box-shadow: 0 0 10px #0000001a;
        }
        .header {
            background-color: #ffe5e5;
            color: #000000;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }

        .header img {
            max-width: 100px;
        }

        .header h3 {
            margin: 0;
            padding: 15px 0;
        }
        .content {
            padding: 5px 20px;
            color: #333333;
        }
        .greetings{
            margin-top: 10px;
        }

        .content h4 {
            margin-bottom: 0px;
        }

        .content h5 {
            margin-bottom: 10px;
            font-size: 12px;
        }
        .content p {
            margin: 0;
        }
        .footer {
            background-color: #ffe5e5;
            color: #464646;
            padding: 10px 0;
            text-align: center;
            border-radius: 0 0 8px 8px;
            font-size: 12px;
        }
        .footer a {
            color: #fd7d7d;
            font-size: small;
        }
        hr {
         color: #fff;
        }
        .note{
            color: #747474;
        }
        .table_border table, th, td {
            padding: 5px;
        }
        .table_border table {
            border-collapse: collapse;
        }
    </style>
"""

layout_html= lambda name, mail_content : f"""
<html>
     <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
         <div style="max-width: 600px; margin: auto; background-color: #ffffff; border: 1px solid #f0f0f0; border-radius: 8px; padding: 20px;">
             <h3 style="color: #d9534f; text-align:center; margin-top: 0px">{APP_NAME}</h3>
             <p>Dear {name},</p>
             {mail_content}
         </div>
     </body>
     </html>
"""

com_email_html= lambda name, mail_content : f"""
<html>
     <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
         <div style="max-width: 600px; margin: auto; background-color: #ffffff; border: 1px solid #f0f0f0; border-radius: 8px; padding: 20px;">
             <h3 style="color: #d9534f; text-align:center; margin-top: 0px">{APP_NAME}</h3>
             {mail_content}
         </div>
     </body>
     </html>
"""

forgot_password_html_content=lambda reset_link,expire_minutes:f"""
            <p>We received a request to reset your password. Click the link below to set a new one:</p>
             <p>
                 <a href="{reset_link}" style="background-color: #d9534f; color: #ffffff; padding: 10px 15px; border-radius: 5px; text-decoration: none;">Reset Password</a>
             </p>
             <p>If the button doesn't work, copy and paste this link into your browser:</p>
             <p><a href="{reset_link}">{reset_link}</a></p>
             <p style="color: #d9534f;"><strong>Note:</strong> This link will expire in {expire_minutes} minutes.</p>
             <hr />
             <p style="font-size: 12px; color: #888;">If you did not request a password reset, please ignore this email.</p>
"""

forgot_password_html=lambda name,reset_link,expire_minutes:layout_html(name,forgot_password_html_content(reset_link,expire_minutes))

update_password_html_content = lambda reset_link, expire_minutes: f"""
    <p>Welcome! You're almost ready to start using your account. Please click the button below to set your password:</p>
    <p>
        <a href="{reset_link}" style="background-color: #5cb85c; color: #ffffff; padding: 10px 15px; border-radius: 5px; text-decoration: none;">Set Your Password</a>
    </p>
    <p>If the button doesn't work, copy and paste this link into your browser:</p>
    <p><a href="{reset_link}">{reset_link}</a></p>
    <p style="color: #5cb85c;"><strong>Note:</strong> This link will expire in {expire_minutes} minutes for your security.</p>
    <hr />
    <p style="font-size: 12px; color: #888;">If you did not expect this email, you can safely ignore it.</p>
"""

update_pasword= lambda name,reset_link,expire_minutes:layout_html(name,update_password_html_content(reset_link,expire_minutes))


# register mail content
register_html_content = lambda token,email,password: f"""
    <p>Thank you for signing up for {secret.APP_NAME}! 🎉
    <br/>
To complete your registration and activate your account, please confirm your email by clicking the button below:
    <br/>
    <a href="{secret.website_url}/#/registration_verify?token={token}" style="cursor: pointer;">
         <button style="border-radius: 5px;background-color: #4882EE ;color:white;border-color:white;font-size:14px;font-weight:bold;padding:11px 22px;margin-left:30px;cursor: pointer;">Confirm Email</button>
         </a>
         <br/>
     If the button above doesn't work, copy and paste the following link into your browser:
    <a href={secret.website_url}/#/registration_verify?token={token} style="color:#4882EE;text-decoration: none;">{secret.website_url}/#/registration_verify?token={token}</a>
    <br/>
    <h5>Your login credentials:</h5>
    <p>Email ID: {email}</p>
    <p>Password: {password}</p>
    <h5>Important Note:</h5>
    <p>Do not share this credentials with anyone.</p>   
   </p>
"""

