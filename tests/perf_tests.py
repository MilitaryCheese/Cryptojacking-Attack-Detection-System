import timeit
import random
from . import VirtualMachine

# ----------------------------------------------------------
# linear search function
def linear_search(mylist, find):
    for x in mylist:
        if x == find:
            return True
    return False


# compute linear search time
def linear_time():
    SETUP_CODE = """ 
from __main__ import linear_search 
from random import randint"""

    TEST_CODE = """ 
mylist = [x for x in range(10000)] 
find = randint(0, len(mylist)) 
linear_search(mylist, find) 
    """
    # timeit.repeat statement
    times = timeit.repeat(setup=SETUP_CODE, stmt=TEST_CODE, repeat=3, number=10000)

    # priniting minimum exec. time
    print("Linear search time: {}".format(min(times)))


def connect_to_server():
    username = ""
    hostname = ""
    port = ""
    password = ""
    server_instant = VirtualMachine(username, hostname, port, False)
    server_instant.setPassword(password)
    isConnected = server_instant.testServer()


def test_server_connection_module():
    print("testing server connection module")
    linear_time()


if __name__ == "__main__":
    print("initiating testing")
    test_server_connection_module()
