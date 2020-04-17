import base64
import paramiko
from io import StringIO
import pickle
import pandas as pd
import numpy as np
from sklearn.naive_bayes import GaussianNB
from base64 import decodebytes
import threading
from application.utils.email_sender import EmailSender

nb_classifier = pd.read_pickle("application/components/NB_classifier.pkl")


class VirtualMachine:
    def __init__(self, username, hostname, port, using_key):
        self.username = username
        self.hostname = hostname
        self.port = port
        self.using_key = using_key
        self.password = "none"
        self.key_filename = "none"
        self.current_status = 0
        self.stop_detect = False
        self.userEmail = ""

    def setPassword(self, password):
        self.password = password

    def setKeyFilename(self, key_filename):
        self.key_filename = key_filename

    def setUserEmail(self, userEmail):
        self.userEmail = userEmail

    def stopDetect(self):
        print("inside stop detect")
        self.stop_detect = True

    def getStatus(self):
        return self.current_status

    # static methods
    @staticmethod
    def findvalue(att_name, dataset):
        index_begin = dataset.find(att_name)
        if index_begin > -1:
            str_rest = dataset[index_begin:].split(",")[0]
            str_rest = str_rest.replace("'", "").split(" ")
            return str_rest
        else:
            return -1

    # this is the method that needs to be called within
    def startDetection(self):
        print("Begin detection")

        detect_time_gap = 5
        fs_pos = 3
        network_pos = 13
        percpu_pos = 14
        rep_count = 0
        metric_count = 18  # last metric index 20
        stdout_arr = []
        predicted_values = 0

        email_status = False

        # connect to server via SSH
        client = paramiko.SSHClient()
        client.load_system_host_keys()
        if self.using_key:
            client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            client.connect(
                hostname=self.hostname,
                port=self.port,
                username=self.username,
                key_filename=self.key_filename,
            )
        else:
            client.connect(
                hostname=self.hostname,
                port=self.port,
                username=self.username,
                password=self.password,
            )

        # create command
        glances_cmd = (
            "glances --stdout cpu.idle,cpu.total,cpu.user,fs,load.min1,load.min5,load.min15,mem.active,mem.available,mem.buffers,mem.cached,mem.inactive,mem.percent,network,percpu,processcount.sleeping,processcount.thread,processcount.total -t "
            + str(detect_time_gap)
        )

        # get multiple data
        stdin, stdout, stderr = client.exec_command(glances_cmd)

        # gather multiple data
        for line in stdout:
            output_line = line.strip("\n")
            if rep_count == 3:
                fs_percent_val = VirtualMachine.findvalue("percent", output_line)
                stdout_arr.append(float(fs_percent_val[1]))
            elif rep_count == 13:
                network_lo_cumulative_cx = VirtualMachine.findvalue(
                    "cumulative_cx", output_line
                )
                network_lo_time_since_update = VirtualMachine.findvalue(
                    "time_since_update", output_line
                )
                stdout_arr.append(float(network_lo_cumulative_cx[1]))
                stdout_arr.append(float(network_lo_time_since_update[1]))
            elif rep_count == 14:
                percpu_system = VirtualMachine.findvalue("system", output_line)
                percpu_total = VirtualMachine.findvalue("total", output_line)
                percpu_user = VirtualMachine.findvalue("user", output_line)
                stdout_arr.append(float(percpu_system[1]))
                stdout_arr.append(float(percpu_total[1]))
                stdout_arr.append(float(percpu_user[1]))
            else:
                output_line = output_line.split(" ", 1)
                floatVal = float(output_line[1])
                stdout_arr.append(floatVal)
            rep_count = rep_count + 1
            if rep_count >= metric_count:
                # stdout_arr is data
                data_sample = np.asarray(stdout_arr, dtype=np.float32)
                data_sample = np.reshape(data_sample, (1, -1))

                # send data to model
                predicted_values = nb_classifier.predict(data_sample)
                print("Status: " + str(predicted_values))
                # print("Stop detect: " + str(self.stopDetect))
                # assign value to current status
                self.current_status = predicted_values[0]

                # if predicted value == 1
                # send email to user as a notification
                if predicted_values == 1 and email_status == False:
                    email_status = self.sendEmailNotification()

                # break

                # it will only run once
                rep_count = 0
                stdout_arr = []
            if self.stop_detect:
                break

        client.close()
        return predicted_values

    def launchThread(self):
        server_thread = threading.Thread(target=self.startDetection, daemon=True)
        print("Before starting thread...")
        server_thread.start()
        print("Ending thread...")
        return "done"

    def sendEmailNotification(self):
        print("Sending email...")
        email = EmailSender(self.userEmail, self.hostname)
        email.sendNotificationEmail()
        return True

    def testServer(self):
        # need try catching system
        client = paramiko.SSHClient()
        client.load_system_host_keys()
        try:
            if self.using_key:
                client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
                client.connect(
                    hostname=self.hostname,
                    port=self.port,
                    username=self.username,
                    key_filename=self.key_filename,
                )
            else:
                try:
                    client.connect(
                        hostname=self.hostname,
                        port=self.port,
                        username=self.username,
                        password=self.password,
                    )
                except:
                    print("not working")
                    return False
        except:
            return False
        return True
