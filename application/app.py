from flask import request, render_template, jsonify, url_for, redirect, g
from .models import User, Server
from index import app, db
from .utils.auth import generate_token, requires_auth, verify_token
from .components.vm import VirtualMachine
from .components.analytics_graph import AnalyticsGraph
from bson import json_util
import json

import warnings

warnings.filterwarnings("ignore")

current_detecting_servers = []


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
        isDetecting = "False"
        serverName = incoming["serverName"]

    except:
        return jsonify()

    if password == "":
        testServer = VirtualMachine(username, hostname, port, True)
        testServer.setKeyFilename(key_filename)
    else:
        testServer = VirtualMachine(username, hostname, port, False)
        testServer.setPassword(password)
    print("Testing...")
    # isConnected = testServer.testServer()
    isConnected = True
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
            isDetecting=isDetecting,
            serverName=serverName,
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


@app.route("/api/servers_with_user", methods=["POST"])
def servers_with_user():
    try:
        incoming = request.get_json()
        userID = incoming["userID"]
        servers = Server.get_servers_with_user_id(userID)
    except Exception as e:
        print(e)
        return jsonify(message="Error: " + e), 411

    return jsonify(servers)


@app.route("/api/detect_server", methods=["POST"])
def detect_server():
    try:
        incoming = request.get_json()
        userID = incoming["userID"]
        hostname = incoming["hostname"]
        port = incoming["port"]
        username = incoming["username"]
        password = incoming["password"]
        key_filename = incoming["key_filename"]
    except Exception as e:
        return jsonify(error=e)

    if password == "":
        # use key filename
        server_instant = VirtualMachine(username, hostname, port, True)
        server_instant.setKeyFilename(key_filename)
        isConnected = server_instant.testServer()
    else:
        print("pass")
        # use password
        server_instant = VirtualMachine(username, hostname, port, False)
        server_instant.setPassword(password)
        isConnected = server_instant.testServer()

    # get user email
    userEmail = get_user_data(userID).email
    server_instant.setUserEmail(userEmail)

    print(isConnected)
    if isConnected:
        # start detecting
        server_instant.launchThread()
        print(server_instant.getStatus())
        # add to current detecting server list
        print("Current servers:")
        current_detecting_servers.append(server_instant)

        # update server status on database
        try:
            Server.objects(userID=userID).update(isDetecting="True",)
        except Exception as e:
            print(e)
    else:
        return (
            jsonify(
                message="Cannot establish connection to server. Please ensure that the server is online."
            ),
            413,
        )

    print("Detecting server...")
    return jsonify(error=False)


@app.route("/api/get_detection_status", methods=["POST"])
def get_detection_status():
    try:
        incoming = request.get_json()
        hostname = incoming["hostname"]
    except Exception as e:
        return jsonify(error=e)

    try:
        running_server = [
            x for x in current_detecting_servers if x.hostname == hostname
        ][0]
        return jsonify(status=running_server.getStatus())
    except IndexError:
        return jsonify(status="Server not running")


@app.route("/api/stop_server_detect", methods=["POST"])
def stop_server_detect():
    print("stoping server...")
    try:
        incoming = request.get_json()
        hostname = incoming["hostname"]
    except Exception as e:
        return jsonify(error=e)

    try:
        running_server = [
            x for x in current_detecting_servers if x.hostname == hostname
        ][0]
        running_server.stopDetect()
        current_detecting_servers.remove(running_server)
        # update server status on database
        try:
            Server.objects(hostname=hostname).update(isDetecting="False",)
        except Exception as e:
            print(e)
        return jsonify(stopStatus="success")
    except IndexError:
        return jsonify(status="Server not running")


@app.route("/api/get_analytics_data", methods=["POST"])
def get_analytics_data():
    print("start")
    try:
        incoming = request.get_json()
        hostname = incoming["hostname"]
        port = incoming["port"]
        username = incoming["username"]
        password = incoming["password"]
        key_filename = incoming["key_filename"]

        print(hostname)
        print(port)
        print(username)
        print(password)
        print(key_filename)

    except Exception as e:
        print(e)

    if password == "":
        # use key filename
        server_instant = VirtualMachine(username, hostname, port, True)
        server_instant.setKeyFilename(key_filename)
        isConnected = server_instant.testServer()
    else:
        print("pass")
        # use password
        server_instant = VirtualMachine(username, hostname, port, False)
        server_instant.setPassword(password)
        isConnected = server_instant.testServer()

    print(isConnected)
    if isConnected:

        analyticsGraph = AnalyticsGraph(server_instant)
        analytics_data = analyticsGraph.getCPUAnalyticsData()
        analytics_data = json.loads(analytics_data)
        print("analytics are taken")
        return jsonify(analytics=analytics_data)
        # print(analyticsGraph)
    else:
        return (
            jsonify(
                error="Cannot establish connection to server. Please ensure that the server is online."
            ),
        )
