import http from "k6/http"
import { check, sleep } from "k6"
import { Rate } from "k6/metrics"

// Custom metrics
const errorRate = new Rate("errors")

export const options = {
  stages: [
    { duration: "2m", target: 10 }, // Ramp up to 10 users
    { duration: "5m", target: 10 }, // Stay at 10 users
    { duration: "2m", target: 20 }, // Ramp up to 20 users
    { duration: "5m", target: 20 }, // Stay at 20 users
    { duration: "2m", target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"], // 95% of requests must complete below 2s
    errors: ["rate<0.1"], // Error rate must be below 10%
  },
}

const BASE_URL = "http://localhost:8000"

// Test data
const testUser = {
  username: `testuser_${Math.random().toString(36).substring(7)}`,
  email: `test_${Math.random().toString(36).substring(7)}@example.com`,
  password: "testpassword123",
  role: "student",
}

export function setup() {
  // Register a test user
  const registerResponse = http.post(`${BASE_URL}/api/auth/register`, JSON.stringify(testUser), {
    headers: { "Content-Type": "application/json" },
  })

  if (registerResponse.status === 200) {
    const data = registerResponse.json()
    return { token: data.access_token }
  }

  return { token: null }
}

export default function (data) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${data.token}`,
  }

  // Test health endpoint
  const healthResponse = http.get(`${BASE_URL}/health`)
  check(healthResponse, {
    "health check status is 200": (r) => r.status === 200,
    "health check response time < 500ms": (r) => r.timings.duration < 500,
  }) || errorRate.add(1)

  sleep(1)

  // Test dashboard stats
  if (data.token) {
    const dashboardResponse = http.get(`${BASE_URL}/api/dashboard-stats`, { headers })
    check(dashboardResponse, {
      "dashboard stats status is 200": (r) => r.status === 200,
      "dashboard stats response time < 1000ms": (r) => r.timings.duration < 1000,
    }) || errorRate.add(1)
  }

  sleep(1)

  // Test evaluation endpoint with mock data
  if (data.token) {
    const evaluationData = {
      evaluation_id: `test_${Math.random().toString(36).substring(7)}`,
      extracted_text: "This is a test answer for load testing purposes.",
      subject: "Mathematics",
      exam_type: "Quiz",
    }

    const evaluationResponse = http.post(`${BASE_URL}/api/evaluate-answer`, JSON.stringify(evaluationData), { headers })

    check(evaluationResponse, {
      "evaluation status is 200": (r) => r.status === 200,
      "evaluation response time < 5000ms": (r) => r.timings.duration < 5000,
    }) || errorRate.add(1)
  }

  sleep(2)
}

export function teardown(data) {
  // Cleanup if needed
  console.log("Load test completed")
}
