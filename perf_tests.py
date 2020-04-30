import timeit
import random
import paramiko
import numpy as np
import pandas as pd
import pickle
import threading
from application.components.vm import VirtualMachine


# ----------------------ADDITIONAL FUNCTIONS-----------------------
def get_paramiko_client():
    username = "keshinijaya"
    hostname = "35.193.248.60"
    port = 22
    key_filename = "application/components/keyfiles/test-key"

    client = paramiko.SSHClient()
    client.load_system_host_keys()
    try:
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(
            hostname=hostname, port=port, username=username, key_filename=key_filename,
        )
        return client
    except:
        return False


def getPerfMetrics():
    arr = [
        [
            0.0000000e00,
            1.0000000e02,
            2.3000000e01,
            9.6699997e01,
            4.4800000e00,
            3.9800000e00,
            4.2199998e00,
            8.4779418e08,
            5.3890662e08,
            1.6793600e05,
            5.0919424e08,
            2.6062438e08,
            8.6400002e01,
            1.4800000e04,
            1.0120000e00,
            2.0000000e00,
            1.0000000e02,
            2.3000000e01,
            1.0900000e02,
            1.5800000e02,
            1.1100000e02,
        ]
    ]
    data_sample = np.asarray(arr, dtype=np.float32)
    data_sample = np.reshape(data_sample, (1, -1))
    return data_sample


# ------------------------------------------------------------

# ---------------SERVER CONNECTION TESTING---------------------
def test_connect_to_server(iterations):
    SETUP_CODE = """ 
from __main__ import connect_to_server"""

    TEST_CODE = """ 
connect_to_server() 
    """

    times = timeit.repeat(setup=SETUP_CODE, stmt=TEST_CODE, repeat=3, number=iterations)
    print("Server connect time for ", iterations, ": ", min(times))
    return min(times)


def connect_to_server():
    username = "keshinijaya"
    hostname = "35.193.248.60"
    port = 22
    key_filename = "application/components/keyfiles/test-key"

    server_instant = VirtualMachine(username, hostname, port, True)
    server_instant.setKeyFilename(key_filename)
    isConnected = server_instant.testServer()
    print("Connected: ", isConnected)


def test_server_connection_module():
    print("testing server connection module")
    t1 = test_connect_to_server(1)
    t10 = test_connect_to_server(10)
    # test_connect_to_server(50)
    # test_connect_to_server(100)

    print("Server connection - 1: ", t1)
    print("Server connection - 10: ", t10)


# ---------------------------------------------------------------

# ---------------COMMAND EXECUTION TESTING---------------------
def test_command_execute(iterations):
    SETUP_CODE = """ 
from __main__ import command_execute, get_paramiko_client"""

    TEST_CODE = """ 
client = get_paramiko_client()
command_execute(client)
    """

    times = timeit.repeat(setup=SETUP_CODE, stmt=TEST_CODE, repeat=3, number=iterations)
    print("Server connect time for ", iterations, ": ", min(times))
    return min(times)


def command_execute(client):
    cmd = "glances --stdout cpu.idle"
    stdin, stdout, stderr = client.exec_command(cmd)
    output = ""
    for line in stdout:
        output_line = line.strip("\n")
        output = output_line
        break
    client.close()
    print("command executed and results are: ", output)


def test_command_exec_module():
    print("testing command execution module")
    t1 = test_command_execute(1)
    t10 = test_command_execute(10)
    # test_command_execute(50)
    # test_command_execute(100)

    print("Command execution - 1: ", t1)
    print("Command execution - 10: ", t10)


# ---------------------------------------------------------------

# ---------------DETECTION MODULE TESTING---------------------
def test_detect_attack(iterations):
    SETUP_CODE = """ 
from __main__ import detect_attack"""

    TEST_CODE = """ 
detect_attack()
    """

    times = timeit.repeat(setup=SETUP_CODE, stmt=TEST_CODE, repeat=3, number=iterations)
    print("Server connect time for ", iterations, ": ", min(times))
    return min(times)


def detect_attack():
    data = getPerfMetrics()
    nb_classifier = pd.read_pickle("application/components/NB_classifier.pkl")
    predicted_values = nb_classifier.predict(data)
    print(predicted_values)


def test_detection_module():
    print("testing detection module")
    t1 = test_detect_attack(1)
    t10 = test_detect_attack(10)
    # test_detect_attack(50)
    # test_detect_attack(100)

    print("Attack detection - 1: ", t1)
    print("Attack detection - 10: ", t10)


# ---------------------------------------------------------------

# ---------------THREAD MODULE TESTING---------------------
def test_threading(iterations):
    SETUP_CODE = """ 
from __main__ import start_thread"""

    TEST_CODE = """ 
start_thread()
    """

    times = timeit.repeat(setup=SETUP_CODE, stmt=TEST_CODE, repeat=3, number=iterations)
    print("Server connect time for ", iterations, ": ", min(times))
    return min(times)


def thread_func():
    while True:
        data = getPerfMetrics()
        nb_classifier = pd.read_pickle("application/components/NB_classifier.pkl")
        predicted_values = nb_classifier.predict(data)
        print(predicted_values)


def threading_begin():
    server_thread = threading.Thread(target=thread_func, daemon=True)
    server_thread.start()


def start_thread():
    for x in range(10):
        threading_begin()


def test_thread_module():
    print("testing thread module")
    t1 = test_threading(1)
    t10 = test_threading(10)
    # test_threading(50)
    # test_threading(100)

    print("Threading - 1: ", t1)
    print("Threading - 10: ", t10)


# ---------------------------------------------------------------

if __name__ == "__main__":
    print("initiating testing")
    # test_server_connection_module()
    # test_command_exec_module()
    # test_detection_module()
    test_thread_module()
