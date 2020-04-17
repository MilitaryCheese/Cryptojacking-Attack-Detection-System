import smtplib, ssl


class EmailSender:
    def __init__(self, userEmail, hostname):
        self.userEmail = userEmail
        self.hostname = hostname

    def sendNotificationEmail(self):
        port = 587  # For starttls
        smtp_server = "smtp.gmail.com"
        sender_email = "cadsystemnotifier@gmail.com"
        receiver_email = self.userEmail
        password = "1997KeshiniJaya"
        message = (
            """\
        Subject: Attack Detected!

        Your server with the hostname of """
            + self.hostname
            + """ might be under a cryptojacking attack! Recommended action to be taken:  ."""
        )

        context = ssl.create_default_context()
        with smtplib.SMTP(smtp_server, port) as server:
            server.ehlo()  # Can be omitted
            server.starttls(context=context)
            server.ehlo()  # Can be omitted
            server.login(sender_email, password)
            server.sendmail(sender_email, receiver_email, message)
