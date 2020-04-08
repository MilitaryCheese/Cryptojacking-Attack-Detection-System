from index import db, bcrypt


class User(db.Document):
    name = db.StringField(max_length=255, required=True)
    email = db.StringField(max_length=255, unique=True)
    password = db.StringField(max_length=255, required=True)

    @staticmethod
    def get_user_with_email_and_password(email, password):
        user = User.objects.get(email=email)
        if user and bcrypt.check_password_hash(user.password, password):
            return user
        else:
            return None

    @staticmethod
    def get_user_with_id(id):
        user = User.objects.get(id=id)
        if user:
            return user
        else:
            return None

    def save(self, *args, **kwargs):

        if not self.id and self.password:
            self.password = bcrypt.generate_password_hash(self.password).decode("utf-8")
            print(self.password)
        super(User, self).save(*args, **kwargs)


class Server(db.Document):
    userID = db.StringField(max_length=255, required=True)
    hostname = db.StringField(max_length=255, unique=True)
    port = db.IntField(max_length=255, required=True)  # change
    username = db.StringField(max_length=255, required=True)
    password = db.StringField(max_length=255, required=True)
    key_filename = db.StringField(max_length=255, required=True)
    isDetecting = db.BooleanField(default=False, required=True)

    @staticmethod
    def get_server_with_id(id):
        server = Server.objects.get(id=id)
        if server:
            return server
        else:
            return None

    def save(self, *args, **kwargs):

        # if not self.id and self.password:
        #     self.password = bcrypt.generate_password_hash(self.password).decode("utf-8")
        #     print(self.password)
        super(Server, self).save(*args, **kwargs)
