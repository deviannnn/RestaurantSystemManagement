from locust import HttpUser, task, between

class RestaurantLoadTest(HttpUser):
    wait_time = between(1, 5)
    host = "http://ec2-47-129-164-244.ap-southeast-1.compute.amazonaws.com"

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
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwicm9sZUlkIjo0LCJmdWxsTmFtZSI6IldhaXRlciBVc2VyIiwiaWF0IjoxNzIzNzEzMjE2LCJleHAiOjE3MjM3MjA0MTZ9.vxdS592EmGxvoKKHOaOO1XhJO2awWFMSuB4jUrfpowc",
            "Content-Type": "application/json"
        }

        self.client.post("/api/orders/5/add-items", json=payload, headers=headers)
