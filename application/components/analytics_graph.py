import base64
import paramiko
from io import StringIO
from base64 import decodebytes
import threading
from flask import jsonify


class AnalyticsGraph:
    def __init__(self, vm_instance, portno):
        self.vm_instance = vm_instance
        self.portno = portno

    # connecting to the user servers via PARAMIKO
    def connectToClient(self):
        client = paramiko.SSHClient()
        client.load_system_host_keys()

        if self.vm_instance.using_key:
            client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            client.connect(
                hostname=self.vm_instance.hostname,
                port=self.vm_instance.port,
                username=self.vm_instance.username,
                key_filename=self.vm_instance.key_filename,
            )
        else:
            client.connect(
                hostname=self.vm_instance.hostname,
                port=self.vm_instance.port,
                username=self.vm_instance.username,
                password=self.vm_instance.password,
            )
        return client

    # execute glances web server
    def hostGlancesServer(self):
        stdin, stdout, stderr = self.client.exec_command("glances -w -p " + self.portno)
        return stdout

    # execute curl command to retrieve data
    def curlAnalyticsData(self):
        cmd = "curl http://localhost:" + self.portno + "/api/3/cpu/user/history/20"
        stdin, stdout, stderr = self.client.exec_command(cmd)
        output = ""
        for line in stdout:
            output_line = line.strip("\n")
            output = output_line
            break
        self.client.close()
        return output

    # main function used to retrieve the historic & current CPU data
    def getCPUAnalyticsData(self):
        # connects to client
        self.client = self.connectToClient()
        # executes the web server
        x = self.hostGlancesServer()
        # get past and current data
        analytics_data = self.curlAnalyticsData()
        return analytics_data
