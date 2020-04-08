from flask import request, render_template, jsonify, url_for, redirect, g
from .models import User, Server
from index import app, db
from .utils.auth import generate_token, requires_auth, verify_token
from .components.vm import VirtualMachine


@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")


@app.route("/<path:path>", methods=["GET"])
def any_root_path(path):
    return render_template("index.html")


@app.route("/api/user", methods=["GET"])
@requires_auth
def get_user():
    userID = g.current_user["id"]
    userValid = get_user_data(userID)
    return jsonify(userValid)


@app.route("/api/create_user", methods=["POST"])
def create_user():
    try:
        incoming = request.get_json()
        name = incoming["name"]
        email = incoming["email"]
        password = incoming["password"]
    except:
        return jsonify()
    if not email or not password:
        return jsonify(message="User with that email already exists"), 409
    u = User(name=name, email=email, password=password)
    try:
        u.save()
    except db.NotUniqueError:
        return jsonify(message="Email already exists"), 409
    except db.ValidationError:
        return jsonify(message="Email format incorrect "), 409
    new_user = User.objects.get(email=email)
    return jsonify(token=generate_token(new_user))


@app.route("/api/get_token", methods=["POST"])
def get_token():
    incoming = request.get_json()
    user = User.get_user_with_email_and_password(
        incoming["email"], incoming["password"]
    )
    if user:
        return jsonify(token=generate_token(user))

    return jsonify(error=True), 403


@app.route("/api/is_token_valid", methods=["POST"])
def is_token_valid():
    incoming = request.get_json()
    is_valid = verify_token(incoming["token"])

    if is_valid:
        return jsonify(token_is_valid=True)
    else:
        return jsonify(token_is_valid=False), 403


def get_user_data(userID):
    user = User.get_user_with_id(userID)

    # # additional stuff
    # # server1 = VirtualMachine("kjaya", "localhost", 2223, False)
    # server1 = VirtualMachine("keshinijaya", "35.226.234.198", 22, True)
    # server1.setKeyFilename("application/components/keyfiles/test-key")
    # server1.launchThread()
    # # server1.startDetection()
    # print(server1.getStatus())
    # # server1.stopDetect()
    # # additional stuff

    if user:
        return user
    return jsonify(error=True), 403


# ------------- SERVER RELATED API ROUTES ------------------
@app.route("/api/create_server", methods=["POST"])
def create_server():
    try:
        incoming = request.get_json()
        userID = incoming["userID"]
        hostname = incoming["hostname"]
        port = incoming["port"]  # should be an integer
        username = incoming["username"]
        password = incoming["password"]
        key_filename = incoming["key_filename"]

    except:
        return jsonify()

    if password == "":
        testServer = VirtualMachine(username, hostname, port, True)
        testServer.setKeyFilename(key_filename)
    else:
        testServer = VirtualMachine(username, hostname, port, False)
        testServer.setPassword(password)
    isConnected = testServer.testServer()
    print(isConnected)
    if isConnected:
        print("1")
        s = Server(
            userID=userID,
            hostname=hostname,
            port=port,
            username=username,
            password=password,
            key_filename=key_filename,
        )
        try:
            s.save()
        except db.NotUniqueError:
            return jsonify(message="Server already exists"), 410
        return jsonify(status=True)
    else:
        print("2")
        return (
            jsonify(
                message="Cannot establish connection to server. Please check your credentials."
            ),
            412,
        )
