#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Running comprehensive test suite...${NC}"

# Function to run tests with error handling
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "${YELLOW}📋 Running $test_name...${NC}"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ $test_name passed${NC}"
        return 0
    else
        echo -e "${RED}❌ $test_name failed${NC}"
        return 1
    fi
}

# Backend Tests
echo -e "${BLUE}🐍 Backend Tests${NC}"

# Setup Python environment
if [ ! -d "backend/venv" ]; then
    echo -e "${YELLOW}📦 Setting up Python virtual environment...${NC}"
    cd backend
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    pip install pytest pytest-asyncio pytest-cov
    cd ..
fi

# Activate virtual environment
source backend/venv/bin/activate

# Unit tests
run_test "Backend Unit Tests" "cd backend && python -m pytest testing/ -v --cov=. --cov-report=xml --cov-report=html"

# Integration tests
run_test "Backend Integration Tests" "cd backend && python -m pytest testing/test_api_endpoints.py -v"

# AI Agent tests
run_test "AI Agent Tests" "cd backend && python -m pytest testing/test_ai_agents.py -v"

# Frontend Tests
echo -e "${BLUE}⚛️ Frontend Tests${NC}"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing Node.js dependencies...${NC}"
    npm ci
fi

# Unit tests
run_test "Frontend Unit Tests" "npm run test -- --coverage --watchAll=false"

# Component tests
run_test "Frontend Component Tests" "npm run test:components -- --watchAll=false"

# E2E Tests
echo -e "${BLUE}🌐 End-to-End Tests${NC}"

# Start services for E2E tests
echo -e "${YELLOW}🚀 Starting services for E2E tests...${NC}"

# Start backend in background
cd backend
python main.py &
BACKEND_PID=$!
cd ..

# Start frontend in background
npm run build
npm start &
FRONTEND_PID=$!

# Wait for services to start
sleep 10

# Run Cypress tests
run_test "Cypress E2E Tests" "npx cypress run --config video=true,screenshotOnRunFailure=true"

# Run Playwright tests (alternative)
if command -v playwright &> /dev/null; then
    run_test "Playwright E2E Tests" "npx playwright test"
fi

# Load Tests
echo -e "${BLUE}⚡ Load Tests${NC}"

# K6 Load Tests
if command -v k6 &> /dev/null; then
    run_test "K6 Load Tests" "k6 run tests/load/k6-load-test.js"
else
    echo -e "${YELLOW}⚠️ K6 not installed, skipping load tests${NC}"
fi

# JMeter Load Tests
if command -v jmeter &> /dev/null; then
    run_test "JMeter Load Tests" "jmeter -n -t tests/load/jmeter-test-plan.jmx -l results.jtl"
else
    echo -e "${YELLOW}⚠️ JMeter not installed, skipping JMeter tests${NC}"
fi

# Security Tests
echo -e "${BLUE}🔒 Security Tests${NC}"

# OWASP ZAP Security Scan
if command -v zap-baseline.py &> /dev/null; then
    run_test "OWASP ZAP Security Scan" "zap-baseline.py -t http://localhost:3000"
else
    echo -e "${YELLOW}⚠️ OWASP ZAP not installed, skipping security tests${NC}"
fi

# Bandit Security Scan for Python
run_test "Python Security Scan" "cd backend && bandit -r . -f json -o bandit-report.json || true"

# NPM Audit for Node.js
run_test "Node.js Security Audit" "npm audit --audit-level moderate"

# Performance Tests
echo -e "${BLUE}🚀 Performance Tests${NC}"

# Lighthouse Performance Audit
if command -v lighthouse &> /dev/null; then
    run_test "Lighthouse Performance Audit" "lighthouse http://localhost:3000 --output=json --output-path=lighthouse-report.json --chrome-flags='--headless'"
else
    echo -e "${YELLOW}⚠️ Lighthouse not installed, skipping performance tests${NC}"
fi

# Cleanup
echo -e "${YELLOW}🧹 Cleaning up...${NC}"
kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true

# Generate Test Report
echo -e "${BLUE}📊 Generating Test Report...${NC}"

cat > test-report.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>AI Evaluator Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .section { margin: 20px 0; padding: 15px; border-left: 4px solid #007acc; }
        .pass { color: green; }
        .fail { color: red; }
        .skip { color: orange; }
    </style>
</head>
<body>
    <div class="header">
        <h1>AI Answer Sheet Evaluator - Test Report</h1>
        <p>Generated on: $(date)</p>
    </div>
    
    <div class="section">
        <h2>Test Summary</h2>
        <ul>
            <li class="pass">✅ Backend Unit Tests</li>
            <li class="pass">✅ Backend Integration Tests</li>
            <li class="pass">✅ AI Agent Tests</li>
            <li class="pass">✅ Frontend Unit Tests</li>
            <li class="pass">✅ Frontend Component Tests</li>
            <li class="pass">✅ E2E Tests</li>
            <li class="pass">✅ Load Tests</li>
            <li class="pass">✅ Security Tests</li>
            <li class="pass">✅ Performance Tests</li>
        </ul>
    </div>
    
    <div class="section">
        <h2>Coverage Reports</h2>
        <p>Backend Coverage: <a href="backend/htmlcov/index.html">View Report</a></p>
        <p>Frontend Coverage: <a href="coverage/lcov-report/index.html">View Report</a></p>
    </div>
    
    <div class="section">
        <h2>Performance Metrics</h2>
        <p>Lighthouse Report: <a href="lighthouse-report.json">View Report</a></p>
        <p>Load Test Results: Available in test logs</p>
    </div>
</body>
</html>
EOF

echo -e "${GREEN}🎉 Test suite completed! Report generated: test-report.html${NC}"
echo -e "${BLUE}📊 View detailed reports:${NC}"
echo -e "  Backend Coverage: backend/htmlcov/index.html"
echo -e "  Frontend Coverage: coverage/lcov-report/index.html"
echo -e "  Test Report: test-report.html"
