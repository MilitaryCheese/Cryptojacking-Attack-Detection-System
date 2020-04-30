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
                1) If no network-critical applications are currently running, please consider shutting down the network.
                2) Use the command 'ps -aux' to locate applications that you do not recognize.
                3) Consider shutting down applications that are suspicious and/or foriegn that you think are not critical. Use the command 'kill [pid]' to kill any process.
                4) If the issue persists, please consider rebooting the server."""
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
