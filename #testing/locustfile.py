from locust import HttpUser, task

class HelloWorldUser(HttpUser):
    @task
    def index(self):
        self.client.get("/")