import base64
import paramiko
from io import StringIO
from base64 import decodebytes
import threading
from flask import jsonify


class AnalyticsGraph:
    def __init__(self, vm_instance):
        self.vm_instance = vm_instance

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

    def hostGlancesServer(self):
        stdin, stdout, stderr = self.client.exec_command("glances -w")
        return stdout

    def curlAnalyticsData(self):
        cmd = "curl http://localhost:61208/api/3/cpu/user/history/20"
        stdin, stdout, stderr = self.client.exec_command(cmd)
        output = ""
        for line in stdout:
            output_line = line.strip("\n")
            output = output_line
            break
        return output

    def getCPUAnalyticsData(self):
        self.client = self.connectToClient()
        x = self.hostGlancesServer()
        print("connected...")
        analytics_data = self.curlAnalyticsData()
        return analytics_data
