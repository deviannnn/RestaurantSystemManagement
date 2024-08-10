from locust import HttpUser, task, between

class HelloWorldUser(HttpUser):
    wait_time = between(1, 5)
    host = "http://ec2-18-136-230-69.ap-southeast-1.compute.amazonaws.com"

    @task
    def post_example(self):
        payload = {
            "items": [
                {
                    "itemId": 1,
                    "quantity": 10,
                    "note": "nhieu ot"
                },
                {
                    "itemId": 3,
                    "quantity": 10,
                    "note": "khong cay"
                },
                {
                    "itemId": 5,
                    "quantity": 10,
                    "note": "it duong"
                }
            ]
        }

        headers = {
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwicm9sZUlkIjo0LCJmdWxsTmFtZSI6IlR1YW4gQW4iLCJpYXQiOjE3MjMzMTI5MDIsImV4cCI6MTcyMzMyMDEwMn0.mNRxbZ7qN3pqRegfaXtbbWGY1VXFFIwD0Y0MecINk3E",
            "Content-Type": "application/json"
        }

        self.client.post("/api/orders/5/add-items", json=payload, headers=headers)
