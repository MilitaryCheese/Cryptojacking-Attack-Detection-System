import smtplib, ssl


class EmailSender:
    def __init__(self, userEmail, hostname):
        self.userEmail = userEmail
        self.hostname = hostname

    def sendNotificationEmail(self):
        # For starttls
        port = 587
        smtp_server = "smtp.gmail.com"
        # senders email address
        sender_email = "cadsystemnotifier@gmail.com"
        receiver_email = self.userEmail
        password = "1997KeshiniJaya"
        message = (
            """\
        Subject: Attack Detected!

        Your server with the hostname of """
            + self.hostname
            + """ might be under a cryptojacking attack! Recommended action to be taken: 
                1) Manually identify the underlying miner and use process ID to terminate it
                2) Shut down the server if no critical applications are being sent."""
        )

        context = ssl.create_default_context()
        with smtplib.SMTP(smtp_server, port) as server:
            server.ehlo()  # Can be omitted
            server.starttls(context=context)
            server.ehlo()  # Can be omitted
            server.login(sender_email, password)
            # sending a notification email to the given address variables
            server.sendmail(sender_email, receiver_email, message)


# 1997KeshiniJaya"
